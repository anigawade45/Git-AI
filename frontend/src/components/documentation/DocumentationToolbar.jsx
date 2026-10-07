import React, { useState } from 'react';
import { Edit3, Eye, Copy, Download, RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export default function DocumentationToolbar({
  mode = 'preview', // 'preview' | 'editor'
  onModeChange,
  onCopy,
  onDownload,
  onRegenerate,
  docTitle = 'README.md',
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (onCopy) onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl border border-border/80 bg-card/90 backdrop-blur shadow-sm">
      
      {/* Title & Badge */}
      <div className="flex items-center gap-2 font-mono text-xs font-bold text-foreground">
        <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary uppercase text-[10px]">
          Markdown
        </span>
        <span className="truncate">{docTitle}</span>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
        {/* Toggle Mode */}
        {mode === 'preview' ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onModeChange('editor')}
            className="h-8 text-xs font-semibold gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onModeChange('preview')}
            className="h-8 text-xs font-semibold gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </Button>
        )}

        {/* Copy Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="h-8 text-xs font-semibold gap-1.5 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-500 font-bold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </Button>

        {/* Download Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="h-8 px-3 rounded-lg border border-border/80 bg-card hover:bg-accent text-xs font-semibold text-foreground flex items-center gap-1.5 cursor-pointer transition-colors">
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
              <span className="text-[10px] text-muted-foreground">▼</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="right" className="w-36">
            <DropdownMenuItem onClick={() => onDownload && onDownload('md')}>
              Markdown (.md)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownload && onDownload('txt')}>
              Text File (.txt)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Regenerate Button */}
        <Button
          size="sm"
          onClick={onRegenerate}
          className="h-8 text-xs font-bold gap-1.5 cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Regenerate</span>
        </Button>
      </div>

    </div>
  );
}
