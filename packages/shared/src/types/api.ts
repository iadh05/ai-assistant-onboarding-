import { z } from 'zod';

// ============================================
// Chat API Types
// ============================================

export const SourceSchema = z.object({
  chunk_id: z.string(),
  text: z.string(),
  source: z.string(),
  heading: z.string(),
});

export const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  sources: z.array(SourceSchema).optional(),
});

export const ChatRequestSchema = z.object({
  question: z.string().min(1, 'Question cannot be empty'),
  top_k: z.number().int().positive().optional().default(5),
});

export const ChatResponseSchema = z.object({
  answer: z.string(),
  sources: z.array(SourceSchema),
});

// ============================================
// Document API Types
// ============================================

export const AddDocumentsRequestSchema = z.object({
  content: z.array(z.string()),
});

export const AddDocumentsResponseSchema = z.object({
  message: z.string(),
  count: z.number().int().nonnegative(),
});

export const UploadDocumentResponseSchema = z.object({
  success: z.boolean(),
  documentId: z.string(),
  storageKey: z.string(),
  filename: z.string(),
  fileType: z.string(),
  contentLength: z.number().int().nonnegative(),
  indexed: z.boolean(),
});

export const UploadErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.string().optional(),
  existingDocumentId: z.string().optional(),
});

export const UploadStatusSchema = z.enum(['idle', 'uploading', 'success', 'error']);

// ============================================
// Health API Types
// ============================================

export const HealthResponseSchema = z.object({
  status: z.enum(['healthy', 'unhealthy', 'degraded']),
  timestamp: z.string(),
  services: z.record(z.object({
    status: z.enum(['up', 'down']),
    latency: z.number().optional(),
  })).optional(),
});

// ============================================
// Error Types
// ============================================

export const ApiErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.string().optional(),
});

// ============================================
// Inferred TypeScript Types
// ============================================

export type Source = z.infer<typeof SourceSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
export type AddDocumentsRequest = z.infer<typeof AddDocumentsRequestSchema>;
export type AddDocumentsResponse = z.infer<typeof AddDocumentsResponseSchema>;
export type UploadDocumentResponse = z.infer<typeof UploadDocumentResponseSchema>;
export type UploadError = z.infer<typeof UploadErrorSchema>;
export type UploadStatus = z.infer<typeof UploadStatusSchema>;
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
