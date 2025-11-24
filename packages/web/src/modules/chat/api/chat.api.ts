import { apiClient } from '../../global/api/client';
import type { ChatRequest, ChatResponse } from '../types/chat.model';

/**
 * Chat API - Raw HTTP calls
 */

export const chatApi = {
  /**
   * Ask a question to the chatbot
   */
  askQuestion: async (request: ChatRequest): Promise<ChatResponse> => {
    const response = await apiClient.post<ChatResponse>('/api/chat', {
      question: request.question,
      top_k: request.top_k || 5,
    });
    return response.data;
  },
};
