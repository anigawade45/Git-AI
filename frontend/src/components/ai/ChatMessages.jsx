import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import AIThinking from './AIThinking';

export default function ChatMessages({ messages = [], onRegenerate, repoId }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages]);

  return (
    <div className="space-y-6 pb-4">
      {messages.map((msg, idx) => (
        <ChatMessage
          key={msg.id || `msg_${idx}`}
          message={msg}
          onRegenerate={onRegenerate}
          repoId={repoId}
        />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
