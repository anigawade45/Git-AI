import React, { useState, useMemo } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import RepositoryGrid from './RepositoryGrid';

export default function RepositorySection({
  repositories = [],
  isLoading = false,
  title = 'My Repositories',
  description = 'Manage and chat with your indexed codebases.',
  onDelete,
  onAction,
  onImportClick,
  onViewAllClick,
}) {
  const [filterText, setFilterText] = useState('');

  const safeRepositories = Array.isArray(repositories) ? repositories : [];

  const filteredRepos = useMemo(() => {
    const query = filterText.trim().toLowerCase();
    if (!query) return safeRepositories;

    return safeRepositories.filter((repo) => {
      const name = repo?.name?.toLowerCase() || '';
      const repoDesc = repo?.description?.toLowerCase() || '';
      const language = repo?.language?.toLowerCase() || '';
      return name.includes(query) || repoDesc.includes(query) || language.includes(query);
    });
  }, [safeRepositories, filterText]);

  return (
    <section aria-labelledby="repositories-heading" className="space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 id="repositories-heading" className="text-xl font-bold tracking-tight text-foreground">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter Input */}
          <div className="relative w-44 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Filter repos..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="pl-8 h-8 text-xs bg-muted/40 border-border/60"
            />
          </div>

          {onViewAllClick && (
            <button
              type="button"
              onClick={onViewAllClick}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <RepositoryGrid
        repositories={filteredRepos}
        isLoading={isLoading}
        onDelete={onDelete}
        onAction={onAction}
        onImportClick={onImportClick}
      />

    </section>
  );
}
