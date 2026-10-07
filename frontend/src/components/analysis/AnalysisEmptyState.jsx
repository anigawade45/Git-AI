import React from 'react';
import { Search, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AnalysisEmptyState({ onRunAnalysis, repoName = 'repository', isIndexing = false }) {
  if (isIndexing) {
    return (
      <div className="p-12 text-center border border-dashed border-amber-500/30 rounded-2xl bg-amber-500/5 backdrop-blur space-y-4 max-w-xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-foreground">Repository Indexing in Progress</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="font-mono text-foreground">{repoName}</strong> is currently being indexed into vector storage. Codebase health analysis will be enabled automatically as soon as indexing completes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-12 text-center border border-dashed border-border/80 rounded-2xl bg-card/50 backdrop-blur space-y-4 max-w-xl mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
        <Search className="w-7 h-7" />
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-foreground">No Analysis Available</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Run an automated health analysis on <strong className="font-mono text-foreground">{repoName}</strong> to detect hardcoded secrets, code complexity, performance bottlenecks, and architectural patterns.
        </p>
      </div>
      <Button onClick={onRunAnalysis} className="gap-2 shadow-md cursor-pointer font-bold bg-primary hover:bg-primary/90">
        <Sparkles className="w-4 h-4 text-amber-300" />
        <span>Analyze Repository Now</span>
      </Button>
    </div>
  );
}
