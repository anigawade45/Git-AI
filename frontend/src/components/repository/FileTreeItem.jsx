import React from 'react';
import FolderItem from './FolderItem';
import FileItem from './FileItem';

export default function FileTreeItem({
  item,
  expandedFolders,
  onToggleFolder,
  selectedFile,
  onFileSelect,
}) {
  if (item.type === 'folder') {
    return (
      <FolderItem
        item={item}
        expandedFolders={expandedFolders}
        onToggleFolder={onToggleFolder}
        selectedFile={selectedFile}
        onFileSelect={onFileSelect}
      />
    );
  }

  return (
    <FileItem
      item={item}
      selectedFile={selectedFile}
      onFileSelect={onFileSelect}
    />
  );
}
