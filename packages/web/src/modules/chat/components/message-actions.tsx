import React from 'react';
import { Copy, ThumbsUp, MoreHorizontal, Check } from 'lucide-react';

interface MessageActionsProps {
  onCopy: () => void;
  isCopied: boolean;
}

export const MessageActions: React.FC<MessageActionsProps> = ({ onCopy, isCopied }) => (
  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-2">
    <button
      onClick={onCopy}
      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
      title={isCopied ? 'Copied!' : 'Copy'}
    >
      {isCopied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
    </button>
    <button
      className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
      title="Helpful"
    >
      <ThumbsUp size={14} />
    </button>
    <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
      <MoreHorizontal size={14} />
    </button>
  </div>
);
