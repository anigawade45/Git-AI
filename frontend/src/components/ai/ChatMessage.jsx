import React from 'react';
import UserMessage from './UserMessage';
import AIMessage from './AIMessage';

export default function ChatMessage({ message, onRegenerate, repoId }) {
  if (!message) return null;

  if (message.role === 'user') {
    return <UserMessage message={message} />;
  }

  if (message.role === 'assistant') {
    return (
      <AIMessage
        message={message}
        onRegenerate={onRegenerate}
        repoId={repoId}
      />
    );
  }

  return null;
}