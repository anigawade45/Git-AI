import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, RefreshCw, Sparkles, FileCode, FolderGit2 } from 'lucide-react';
import RepositoryLayout from '@/components/repository/RepositoryLayout';
import RepositoryHeader from '@/components/repository/RepositoryHeader';
import RepositoryStats from '@/components/repository/RepositoryStats';
import RepositoryTabs from '@/components/repository/RepositoryTabs';
import FileExplorer from '@/components/repository/FileExplorer';
import CodeViewer from '@/components/repository/CodeViewer';
import RepositoryEmptyState from '@/components/repository/RepositoryEmptyState';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { repositoryService } from '@/services/repositoryService';
import { useMeta } from '@/hooks/useMeta';

export default function Repository() {
  const { id, owner, repo: repoSlug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const targetFileParam = searchParams.get('file');
  const targetLineParam = searchParams.get('line');

  const targetRepoId = id
    ? decodeURIComponent(id)
    : owner && repoSlug
      ? `${owner}/${repoSlug}`
      : null;

  useMeta({
    title: targetRepoId
      ? `${targetRepoId} Explorer | GitHub Knowledge Assistant`
      : 'Repository Explorer | GitHub Knowledge Assistant',
    description: 'Browse repository file tree and view source code.',
    robots: 'noindex, nofollow',
  });

  const [repo, setRepo] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(['folder-src', 'folder-controllers']);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentBranch, setCurrentBranch] = useState('main');
  const [activeTab, setActiveTab] = useState('files');
  const [mobileView, setMobileView] = useState('files');
  const [isLoading, setIsLoading] = useState(true);
  const [isCodeLoading, setIsCodeLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeError, setCodeError] = useState('');

  const findFileByPath = (items, targetPath) => {
    if (!items || !targetPath) return null;
    const cleanTarget = targetPath.trim().toLowerCase();

    for (const item of items) {
      if (item.type === 'file' || (!item.children && item.path)) {
        const itemPath = item.path?.toLowerCase() || '';
        const itemName = item.name?.toLowerCase() || '';
        if (
          itemPath === cleanTarget ||
          itemName === cleanTarget ||
          itemPath.endsWith(`/${cleanTarget}`) ||
          cleanTarget.endsWith(`/${itemPath}`) ||
          cleanTarget.endsWith(itemPath)
        ) {
          return item;
        }
      }
      if (item.children) {
        const found = findFileByPath(item.children, targetPath);
        if (found) return found;
      }
    }
    return null;
  };

  const findParentFolderIds = (items, targetPath, parents = []) => {
    if (!items || !targetPath) return [];
    const cleanTarget = targetPath.trim().toLowerCase();

    for (const item of items) {
      if (item.children) {
        const folderId = item.id || item.path || item.name;
        const newParents = [...parents, folderId];

        for (const child of item.children) {
          const childPath = child.path?.toLowerCase() || '';
          const childName = child.name?.toLowerCase() || '';
          if (
            childPath === cleanTarget ||
            childName === cleanTarget ||
            childPath.endsWith(`/${cleanTarget}`) ||
            cleanTarget.endsWith(`/${childPath}`) ||
            cleanTarget.endsWith(childPath)
          ) {
            return newParents;
          }
        }

        const found = findParentFolderIds(item.children, targetPath, newParents);
        if (found.length > 0) return found;
      }
    }
    return [];
  };

  const fetchFileContent = async (fileToLoad) => {
    if (!fileToLoad || (fileToLoad.type && fileToLoad.type !== 'file') || !fileToLoad.path) return;

    setIsCodeLoading(true);
    setCodeError('');
    try {
      const fileData = await repositoryService.getFileContent(targetRepoId, fileToLoad.path);
      setSelectedFile({
        ...fileToLoad,
        content: fileData.content,
        size: fileData.size ? `${(fileData.size / 1024).toFixed(1)} KB` : fileToLoad.size,
        sha: fileData.sha,
      });
    } catch (err) {
      console.warn(`[Repository] Could not fetch code for ${fileToLoad.path}: ${err.message}`);
      setCodeError(`Unable to fetch file content for "${fileToLoad.path}" from GitHub.`);
      setSelectedFile({
        ...fileToLoad,
        content: null,
      });
    } finally {
      setIsCodeLoading(false);
    }
  };

  const loadRepositoryData = async () => {
    if (!targetRepoId) {
      setError('Repository was not specified.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const repoData = await repositoryService.getRepository(targetRepoId);
      setRepo(repoData);
      const fileTree = repoData.files || [];
      setFiles(fileTree);

      const findFirstFile = (items) => {
        for (const item of items) {
          if (item.type === 'file') return item;
          if (item.children) {
            const found = findFirstFile(item.children);
            if (found) return found;
          }
        }
        return null;
      };

      const fileFromQuery = targetFileParam ? findFileByPath(fileTree, targetFileParam) : null;

      if (fileFromQuery) {
        const parentFolders = findParentFolderIds(fileTree, targetFileParam);
        if (parentFolders.length > 0) {
          setExpandedFolders((prev) => Array.from(new Set([...prev, ...parentFolders])));
        }
        fetchFileContent(fileFromQuery);
      } else {
        const defaultFile = findFirstFile(fileTree);
        if (defaultFile) {
          fetchFileContent(defaultFile);
        }
      }
    } catch (err) {
      setError('Unable to load repository data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRepositoryData();
  }, [targetRepoId]);

  useEffect(() => {
    if (targetFileParam && files.length > 0) {
      const matched = findFileByPath(files, targetFileParam);
      if (matched && matched.path !== selectedFile?.path) {
        const parentFolders = findParentFolderIds(files, targetFileParam);
        if (parentFolders.length > 0) {
          setExpandedFolders((prev) => Array.from(new Set([...prev, ...parentFolders])));
        }
        fetchFileContent(matched);
      }
    }
  }, [targetFileParam, files]);

  const handleToggleFolder = (folderId) => {
    setExpandedFolders((prev) =>
      prev.includes(folderId) ? prev.filter((f) => f !== folderId) : [...prev, folderId]
    );
  };

  const handleFileSelect = (file) => {
    if (file.type === 'file') {
      fetchFileContent(file);
    }
    setMobileView('code');
  };

  const handleAiAction = (actionName) => {
    navigate(`/repository/${encodeURIComponent(targetRepoId)}/chat`, {
      state: { contextFile: selectedFile },
    });
  };

  return (
    <RepositoryLayout repo={repo}>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <div>
              <AlertTitle>Error Loading Repository</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={loadRepositoryData} className="gap-1 cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </Button>
        </Alert>
      )}

      {/* Repository Header */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      ) : (
        <RepositoryHeader
          repo={repo}
          onAiChatClick={() => handleAiAction('AI Chat')}
          onAnalyzeClick={() => handleAiAction('Repository Analysis')}
        />
      )}

      {/* Repository Quick Stats */}
      <RepositoryStats stats={repo?.stats} />

      {/* Workspace Tabs */}
      <RepositoryTabs
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'chat') {
            navigate(`/repository/${encodeURIComponent(targetRepoId)}/chat`, {
              state: { contextFile: selectedFile },
            });
          } else if (tab === 'analysis') {
            navigate(`/repository/${encodeURIComponent(targetRepoId)}/analysis`);
          } else if (tab === 'docs') {
            navigate(`/repository/${encodeURIComponent(targetRepoId)}/docs`);
          } else {
            setActiveTab(tab);
          }
        }}
      />

      {/* Mobile Toggle View Switcher */}
      <div className="flex md:hidden items-center justify-center p-1 rounded-xl bg-muted/60 border border-border/60 text-xs font-medium">
        <button
          onClick={() => setMobileView('files')}
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${mobileView === 'files' ? 'bg-primary text-primary-foreground font-semibold shadow-sm' : 'text-muted-foreground'
            }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>Files Tree</span>
        </button>
        <button
          onClick={() => setMobileView('code')}
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${mobileView === 'code' ? 'bg-primary text-primary-foreground font-semibold shadow-sm' : 'text-muted-foreground'
            }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Code Viewer ({selectedFile?.name || 'None'})</span>
        </button>
      </div>

      {/* Main Workspace Layout (Desktop: 2 Columns - 35% File Explorer / 65% Code Viewer) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

        {/* Left Column: File Explorer */}
        <div className={`md:col-span-4 ${mobileView === 'code' ? 'hidden md:block' : 'block'}`}>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : files.length === 0 ? (
            <RepositoryEmptyState onRefresh={loadRepositoryData} />
          ) : (
            <FileExplorer
              files={files}
              branches={repo?.branches}
              currentBranch={currentBranch}
              onSelectBranch={setCurrentBranch}
              commit={repo?.latestCommit}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              expandedFolders={expandedFolders}
              onToggleFolder={handleToggleFolder}
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              onRefresh={loadRepositoryData}
            />
          )}
        </div>

        {/* Right Column: Code Viewer */}
        <div className={`md:col-span-8 ${mobileView === 'files' ? 'hidden md:block' : 'block'}`}>
          <CodeViewer
            file={selectedFile}
            repoName={repo?.name}
            isLoading={isCodeLoading}
            error={codeError}
            targetLine={targetLineParam ? Number(targetLineParam) : null}
            onAiExplainClick={() => handleAiAction('Explain with AI')}
            onAnalyzeClick={() => handleAiAction('Code Analysis')}
          />
        </div>

      </div>

    </RepositoryLayout>
  );
}
