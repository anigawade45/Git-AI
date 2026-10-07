import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Code2,
  LayoutDashboard,
  FolderGit2,
  Activity,
  Bot,
  BarChart3,
  Settings,
  HelpCircle,
  Sparkles,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export default function DashboardSidebar({ activeTab = 'overview', onSelectTab, repoCount = null, className = '' }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isItemActive = (id) => {
    if (activeTab === id) return true;
    if (id === 'overview' && (location.pathname === '/dashboard' || location.pathname === '/')) return activeTab === 'overview';
    if (id === 'repositories' && location.pathname.includes('/repository')) return activeTab === 'repositories';
    if (id === 'settings' && location.pathname === '/settings') return true;
    return false;
  };

  const mainNav = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: null },
    { id: 'repositories', label: 'Repositories', icon: FolderGit2, badge: repoCount !== null ? String(repoCount) : null },
    { id: 'activity', label: 'Activity', icon: Activity, badge: 'Live', badgeStyle: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  ];

  const aiNav = [
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, badge: 'PRO', badgeStyle: 'bg-primary/10 text-primary border-primary/20' },
    { id: 'analyses', label: 'Analyses', icon: BarChart3, badge: '3' },
  ];

  const secondaryNav = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Docs', icon: HelpCircle },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={cn(
      "w-64 border-r border-border/80 bg-card/80 backdrop-blur-md p-3.5 flex flex-col justify-between h-full select-none text-card-foreground shadow-xs transition-all duration-200",
      className
    )}>
      <div className="flex-1 flex flex-col min-h-0 space-y-5">

        {/* Brand Logo Header */}
        <Link
          to="/dashboard"
          className="flex items-center justify-between px-2.5 py-2.5 rounded-xl hover:bg-accent/50 border border-transparent hover:border-border/50 transition-all duration-200 group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform duration-200 shrink-0">
              <Code2 className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-foreground truncate">
                  GitHub Assistant
                </span>
                <span className="text-[9px] uppercase font-extrabold tracking-wider px-1.5 py-0.2 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground font-medium truncate">v2.4 • Smart Workspace</span>
            </div>
          </div>
        </Link>

        {/* Navigation Sections (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-0.5 custom-scrollbar">

          {/* Main Navigation Section */}
          <div>
            <p className="px-2.5 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground/70 mb-1.5">
              Main
            </p>
            <nav className="space-y-1">
              {mainNav.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab && onSelectTab(item.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer group",
                      active
                        ? "bg-foreground text-background shadow-sm font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/70"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        active ? "text-background" : "text-muted-foreground group-hover:text-foreground"
                      )} />
                      <span className="truncate group-hover:translate-x-0.5 transition-transform duration-150">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={cn(
                        "text-[10px] font-mono font-medium px-1.5 py-0.2 rounded-md border shrink-0",
                        active
                          ? "bg-background/20 text-background border-transparent"
                          : item.badgeStyle || "bg-muted text-muted-foreground border-border/60"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* AI Features Section */}
          <div>
            <div className="px-2.5 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground/70 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
              <span>AI Features</span>
            </div>
            <nav className="space-y-1">
              {aiNav.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab && onSelectTab(item.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer group",
                      active
                        ? "bg-foreground text-background shadow-sm font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/70"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        active ? "text-background" : "text-muted-foreground group-hover:text-foreground"
                      )} />
                      <span className="truncate group-hover:translate-x-0.5 transition-transform duration-150">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={cn(
                        "text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md border shrink-0",
                        active
                          ? "bg-background/20 text-background border-transparent"
                          : item.badgeStyle || "bg-muted text-muted-foreground border-border/60"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

        </div>
      </div>

      {/* Footer & User Profile Section */}
      <div className="pt-3 border-t border-border/70 space-y-2 shrink-0">
        <nav className="space-y-1">
          {secondaryNav.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.id);
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab && onSelectTab(item.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer group",
                  active
                    ? "bg-accent text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/70"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span className="truncate group-hover:translate-x-0.5 transition-transform duration-150">{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* User Card Pill with Quick Actions */}
        <div className="p-2.5 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-border hover:shadow-sm transition-all duration-200 flex items-center justify-between gap-2 group">
          <div
            onClick={() => onSelectTab && onSelectTab('settings')}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
          >
            <div className="relative shrink-0">
              <Avatar className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shadow-2xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </Avatar>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                {user?.name || 'anigawade05'}
              </p>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground font-medium truncate">Free Plan</span>
                <span className="text-[9px] px-1 py-0.1 rounded bg-accent text-muted-foreground font-mono font-bold">PRO</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleLogout}
              title="Log out"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </aside>
  );
}
