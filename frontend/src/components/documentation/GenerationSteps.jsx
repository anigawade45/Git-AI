import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function GenerationSteps({ progress = 0 }) {
  const steps = [
    { num: '01', label: 'Analyze repository metadata & commit history', done: progress >= 15 },
    { num: '02', label: 'Parse AST and directory structure', done: progress >= 35 },
    { num: '03', label: 'Extract dependencies & environment variables', done: progress >= 55 },
    { num: '04', label: 'Generate Markdown sections with AI', done: progress >= 75 },
    { num: '05', label: 'Format document & build section outline', done: progress >= 95 },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs font-mono">
      {steps.map((step) => (
        <div key={step.num} className="flex items-center gap-2">
          {step.done ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <div className="w-4 h-4 rounded-full border border-muted-foreground/40 shrink-0 flex items-center justify-center text-[9px] font-bold text-muted-foreground">
              {step.num}
            </div>
          )}
          <span className={step.done ? 'text-foreground font-medium' : 'text-muted-foreground'}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}
