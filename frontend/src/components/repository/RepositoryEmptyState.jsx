import React from 'react';
import { FolderGit2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RepositoryEmptyState({ onRefresh, message = 'No files available in this repository.' }) {
  return (
    <div className="p-12 text-center border border-dashed border-border/80 rounded-2xl bg-card/50 backdrop-blur space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mx-auto">
        <FolderGit2 className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-foreground">No files found</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          {message}
        </p>
      </div>
      {onRefresh && (
        <Button onClick={onRefresh} variant="outline" className="gap-2 shadow-sm cursor-pointer">
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Files</span>
        </Button>
      )}
    </div>
  );
}
