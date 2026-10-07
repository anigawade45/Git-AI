import React from 'react';
import { BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DocumentationEmptyState({ onGenerateClick, repoName = 'repository' }) {
  const highlights = [
    'Project Overview & Features',
    'Installation & Environment Setup',
    'REST API Endpoint Reference',
    'System Architecture Diagrams',
    'JSDoc Module Specifications',
  ];

  return (
    <div className="p-10 text-center border border-dashed border-border/80 rounded-2xl bg-card/50 backdrop-blur space-y-5 max-w-xl mx-auto animate-in fade-in-0">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
        <BookOpen className="w-7 h-7" />
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-bold text-foreground">No Documentation Generated</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Generate AI-powered technical documentation from <strong className="font-mono text-foreground">{repoName}</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left text-xs font-mono pt-2 border-t border-border/40">
        {highlights.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </div>

      <Button onClick={onGenerateClick} className="gap-2 shadow-md cursor-pointer font-bold bg-primary hover:bg-primary/90">
        <Sparkles className="w-4 h-4 text-amber-300" />
        <span>Generate Documentation Now</span>
      </Button>
    </div>
  );
}
