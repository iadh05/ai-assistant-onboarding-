import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';
import type { Source } from '../types/chat.model';

interface SourcesDisplayProps {
  sources: Source[];
}

export const SourcesDisplay: React.FC<SourcesDisplayProps> = ({ sources }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-xs text-slate-500 hover:text-blue-600 transition-colors"
      >
        <FileText size={12} />
        <span>
          {sources.length} source{sources.length > 1 ? 's' : ''}
        </span>
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
                {source.heading && <span className="text-slate-400">• {source.heading}</span>}
              </div>
              <p className="text-slate-600 line-clamp-2">{source.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
