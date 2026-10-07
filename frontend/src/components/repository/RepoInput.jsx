import React, { useState } from 'react';
import { Search, GitBranch } from 'lucide-react';

export default function RepoInput({ onSubmit }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = url.trim();
    if (value) {
      onSubmit?.(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-2xl">
      <div className="relative flex-1">
        <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter GitHub repository URL or owner/repo..."
          className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
      <button
        type="submit"
        disabled={!url.trim()}
        className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <Search className="w-4 h-4" />
        Analyze
      </button>
    </form>
  );
}
