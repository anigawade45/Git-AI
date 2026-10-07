import React from 'react';
import { Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import ActivityItem from './ActivityItem';
import { Skeleton } from '@/components/ui/skeleton';

export default function RecentActivity({ activities = [], isLoading = false }) {
  return (
    <Card className="border-border/80 bg-card/90 backdrop-blur shadow-md flex flex-col justify-between">
      <CardHeader className="p-5 pb-3 border-b border-border/60">
        <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 space-y-1 divide-y divide-border/40">
        {isLoading ? (
          <div className="space-y-3 p-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 items-center">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No recent activity recorded.
          </div>
        ) : (
          activities.map((act) => <ActivityItem key={act.id} activity={act} />)
        )}
      </CardContent>
    </Card>
  );
}
