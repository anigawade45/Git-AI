import React from 'react';
import { FolderGit2, MessageSquareCode, BarChart3, Zap } from 'lucide-react';
import StatCard from './StatCard';
import { Skeleton } from '@/components/ui/skeleton';

const DEFAULT_ICON_CONFIG = {
  icon: FolderGit2,
  color: 'text-primary bg-primary/10 border-primary/20',
};

const ICON_MAP = {
  repos: { icon: FolderGit2, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  chats: { icon: MessageSquareCode, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
  analyses: { icon: BarChart3, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  queries: { icon: Zap, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
};

export default function StatsCards({ stats = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-card border border-border/80 space-y-3 flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="h-7 w-14 rounded-md" />
              <Skeleton className="h-3 w-24 rounded-md" />
            </div>
            <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  const safeStats = Array.isArray(stats) ? stats : [];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {safeStats.map((stat) => {
        const config = ICON_MAP[stat.type] || DEFAULT_ICON_CONFIG;
        return (
          <StatCard
            key={stat.id || stat.title}
            title={stat.title}
            value={stat.value}
            trend={stat.trend}
            icon={config.icon}
            iconColor={config.color}
          />
        );
      })}
    </div>
  );
}
