import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Link2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  User,
  FolderGit2,
  Search,
  MessageSquareCode,
  Folder,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { repositoryService } from '@/services/repositoryService';
import { useAuth } from '@/context/AuthContext';

export default function RepositoryImport({ open, onOpenChange, onImportSuccess }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('url'); // 'url' | 'account'
  const [url, setUrl] = useState('');
  const [accountUsername, setAccountUsername] = useState(user?.githubUsername || '');
  const [userRepos, setUserRepos] = useState([]);
  const [isFetchingUserRepos, setIsFetchingUserRepos] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [indexingState, setIndexingState] = useState(null); // null | { repoId, name, owner, status, processedFiles, totalFiles, totalChunks }

  useEffect(() => {
    if (user?.githubUsername && !accountUsername) {
      setAccountUsername(user.githubUsername);
    }
  }, [user]);

  // Poll indexing status when an import is actively being indexed
  useEffect(() => {
    let timer = null;
    const isProcessing =
      indexingState?.status === 'QUEUED' ||
      indexingState?.status === 'SYNCING' ||
      indexingState?.status === 'INDEXING';

    if (indexingState && isProcessing) {
      timer = setInterval(async () => {
        try {
          const statusData = await repositoryService.getIndexStatus(indexingState.repoId);
          if (statusData) {
            setIndexingState((prev) => ({
              ...prev,
              status: statusData.status || prev.status,
              processedFiles: statusData.processedFiles || prev.processedFiles,
              totalFiles: statusData.totalFiles || prev.totalFiles,
              totalChunks: statusData.totalChunks || prev.totalChunks,
            }));

            if (
              statusData.status === 'INDEXED' ||
              statusData.status === 'PARTIAL' ||
              statusData.status === 'FAILED'
            ) {
              clearInterval(timer);
            }
          }
        } catch (err) {
          console.warn('[Indexing Progress Poll Warning]', err.message);
        }
      }, 1500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [indexingState]);

  const handleClose = () => {
    setUrl('');
    setError('');
    setIndexingState(null);
    onOpenChange(false);
  };

  const handleFetchUserRepos = async (e) => {
    if (e) e.preventDefault();
    if (!accountUsername.trim()) {
      setFetchError('Please enter a GitHub username');
      return;
    }
    setFetchError('');
    setIsFetchingUserRepos(true);
    try {
      const repos = await repositoryService.getUserRepos(accountUsername.trim());
      setUserRepos(repos);
      if (repos.length === 0) {
        setFetchError(`No public repositories found for user '${accountUsername.trim()}'`);
      }
    } catch (err) {
      setFetchError(err.message || 'Failed to fetch repositories. Please check the username.');
    } finally {
      setIsFetchingUserRepos(false);
    }
  };

  const validateUrl = (inputUrl) => {
    const trimmed = inputUrl.trim();
    if (!trimmed) {
      return 'Repository URL or owner/repo is required';
    }
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[^/]+\/[^/]+/;
    const ownerRepoRegex = /^[^/]+\/[^/]+$/;
    if (!githubRegex.test(trimmed) && !ownerRepoRegex.test(trimmed)) {
      return 'Please enter a valid GitHub repository URL (e.g. https://github.com/username/repository) or owner/repo (e.g. username/repository)';
    }
    return null;
  };

  const handleImport = async (targetUrl) => {
    const repoUrlToUse = targetUrl || url;
    setError('');

    const validationError = validateUrl(repoUrlToUse);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Extract owner/repo name for UI state display
    let ownerName = 'github';
    let repoName = 'repository';
    const match = repoUrlToUse.match(/github\.com\/([^/]+)\/([^/]+)/) || repoUrlToUse.split('/');
    if (match && match.length >= 3) {
      ownerName = match[1];
      repoName = match[2].replace(/\.git$/, '');
    } else if (match && match.length === 2) {
      ownerName = match[0];
      repoName = match[1];
    }
    const fullRepoId = `${ownerName}/${repoName}`;

    setIsLoading(true);
    try {
      if (onImportSuccess) {
        await onImportSuccess(repoUrlToUse.trim());
      }

      setIndexingState({
        repoId: fullRepoId,
        name: repoName,
        owner: ownerName,
        status: 'INDEXING',
        processedFiles: 0,
        totalFiles: 0,
        totalChunks: 0,
      });
    } catch (err) {
      setError(err?.message || 'Unable to import repository. Please check the URL and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (exampleUrl) => {
    setUrl(exampleUrl);
    setError('');
  };

  const isCompletedState =
    indexingState?.status === 'INDEXED' || indexingState?.status === 'PARTIAL';

  const progressPercent = indexingState?.totalFiles > 0
    ? Math.min(100, Math.round((indexingState.processedFiles / indexingState.totalFiles) * 100))
    : isCompletedState ? 100 : 35;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent onClose={handleClose} className="max-w-lg">
        
        {/* ACTIVE RAG INDEXING / READY DISPLAY CARD */}
        {indexingState ? (
          <div className="space-y-5 my-1">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                isCompletedState
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                  : indexingState.status === 'FAILED'
                  ? 'bg-destructive/10 border-destructive/30 text-destructive'
                  : 'bg-primary/10 border-primary/20 text-primary'
              }`}>
                {isCompletedState ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : indexingState.status === 'FAILED' ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <Loader2 className="w-5 h-5 animate-spin" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-foreground font-mono truncate">
                  {indexingState.name}
                </h3>
                <p className="text-xs text-muted-foreground font-mono truncate">
                  {indexingState.owner}/{indexingState.name}
                </p>
              </div>
            </div>

            {/* INDEXING IN PROGRESS VIEW */}
            {(indexingState.status === 'QUEUED' || indexingState.status === 'SYNCING' || indexingState.status === 'INDEXING') && (
              <div className="space-y-3 p-4 rounded-xl bg-muted/40 border border-border/60">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-primary">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>
                      {indexingState.status === 'QUEUED'
                        ? 'Queueing repository indexing...'
                        : indexingState.status === 'SYNCING'
                        ? 'Fetching repository file tree...'
                        : 'Indexing repository...'}
                    </span>
                  </span>
                  <span className="font-mono text-muted-foreground">{progressPercent}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden border border-border/40">
                  <div
                    className="h-full bg-primary transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1">
                  <span>
                    {indexingState.totalFiles > 0
                      ? `${indexingState.processedFiles} / ${indexingState.totalFiles} files`
                      : 'Analyzing AST files & symbols...'}
                  </span>
                  <span>RAG Vector pipeline active</span>
                </div>
              </div>
            )}

            {/* INDEXED / PARTIAL READY VIEW */}
            {isCompletedState && (
              <div className="space-y-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-foreground">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {indexingState.status === 'PARTIAL' ? 'Repository Partially Indexed' : 'Repository Ready'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  {indexingState.totalFiles || 0} files · {indexingState.totalChunks || 0} code chunks indexed for RAG vector search.
                </p>
              </div>
            )}

            {/* FAILED VIEW */}
            {indexingState.status === 'FAILED' && (
              <div className="space-y-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-foreground">
                <div className="flex items-center gap-2 text-xs font-bold text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span>Indexing Failed</span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  Unable to complete vector indexing for this repository. You can retry indexing from the repository header.
                </p>
              </div>
            )}

            <DialogFooter className="pt-2 flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="cursor-pointer text-xs"
              >
                Close
              </Button>

              {isCompletedState && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      navigate(`/repository/${encodeURIComponent(indexingState.repoId)}`);
                      handleClose();
                    }}
                    className="gap-1.5 cursor-pointer text-xs font-semibold"
                  >
                    <Folder className="w-3.5 h-3.5" />
                    <span>View Repository</span>
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      navigate(`/repository/${encodeURIComponent(indexingState.repoId)}/chat`);
                      handleClose();
                    }}
                    className="gap-1.5 cursor-pointer text-xs font-bold shadow-md bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <MessageSquareCode className="w-3.5 h-3.5" />
                    <span>Open Chat</span>
                  </Button>
                </>
              )}
            </DialogFooter>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2">
                <Sparkles className="w-5 h-5" />
              </div>
              <DialogTitle>Import GitHub Repository</DialogTitle>
              <DialogDescription>
                Import a public GitHub repository directly from your GitHub account or via URL.
              </DialogDescription>
            </DialogHeader>

            {/* Tab Navigation */}
            <div className="flex border-b border-border/60 my-2">
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'url'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Direct URL / Shorthand
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('account');
                  if (accountUsername && userRepos.length === 0) {
                    handleFetchUserRepos();
                  }
                }}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'account'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Fetch Account Repos</span>
              </button>
            </div>

            {/* Alerts */}
            {error && (
              <Alert variant="destructive" className="my-1">
                <AlertCircle className="w-4 h-4" />
                <div>
                  <AlertTitle>Validation Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </div>
              </Alert>
            )}

            {/* TAB 1: Direct URL / Shorthand */}
            {activeTab === 'url' && (
              <form onSubmit={(e) => { e.preventDefault(); handleImport(); }} className="space-y-4 my-2">
                <div className="space-y-2">
                  <Label htmlFor="repo-url">Repository URL or Shorthand</Label>
                  <div className="relative flex items-center">
                    <Link2 className="absolute left-3.5 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="repo-url"
                      placeholder="e.g. https://github.com/aniket/my-repo or aniket/my-repo"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      disabled={isLoading}
                      className="pl-10 font-mono text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1 pt-1">
                  <p>Try with public repositories:</p>
                  <div className="flex flex-wrap gap-2 font-mono text-[11px]">
                    <span
                      onClick={() => handleExampleClick('https://github.com/facebook/react')}
                      className="px-2 py-0.5 rounded bg-muted/60 hover:bg-accent border border-border/40 text-foreground cursor-pointer transition-colors"
                    >
                      facebook/react
                    </span>
                    <span
                      onClick={() => handleExampleClick('https://github.com/vercel/next.js')}
                      className="px-2 py-0.5 rounded bg-muted/60 hover:bg-accent border border-border/40 text-foreground cursor-pointer transition-colors"
                    >
                      vercel/next.js
                    </span>
                  </div>
                </div>

                <DialogFooter className="pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="cursor-pointer text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="gap-2 cursor-pointer shadow-md text-xs font-bold"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Importing...</span>
                      </>
                    ) : (
                      <>
                        <span>Import Repository</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            )}

            {/* TAB 2: Fetch Account Repos */}
            {activeTab === 'account' && (
              <div className="space-y-4 my-2">
                <form onSubmit={handleFetchUserRepos} className="flex gap-2">
                  <Input
                    placeholder="Enter GitHub Username (e.g. aniket)"
                    value={accountUsername}
                    onChange={(e) => setAccountUsername(e.target.value)}
                    className="font-mono text-xs h-9"
                  />
                  <Button type="submit" size="sm" disabled={isFetchingUserRepos} className="gap-1.5 cursor-pointer text-xs shrink-0">
                    {isFetchingUserRepos ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    <span>Fetch Repos</span>
                  </Button>
                </form>

                {fetchError && (
                  <p className="text-xs text-destructive font-medium">{fetchError}</p>
                )}

                {/* Repos List */}
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1 border border-border/50 rounded-xl p-2 bg-muted/20">
                  {isFetchingUserRepos ? (
                    <div className="p-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span>Loading GitHub repositories...</span>
                    </div>
                  ) : userRepos.length > 0 ? (
                    userRepos.map((repo) => (
                      <div
                        key={repo.id}
                        onClick={() => handleImport(repo.url)}
                        className="p-2.5 rounded-lg border border-border/60 bg-card hover:bg-accent/80 hover:border-primary/50 transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FolderGit2 className="w-4 h-4 text-primary shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                              {repo.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate font-mono">
                              {repo.owner}/{repo.name} • {repo.language}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-xs h-7 gap-1 text-primary cursor-pointer shrink-0">
                          <span>Import</span>
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-muted-foreground space-y-1">
                      <p>Enter a GitHub username above to discover public repositories.</p>
                    </div>
                  )}
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="cursor-pointer text-xs"
                  >
                    Close
                  </Button>
                </DialogFooter>
              </div>
            )}
          </>
        )}

      </DialogContent>
    </Dialog>
  );
}
