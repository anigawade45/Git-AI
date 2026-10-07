import React from 'react';
import FileTreeItem from './FileTreeItem';

export default function FileTree({
  files = [],
  expandedFolders = [],
  onToggleFolder,
  selectedFile,
  onFileSelect,
}) {
  if (!files || files.length === 0) {
    return (
      <div className="py-6 text-center text-xs font-mono text-muted-foreground">
        No files in this directory.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {files.map((item) => (
        <FileTreeItem
          key={item.id || item.path}
          item={item}
          expandedFolders={expandedFolders}
          onToggleFolder={onToggleFolder}
          selectedFile={selectedFile}
          onFileSelect={onFileSelect}
        />
      ))}
    </div>
  );
}
