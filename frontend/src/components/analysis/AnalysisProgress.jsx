import React from 'react';
import { Loader2, CheckCircle2, Search } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function AnalysisProgress({ progress = 0, message = 'Analyzing codebase...' }) {
  const steps = [
    { label: 'Repository loaded & AST parsed', done: progress >= 20 },
    { label: 'Scanning files & function complexity', done: progress >= 45 },
    { label: 'Running security vulnerability checks', done: progress >= 70 },
    { label: 'Computing code quality & architecture metrics', done: progress >= 90 },
  ];

  return (
    <div className="p-6 rounded-2xl border border-primary/30 bg-primary/5 backdrop-blur space-y-4 animate-in fade-in-0 slide-in-from-top-2 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <h3 className="text-sm font-bold text-foreground">Analyzing Repository Codebase...</h3>
        </div>
        <span className="text-xs font-mono font-bold text-primary">{progress}%</span>
      </div>

      {/* Progress Bar */}
      <Progress value={progress} className="h-2 w-full" />

      {/* Current Step Message */}
      <p className="text-xs font-mono text-muted-foreground">
        Current step: <span className="text-foreground font-semibold">{message}</span>
      </p>

      {/* Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs font-mono">
        {steps.map((s, idx) => (
          <div key={idx} className="flex items-center gap-2">
            {s.done ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border border-muted-foreground/40 shrink-0" />
            )}
            <span className={s.done ? 'text-foreground font-medium' : 'text-muted-foreground'}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
