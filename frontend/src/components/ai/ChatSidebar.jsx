import React from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConversationList from './ConversationList';
import { cn } from '@/lib/utils';

export default function ChatSidebar({
  conversations = [],
  activeId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  repositoryStatus,
  className = '',
}) {
  const isContextActive = repositoryStatus === 'INDEXED';

  return (
    <aside className={cn("w-72 border-r border-border bg-card/60 backdrop-blur p-4 flex flex-col justify-between h-full select-none text-card-foreground", className)}>
      
      <div className="space-y-4 flex-1 flex flex-col min-h-0">
        
        {/* New Chat Primary Button */}
        <Button
          onClick={onNewChat}
          className="w-full h-10 rounded-xl gap-2 font-semibold shadow-sm cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </Button>

        {/* Conversations Scroll Container */}
        <div className="flex-1 overflow-y-auto no-scrollbar pt-2 pr-1">
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            onSelect={onSelectConversation}
            onRename={onRenameConversation}
            onDelete={onDeleteConversation}
          />
        </div>

      </div>

      {/* Sidebar Footer */}
      <div className="pt-3 border-t border-border/60 shrink-0">
        <div className="p-2.5 rounded-xl bg-card border border-border/60 backdrop-blur flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className={cn("w-3.5 h-3.5", isContextActive ? "text-primary" : "text-muted-foreground")} />
            {isContextActive ? 'AI Context Active' : 'AI Context Unavailable'}
          </span>
          <span className={cn("font-mono text-[10px] uppercase font-bold", isContextActive ? "text-emerald-500" : "text-muted-foreground")}>
            {isContextActive ? 'Online' : repositoryStatus || 'Pending'}
          </span>
        </div>
      </div>

    </aside>
  );
}
