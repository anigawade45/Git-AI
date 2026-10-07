import React from 'react';
import RepoInput from '../components/repository/RepoInput';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center">
      <div className="space-y-2 max-w-xl">
        <h1 className="text-4xl font-bold tracking-tight">AI-Powered GitHub Assistant</h1>
        <p className="text-muted-foreground text-lg">
          Analyze codebases, generate documentation, and chat with your repositories effortlessly.
        </p>
      </div>
      <RepoInput />
    </div>
  );
}
