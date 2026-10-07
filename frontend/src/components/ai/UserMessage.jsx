import React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';

export default function UserMessage({ message }) {
  const { user } = useAuth();

  if (!message) return null;

  const initial =
    user?.name?.trim()?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="flex gap-3 justify-end items-start animate-in fade-in-0 slide-in-from-bottom-2">
      <div className="space-y-1 max-w-2xl text-right min-w-0">
        <div className="inline-block bg-primary text-primary-foreground text-xs sm:text-sm px-4 py-3 rounded-2xl rounded-tr-xs shadow-md leading-relaxed text-left break-words whitespace-pre-wrap">
          {message.content}
        </div>

        {message.timestamp && (
          <p className="text-[10px] text-muted-foreground font-mono px-1">
            {message.timestamp}
          </p>
        )}
      </div>

      <Avatar className="w-8 h-8 bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-xs text-primary shrink-0">
        {initial}
      </Avatar>
    </div>
  );
}