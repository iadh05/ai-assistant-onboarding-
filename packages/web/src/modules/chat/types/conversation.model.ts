import type { Message } from './chat.model';

/**
 * Conversation represents a chat session
 */
export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

/**
 * Generate conversation title from first user message
 */
export function generateConversationTitle(firstMessage: string): string {
  const maxLength = 40;
  const cleaned = firstMessage.trim();

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return cleaned.substring(0, maxLength) + '...';
}

/**
 * Generate unique conversation ID
 */
export function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
