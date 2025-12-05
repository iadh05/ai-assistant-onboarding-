import { Router } from 'express';
import multer from 'multer';
import { tmpdir } from 'os';
import { readFile } from 'fs/promises';
import { AddDocumentsRequestSchema, HTTP_STATUS } from '@onboarding/shared';
import { handleGrpcError } from '../errors/index.js';
import { storageService } from '../../services/storage/index.js';
// @ts-ignore - will resolve after core package is built
import { fileValidator, contentExtractor, textSanitizer, documentDeduplicator } from '@onboarding/core';

// Size threshold for switching to disk storage (10MB)
const MEMORY_LIMIT = 10 * 1024 * 1024;
// Max file size for streaming upload (100MB)
const MAX_FILE_SIZE = 100 * 1024 * 1024;

// Disk storage for large files
const diskStorage = multer.diskStorage({
  destination: tmpdir(),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `upload-${uniqueSuffix}-${file.originalname}`);
  },
});

// Use disk storage with 100MB limit
const upload = multer({
  storage: diskStorage,
  limits: { fileSize: MAX_FILE_SIZE },
});

export function createDocumentRoutes(documentClient: any, promisifyGrpcCall: Function): Router {
  const router = Router();

  // Add Documents (JSON body - for programmatic use)
  router.post('/', async (req, res) => {
    try {
      const parseResult = AddDocumentsRequestSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'Validation failed',
          message: parseResult.error.issues[0]?.message || 'Invalid request',
        });
      }

      const { content } = parseResult.data;

      if (content.length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'Invalid content',
          message: 'Please provide at least one document to add.'
        });
      }

      console.log(`[REST Gateway] Adding ${content.length} document(s)`);

      const documents = content.map((docContent: string, index: number) => ({
        content: docContent,
        source: `document-${index + 1}`,
      }));

      const response = await promisifyGrpcCall(documentClient, 'addDocuments', {
        documents,
      });

      res.json(response);
    } catch (error) {
      handleGrpcError(res, error, 'Failed to add documents');
    }
  });

  // Upload Document (multipart/form-data - for file uploads from UI)
  router.post('/upload', upload.single('file'), async (req, res) => {
    const tempFilePath = req.file?.path;

    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'No file provided',
          message: 'Please select a file to upload.'
        });
      }

      const { originalname, mimetype, size, path: filePath } = req.file;
      console.log(`[REST Gateway] Upload: ${originalname} (${size} bytes, ${mimetype})`);

      // Read file for validation and extraction (streaming for storage)
      const buffer = await readFile(filePath);

      // Step 1: Validate file
      const validation = fileValidator.validate(buffer, originalname, mimetype);
      if (!validation.valid) {
        return res.status(400).json({
          error: 'Validation failed',
          message: validation.error
        });
      }

      // Step 2: Upload to MinIO (streaming for large files)
      let storageResult;
      if (size > MEMORY_LIMIT) {
        console.log(`[REST Gateway] Using streaming upload for large file (${Math.round(size / 1024 / 1024)}MB)`);
        storageResult = await storageService.uploadFileStream(filePath, originalname, mimetype);
      } else {
        storageResult = await storageService.uploadFile(buffer, originalname, mimetype);
      }
      console.log(`[REST Gateway] Stored: ${storageResult.key}`);

      // Step 3: Extract text content
      const extraction = await contentExtractor.extract(buffer, validation.fileType!);
      if (!extraction.success) {
        return res.status(422).json({
          error: 'Extraction failed',
          message: extraction.error
        });
      }

      // Step 4: Sanitize text for RAG
      const sanitized = textSanitizer.sanitize(extraction.text!);
      console.log(`[REST Gateway] Sanitized: ${sanitized.changes.length} changes applied`);

      // Step 5: Check for duplicates
      const dedup = documentDeduplicator.checkDuplicate(sanitized.text);
      if (dedup.isDuplicate) {
        return res.status(409).json({
          error: 'Duplicate document',
          message: 'This document has already been uploaded.',
          existingDocumentId: dedup.existingDocumentId
        });
      }

      // Step 6: Send to Document Service for indexing
      const grpcResponse = await promisifyGrpcCall(documentClient, 'addDocuments', {
        documents: [{
          content: sanitized.text,
          source: originalname,
          metadata: {
            storageKey: storageResult.key,
            contentHash: dedup.contentHash,
            fileType: validation.fileType,
            originalSize: size,
            extractedLength: sanitized.text.length,
            ...extraction.metadata
          }
        }]
      });

      // Step 7: Register hash for future dedup checks
      const documentId = grpcResponse.document_ids?.[0] || storageResult.key;
      documentDeduplicator.register(dedup.contentHash, documentId);

      res.status(201).json({
        success: true,
        documentId,
        storageKey: storageResult.key,
        filename: originalname,
        fileType: validation.fileType,
        contentLength: sanitized.text.length,
        indexed: true
      });

    } catch (error) {
      console.error('[REST Gateway] Upload error:', error);
      handleGrpcError(res, error, 'Failed to upload document');
    } finally {
      // Always cleanup temp file
      if (tempFilePath) {
        await storageService.cleanupTempFile(tempFilePath);
      }
    }
  });

  // Clear all documents (for testing/reset)
  router.delete('/clear', async (_req, res) => {
    try {
      console.log('[REST Gateway] Clearing all documents...');

      const response = await promisifyGrpcCall(documentClient, 'clearDocuments', {});

      // Also clear deduplication registry
      documentDeduplicator.clear();

      res.json({
        success: true,
        chunksRemoved: response.chunks_removed,
        message: response.message
      });
    } catch (error) {
      handleGrpcError(res, error, 'Failed to clear documents');
    }
  });

  return router;
}
