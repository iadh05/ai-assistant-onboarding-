import React, { useRef, useEffect } from 'react';
import { Bot } from 'lucide-react';
import type { Message } from '../types/chat.model';
import { MessageBubble } from './message-bubble';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  copiedIndex: number | null;
  onCopy: (content: string, index: number) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isTyping, copiedIndex, onCopy }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto relative z-10">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 pb-40">
        {messages.map((msg, idx) => (
          <MessageBubble
            key={idx}
            message={msg}
            index={idx}
            onCopy={onCopy}
            isCopied={copiedIndex === idx}
          />
        ))}

        {isTyping && (
          <div className="flex gap-6 justify-start animate-fade-in-up">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 border border-slate-100 shadow-sm">
              <Bot size={20} className="text-blue-600" />
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none px-6 py-5 shadow-sm flex items-center gap-1.5">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
