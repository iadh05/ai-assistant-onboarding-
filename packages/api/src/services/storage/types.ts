export interface UploadResult {
  key: string;
  bucket: string;
  size: number;
  etag: string;
}

export interface StreamUploadResult extends UploadResult {
  contentHash: string;
}

export interface FileInfo {
  key: string;
  size: number;
  lastModified: Date;
  etag: string;
}

export interface StorageConfig {
  endpoint: string;
  port: number;
  accessKey: string;
  secretKey: string;
  bucket: string;
  useSSL: boolean;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}
