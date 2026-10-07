import React from 'react';
import { FolderGit2, Bot, BarChart3, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RepositoryTabs({ activeTab = 'files', onSelectTab }) {
  const tabs = [
    { id: 'files', label: 'Files', icon: FolderGit2 },
    { id: 'chat', label: 'AI Chat', icon: Bot, badge: 'AI' },
    { id: 'analysis', label: 'Analysis', icon: BarChart3 },
    { id: 'docs', label: 'Docs', icon: FileText },
  ];

  return (
    <div className="border-b border-border/60">
      <nav role="tablist" className="flex space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectTab?.(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap",
                isActive
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
