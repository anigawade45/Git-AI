import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, ChevronRight, User, Settings, CreditCard, LogOut } from 'lucide-react';
import ThemeToggle from '@/components/common/ThemeToggle';
import { Avatar } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';

export default function RepositoryNavbar({ repo }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 border-b border-border/40 bg-background/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between transition-colors duration-200">
      
      {/* Brand & Repository Breadcrumb */}
      <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
        <Link to="/dashboard" className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
            <Code2 className="w-4 h-4" />
          </div>
          <span className="font-semibold text-foreground hidden sm:inline">Dashboard</span>
        </Link>

        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />

        <div className="flex items-center gap-1.5 font-mono text-muted-foreground truncate">
          <span className="hover:text-foreground transition-colors cursor-pointer">{repo?.owner || 'user'}</span>
          <span>/</span>
          <span className="font-bold text-foreground truncate">{repo?.name || 'repository'}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

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
              <span>Billing</span>
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
