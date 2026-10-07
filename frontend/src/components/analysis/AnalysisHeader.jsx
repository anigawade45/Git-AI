import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AnalysisHeader({ repo, lastAnalyzed, isAnalyzing, onRunAnalysis }) {
  const formatLastAnalyzed = (val) => {
    if (!val) return 'Not analyzed yet';
    if (typeof val === 'string' && (val === 'Just now' || val.includes('ago'))) return val;

    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);

    const diffSec = Math.floor((new Date() - d) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} minutes ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-4 pb-2 border-b border-border/60">
      {/* Back Link */}
      <div>
        <Link
          to={`/repository/${encodeURIComponent(repo?.repoId || repo?.id || 'ecommerce-platform')}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Repository Explorer</span>
        </Link>
      </div>

      {/* Header Info & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Code Analysis & Health Audit
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-sans font-bold">
              <CheckCircle2 className="w-3 h-3" /> Audit Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
            Proactively scan <strong className="font-mono text-foreground">{repo?.name || 'repository'}</strong> for hardcoded credentials, code complexity, and static AST security patterns.
          </p>
          <p className="text-[11px] font-mono text-muted-foreground pt-1">
            Last analyzed: <span className="text-foreground font-semibold">{formatLastAnalyzed(lastAnalyzed)}</span>
          </p>
        </div>

        {/* Action Button */}
        <Button
          onClick={onRunAnalysis}
          disabled={isAnalyzing}
          className="h-11 px-5 rounded-xl text-xs font-bold gap-2 cursor-pointer shadow-md bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 sm:self-start"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Repository...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Run Analysis</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
