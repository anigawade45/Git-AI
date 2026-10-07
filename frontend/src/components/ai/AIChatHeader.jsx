import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, FolderGit2, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AIChatHeader({ repo }) {
  const repoLabel =
    repo?.fullName ||
    repo?.repoId ||
    repo?.id ||
    repo?.name ||
    'repository';

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 border border-border/60 backdrop-blur flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
          <Bot className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              AI Repository Assistant
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] uppercase font-bold tracking-wider">
              Copilot
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Repo: <span className="font-mono font-semibold text-foreground">{repoLabel}</span> — Ask about code, bugs, or logic.
          </p>
        </div>
      </div>

      {repo?.id || repo?.repoId ? (
        <Link to={`/repository/${encodeURIComponent(repo?.id || repo?.repoId)}`}>
          <Button variant="outline" size="sm" className="gap-2 text-xs font-semibold shrink-0 cursor-pointer">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Repository Files</span>
          </Button>
        </Link>
      ) : null}
    </div>
  );
}
