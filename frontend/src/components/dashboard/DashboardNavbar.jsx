import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, User, Settings, CreditCard, LogOut, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import ThemeToggle from '@/components/common/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';

export default function DashboardNavbar({ onOpenMobileSidebar, pageTitle = 'Dashboard' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 border-b border-border/40 bg-background/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between transition-colors duration-200">
      
      {/* Left Menu & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors cursor-pointer"
          aria-label="Toggle Mobile Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
          {pageTitle}
        </h1>
      </div>

      {/* Right Search, Theme Toggle & User Avatar Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Global Search Bar */}
        <div className="relative hidden sm:flex items-center w-48 md:w-64">
          <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search repositories, chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs bg-muted/40 border-border/60 focus-visible:ring-primary/50"
          />
        </div>

        {/* Theme Toggler */}
        <ThemeToggle />

        {/* User Profile Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar className="w-9 h-9 bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-xs text-primary transition-transform hover:scale-105 active:scale-95 cursor-pointer">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="right" className="w-56">
            <DropdownMenuLabel>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-foreground truncate">{user?.name || 'Developer'}</p>
                <p className="text-[11px] font-normal text-muted-foreground truncate">{user?.email || 'user@example.com'}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <User className="w-4 h-4 text-muted-foreground" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <span>Billing & Plan</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
}
