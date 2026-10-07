import React from 'react';
import { ExternalLink, Sparkles, AlertTriangle, Lightbulb } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CodeSnippet from './CodeSnippet';

export default function IssueDetails({ issue, open, onOpenChange, onViewCode, onExplainAi }) {
  if (!issue) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={issue.severity === 'critical' ? 'destructive' : 'outline'}>
              {issue.severity.toUpperCase()}
            </Badge>
            <span className="px-2 py-0.5 rounded bg-muted font-mono text-[10px] uppercase font-bold text-muted-foreground">
              {issue.category}
            </span>
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            {issue.title}
          </DialogTitle>
          <DialogDescription className="font-mono text-xs text-muted-foreground pt-0.5">
            File: <span className="text-foreground font-semibold">{issue.file}</span> (Line {issue.startLine})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2 text-xs sm:text-sm">
          {/* Problem Explanation */}
          <div className="space-y-1">
            <p className="font-bold text-foreground">Problem Description:</p>
            <p className="text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-xl border border-border/60">
              {issue.description}
            </p>
          </div>

          {/* Code Snippet */}
          {issue.snippet && (
            <div className="space-y-1">
              <p className="font-bold text-foreground">Source Code Context:</p>
              <CodeSnippet
                snippet={issue.snippet}
                fileName={issue.file}
                startLine={issue.startLine}
              />
            </div>
          )}

          {/* Recommendation Fix */}
          {issue.recommendation && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Lightbulb className="w-4 h-4 text-emerald-500" />
                <span>Recommended Fix:</span>
              </div>
              <p className="text-xs leading-relaxed">{issue.recommendation}</p>
            </div>
          )}
        </div>

        <DialogFooter className="pt-3">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              if (onViewCode) onViewCode(issue);
            }}
            className="gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <span>View Code</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>

          <Button
            onClick={() => {
              onOpenChange(false);
              if (onExplainAi) onExplainAi(issue);
            }}
            className="gap-1.5 text-xs font-bold cursor-pointer shadow-md bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Explain with AI</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
