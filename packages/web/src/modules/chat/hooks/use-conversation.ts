import { useState, useEffect, useCallback } from 'react';
import type { Message } from '../types/chat.model';
import type { Conversation } from '../types/conversation.model';
import { generateConversationId, generateConversationTitle } from '../types/conversation.model';
import { conversationStorage } from '../utils/conversation-storage';
import { MESSAGE_ROLES } from '../types/chat.constants';

interface UseConversationReturn {
  messages: Message[];
  conversationId: string | null;
  addUserMessage: (content: string) => void;
  addAssistantMessage: (content: string, sources?: Message['sources']) => void;
  clearConversation: () => void;
}

export function useConversation(): UseConversationReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (messages.length === 0 || !conversationId) return;

    const firstUserMessage = messages.find((m) => m.role === MESSAGE_ROLES.USER);
    const conversation: Conversation = {
      id: conversationId,
      title: firstUserMessage ? generateConversationTitle(firstUserMessage.content) : 'New Conversation',
      messages,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    conversationStorage.save(conversation);
  }, [messages, conversationId]);

  const addUserMessage = useCallback((content: string) => {
    setConversationId((prev) => prev ?? generateConversationId());
    setMessages((prev) => [...prev, { role: MESSAGE_ROLES.USER, content }]);
  }, []);

  const addAssistantMessage = useCallback((content: string, sources?: Message['sources']) => {
    setMessages((prev) => [...prev, { role: MESSAGE_ROLES.ASSISTANT, content, sources }]);
  }, []);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
  }, []);

  return {
    messages,
    conversationId,
    addUserMessage,
    addAssistantMessage,
    clearConversation,
  };
}
