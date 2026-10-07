import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMeta } from '@/hooks/useMeta';

export default function NotFound() {
  useMeta({
    title: '404 - Page Not Found | GitHub Knowledge Assistant',
    description: 'The requested page does not exist.',
    robots: 'noindex, nofollow',
  });

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center p-6 select-none">
      <div className="max-w-md w-full p-8 rounded-2xl border border-border bg-card shadow-2xl text-center space-y-6 animate-in fade-in-0 zoom-in-95">
        
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-4xl font-extrabold font-mono tracking-tight text-foreground">404</span>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Page Not Found</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The page or repository route you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/dashboard">
            <Button size="sm" className="gap-2 text-xs font-bold cursor-pointer bg-primary text-primary-foreground">
              <LayoutDashboard className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
