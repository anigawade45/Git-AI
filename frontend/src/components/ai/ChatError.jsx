import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function ChatError({ message, onRetry }) {
  return (
    <Alert
      variant="destructive"
      className="my-4 flex items-start justify-between gap-3"
    >
      <div className="flex items-start gap-2 min-w-0">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />

        <div className="min-w-0">
          <AlertTitle>AI Chat Error</AlertTitle>

          <AlertDescription className="break-words">
            {message || 'Unable to generate response. Please try again.'}
          </AlertDescription>
        </div>
      </div>

      {onRetry && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onRetry}
          aria-label="Retry AI response"
          className="gap-1 cursor-pointer shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </Button>
      )}
    </Alert>
  );
}