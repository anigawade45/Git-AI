import React from 'react';
import ChatWindow from '../components/chat/ChatWindow';

export default function Chat() {
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <h2 className="text-2xl font-bold">Code Assistant Chat</h2>
      <div className="flex-1">
        <ChatWindow />
      </div>
    </div>
  );
}
