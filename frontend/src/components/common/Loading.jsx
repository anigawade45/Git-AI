import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3 text-muted-foreground">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
