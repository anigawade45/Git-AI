import React from 'react';
import { Sliders, Eye, Edit3, History } from 'lucide-react';

export default function DocumentationTabs({ activeTab = 'generator', onSelectTab }) {
  const tabs = [
    { id: 'generator', label: 'Generator & Options', icon: Sliders },
    { id: 'preview', label: 'Markdown Preview', icon: Eye },
    { id: 'editor', label: 'Raw Editor', icon: Edit3 },
    { id: 'history', label: 'Version History', icon: History },
  ];

  return (
    <div className="border-b border-border/60 overflow-x-auto no-scrollbar">
      <nav className="flex space-x-2 sm:space-x-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
