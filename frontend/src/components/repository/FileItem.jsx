import React from 'react';
import { FileCode, FileText, FileJson, File } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FileItem({ item, selectedFile, onFileSelect }) {
  const isSelected = selectedFile?.id === item.id || selectedFile?.path === item.path;

  const getFileIcon = (filename = '') => {
    const lowerFilename = filename.toLowerCase();

    if (lowerFilename.endsWith('.json')) {
      return <FileJson className="w-4 h-4 text-amber-400 shrink-0" />;
    }
    if (lowerFilename.endsWith('.md') || lowerFilename.endsWith('.txt')) {
      return <FileText className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    if (
      lowerFilename.endsWith('.js') ||
      lowerFilename.endsWith('.jsx') ||
      lowerFilename.endsWith('.ts') ||
      lowerFilename.endsWith('.tsx') ||
      lowerFilename.endsWith('.css') ||
      lowerFilename.endsWith('.html')
    ) {
      return <FileCode className="w-4 h-4 text-primary shrink-0" />;
    }
    return <File className="w-4 h-4 text-muted-foreground shrink-0" />;
  };

  return (
    <button
      type="button"
      aria-label={`File: ${item.name}`}
      onClick={() => onFileSelect?.(item)}
      className={cn(
        "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer text-left select-none text-muted-foreground hover:text-foreground hover:bg-accent/60",
        isSelected && "bg-primary/15 text-primary font-bold border border-primary/20 hover:bg-primary/20 hover:text-primary"
      )}
    >
      {getFileIcon(item.name)}
      <span className="truncate flex-1">{item.name}</span>
      {item.size && (
        <span className="text-[10px] text-muted-foreground/70 font-mono shrink-0 ml-auto hidden sm:inline">
          {item.size}
        </span>
      )}
    </button>
  );
}
