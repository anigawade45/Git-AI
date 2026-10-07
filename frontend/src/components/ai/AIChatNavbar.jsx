import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Menu, User, Settings, CreditCard, LogOut, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import ThemeToggle from '@/components/common/ThemeToggle';
import { Avatar } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';

export default function AIChatNavbar({ repo, onOpenMobileSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (logout) await logout();
    navigate('/login');
  };

  const repositoryId = repo?.repoId || repo?.id;
  const indexedFileCount = repo?.stats?.files ?? repo?.filesCount ?? repo?.files?.length ?? 0;
  const repoStatus = repo?.status;

  return (
    <header className="sticky top-0 z-40 w-full h-16 border-b border-border/40 bg-background/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between transition-colors duration-200">
      
      {/* Left: Mobile Menu + Back + Repo Context */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors cursor-pointer"
          aria-label="Toggle Conversations Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link
          to={repositoryId ? `/repository/${encodeURIComponent(repositoryId)}` : '/dashboard'}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group shrink-0"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">Files Explorer</span>
        </Link>

        <span className="text-muted-foreground/50 hidden sm:inline">•</span>

        <div className="flex items-center gap-2 font-mono text-xs truncate">
          <span className="font-bold text-foreground truncate">
            {repo?.owner && repo?.name ? `${repo.owner}/${repo.name}` : repo?.name || repositoryId || 'repository'}
          </span>
          {repoStatus === 'INDEXED' && (
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted border border-border text-foreground text-[10px] font-sans font-semibold">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>Indexed ({indexedFileCount} files)</span>
            </span>
          )}
          {(repoStatus === 'INDEXING' || repoStatus === 'SYNCING' || repoStatus === 'QUEUED') && (() => {
            const processedFiles = repo?.indexingProgress?.processedFiles ?? repo?.processedFiles ?? 0;
            const totalFiles = repo?.indexingProgress?.totalFiles ?? repo?.totalFiles ?? 0;
            const pct = totalFiles > 0 ? Math.min(100, Math.round((processedFiles / totalFiles) * 100)) : 0;
            return (
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-[10px] font-sans font-semibold">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>
                  {pct > 0
                    ? `Indexing ${pct}%`
                    : repoStatus === 'SYNCING'
                    ? 'Syncing repo...'
                    : repoStatus === 'QUEUED'
                    ? 'Queueing...'
                    : 'Indexing 0%'}
                </span>
              </span>
            );
          })()}
          {repoStatus === 'FAILED' && (
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-sans font-semibold">
              <AlertCircle className="w-3 h-3" />
              <span>Indexing Failed</span>
            </span>
          )}
        </div>
      </div>

      {/* Right: Theme Toggle & User Menu */}
      <div className="flex items-center gap-3 shrink-0">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar className="w-9 h-9 bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-xs text-primary transition-transform hover:scale-105 active:scale-95 cursor-pointer">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="right" className="w-56">
            <DropdownMenuLabel>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-foreground truncate">{user?.name || 'Developer'}</p>
                <p className="text-[11px] font-normal text-muted-foreground truncate">{user?.email || 'user@example.com'}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <User className="w-4 h-4 text-muted-foreground" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <span>Billing</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

    </header>
  );
}
