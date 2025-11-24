import { useMutation } from '@tanstack/react-query';
import { documentsApi } from '../api/documents.api';
import type { AddDocumentsResponse, AddDocumentsRequest } from '../types/documents.model';

/**
 * Documents hooks - Business logic + React Query
 */

export const useAddDocuments = () => {
  return useMutation<AddDocumentsResponse, Error, string[]>({
    mutationFn: async (content: string[]) => {
      // Validation
      if (!content || content.length === 0) {
        throw new Error('Content cannot be empty');
      }

      // Filter out empty documents
      const validContent = content
        .map(doc => doc.trim())
        .filter(doc => doc.length > 0);

      if (validContent.length === 0) {
        throw new Error('No valid documents provided');
      }

      // Check document size limits (max 10,000 chars per document)
      const oversizedDocs = validContent.filter(doc => doc.length > 10000);
      if (oversizedDocs.length > 0) {
        throw new Error(`${oversizedDocs.length} document(s) exceed maximum size of 10,000 characters`);
      }

      // Prepare request
      const request: AddDocumentsRequest = {
        content: validContent,
      };

      // Call API
      return await documentsApi.addDocuments(request);
    },
  });
};
