import React from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';

export default function SuggestedQuestions({
  questions = [],
  onSelectQuestion,
}) {
  const validQuestions = Array.isArray(questions)
    ? questions.filter((q) => typeof q === 'string' && q.trim())
    : [];

  if (validQuestions.length === 0) return null;

  return (
    <div className="space-y-2 pt-2">
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 px-1">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <span>Suggested Questions</span>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {validQuestions.map((question, idx) => (
          <button
            key={`${question}-${idx}`}
            type="button"
            onClick={() => onSelectQuestion?.(question)}
            aria-label={`Ask: ${question}`}
            className="p-3 rounded-xl border border-border/70 bg-card/60 hover:bg-card hover:border-primary/40 transition-all text-left text-xs font-medium text-foreground flex items-start gap-2.5 group cursor-pointer shadow-xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />

            <span className="leading-snug">
              {question}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}