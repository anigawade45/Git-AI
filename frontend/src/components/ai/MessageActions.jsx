import React, { useState } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';

export default function MessageActions({
  messageContent,
  onRegenerate,
}) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(null);

  const handleCopy = async () => {
    if (!messageContent) return;

    try {
      await navigator.clipboard.writeText(messageContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy response:', error);
    }
  };

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2">
      <button
        type="button"
        aria-label="Helpful response"
        onClick={() => setLiked(liked === 'up' ? null : 'up')}
        className={`p-1.5 rounded-lg hover:bg-card transition-colors cursor-pointer ${
          liked === 'up'
            ? 'text-emerald-500 bg-emerald-500/10'
            : 'hover:text-foreground'
        }`}
        title="Helpful response"
      >
        <ThumbsUp className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        aria-label="Unhelpful response"
        onClick={() => setLiked(liked === 'down' ? null : 'down')}
        className={`p-1.5 rounded-lg hover:bg-card transition-colors cursor-pointer ${
          liked === 'down'
            ? 'text-destructive bg-destructive/10'
            : 'hover:text-foreground'
        }`}
        title="Unhelpful response"
      >
        <ThumbsDown className="w-3.5 h-3.5" />
      </button>

      <span className="text-border">|</span>

      <button
        type="button"
        aria-label={copied ? 'Response copied' : 'Copy answer'}
        onClick={handleCopy}
        className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-card hover:text-foreground transition-colors cursor-pointer"
        title="Copy answer to clipboard"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-emerald-500 font-medium">Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>Copy</span>
          </>
        )}
      </button>

      {onRegenerate && (
        <button
          type="button"
          aria-label="Regenerate AI response"
          onClick={onRegenerate}
          className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-card hover:text-foreground transition-colors cursor-pointer"
          title="Regenerate AI response"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Regenerate</span>
        </button>
      )}
    </div>
  );
}

