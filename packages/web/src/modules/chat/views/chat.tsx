import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAskQuestion } from '../hooks/use-chat';
import { useConversation } from '../hooks/use-conversation';
import { getErrorMessage } from '../utils/error-messages';
import { TIMING } from '../types/chat.constants';
import { WelcomeScreen } from '../components/welcome-screen';
import { MessageList } from '../components/message-list';
import { ChatInput } from '../components/chat-input';

export const Chat: React.FC = () => {
  const [input, setInput] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { messages, addUserMessage, addAssistantMessage } = useConversation();
  const mutation = useAskQuestion();

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async (content: string, index: number) => {
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }

    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      copyTimeoutRef.current = setTimeout(() => setCopiedIndex(null), TIMING.COPY_FEEDBACK_MS);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  const handleSubmit = () => {
    if (!input.trim() || mutation.isPending) return;

    const question = input;
    setInput('');
    addUserMessage(question);

    mutation.mutate(
      { question, topK: 5 },
      {
        onSuccess: (data) => {
          addAssistantMessage(data.answer, data.sources);
        },
        onError: (error) => {
          addAssistantMessage(getErrorMessage(error));
        },
      }
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '-3s' }}
        />
      </div>

      {messages.length === 0 ? (
        <WelcomeScreen onQuickAction={setInput} />
      ) : (
        <MessageList
          messages={messages}
          isTyping={mutation.isPending}
          copiedIndex={copiedIndex}
          onCopy={handleCopy}
        />
      )}

      <ChatInput value={input} onChange={setInput} onSubmit={handleSubmit} disabled={mutation.isPending} />
    </div>
  );
};
