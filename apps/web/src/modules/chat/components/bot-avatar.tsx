import React from 'react';
import { Bot } from 'lucide-react';

export const BotAvatar: React.FC = () => (
  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 border border-slate-100 shadow-sm mt-1">
    <Bot size={20} className="text-blue-600" />
  </div>
);
