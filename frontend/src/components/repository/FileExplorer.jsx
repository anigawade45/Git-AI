import React from 'react';
import { GitBranch, RefreshCw, FolderGit2 } from 'lucide-react';
import RepositorySearch from './RepositorySearch';
import CommitInfo from './CommitInfo';
import FileTree from './FileTree';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export default function FileExplorer({
  files = [],
  branches = [],
  currentBranch = 'main',
  onSelectBranch,
  commit,
  searchQuery,
  onSearchChange,
  expandedFolders,
  onToggleFolder,
  selectedFile,
  onFileSelect,
  onRefresh,
}) {
  return (
    <div className="space-y-4">
      
      {/* Branch & Search Toolbar */}
      <div className="flex items-center gap-2">
        {/* Branch Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="h-9 px-3 rounded-lg border border-border/80 bg-muted/30 hover:bg-accent text-xs font-mono font-semibold text-foreground flex items-center gap-2 transition-colors cursor-pointer shrink-0">
              <GitBranch className="w-3.5 h-3.5 text-primary" />
              <span>{currentBranch}</span>
              <span className="text-[10px] text-muted-foreground">▼</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="left" className="w-40">
            {branches.length === 0 ? (
              <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                No branches available
              </DropdownMenuItem>
            ) : (
              branches.map((b) => (
                <DropdownMenuItem key={b} onClick={() => onSelectBranch?.(b)}>
                  <span className={b === currentBranch ? 'font-bold text-primary' : ''}>
                    {b === currentBranch ? `✓ ${b}` : b}
                  </span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Search */}
        <div className="flex-1">
          <RepositorySearch value={searchQuery} onChange={onSearchChange} />
        </div>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          className="p-2 h-9 w-9 rounded-lg border border-border/80 bg-muted/30 hover:bg-accent text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer shrink-0"
          title="Refresh repository files"
          aria-label="Refresh repository files"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Latest Commit Info */}
      <CommitInfo commit={commit} />

      {/* Header Label */}
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 pt-1">
        <span className="flex items-center gap-1.5">
          <FolderGit2 className="w-3.5 h-3.5 text-primary" />
          <span>Files</span>
        </span>
        <span className="text-[11px] font-mono text-muted-foreground font-normal">
          {files.length} items
        </span>
      </div>

      {/* Tree View Container */}
      <div className="p-2 rounded-xl bg-card/60 border border-border/60 backdrop-blur max-h-[500px] overflow-y-auto no-scrollbar">
        <FileTree
          files={files}
          expandedFolders={expandedFolders}
          onToggleFolder={onToggleFolder}
          selectedFile={selectedFile}
          onFileSelect={onFileSelect}
        />
      </div>

    </div>
  );
}
