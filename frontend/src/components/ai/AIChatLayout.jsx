import React, { useState } from 'react';
import AIChatNavbar from './AIChatNavbar';
import ChatSidebar from './ChatSidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';

export default function AIChatLayout({
  repo,
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  children,
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleSelectConversation = (id) => {
    onSelectConversation(id);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="h-screen w-full bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary transition-colors duration-200 overflow-hidden">
      
      {/* Top Navbar */}
      <AIChatNavbar
        repo={repo}
        onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 min-h-0 flex w-full overflow-hidden">
        
        {/* Desktop Collapsible Conversations Sidebar */}
        <div className="hidden lg:block h-full shrink-0">
          <ChatSidebar
            conversations={conversations}
            activeId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            onNewChat={onNewChat}
            onRenameConversation={onRenameConversation}
            onDeleteConversation={onDeleteConversation}
            repositoryStatus={repo?.status}
          />
        </div>

        {/* Mobile Sidebar Sheet Drawer */}
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="p-0 border-r-0">
            <ChatSidebar
              conversations={conversations}
              activeId={activeConversationId}
              onSelectConversation={handleSelectConversation}
              onNewChat={onNewChat}
              onRenameConversation={onRenameConversation}
              onDeleteConversation={onDeleteConversation}
              repositoryStatus={repo?.status}
              className="border-r-0 w-full"
            />
          </SheetContent>
        </Sheet>

        {/* Chat Window Container */}
        <div className="flex-1 min-w-0 min-h-0 flex flex-col">
          {children}
        </div>

      </div>

    </div>
  );
}
