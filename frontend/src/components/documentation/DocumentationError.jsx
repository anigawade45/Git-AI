import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function DocumentationError({ message, onRetry }) {
  return (
    <Alert variant="destructive" className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <div>
          <AlertTitle>Documentation Error</AlertTitle>
          <AlertDescription>{message || 'Unable to generate documentation. Please try again.'}</AlertDescription>
        </div>
      </div>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} className="gap-1 cursor-pointer shrink-0">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </Button>
      )}
    </Alert>
  );
}
