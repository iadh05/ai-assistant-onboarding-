export interface AddDocumentsRequest {
  content: string[];
}

export interface AddDocumentsResponse {
  message: string;
  count: number;
}

export interface UploadDocumentResponse {
  success: boolean;
  documentId: string;
  storageKey: string;
  filename: string;
  fileType: string;
  contentLength: number;
  indexed: boolean;
}

export interface UploadError {
  error: string;
  message: string;
  details?: string;
  existingDocumentId?: string;
}

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface FileUploadState {
  file: File;
  status: UploadStatus;
  progress: number;
  error?: string;
  response?: UploadDocumentResponse;
}
