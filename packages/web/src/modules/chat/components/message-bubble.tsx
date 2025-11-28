import React from 'react';
import type { Message } from '../types/chat.model';
import { MESSAGE_ROLES } from '../types/chat.constants';
import { BotAvatar } from './bot-avatar';
import { UserAvatar } from './user-avatar';
import { MessageActions } from './message-actions';
import { SourcesDisplay } from './sources-display';

interface MessageBubbleProps {
  message: Message;
  index: number;
  onCopy: (content: string, index: number) => void;
  isCopied: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, index, onCopy, isCopied }) => {
  const isUser = message.role === MESSAGE_ROLES.USER;

  return (
    <div className={`flex gap-6 animate-fade-in-up group ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <BotAvatar />}

      <div className={`flex flex-col gap-2 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-8 py-6 shadow-sm relative overflow-hidden ${
            isUser
              ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-none shadow-blue-900/20'
              : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none shadow-slate-200/50'
          }`}
        >
          {isUser && (
            <div
              className="absolute inset-0 bg-white/10 animate-shimmer pointer-events-none"
              style={{ backgroundSize: '200% 100%' }}
            />
          )}
          <p className="whitespace-pre-wrap leading-relaxed text-[15px] relative z-10">{message.content}</p>

          {!isUser && message.sources && <SourcesDisplay sources={message.sources} />}
        </div>

        {!isUser && <MessageActions onCopy={() => onCopy(message.content, index)} isCopied={isCopied} />}
      </div>

      {isUser && <UserAvatar />}
    </div>
  );
};
