import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export default function IssueFilters({
  searchQuery,
  onSearchChange,
  severityFilter,
  onSeverityChange,
  categoryFilter,
  onCategoryChange,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-card/60 border border-border/60 backdrop-blur">
      
      {/* Search Input */}
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search issues, files..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-8 h-9 text-xs bg-muted/40 border-border/60"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 p-0.5 text-muted-foreground hover:text-foreground rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Dropdowns */}
      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
        {/* Severity Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="h-9 px-3 rounded-lg border border-border/80 bg-muted/30 hover:bg-accent text-xs font-semibold text-foreground flex items-center gap-2 cursor-pointer transition-colors">
              <Filter className="w-3.5 h-3.5 text-primary" />
              <span>{severityFilter ? `Severity: ${severityFilter}` : 'All Severities'}</span>
              <span className="text-[10px] text-muted-foreground">▼</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="right" className="w-40">
            <DropdownMenuItem onClick={() => onSeverityChange('')}>All Severities</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSeverityChange('critical')}>🔴 Critical</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSeverityChange('high')}>🟠 High</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSeverityChange('medium')}>🟡 Medium</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSeverityChange('low')}>🔵 Low</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Category Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="h-9 px-3 rounded-lg border border-border/80 bg-muted/30 hover:bg-accent text-xs font-semibold text-foreground flex items-center gap-2 cursor-pointer transition-colors">
              <span>{categoryFilter ? `Category: ${categoryFilter}` : 'All Categories'}</span>
              <span className="text-[10px] text-muted-foreground">▼</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="right" className="w-40">
            <DropdownMenuItem onClick={() => onCategoryChange('')}>All Categories</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCategoryChange('security')}>Security</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCategoryChange('quality')}>Code Quality</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCategoryChange('performance')}>Performance</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

    </div>
  );
}
