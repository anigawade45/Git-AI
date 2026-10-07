import React, { useEffect, useRef } from 'react';
import { FileCode, Sparkles, AlertCircle } from 'lucide-react';
import CodeHeader from './CodeHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

export default function CodeViewer({
  file,
  repoName,
  isLoading,
  error,
  targetLine,
  onAiExplainClick,
}) {
  const targetLineRef = useRef(null);

  const targetLineNumber = Number(targetLine);
  const isValidTargetLine = Number.isInteger(targetLineNumber) && targetLineNumber > 0;

  useEffect(() => {
    if (isValidTargetLine && targetLineRef.current) {
      targetLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [file, targetLine, isValidTargetLine]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/80 bg-card/90 backdrop-blur shadow-xl overflow-hidden flex flex-col p-6 space-y-4 min-h-[450px]">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-[360px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-card/90 backdrop-blur p-6 space-y-4 min-h-[300px] flex flex-col justify-center">
        <Alert variant="destructive">
          <AlertCircle className="w-5 h-5" />
          <div>
            <AlertTitle>File Content Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </div>
        </Alert>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur min-h-[450px] flex flex-col items-center justify-center p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground">
          <FileCode className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-sm">
          <h4 className="text-base font-bold text-foreground">No file selected</h4>
          <p className="text-xs text-muted-foreground">
            Select a file from the repository file explorer to view its source code.
          </p>
        </div>
      </div>
    );
  }

  const lines =
    file.content !== null && file.content !== undefined
      ? file.content.split('\n')
      : ['// File content unavailable'];

  return (
    <div className="rounded-2xl border border-border/80 bg-card/90 backdrop-blur shadow-xl overflow-hidden flex flex-col min-w-0 w-full max-w-full">
      {/* Code Header */}
      <CodeHeader
        file={file}
        repoName={repoName}
        onAiExplainClick={onAiExplainClick}
      />

      {/* Code Viewport with Line Numbers */}
      <div className="overflow-x-auto p-4 bg-muted/20 font-mono text-xs sm:text-sm leading-relaxed min-h-[400px] max-h-[600px] select-text min-w-0 w-full max-w-full">
        <div className="table w-full">
          {lines.map((line, idx) => {
            const lineNumber = idx + 1;
            const isTargetLine = isValidTargetLine && lineNumber === targetLineNumber;

            return (
              <div
                key={idx}
                ref={isTargetLine ? targetLineRef : null}
                className={cn(
                  'table-row hover:bg-accent/40 transition-colors group',
                  isTargetLine && 'bg-purple-500/25 dark:bg-purple-500/35 border-l-4 border-purple-500 font-bold'
                )}
              >
                {/* Line Number */}
                <span
                  className={cn(
                    'table-cell pr-4 text-right select-none text-muted-foreground/60 group-hover:text-muted-foreground w-10 text-[11px] font-mono border-r border-border/40 pr-3 shrink-0',
                    isTargetLine && 'text-purple-600 dark:text-purple-300 font-extrabold'
                  )}
                >
                  {lineNumber}
                </span>
                {/* Line Content */}
                <span
                  className={cn(
                    'table-cell pl-4 whitespace-pre text-foreground font-mono',
                    isTargetLine && 'text-purple-900 dark:text-purple-100 font-semibold'
                  )}
                >
                  {line || ' '}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-border/60 bg-card/60 flex items-center justify-between text-[11px] font-mono text-muted-foreground px-4">
        <span>{lines.length} lines</span>
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-primary" /> Live GitHub Source Code
        </span>
      </div>
    </div>
  );
}
