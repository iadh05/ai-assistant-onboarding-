import { apiClient } from '../../../core';
import type { AddDocumentsRequest, AddDocumentsResponse } from '../types/documents.model';

export const documentsApi = {
  addDocuments: async (request: AddDocumentsRequest): Promise<AddDocumentsResponse> => {
    const response = await apiClient.post<AddDocumentsResponse>('/api/documents', {
      content: request.content,
    });
    return response.data;
  },
};
