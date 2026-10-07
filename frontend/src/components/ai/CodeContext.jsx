import React from 'react';
import { FileCode, X } from 'lucide-react';

export default function CodeContext({ contextFile, onRemoveContext }) {
  if (!contextFile) return null;

  const fileLabel = contextFile.name || contextFile.path || 'Selected file';

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-300 text-xs font-mono mb-2 animate-in fade-in-0 slide-in-from-bottom-1">
      <FileCode className="w-4 h-4 text-purple-500 shrink-0" />
      <span>
        Context: <strong>{fileLabel}</strong>
      </span>
      <button
        type="button"
        onClick={onRemoveContext}
        aria-label="Remove file context"
        className="p-0.5 hover:bg-purple-500/20 rounded-md transition-colors cursor-pointer text-muted-foreground hover:text-foreground ml-1"
        title="Remove file context"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
