import { apiClient } from '../../global/api/client';
import type { AddDocumentsRequest, AddDocumentsResponse } from '../types/documents.model';

/**
 * Documents API - Raw HTTP calls
 */

export const documentsApi = {
  /**
   * Add documents to the knowledge base
   */
  addDocuments: async (request: AddDocumentsRequest): Promise<AddDocumentsResponse> => {
    const response = await apiClient.post<AddDocumentsResponse>('/api/documents', {
      content: request.content,
    });
    return response.data;
  },
};
