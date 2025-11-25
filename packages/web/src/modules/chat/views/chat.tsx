import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Sparkles, Copy, ThumbsUp, MoreHorizontal, FileText, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useAskQuestion } from '../hooks/use-chat';
import type { Message, ChatResponse, Source } from '../types/chat.model';
import type { Conversation } from '../types/conversation.model';
import { generateConversationId, generateConversationTitle } from '../types/conversation.model';
import { conversationStorage } from '../utils/conversation-storage';

// Sources display component - shows where the answer came from
const SourcesDisplay: React.FC<{ sources: Source[] }> = ({ sources }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-xs text-slate-500 hover:text-blue-600 transition-colors"
      >
        <FileText size={12} />
        <span>{sources.length} source{sources.length > 1 ? 's' : ''}</span>
        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-2 animate-fade-in">
          {sources.map((source, idx) => (
            <div
              key={source.chunk_id || idx}
              className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-slate-700">{source.source}</span>
                {source.heading && (
                  <span className="text-slate-400">• {source.heading}</span>
                )}
              </div>
              <p className="text-slate-600 line-clamp-2">{source.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Save conversation to localStorage whenever messages change
  useEffect(() => {
    if (messages.length === 0 || !conversationId) return;

    const firstUserMessage = messages.find((m) => m.role === 'user');
    const conversation: Conversation = {
      id: conversationId,
      title: firstUserMessage ? generateConversationTitle(firstUserMessage.content) : 'New Conversation',
      messages,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    conversationStorage.save(conversation);
  }, [messages, conversationId]);

  // Copy message to clipboard
  const handleCopy = useCallback(async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  const mutation = useAskQuestion();

  const handleSuccess = (data: ChatResponse) => {
    setIsTyping(false);
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: data.answer,
        sources: data.sources, // Store sources with the message
      },
    ]);
  };

  const handleError = (error: Error & { code?: string }) => {
    setIsTyping(false);

    // Better error messages for common issues
    let errorMessage = error.message || 'Failed to get response';
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      errorMessage = 'Request timed out. The server took too long to respond. Please try again.';
    } else if (error.message?.includes('Network Error')) {
      errorMessage = 'Network error. Please check your connection and try again.';
    }

    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: `Error: ${errorMessage}`,
      },
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || mutation.isPending) return;

    // Create new conversation ID if this is the first message
    if (!conversationId) {
      setConversationId(generateConversationId());
    }

    setMessages((prev) => [...prev, { role: 'user', content: input }]);
    setIsTyping(true);
    mutation.mutate(
      { question: input, topK: 5 },
      {
        onSuccess: handleSuccess,
        onError: handleError,
      }
    );
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 pb-40">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 animate-fade-in-up">
              <div className="relative group cursor-default">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 blur-2xl opacity-20 rounded-full animate-pulse-glow group-hover:opacity-30 transition-opacity duration-500" />
                <div className="relative w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-900/10 border border-white/50 backdrop-blur-xl animate-float">
                  <Sparkles className="w-12 h-12 text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-600 fill-blue-600/10" />
                </div>
              </div>
              <div className="space-y-4 max-w-lg">
                <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
                  How can I help you?
                </h2>
                <p className="text-slate-500 text-lg leading-relaxed">
                  I'm your AI assistant. Ask me anything about your documents, and I'll provide instant insights.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-md mt-8">
                {['Summarize document', 'Key insights', 'Explain concepts', 'Find details'].map((action, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(action)}
                    className="p-4 bg-white border border-slate-200/60 rounded-xl text-sm font-medium text-slate-600 hover:border-blue-500/30 hover:bg-blue-50/50 hover:text-blue-600 transition-all duration-300 shadow-sm hover:shadow-md text-left group"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <span className="group-hover:translate-x-1 inline-block transition-transform duration-300">{action}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-6 animate-fade-in-up group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 border border-slate-100 shadow-sm mt-1">
                      <Bot size={20} className="text-blue-600" />
                    </div>
                  )}

                  <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`rounded-2xl px-8 py-6 shadow-sm relative overflow-hidden ${msg.role === 'user'
                          ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-none shadow-blue-900/20'
                          : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none shadow-slate-200/50'
                        }`}
                    >
                      {msg.role === 'user' && (
                        <div className="absolute inset-0 bg-white/10 animate-shimmer pointer-events-none" style={{ backgroundSize: '200% 100%' }} />
                      )}
                      <p className="whitespace-pre-wrap leading-relaxed text-[15px] relative z-10">{msg.content}</p>

                      {/* Sources - only for assistant messages */}
                      {msg.role === 'assistant' && msg.sources && (
                        <SourcesDisplay sources={msg.sources} />
                      )}
                    </div>

                    {/* Message Actions (Assistant Only) */}
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-2">
                        <button
                          onClick={() => handleCopy(msg.content, idx)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={copiedIndex === idx ? 'Copied!' : 'Copy'}
                        >
                          {copiedIndex === idx ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Helpful">
                          <ThumbsUp size={14} />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0 border border-indigo-100 mt-1">
                      <User size={20} className="text-indigo-600" />
                    </div>
                  )}
                </div>
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
            </>
          )}
        </div>
      </div>

      {/* Floating Command Bar */}
      <div className="absolute bottom-8 left-0 right-0 px-4 z-20 flex justify-center">
        <div className="w-full max-w-3xl relative">
          <form
            onSubmit={handleSubmit}
            className={`
              relative bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl shadow-slate-900/10 transition-all duration-300
              ${input.trim() ? 'scale-100 opacity-100' : 'scale-100 opacity-100'}
              focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50 focus-within:shadow-blue-900/10
            `}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              disabled={mutation.isPending}
              className="w-full pl-6 pr-16 py-5 bg-transparent rounded-2xl focus:outline-none placeholder-slate-400 text-slate-700 text-lg font-medium"
            />
            <div className="absolute right-3 top-3 flex items-center gap-2">
              <button
                type="submit"
                disabled={!input.trim() || mutation.isPending}
                className={`
                  p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center
                  ${input.trim()
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:scale-105 active:scale-95'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
                `}
              >
                <Send size={20} className={input.trim() ? 'ml-0.5' : ''} />
              </button>
            </div>
          </form>
          <p className="text-center text-[10px] text-slate-400 mt-3 font-medium tracking-wide uppercase opacity-60">
            Powered by Advanced AI • Enterprise Secure
          </p>
        </div>
      </div>
    </div>
  );
};
