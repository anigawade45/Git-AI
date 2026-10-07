import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmptyState({
  title = 'No Data Found',
  description = 'There are no items to display at this time.',
  icon: Icon = FolderOpen,
  actionLabel,
  onAction,
}) {
  return (
    <div className="p-10 text-center border border-dashed border-border rounded-2xl bg-card/50 backdrop-blur space-y-4 max-w-md mx-auto select-none">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
        <Icon className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h4 className="text-base font-bold text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          size="sm"
          className="h-9 px-4 text-xs font-bold gap-2 cursor-pointer bg-primary text-primary-foreground"
        >
          <span>{actionLabel}</span>
        </Button>
      )}
    </div>
  );
}
