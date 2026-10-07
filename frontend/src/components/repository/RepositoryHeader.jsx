import React, { useState, useEffect } from 'react';
import { Folder, Star, GitFork, Sparkles, Globe, Database, Loader2, Check, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { repositoryService } from '@/services/repositoryService';

export default function RepositoryHeader({ repo, onAiChatClick }) {
  const [indexingStatus, setIndexingStatus] = useState('NOT_INDEXED');
  const [totalChunks, setTotalChunks] = useState(0);
  const [indexingError, setIndexingError] = useState(null);
  const [isIndexing, setIsIndexing] = useState(false);
  const [progress, setProgress] = useState({ processedFiles: 0, totalFiles: 0, processedChunks: 0, totalChunks: 0 });

  const targetId = repo?.repoId || (repo?.owner && repo?.name ? `${repo.owner}/${repo.name}` : repo?.id);

  // 1. Initial Status Fetch Effect
  useEffect(() => {
    let cancelled = false;

    async function loadIndexStatus() {
      if (!targetId) return;

      try {
        const res = await repositoryService.getIndexStatus(targetId);
        if (cancelled) return;

        setIndexingStatus(res?.status || 'NOT_INDEXED');
        setTotalChunks(res?.totalChunks || 0);
        setIndexingError(res?.error || null);
        const processedFiles = res?.progress?.processedFiles ?? res?.processedFiles ?? 0;
        const totalFiles = res?.progress?.totalFiles ?? res?.totalFiles ?? 0;
        const processedChunks = res?.progress?.processedChunks ?? res?.processedChunks ?? 0;
        const totalChunks = res?.progress?.totalChunks ?? res?.totalChunks ?? 0;
        setProgress({ processedFiles, totalFiles, processedChunks, totalChunks });
      } catch (err) {
        console.warn('[RepositoryHeader] Index status check error:', err?.message || err);
      }
    }

    loadIndexStatus();

    return () => {
      cancelled = true;
    };
  }, [targetId]);

  // 2. Fast Controlled Polling Effect (Every 1.5s while QUEUED, SYNCING, or INDEXING)
  useEffect(() => {
    const isProcessing =
      isIndexing ||
      indexingStatus === 'QUEUED' ||
      indexingStatus === 'SYNCING' ||
      indexingStatus === 'INDEXING';

    if (!targetId || !isProcessing) return;

    let cancelled = false;

    const timerId = setInterval(async () => {
      try {
        const res = await repositoryService.getIndexStatus(targetId);
        if (cancelled) return;

        setIndexingStatus(res?.status || 'NOT_INDEXED');
        setTotalChunks(res?.totalChunks || 0);
        setIndexingError(res?.error || null);
        const processedFiles = res?.progress?.processedFiles ?? res?.processedFiles ?? 0;
        const totalFiles = res?.progress?.totalFiles ?? res?.totalFiles ?? 0;
        const processedChunks = res?.progress?.processedChunks ?? res?.processedChunks ?? 0;
        const totalChunks = res?.progress?.totalChunks ?? res?.totalChunks ?? 0;
        setProgress({ processedFiles, totalFiles, processedChunks, totalChunks });
      } catch (err) {
        console.warn('[RepositoryHeader] Index polling error:', err?.message || err);
      }
    }, 1500);

    return () => {
      cancelled = true;
      clearInterval(timerId);
    };
  }, [targetId, indexingStatus, isIndexing]);

  const handleIndexClick = async () => {
    if (!targetId || isIndexing) return;

    setIsIndexing(true);
    setIndexingStatus('INDEXING');
    try {
      const res = await repositoryService.indexRepository(targetId);
      setIndexingStatus(res?.status || 'INDEXING');
      setTotalChunks(res?.totalChunks || 0);
    } catch (err) {
      console.error('Indexing failed:', err?.message || err);
      setIndexingStatus('FAILED');
    } finally {
      setIsIndexing(false);
    }
  };

  const indexingInProgress =
    isIndexing ||
    indexingStatus === 'QUEUED' ||
    indexingStatus === 'SYNCING' ||
    indexingStatus === 'INDEXING';

  const pct = progress.totalFiles > 0
    ? Math.min(100, Math.round((progress.processedFiles / progress.totalFiles) * 100))
    : 0;

  return (
    <div className="space-y-4 pb-2 border-b border-border/60">
      
      {/* Title & CTAs Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-mono text-foreground tracking-tight">
                  {repo?.name || 'repository'}
                </h1>
                <Badge variant="outline" className="text-[10px] uppercase font-mono gap-1">
                  <Globe className="w-3 h-3 text-emerald-500" /> Public
                </Badge>
                {indexingInProgress ? (
                  <Badge variant="outline" className="text-[10px] font-mono gap-1.5 text-purple-400 border-purple-500/30 bg-purple-500/10">
                    <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
                    <span>
                      {pct > 0
                        ? `Indexing ${pct}% (${progress.processedFiles}/${progress.totalFiles} files)`
                        : indexingStatus === 'SYNCING'
                        ? 'Syncing repo...'
                        : indexingStatus === 'QUEUED'
                        ? 'Queueing...'
                        : 'Indexing 0%'}
                    </span>
                    {pct > 0 && (
                      <div className="w-12 h-1.5 bg-purple-950 rounded-full overflow-hidden border border-purple-500/30 ml-1">
                        <div className="h-full bg-purple-400 transition-all duration-300" style={{ width: `${pct}%` }} />
                      </div>
                    )}
                  </Badge>
                ) : indexingStatus === 'INDEXED' ? (
                  <Badge variant="success" className="text-[10px] font-mono gap-1">
                    <Check className="w-3 h-3 text-emerald-400" /> RAG Vector Index ({totalChunks} Chunks)
                  </Badge>
                ) : indexingStatus === 'PARTIAL' ? (
                  <Badge
                    variant="outline"
                    title={indexingError || 'Some files were skipped during vector indexing'}
                    className="text-[10px] font-mono gap-1 text-amber-400 border-amber-500/30 bg-amber-500/10 cursor-help"
                  >
                    <AlertCircle className="w-3 h-3 text-amber-400" /> Partial Index ({totalChunks} Chunks)
                  </Badge>
                ) : indexingStatus === 'FAILED' ? (
                  <Badge variant="destructive" className="text-[10px] font-mono gap-1" title={indexingError || ''}>
                    <AlertCircle className="w-3 h-3" /> Indexing Failed
                  </Badge>
                ) : null}
              </div>
              <p className="text-xs font-mono text-muted-foreground">{repo?.owner}/{repo?.name}</p>
            </div>
          </div>

          {/* Description */}
          {repo?.description && (
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {repo.description}
            </p>
          )}

          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground pt-0.5">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500" /> {repo?.stars || '0'} stars
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="w-3.5 h-3.5 text-blue-400" /> {repo?.forks || '0'} forks
            </span>
            <span className="px-2 py-0.5 rounded-md bg-muted/60 border border-border/40 font-mono text-[11px] text-foreground">
              {repo?.language || 'JavaScript'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 sm:self-end">
          <Button
            variant="outline"
            onClick={handleIndexClick}
            disabled={indexingInProgress}
            className="gap-2 text-xs font-semibold cursor-pointer border-border/80 min-w-[130px] justify-center"
          >
            {indexingInProgress ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                <span>
                  {pct > 0
                    ? `Indexing ${pct}%`
                    : indexingStatus === 'SYNCING'
                    ? 'Syncing repo...'
                    : indexingStatus === 'QUEUED'
                    ? 'Queueing...'
                    : 'Indexing 0%'}
                </span>
              </>
            ) : indexingStatus === 'INDEXED' ? (
              <>
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                <span>Re-Index Code</span>
              </>
            ) : (
              <>
                <Database className="w-3.5 h-3.5 text-purple-500" />
                <span>
                  {indexingStatus === 'FAILED' ? 'Retry Indexing' : 'Index for RAG'}
                </span>
              </>
            )}
          </Button>

          <Button
            onClick={onAiChatClick}
            className="gap-2 text-xs font-bold cursor-pointer shadow-md bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Chat with AI</span>
          </Button>
        </div>

      </div>

    </div>
  );
}
