import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  MoreVertical,
  Edit2,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onRename,
  onDelete,
}) {
  const convId =
    conversation.convId ||
    conversation.id ||
    conversation._id;

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(conversation.title || '');

  useEffect(() => {
    setTitle(conversation.title || '');
  }, [conversation.title]);

  const handleSaveRename = () => {
    const nextTitle = title.trim();

    if (nextTitle && nextTitle !== conversation.title) {
      onRename?.(convId, nextTitle);
    }

    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 bg-accent/80 rounded-xl border border-primary/40">
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          className="h-7 text-xs font-medium bg-background px-2"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSaveRename();
            }

            if (e.key === 'Escape') {
              setIsEditing(false);
              setTitle(conversation.title || '');
            }
          }}
        />

        <button
          type="button"
          onClick={handleSaveRename}
          aria-label="Save conversation name"
          className="p-1 text-emerald-500 hover:bg-card rounded cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => {
            setIsEditing(false);
            setTitle(conversation.title || '');
          }}
          aria-label="Cancel rename"
          className="p-1 text-muted-foreground hover:bg-card rounded cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect?.(convId)}
      className={cn(
        'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer group text-muted-foreground hover:text-foreground hover:bg-accent/60 select-none',
        isActive &&
          'bg-primary/15 text-primary font-bold border border-primary/20 hover:bg-primary/20 hover:text-primary'
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <MessageSquare className="w-4 h-4 shrink-0" />
        <span className="truncate">
          {conversation.title || 'Untitled conversation'}
        </span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Conversation actions"
            className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-card text-muted-foreground hover:text-foreground transition-opacity cursor-pointer"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="right" className="w-36">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Rename</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            destructive
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(convId);
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}