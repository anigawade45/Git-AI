import React from 'react';
import RepositoryNavbar from './RepositoryNavbar';

export default function RepositoryLayout({ repo, children }) {
  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary transition-colors duration-200">
      <RepositoryNavbar repo={repo} />
      <main className="flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {children}
      </main>
    </div>
  );
}
