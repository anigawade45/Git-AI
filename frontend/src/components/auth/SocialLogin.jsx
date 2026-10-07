import React from 'react';
import { Github } from '@/components/common/Icons';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/authService';

export default function SocialLogin({ onGitHubClick }) {
  const handleGitHubLogin = async () => {
    if (onGitHubClick) {
      onGitHubClick();
      return;
    }

    try {
      const url = await authService.getGitHubAuthUrl();
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      window.location.href = 'http://localhost:5000/api/auth/github?redirect=true';
    }
  };

  return (
    <div className="w-full space-y-4">

      {/* Divider */}
      <div
        className="relative flex items-center justify-center"
        aria-hidden="true"
      >
        <div className="w-full border-t border-border" />

        <span className="absolute bg-card px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Or continue with
        </span>
      </div>

      {/* GitHub Login */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGitHubLogin}
        aria-label="Continue with GitHub"
        className="h-11 w-full justify-center gap-2 text-sm font-medium transition-all hover:bg-accent"
      >
        <Github
          className="h-5 w-5 text-foreground"
          aria-hidden="true"
        />

        <span>
          Continue with GitHub
        </span>
      </Button>
    </div>
  );
}
