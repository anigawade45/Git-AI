import React from 'react';
import { Clock } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';

export default function CommitInfo({ commit }) {
  if (!commit) return null;

  return (
    <div className="p-3 rounded-xl bg-card/60 border border-border/60 backdrop-blur flex items-center justify-between text-xs gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <Avatar className="w-6 h-6 bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-[10px] text-primary shrink-0">
          {commit.author ? commit.author.charAt(0).toUpperCase() : 'U'}
        </Avatar>
        <div className="min-w-0">
          <p className="font-semibold text-foreground truncate">{commit.author || 'Developer'}</p>
          <p className="text-[11px] text-muted-foreground truncate">{commit.message || 'No commit message'}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground shrink-0">
        <span className="px-2 py-0.5 rounded bg-muted/60 border border-border/40 text-foreground">
          {commit.hash ?? '—'}
        </span>
        <span className="hidden sm:inline">•</span>
        <span className="hidden sm:flex items-center gap-1">
          <Clock className="w-3 h-3" /> {commit.time ?? '—'}
        </span>
      </div>
    </div>
  );
}
