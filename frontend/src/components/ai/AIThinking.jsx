import React from 'react';
import { Bot, Loader2 } from 'lucide-react';

const STAGES = {
  retrieving: {
    title: 'Analyzing repository codebase...',
    detail: 'Searching codebase for relevant context chunks...',
  },
  generating: {
    title: 'Generating AI response...',
    detail: 'Synthesizing answer from retrieved code context...',
  },
  finalizing: {
    title: 'Finalizing response...',
    detail: 'Validating source references and line citations...',
  },
};

export default function AIThinking({ stage = 'retrieving' }) {
  const current = STAGES[stage] || STAGES.retrieving;

  return (
    <div className="flex gap-3 max-w-3xl items-start animate-in fade-in-0 slide-in-from-bottom-2">
      {/* Bot Avatar */}
      <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
        <Bot className="w-4 h-4" />
      </div>

      {/* Thinking Bubble */}
      <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-md space-y-2 flex-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-500" />
          <span>{current.title}</span>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
          {current.detail}
        </p>
      </div>
    </div>
  );
}
