import { apiClient } from '../../../core';
import type {
  AddDocumentsRequest,
  AddDocumentsResponse,
  UploadDocumentResponse,
} from '../types/documents.model';

export const documentsApi = {
  addDocuments: async (request: AddDocumentsRequest): Promise<AddDocumentsResponse> => {
    const response = await apiClient.post<AddDocumentsResponse>('/api/documents', {
      content: request.content,
    });
    return response.data;
  },

  uploadDocument: async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadDocumentResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<UploadDocumentResponse>(
      '/api/documents/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (event.total && onProgress) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        },
      }
    );

    return response.data;
  },
};
