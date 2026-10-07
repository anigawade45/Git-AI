import React, { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import CodeContext from '../ai/CodeContext';

export default function ChatInput({
  onSend,
  disabled = false,
  contextFile = null,
  onRemoveContext,
}) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [text]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedText = text.trim();

    if (!trimmedText || disabled || typeof onSend !== 'function') {
      return;
    }

    onSend({
      text: trimmedText,
      contextFile,
    });

    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 p-3 bg-card border-t border-border"
    >
      {contextFile && (
        <CodeContext
          contextFile={contextFile}
          onRemoveContext={onRemoveContext}
        />
      )}

      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          placeholder="Ask anything about the codebase..."
          className="flex-1 resize-none max-h-40 px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60 disabled:cursor-not-allowed"
          aria-label="Ask about the codebase"
        />

        <button
          type="submit"
          disabled={disabled || !text.trim()}
          aria-label="Send message"
          className="p-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}


