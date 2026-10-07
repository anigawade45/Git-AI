import React, { useState } from 'react';
import { Copy, Check, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CodeSnippet({ snippet, fileName, startLine = 1 }) {
  const [copied, setCopied] = useState(false);

  if (!snippet) return null;

  const lines = snippet.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border/80 bg-muted/30 overflow-hidden font-mono text-xs my-2">
      {/* Code Snippet Header */}
      <div className="px-3 py-2 border-b border-border/60 bg-card/80 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
          <FileCode className="w-3.5 h-3.5 text-primary" />
          <span>{fileName || 'Source Code Snippet'}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 text-[10px] gap-1 px-2 font-medium cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-500" />
              <span className="text-emerald-500">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </Button>
      </div>

      {/* Lines Display */}
      <div className="p-3 overflow-x-auto">
        <div className="table w-full">
          {lines.map((line, idx) => {
            const isIssueLine = line.includes('// Issue') || line.includes('← Issue');
            return (
              <div
                key={idx}
                className={`table-row ${isIssueLine ? 'bg-destructive/15 text-destructive font-semibold' : 'hover:bg-accent/40'}`}
              >
                <span className="table-cell pr-3 text-right select-none text-muted-foreground/60 w-8 text-[10px] border-r border-border/40 shrink-0">
                  {startLine + idx}
                </span>
                <span className="table-cell pl-3 whitespace-pre font-mono text-[11px]">
                  {line || ' '}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
