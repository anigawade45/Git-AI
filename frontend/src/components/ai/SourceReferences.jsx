import React from 'react';
import { FileCode2 } from 'lucide-react';
import SourceReference from './SourceReference';

export default function SourceReferences({ sources = [], repoId }) {
  if (!Array.isArray(sources) || sources.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 pt-2 border-t border-border/40 mt-3">
      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <FileCode2 className="w-3.5 h-3.5 text-primary" />
        <span>Sources & Citations ({sources.length})</span>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sources.map((src, idx) => (
          <SourceReference
            key={src.id || `${src.filePath || src.fileName || 'source'}-${src.startLine ?? ''}-${src.endLine ?? ''}-${idx}`}
            fileName={src.fileName}
            filePath={src.filePath}
            startLine={src.startLine}
            endLine={src.endLine}
            score={src.score ?? src.finalScore}
            retrievalMethod={src.retrievalMethod}
            repoId={repoId}
          />
        ))}
      </div>
    </div>
  );
}

