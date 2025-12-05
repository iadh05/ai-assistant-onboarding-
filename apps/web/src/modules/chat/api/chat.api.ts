import { apiClient } from '../../../core';
import type { ChatRequest, ChatResponse } from '../types/chat.model';

export const chatApi = {
  askQuestion: async (request: ChatRequest): Promise<ChatResponse> => {
    const response = await apiClient.post<ChatResponse>('/api/chat', {
      question: request.question,
      top_k: request.top_k || 5,
    });
    return response.data;
  },
};
