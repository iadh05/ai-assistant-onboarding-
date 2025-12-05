export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export interface ConversationMemoryConfig {
  maxMessages?: number;
  maxConversations?: number;
}

const DEFAULT_MAX_MESSAGES = 20;
const DEFAULT_MAX_CONVERSATIONS = 100;

export class ConversationMemory {
  private conversations: Map<string, Message[]> = new Map();
  private maxMessages: number;
  private maxConversations: number;

  constructor(config: ConversationMemoryConfig = {}) {
    this.maxMessages = config.maxMessages ?? DEFAULT_MAX_MESSAGES;
    this.maxConversations = config.maxConversations ?? DEFAULT_MAX_CONVERSATIONS;
  }

  addMessage(conversationId: string, message: Message): void {
    let messages = this.conversations.get(conversationId);

    if (!messages) {
      if (this.conversations.size >= this.maxConversations) {
        const oldestKey = this.conversations.keys().next().value;
        if (oldestKey) this.conversations.delete(oldestKey);
      }
      messages = [];
      this.conversations.set(conversationId, messages);
    }

    messages.push({
      ...message,
      timestamp: message.timestamp ?? Date.now(),
    });

    if (messages.length > this.maxMessages) {
      messages.shift();
    }
  }

  getHistory(conversationId: string, limit?: number): Message[] {
    const messages = this.conversations.get(conversationId) ?? [];
    if (limit && limit < messages.length) {
      return messages.slice(-limit);
    }
    return [...messages];
  }

  formatForLLM(conversationId: string, limit?: number): string {
    const messages = this.getHistory(conversationId, limit);
    if (messages.length === 0) return '';

    return messages
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n');
  }

  clear(conversationId: string): void {
    this.conversations.delete(conversationId);
  }

  clearAll(): void {
    this.conversations.clear();
  }

  getConversationCount(): number {
    return this.conversations.size;
  }

  getMessageCount(conversationId: string): number {
    return this.conversations.get(conversationId)?.length ?? 0;
  }
}
