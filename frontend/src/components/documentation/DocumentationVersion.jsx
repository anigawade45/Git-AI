import React from 'react';
import { History, Check, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function DocumentationVersion({ versionItem, onViewVersion }) {
  const isCurrent = versionItem.status === 'Current';

  return (
    <div className="p-4 rounded-xl bg-card border border-border/60 backdrop-blur flex items-center justify-between gap-4 text-xs hover:border-primary/40 transition-all">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold font-mono">
          v{versionItem.version}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-bold text-foreground">{versionItem.type} Documentation</p>
            {isCurrent && (
              <Badge variant="default" className="text-[10px] font-mono gap-1">
                <Check className="w-3 h-3" /> Current
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground font-mono pt-0.5">
            {versionItem.date} at {versionItem.time} • {versionItem.author}
          </p>
        </div>
      </div>

      {!isCurrent && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewVersion && onViewVersion(versionItem)}
          className="h-8 text-xs gap-1 cursor-pointer shrink-0"
        >
          <span>View Version</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
}
