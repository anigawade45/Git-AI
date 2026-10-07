import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PageLoader() {
  return (
    <div className="min-h-screen w-full bg-background p-6 space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="h-16 w-full rounded-2xl bg-card border border-border flex items-center justify-between px-6">
        <Skeleton className="h-6 w-48 rounded-lg" />
        <div className="flex gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>

      {/* Main Area Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
