import React from 'react';
import { Star, GitFork, Eye, ExternalLink } from 'lucide-react';

export default function RepoCard({ repo }) {
  if (!repo) return null;

  const githubUrl = repo.htmlUrl || repo.url || (repo.name ? `https://github.com/${repo.name}` : null);

  return (
    <div className="p-5 bg-card border border-border rounded-xl flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          {githubUrl ? (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-lg hover:underline flex items-center gap-2 text-foreground"
            >
              {repo.name}
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </a>
          ) : (
            <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
              {repo.name}
            </h3>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            {repo.description || 'No description available'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Star className="w-4 h-4 text-amber-500" />
          {(repo.stars ?? 0).toLocaleString()}
        </span>
        <span className="flex items-center gap-1.5">
          <GitFork className="w-4 h-4" />
          {(repo.forks ?? 0).toLocaleString()}
        </span>
        <span className="flex items-center gap-1.5">
          <Eye className="w-4 h-4" />
          {(repo.watchers ?? 0).toLocaleString()}
        </span>
        <span className="ml-auto font-medium text-foreground">
          {repo.language || '—'}
        </span>
      </div>
    </div>
  );
}
