import React from 'react';
import {
  MessageSquareCode,
  Search,
  FolderPlus,
  FileText,
  Cpu,
  Trash2,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ActivityItem({ activity }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'chat':
        return { icon: MessageSquareCode, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' };
      case 'analysis':
        return { icon: Search, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
      case 'import':
        return { icon: FolderPlus, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
      case 'doc':
        return { icon: FileText, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
      case 'remove':
        return { icon: Trash2, color: 'text-destructive bg-destructive/10 border-destructive/20' };
      default:
        return { icon: Cpu, color: 'text-primary bg-primary/10 border-primary/20' };
    }
  };

  const { icon: Icon, color } = getActivityIcon(activity.type);

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-accent/40 transition-colors group">
      <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5", color)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
          {activity.title}
        </p>
        <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground mt-0.5">
          <span className="truncate">{activity.repoName}</span>
          <span>•</span>
          <span className="flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3" /> {activity.time ? (isNaN(Date.parse(activity.time)) ? activity.time : new Date(activity.time).toLocaleDateString()) : 'Recently'}
          </span>
        </div>
      </div>
    </div>
  );
}
