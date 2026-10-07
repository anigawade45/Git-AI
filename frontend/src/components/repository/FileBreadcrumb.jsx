import React from 'react';
import { ChevronRight, FileCode, Folder } from 'lucide-react';

export default function FileBreadcrumb({ repoName = 'repository', filePath }) {
  if (!filePath) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
        <span>{repoName}</span>
      </div>
    );
  }

  const parts = filePath.split('/');

  return (
    <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground overflow-x-auto no-scrollbar">
      <span className="shrink-0">{repoName}</span>
      {parts.map((part, index) => {
        const isLast = index === parts.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            <span
              className={
                isLast
                  ? 'font-bold text-foreground flex items-center gap-1 shrink-0'
                  : 'shrink-0'
              }
            >
              {isLast && <FileCode className="w-3.5 h-3.5 text-primary shrink-0" />}
              {part}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
}
