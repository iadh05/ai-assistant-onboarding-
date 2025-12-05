import type {
  AddDocumentsRequest,
  AddDocumentsResponse,
  UploadDocumentResponse,
  UploadError,
  UploadStatus,
} from '@onboarding/shared';

// Re-export types from shared package
export type {
  AddDocumentsRequest,
  AddDocumentsResponse,
  UploadDocumentResponse,
  UploadError,
  UploadStatus,
};

// Re-export schemas if needed for runtime validation
export {
  AddDocumentsRequestSchema,
  AddDocumentsResponseSchema,
  UploadDocumentResponseSchema,
  UploadErrorSchema,
  UploadStatusSchema,
} from '@onboarding/shared';

// Local UI state types (not shared with backend)
export interface FileUploadState {
  file: File;
  status: UploadStatus;
  progress: number;
  error?: string;
  response?: UploadDocumentResponse;
}
