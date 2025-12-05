import React from 'react';
import { MessageSquare, FileText, Activity, Plus, Settings } from 'lucide-react';
import type { ViewMode } from '../types/common.model';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { view: 'chat' as const, label: 'Chat', icon: MessageSquare },
    { view: 'documents' as const, label: 'Knowledge Base', icon: FileText },
    { view: 'health' as const, label: 'System Health', icon: Activity },
  ];

  return (
    <div className="flex flex-col h-screen w-72 bg-slate-900 text-slate-100 border-r border-slate-800/50 shadow-2xl z-20 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-64 bg-blue-500/10 blur-3xl pointer-events-none" />

      {/* Header / Logo */}
      <div className="p-6 border-b border-slate-800/50 backdrop-blur-sm relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
            <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20 border border-blue-500/20">
              <span className="text-xl font-bold text-white">AI</span>
            </div>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white">OnboardBot</h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide">Enterprise Edition</p>
          </div>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4 relative z-10">
        <button
          onClick={() => onViewChange('chat')}
          className="group w-full flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl transition-all duration-300 shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 hover:scale-[1.02] active:scale-[0.98] font-medium border border-blue-500/20"
        >
          <Plus size={20} className="transition-transform duration-500 group-hover:rotate-90" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 relative z-10">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 mb-3 mt-4">
          Main Menu
        </div>
        {navItems.map(({ view, label, icon: Icon }) => (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            className={`
              group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden
              ${currentView === view
                ? 'text-white shadow-lg shadow-slate-900/20 translate-x-1'
                : 'text-slate-400 hover:text-slate-100 hover:translate-x-1'
              }
            `}
          >
            {/* Active Background with Glass Effect */}
            {currentView === view && (
              <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-800/50 border border-slate-700/50 rounded-xl animate-fade-in" />
            )}

            {/* Hover Background */}
            {currentView !== view && (
              <div className="absolute inset-0 bg-slate-800/0 group-hover:bg-slate-800/30 rounded-xl transition-colors duration-300" />
            )}

            <Icon
              size={18}
              className={`relative z-10 transition-colors duration-300 ${currentView === view ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                }`}
            />
            <span className="relative z-10">{label}</span>

            {/* Active Indicator Dot */}
            {currentView === view && (
              <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)] animate-scale-in" />
            )}
          </button>
        ))}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-md relative z-10">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all mb-2 group">
          <Settings size={18} className="transition-transform duration-500 group-hover:rotate-180" />
          <span>Settings</span>
        </button>
        <div className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-800/50 transition-all cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-inner border border-white/10">
              US
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-900 rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate group-hover:text-blue-200 transition-colors">User Account</p>
            <p className="text-xs text-blue-400/80 truncate font-medium">Pro Plan Active</p>
          </div>
        </div>
      </div>
    </div>
  );
};
