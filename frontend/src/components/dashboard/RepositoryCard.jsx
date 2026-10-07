import React from 'react';
import {
  Folder,
  Star,
  GitFork,
  MoreVertical,
  MessageSquareCode,
  Search,
  FileText,
  RefreshCw,
  Trash2,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export default function RepositoryCard({ repo, onDelete, onAction }) {
  const processedFiles = repo?.indexingProgress?.processedFiles ?? repo?.processedFiles ?? 0;
  const totalFiles = repo?.indexingProgress?.totalFiles ?? repo?.totalFiles ?? 0;
  const pct = totalFiles > 0 ? Math.min(100, Math.round((processedFiles / totalFiles) * 100)) : 0;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'INDEXED':
      case 'Analyzed':
        return <Badge variant="success">● Ready</Badge>;
      case 'INDEXING':
      case 'Processing':
      case 'IMPORTED':
      case 'SYNCING':
      case 'QUEUED':
        return (
          <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10 animate-pulse">
            ◌ {pct > 0 ? `Indexing ${pct}%` : status === 'SYNCING' ? 'Syncing repo...' : status === 'QUEUED' ? 'Queueing...' : 'Indexing 0%'}
          </Badge>
        );
      case 'FAILED':
      case 'Failed':
        return <Badge variant="destructive">● Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="border-border/80 bg-card/90 backdrop-blur shadow-md hover:shadow-xl hover:border-primary/40 transition-all flex flex-col justify-between group relative overflow-visible z-10 hover:z-20">
      
      {/* Card Header */}
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
              <Folder className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-sm font-bold font-mono text-foreground truncate group-hover:text-primary transition-colors">
                {repo.name}
              </CardTitle>
              <p className="text-[11px] font-mono text-muted-foreground truncate">{repo.owner}/{repo.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {getStatusBadge(repo.status)}

            {/* 3-Dot Action Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <MoreVertical className="w-4 h-4" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="right" className="w-48">
                <DropdownMenuItem onClick={() => onAction && onAction('open', repo)}>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                  <span>Open Repository</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction && onAction('chat', repo)}>
                  <MessageSquareCode className="w-4 h-4 text-purple-500" />
                  <span>Chat with Repo</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction && onAction('analyze', repo)}>
                  <Search className="w-4 h-4 text-blue-500" />
                  <span>Analyze Code</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction && onAction('docs', repo)}>
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>Documentation</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction && onAction('refresh', repo)}>
                  <RefreshCw className="w-4 h-4 text-muted-foreground" />
                  <span>Refresh Analysis</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem destructive onClick={() => onDelete && onDelete(repo.id)}>
                  <Trash2 className="w-4 h-4" />
                  <span>Remove Repo</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      {/* Card Content */}
      <CardContent className="px-5 py-2 space-y-3 flex-1">
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {repo.description}
        </p>

        {/* Tech Stack Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {repo.technologies?.map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 rounded-md bg-muted/60 border border-border/40 text-[10px] font-mono text-foreground"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Stars & Forks */}
        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground pt-1">
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500" /> {repo.stars}
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="w-3.5 h-3.5 text-blue-400" /> {repo.forks}
          </span>
          <span className="text-[11px] font-mono text-muted-foreground/80 flex items-center gap-1 ml-auto">
            <Clock className="w-3 h-3" /> {repo.lastAnalyzed ? (isNaN(Date.parse(repo.lastAnalyzed)) ? repo.lastAnalyzed : new Date(repo.lastAnalyzed).toLocaleDateString()) : 'Recently'}
          </span>
        </div>
      </CardContent>

      {/* Card Footer */}
      <CardFooter className="p-5 pt-3 border-t border-border/60">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAction && onAction('open', repo)}
          className="w-full h-9 text-xs font-medium justify-center gap-1.5 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all cursor-pointer"
        >
          <span>Open Repository</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Button>
      </CardFooter>

    </Card>
  );
}
