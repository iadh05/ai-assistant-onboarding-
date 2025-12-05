import React from 'react';
import { User } from 'lucide-react';

export const UserAvatar: React.FC = () => (
  <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0 border border-indigo-100 mt-1">
    <User size={20} className="text-indigo-600" />
  </div>
);
