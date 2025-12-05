import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadBucketCommand,
  CreateBucketCommand,
  HeadObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { createHash, randomUUID } from 'crypto';
import { createReadStream } from 'fs';
import { stat, unlink } from 'fs/promises';
import { Readable } from 'stream';
import { extname } from 'path';

import { getConfig } from './config.js';
import { HashingStream } from './hashing-stream.js';
import type {
  UploadResult,
  StreamUploadResult,
  FileInfo,
  StorageConfig,
  UploadProgress,
} from './types.js';

export class StorageService {
  private client: S3Client;
  private config: StorageConfig;
  private initialized = false;

  constructor() {
    this.config = getConfig();

    this.client = new S3Client({
      endpoint: `${this.config.useSSL ? 'https' : 'http'}://${this.config.endpoint}:${this.config.port}`,
      region: 'us-east-1',
      credentials: {
        accessKeyId: this.config.accessKey,
        secretAccessKey: this.config.secretKey,
      },
      forcePathStyle: true,
    });

    console.log(`📦 StorageService configured for ${this.config.endpoint}:${this.config.port}`);
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.config.bucket }));
      console.log(`✅ Bucket "${this.config.bucket}" exists`);
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        console.log(`📦 Creating bucket "${this.config.bucket}"...`);
        await this.client.send(new CreateBucketCommand({ Bucket: this.config.bucket }));
        console.log(`✅ Bucket "${this.config.bucket}" created`);
      } else {
        throw new Error(`Failed to connect to MinIO: ${error.message}. Is MinIO running?`);
      }
    }

    this.initialized = true;
  }

  async uploadFile(file: Buffer, filename: string, mimetype: string): Promise<UploadResult> {
    await this.initialize();

    const hash = createHash('sha256').update(file).digest('hex');
    const extension = filename.split('.').pop() || '';
    const key = `uploads/${hash}.${extension}`;

    const exists = await this.fileExists(key);
    if (exists) {
      console.log(`♻️ File already exists (deduplicated): ${key}`);
      return { key, bucket: this.config.bucket, size: file.length, etag: hash };
    }

    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
      Body: file,
      ContentType: mimetype,
      Metadata: { 'original-filename': filename },
    });

    const response = await this.client.send(command);
    console.log(`📤 Uploaded: ${key} (${file.length} bytes)`);

    return {
      key,
      bucket: this.config.bucket,
      size: file.length,
      etag: response.ETag?.replace(/"/g, '') || '',
    };
  }

  async uploadFileStream(
    filePath: string,
    filename: string,
    mimetype: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<StreamUploadResult> {
    await this.initialize();

    const fileStats = await stat(filePath);
    const fileSize = fileStats.size;
    const extension = extname(filename).slice(1) || '';
    const tempKey = `temp/${randomUUID()}.${extension}`;

    const hashingStream = new HashingStream();
    const fileStream = createReadStream(filePath);
    fileStream.pipe(hashingStream);

    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.config.bucket,
        Key: tempKey,
        Body: hashingStream,
        ContentType: mimetype,
        Metadata: { 'original-filename': filename },
      },
      partSize: 5 * 1024 * 1024,
      queueSize: 4,
    });

    if (onProgress) {
      upload.on('httpUploadProgress', (progress) => {
        onProgress({
          loaded: progress.loaded || 0,
          total: fileSize,
          percentage: Math.round(((progress.loaded || 0) / fileSize) * 100),
        });
      });
    }

    await upload.done();

    const contentHash = hashingStream.digest;
    const finalKey = `uploads/${contentHash}.${extension}`;

    const exists = await this.fileExists(finalKey);
    if (exists) {
      await this.deleteFile(tempKey);
      console.log(`♻️ File already exists (deduplicated): ${finalKey}`);
      return {
        key: finalKey,
        bucket: this.config.bucket,
        size: fileSize,
        etag: contentHash,
        contentHash,
      };
    }

    await this.client.send(new CopyObjectCommand({
      Bucket: this.config.bucket,
      CopySource: `${this.config.bucket}/${tempKey}`,
      Key: finalKey,
    }));
    await this.deleteFile(tempKey);

    console.log(`📤 Streamed: ${finalKey} (${fileSize} bytes)`);

    return {
      key: finalKey,
      bucket: this.config.bucket,
      size: fileSize,
      etag: contentHash,
      contentHash,
    };
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      }));
      return true;
    } catch {
      return false;
    }
  }

  async downloadFile(key: string): Promise<Buffer> {
    await this.initialize();

    const response = await this.client.send(new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    }));

    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }

    console.log(`📥 Downloaded: ${key}`);
    return Buffer.concat(chunks);
  }

  async downloadFileStream(key: string): Promise<Readable> {
    await this.initialize();

    const response = await this.client.send(new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    }));

    console.log(`📥 Streaming download: ${key}`);
    return response.Body as Readable;
  }

  async deleteFile(key: string): Promise<void> {
    await this.initialize();
    await this.client.send(new DeleteObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    }));
    console.log(`🗑️ Deleted: ${key}`);
  }

  async listFiles(prefix?: string): Promise<FileInfo[]> {
    await this.initialize();

    const response = await this.client.send(new ListObjectsV2Command({
      Bucket: this.config.bucket,
      Prefix: prefix,
    }));

    return (response.Contents || []).map((item) => ({
      key: item.Key || '',
      size: item.Size || 0,
      lastModified: item.LastModified || new Date(),
      etag: item.ETag?.replace(/"/g, '') || '',
    }));
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.config.bucket }));
      return true;
    } catch {
      return false;
    }
  }

  async cleanupTempFile(filePath: string): Promise<void> {
    try {
      await unlink(filePath);
      console.log(`🧹 Cleaned up temp file: ${filePath}`);
    } catch {
      console.warn(`⚠️ Failed to cleanup temp file: ${filePath}`);
    }
  }
}

export const storageService = new StorageService();
