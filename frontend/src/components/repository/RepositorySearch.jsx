import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function RepositorySearch({
  value,
  onChange,
  placeholder = 'Search files...',
}) {
  return (
    <div className="relative flex items-center w-full">
      <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />

      <Input
        type="search"
        aria-label="Search repository files"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="pl-9 pr-8 h-9 text-xs bg-muted/40 border-border/60 focus-visible:ring-primary/50 font-mono"
      />

      {value && (
        <button
          type="button"
          aria-label="Clear file search"
          onClick={() => onChange?.('')}
          className="absolute right-2.5 p-0.5 text-muted-foreground hover:text-foreground rounded cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}