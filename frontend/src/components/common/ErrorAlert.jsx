import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function ErrorAlert({ title = 'Action Failed', message, onRetry }) {
  return (
    <Alert variant="destructive" className="my-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <div>
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{message || 'An error occurred. Please try again.'}</AlertDescription>
        </div>
      </div>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} className="gap-1.5 cursor-pointer shrink-0 text-xs">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </Button>
      )}
    </Alert>
  );
}
