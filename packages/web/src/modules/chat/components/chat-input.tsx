import React from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSubmit, disabled = false }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSubmit();
  };

  const canSubmit = value.trim() && !disabled;

  return (
    <div className="absolute bottom-8 left-0 right-0 px-4 z-20 flex justify-center">
      <div className="w-full max-w-3xl relative">
        <form
          onSubmit={handleSubmit}
          className="
            relative bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl
            shadow-2xl shadow-slate-900/10 transition-all duration-300
            focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50
            focus-within:shadow-blue-900/10
          "
        >
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ask anything..."
            disabled={disabled}
            className="
              w-full pl-6 pr-16 py-5 bg-transparent rounded-2xl focus:outline-none
              placeholder-slate-400 text-slate-700 text-lg font-medium
            "
          />
          <div className="absolute right-3 top-3 flex items-center gap-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className={`
                p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center
                ${
                  canSubmit
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:scale-105 active:scale-95'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }
              `}
            >
              <Send size={20} className={canSubmit ? 'ml-0.5' : ''} />
            </button>
          </div>
        </form>
        <p className="text-center text-[10px] text-slate-400 mt-3 font-medium tracking-wide uppercase opacity-60">
          Powered by Advanced AI • Enterprise Secure
        </p>
      </div>
    </div>
  );
};
