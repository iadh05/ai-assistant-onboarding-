import { useMutation } from '@tanstack/react-query';
import { chatApi } from '../api/chat.api';
import type { ChatResponse, ChatRequest } from '../types/chat.model';

/**
 * Chat hooks - Business logic + React Query
 */

interface UseAskQuestionParams {
  question: string;
  topK?: number;
}

export const useAskQuestion = () => {
  return useMutation<ChatResponse, Error, UseAskQuestionParams>({
    mutationFn: async ({ question, topK = 5 }: UseAskQuestionParams) => {
      // Validation
      if (!question || question.trim().length === 0) {
        throw new Error('Question cannot be empty');
      }

      if (question.length > 1000) {
        throw new Error('Question is too long (max 1000 characters)');
      }

      if (topK < 1 || topK > 20) {
        throw new Error('topK must be between 1 and 20');
      }

      // Prepare request
      const request: ChatRequest = {
        question: question.trim(),
        top_k: topK,
      };

      // Call API (timeout is handled by axios client - 30s default)
      const response = await chatApi.askQuestion(request);

      return response;
    },
  });
};
