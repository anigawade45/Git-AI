import React from 'react';
import { Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export default function WelcomeHeader({ onImportClick }) {
  const { user } = useAuth();

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 border border-border/60 backdrop-blur flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1.5 max-w-xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-Powered Developer Workspace</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Welcome back, {user?.name || 'Developer'}! 👋
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Connect GitHub repositories, explore your code with AI, ask questions with source citations, and run automated codebase audits.
        </p>
      </div>

      <Button
        type="button"
        size="lg"
        onClick={onImportClick}
        className="h-11 px-5 rounded-xl font-medium shadow-md gap-2 shrink-0 cursor-pointer bg-primary hover:bg-primary/90 transition-all"
      >
        <Plus className="w-4 h-4" />
        <span>Import Repository</span>
      </Button>
    </div>
  );
}
