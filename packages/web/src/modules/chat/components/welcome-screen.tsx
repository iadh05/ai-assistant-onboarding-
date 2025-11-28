import React from 'react';
import { Sparkles } from 'lucide-react';
import { QUICK_ACTIONS } from '../types/chat.constants';

interface WelcomeScreenProps {
  onQuickAction: (action: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onQuickAction }) => {
  return (
    <div className="flex-1 overflow-y-auto relative z-10">
      <div className="max-w-4xl mx-auto px-4 py-8 pb-40">
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 animate-fade-in-up">
          <div className="relative group cursor-default">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 blur-2xl opacity-20 rounded-full animate-pulse-glow group-hover:opacity-30 transition-opacity duration-500" />
            <div className="relative w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-900/10 border border-white/50 backdrop-blur-xl animate-float">
              <Sparkles className="w-12 h-12 text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-600 fill-blue-600/10" />
            </div>
          </div>

          <div className="space-y-4 max-w-lg">
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">How can I help you?</h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              I'm your AI assistant. Ask me anything about your documents, and I'll provide instant insights.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-md mt-8">
            {QUICK_ACTIONS.map((action, i) => (
              <button
                key={i}
                onClick={() => onQuickAction(action)}
                className="p-4 bg-white border border-slate-200/60 rounded-xl text-sm font-medium text-slate-600 hover:border-blue-500/30 hover:bg-blue-50/50 hover:text-blue-600 transition-all duration-300 shadow-sm hover:shadow-md text-left group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="group-hover:translate-x-1 inline-block transition-transform duration-300">
                  {action}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
