import React from 'react';
import { Bell, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Navbar() {
  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur px-6 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
        <Logo className="h-10 sm:h-11 w-auto" />
      </Link>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
}
