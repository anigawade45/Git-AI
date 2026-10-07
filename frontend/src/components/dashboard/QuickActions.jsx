import React from 'react';
import { Plus, Bot, Search, FileText, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function QuickActions({ onImportClick, onActionClick }) {
  const actions = [
    {
      id: 'import',
      title: 'Import Repo',
      description: 'Add a new GitHub repository',
      icon: Plus,
      color: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-primary-foreground',
      onClick: onImportClick,
    },
    {
      id: 'assistant',
      title: 'AI Assistant',
      description: 'Chat across your codebases',
      icon: Bot,
      color: 'bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500 hover:text-white',
      onClick: () => onActionClick && onActionClick('assistant'),
    },
    {
      id: 'analyze',
      title: 'Analyze Code',
      description: 'Audit codebase health',
      icon: Search,
      color: 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500 hover:text-white',
      onClick: () => onActionClick && onActionClick('analyze'),
    },
    {
      id: 'docs',
      title: 'Documentation',
      description: 'Generate instant docs',
      icon: FileText,
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white',
      onClick: () => onActionClick && onActionClick('docs'),
    },
  ];

  return (
    <Card className="border-border/80 bg-card/90 backdrop-blur shadow-md flex flex-col justify-between">
      <CardHeader className="p-5 pb-3 border-b border-border/60">
        <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 grid grid-cols-2 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={act.onClick}
              className="p-3.5 rounded-xl border border-border/60 bg-muted/30 hover:bg-card hover:border-primary/40 transition-all text-left space-y-2 group cursor-pointer"
            >
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${act.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  {act.title}
                </p>
                <p className="text-[10px] text-muted-foreground line-clamp-1">{act.description}</p>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
