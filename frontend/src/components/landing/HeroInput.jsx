import React, { useState } from 'react';
import { Link2, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const EXAMPLE_REPOSITORIES = [
  {
    label: 'vercel/next.js',
    url: 'https://github.com/vercel/next.js',
  },
  {
    label: 'tailwindlabs/tailwindcss',
    url: 'https://github.com/tailwindlabs/tailwindcss',
  },
];

export default function HeroInput({ onAnalyze, isAnalyzing = false }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const repositoryUrl = url.trim().replace(/\/+$/, '');

    if (!repositoryUrl || !onAnalyze) {
      return;
    }

    try {
      const parsedUrl = new URL(repositoryUrl);

      const isGitHubRepository =
        parsedUrl.hostname === 'github.com' &&
        parsedUrl.pathname.split('/').filter(Boolean).length >= 2;

      if (!isGitHubRepository) {
        return;
      }

      onAnalyze(repositoryUrl);
    } catch {
      return;
    }
  };

  const handleExampleClick = (repositoryUrl) => {
    setUrl(repositoryUrl);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-lg flex-col items-center"
    >
      {/* Repository Input */}
      <div className="group relative flex w-full items-center gap-1.5 rounded-full border border-border/80 bg-card/90 p-1.5 shadow-lg backdrop-blur transition-all hover:border-primary/40 focus-within:border-primary/50">

        <div className="relative flex flex-1 items-center">
          <Link2 className="absolute left-3.5 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />

          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/facebook/react"
            disabled={isAnalyzing}
            required
            aria-label="GitHub repository URL"
            className="h-10 w-full border-0 bg-transparent py-2 pl-10 pr-3 font-mono text-xs text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 sm:text-sm"
          />
        </div>

        <Button
          type="submit"
          size="sm"
          disabled={isAnalyzing}
          className="h-10 shrink-0 gap-1.5 rounded-full bg-primary px-4.5 text-xs font-medium shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed sm:text-sm"
        >
          <Sparkles className="h-3.5 w-3.5" />

          <span>
            {isAnalyzing ? 'Analyzing...' : 'Analyze Repository'}
          </span>

          {!isAnalyzing && (
            <ArrowRight className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      {/* Examples */}
      <div className="mt-3 flex max-w-lg flex-wrap items-center justify-center gap-1.5 text-center text-xs text-slate-500 dark:text-slate-400">
        <span>Try with public GitHub repos</span>

        {EXAMPLE_REPOSITORIES.map((repo, index) => (
          <React.Fragment key={repo.label}>
            <span aria-hidden="true">•</span>

            <button
              type="button"
              onClick={() => handleExampleClick(repo.url)}
              disabled={isAnalyzing}
              className="cursor-pointer font-mono text-slate-700 transition-colors hover:text-primary disabled:cursor-not-allowed dark:text-slate-300"
            >
              {repo.label}
            </button>
          </React.Fragment>
        ))}
      </div>
    </form>
  );
}