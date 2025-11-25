import type { Conversation } from '../types/conversation.model';

const STORAGE_KEY = 'onboarding_conversations';

/**
 * Conversation Storage Utility
 *
 * Manages conversation persistence in localStorage
 */
export const conversationStorage = {
  /**
   * Get all conversations sorted by most recent
   */
  getAll(): Conversation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];

      const conversations: Conversation[] = JSON.parse(data);
      return conversations.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      return [];
    }
  },

  /**
   * Get a specific conversation by ID
   */
  getById(id: string): Conversation | null {
    const conversations = this.getAll();
    return conversations.find((conv) => conv.id === id) || null;
  },

  /**
   * Save or update a conversation
   */
  save(conversation: Conversation): void {
    try {
      const conversations = this.getAll();
      const index = conversations.findIndex((conv) => conv.id === conversation.id);

      if (index >= 0) {
        // Update existing
        conversations[index] = conversation;
      } else {
        // Add new
        conversations.push(conversation);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  },

  /**
   * Delete a conversation
   */
  delete(id: string): void {
    try {
      const conversations = this.getAll();
      const filtered = conversations.filter((conv) => conv.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  },

  /**
   * Clear all conversations
   */
  clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear conversations:', error);
    }
  },
};
