import React from 'react';
import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import GenerationSteps from './GenerationSteps';

export default function GenerationProgress({ progress = 0, message = 'Generating Documentation...' }) {
  return (
    <div className="p-6 rounded-2xl border border-primary/30 bg-primary/5 backdrop-blur space-y-4 animate-in fade-in-0 slide-in-from-top-2 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <h3 className="text-sm font-bold text-foreground">AI Documentation Engine Active...</h3>
        </div>
        <span className="text-xs font-mono font-bold text-primary">{Math.round(progress)}%</span>
      </div>

      <Progress value={progress} className="h-2 w-full" />

      <p className="text-xs font-mono text-muted-foreground">
        Current step: <span className="text-foreground font-semibold">{message}</span>
      </p>

      <GenerationSteps progress={progress} />
    </div>
  );
}
