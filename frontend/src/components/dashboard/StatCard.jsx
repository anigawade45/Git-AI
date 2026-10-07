import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function StatCard({ title, value, trend, icon: Icon, iconColor = 'text-primary' }) {
  return (
    <Card className="border-border/80 bg-card/80 backdrop-blur hover:border-primary/40 transition-all">
      <CardContent className="p-5 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono tracking-tight">{value}</p>
          {trend && (
            <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn("w-12 h-12 rounded-xl bg-card border border-border/60 flex items-center justify-center shrink-0 shadow-sm", iconColor)}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
