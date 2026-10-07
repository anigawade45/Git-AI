import React, { useState } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardNavbar from './DashboardNavbar';
import { Sheet, SheetContent } from '@/components/ui/sheet';

export default function DashboardLayout({ children, activeTab = 'overview', onSelectTab, pageTitle = 'Dashboard', repoCount = null }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleSelectTab = (tabId) => {
    if (onSelectTab) onSelectTab(tabId);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col lg:flex-row font-sans selection:bg-primary/20 selection:text-primary transition-colors duration-200">
      
      {/* Desktop Sidebar (Fixed 250px / 64 tailwind width) */}
      <div className="hidden lg:block h-screen sticky top-0 shrink-0 z-30">
        <DashboardSidebar activeTab={activeTab} onSelectTab={handleSelectTab} repoCount={repoCount} />
      </div>

      {/* Mobile Sidebar Sheet Drawer */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 border-r-0">
          <DashboardSidebar activeTab={activeTab} onSelectTab={handleSelectTab} repoCount={repoCount} className="border-r-0 w-full" />
        </SheetContent>
      </Sheet>

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <DashboardNavbar
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          pageTitle={pageTitle}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1700px] w-full mx-auto space-y-8">
          {children}
        </main>
      </div>

    </div>
  );
}
