import React from 'react';
import { BookOpen, Webhook, Network, Settings, Code, Users, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const iconMap = {
  BookOpen: BookOpen,
  Webhook: Webhook,
  Network: Network,
  Settings: Settings,
  Code: Code,
  Users: Users,
};

export default function DocumentationTypeCard({ docType, selected = false, onSelect }) {
  const Icon = iconMap[docType.iconName] || BookOpen;

  return (
    <Card
      onClick={() => onSelect(docType.id)}
      className={cn(
        "p-5 rounded-2xl border bg-card/90 backdrop-blur transition-all cursor-pointer space-y-3 relative group select-none hover:border-primary/50 hover:shadow-md",
        selected && "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20"
      )}
    >
      <div className="flex items-center justify-between">
        <div className={cn(
          "w-10 h-10 rounded-xl border flex items-center justify-center transition-colors",
          selected ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border text-muted-foreground group-hover:text-foreground"
        )}>
          <Icon className="w-5 h-5" />
        </div>

        {selected ? (
          <Badge variant="default" className="gap-1 font-mono text-[10px]">
            <Check className="w-3 h-3" /> Selected
          </Badge>
        ) : docType.recommended ? (
          <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-mono">
            ● Recommended
          </Badge>
        ) : null}
      </div>

      <div className="space-y-1">
        <h4 className={cn("text-sm font-bold transition-colors", selected ? "text-primary" : "text-foreground")}>
          {docType.title}
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {docType.description}
        </p>
      </div>
    </Card>
  );
}
