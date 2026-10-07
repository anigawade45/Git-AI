import React from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import FileTreeItem from './FileTreeItem';
import { cn } from '@/lib/utils';

export default function FolderItem({
  item,
  expandedFolders = [],
  onToggleFolder,
  selectedFile,
  onFileSelect,
}) {
  const folderId = item.id || item.path;
  const isExpanded = expandedFolders.includes(folderId);

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-label={`${item.name} folder, ${isExpanded ? 'expanded' : 'collapsed'}`}
        onClick={() => onToggleFolder?.(folderId)}
        className={cn(
          "w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors cursor-pointer text-left select-none",
          isExpanded && "text-foreground font-medium"
        )}
      >
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        )}

        {isExpanded ? (
          <FolderOpen className="w-4 h-4 text-blue-400 shrink-0" />
        ) : (
          <Folder className="w-4 h-4 text-blue-400 shrink-0" />
        )}

        <span className="truncate">{item.name}</span>
      </button>

      {isExpanded && item.children && (
        <div className="pl-4 border-l border-border/40 ml-3 space-y-0.5">
          {item.children.map((child) => (
            <FileTreeItem
              key={child.id || child.path}
              item={child}
              expandedFolders={expandedFolders}
              onToggleFolder={onToggleFolder}
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
