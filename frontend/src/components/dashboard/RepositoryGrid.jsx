import React from 'react';
import { FolderGit2, Plus } from 'lucide-react';
import RepositoryCard from './RepositoryCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function RepositoryGrid({
  repositories = [],
  isLoading = false,
  onDelete,
  onAction,
  onImportClick,
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-card border border-border/80 space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-10 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (repositories.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-border/80 rounded-2xl bg-card/50 backdrop-blur space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mx-auto">
          <FolderGit2 className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground">No repositories yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Import your first GitHub repository and start exploring it with AI.
          </p>
        </div>
        <Button onClick={onImportClick} className="gap-2 shadow-sm cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>Import Repository</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {repositories.map((repo) => (
        <RepositoryCard
          key={repo.id}
          repo={repo}
          onDelete={onDelete}
          onAction={onAction}
        />
      ))}
    </div>
  );
}
