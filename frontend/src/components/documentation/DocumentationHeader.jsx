import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DocumentationHeader({ repo, lastGenerated, isGenerating, onGenerateClick }) {
  return (
    <div className="space-y-4 pb-2 border-b border-border/60">
      {/* Back Link */}
      <div>
        <Link
          to={`/repository/${repo?.id || 'ecommerce-platform'}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Repository Explorer</span>
        </Link>
      </div>

      {/* Header Info & CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Documentation Generator
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-sans font-bold">
              <CheckCircle2 className="w-3 h-3" /> AI Engine Ready
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
            Generate clear READMEs, REST API references, architecture guides, and setup instructions from <strong className="font-mono text-foreground">{repo?.name || 'ecommerce-platform'}</strong>.
          </p>
          <p className="text-[11px] font-mono text-muted-foreground pt-0.5">
            Last generated: <span className="text-foreground font-semibold">{lastGenerated || 'Never'}</span>
          </p>
        </div>

        {/* Action Button */}
        <Button
          onClick={onGenerateClick}
          disabled={isGenerating}
          className="h-11 px-5 rounded-xl text-xs font-bold gap-2 cursor-pointer shadow-md bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 sm:self-start"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Documentation...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{lastGenerated ? 'Regenerate Documentation' : 'Generate Documentation'}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
