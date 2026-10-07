import React from 'react';
import ChatMessages from './ChatMessages';
import ChatEmptyState from './ChatEmptyState';
import ChatInput from './ChatInput';
import ChatError from './ChatError';

export default function ChatWindow({
  repo,
  messages = [],
  isThinking = false,
  isStreaming = false,
  error = '',
  suggestedQuestions = [],
  contextFile,
  onSendMessage,
  onSelectQuestion,
  onRemoveContext,
  onToggleContextModal,
  onRegenerate,
  onRetry,
}) {
  const repositoryId = repo?.repoId || repo?.id;
  const repoName =
    repo?.fullName ||
    repo?.repoId ||
    (repo?.owner && repo?.name ? `${repo.owner}/${repo.name}` : repo?.name);

  return (
    <div className="flex-1 flex flex-col justify-between h-full min-w-0 p-4 sm:p-6 space-y-4">
      

      {/* Error Alert */}
      {error && <ChatError message={error} onRetry={onRetry} />}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-2 px-1">
        {messages.length === 0 ? (
          <ChatEmptyState
            suggestedQuestions={suggestedQuestions}
            onSelectQuestion={onSelectQuestion}
            repoName={repoName}
          />
        ) : (
          <ChatMessages
            messages={messages}
            isThinking={isThinking}
            onRegenerate={onRegenerate}
            repoId={repositoryId}
          />
        )}
      </div>

      {/* Input Dock */}
      <div className="shrink-0 pt-2 border-t border-border/40">
        <ChatInput
          onSendMessage={onSendMessage}
          disabled={isThinking || isStreaming}
          contextFile={contextFile}
          onRemoveContext={onRemoveContext}
          onToggleContextModal={onToggleContextModal}
        />
      </div>

    </div>
  );
}

