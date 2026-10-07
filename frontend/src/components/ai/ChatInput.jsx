import React, { useState, useRef } from 'react';
import { Send, Paperclip, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CodeContext from './CodeContext';

export default function ChatInput({
  onSendMessage,
  disabled = false,
  contextFile,
  onRemoveContext,
  onToggleContextModal,
}) {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || disabled || typeof onSendMessage !== 'function') {
      return;
    }

    onSendMessage(trimmedPrompt);
    setPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e) => {
    setPrompt(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
  };

  return (
    <div className="w-full space-y-2 pt-2">
      {/* File Context Pill */}
      <CodeContext contextFile={contextFile} onRemoveContext={onRemoveContext} />

      {/* Form Input Box */}
      <form
        onSubmit={handleSubmit}
        className="relative rounded-2xl border border-border/80 bg-card p-3 shadow-xl backdrop-blur transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20"
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={prompt}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about this repository (e.g. How does authentication work?)..."
          disabled={disabled}
          className="w-full resize-none bg-transparent text-xs sm:text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none max-h-36 pr-12 leading-relaxed"
        />

        {/* Action Controls Toolbar */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-2">
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleContextModal}
              disabled={disabled || typeof onToggleContextModal !== 'function'}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Attach code file context"
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>Attach File Context</span>
            </button>

            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              Shift + Enter for new line
            </span>
          </div>

          <Button
            type="submit"
            disabled={!prompt.trim() || disabled}
            size="sm"
            className="h-8 px-3 text-xs font-bold gap-1.5 cursor-pointer shadow-md bg-primary hover:bg-primary/90 transition-all shrink-0"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </Button>

        </div>
      </form>
    </div>
  );
}
