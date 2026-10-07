import React from 'react';
import { Bot, Sparkles } from 'lucide-react';
import SuggestedQuestions from './SuggestedQuestions';

export default function ChatEmptyState({
  suggestedQuestions = [],
  onSelectQuestion,
  repoName,
}) {
  return (
    <div className="py-10 max-w-2xl mx-auto text-center space-y-6 animate-in fade-in-0 zoom-in-95">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mx-auto shadow-lg">
        <Bot className="w-7 h-7" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center justify-center gap-2">
          <span>AI Repository Assistant</span>
          <Sparkles className="w-5 h-5 text-amber-400" />
        </h3>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Ask natural-language questions about{' '}
          <strong className="font-mono text-foreground">
            {repoName || 'this repository'}
          </strong>{' '}
          to get answers grounded in the indexed codebase with source references when available.
        </p>
      </div>

      <SuggestedQuestions
        questions={suggestedQuestions}
        onSelectQuestion={onSelectQuestion}
      />
    </div>
  );
}