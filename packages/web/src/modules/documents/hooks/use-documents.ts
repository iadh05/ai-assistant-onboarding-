import { useMutation } from '@tanstack/react-query';
import { documentsApi } from '../api/documents.api';
import type { AddDocumentsResponse, AddDocumentsRequest } from '../types/documents.model';

export const useAddDocuments = () => {
  return useMutation<AddDocumentsResponse, Error, string[]>({
    mutationFn: async (content: string[]) => {
      if (!content || content.length === 0) {
        throw new Error('Content cannot be empty');
      }

      const validContent = content
        .map(doc => doc.trim())
        .filter(doc => doc.length > 0);

      if (validContent.length === 0) {
        throw new Error('No valid documents provided');
      }

      const oversizedDocs = validContent.filter(doc => doc.length > 10000);
      if (oversizedDocs.length > 0) {
        throw new Error(`${oversizedDocs.length} document(s) exceed maximum size of 10,000 characters`);
      }

      const request: AddDocumentsRequest = {
        content: validContent,
      };

      return await documentsApi.addDocuments(request);
    },
  });
};
