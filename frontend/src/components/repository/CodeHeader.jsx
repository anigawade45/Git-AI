import React, { useState } from 'react';
import { Copy, Check, Sparkles, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FileBreadcrumb from './FileBreadcrumb';

export default function CodeHeader({ file, repoName, onAiExplainClick }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!file?.content) return;
    try {
      await navigator.clipboard.writeText(file.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy file content:', err);
    }
  };

  return (
    <div className="p-4 border-b border-border/60 bg-card/80 backdrop-blur flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-t-2xl">
      
      {/* File Path & Language */}
      <div className="space-y-1 min-w-0">
        <FileBreadcrumb repoName={repoName} filePath={file?.path || file?.name} />
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-primary shrink-0" />
          <h3 className="text-sm sm:text-base font-bold font-mono text-foreground truncate">
            {file?.name || 'Select a file'}
          </h3>
          {file?.language && (
            <span className="px-2 py-0.5 rounded bg-muted/60 border border-border/40 font-mono text-[10px] uppercase text-muted-foreground">
              {file.language}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="h-8 text-xs gap-1.5 font-medium cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-500">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </Button>


        <Button
          size="sm"
          onClick={onAiExplainClick}
          className="h-8 text-xs gap-1.5 font-semibold cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Explain with AI</span>
        </Button>
      </div>

    </div>
  );
}
