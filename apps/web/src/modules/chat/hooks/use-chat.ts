import { useMutation } from '@tanstack/react-query';
import { chatApi } from '../api/chat.api';
import type { ChatResponse, ChatRequest } from '../types/chat.model';

interface UseAskQuestionParams {
  question: string;
  topK?: number;
}

export const useAskQuestion = () => {
  return useMutation<ChatResponse, Error, UseAskQuestionParams>({
    mutationFn: async ({ question, topK = 5 }: UseAskQuestionParams) => {
      if (!question || question.trim().length === 0) {
        throw new Error('Question cannot be empty');
      }

      if (question.length > 1000) {
        throw new Error('Question is too long (max 1000 characters)');
      }

      if (topK < 1 || topK > 20) {
        throw new Error('topK must be between 1 and 20');
      }

      const request: ChatRequest = {
        question: question.trim(),
        top_k: topK,
      };

      const response = await chatApi.askQuestion(request);

      return response;
    },
  });
};
