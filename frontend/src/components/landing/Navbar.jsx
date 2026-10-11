import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Code2, Menu, X, ArrowRight } from 'lucide-react';
import { Github } from '@/components/common/Icons';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/common/ThemeToggle';
import Logo from '@/components/common/Logo';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'AI Chat', href: '#chat-demo' },
  { label: 'Analysis', href: '#analysis' },
  { label: 'Benefits', href: '#benefits' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl transition-colors duration-200">
      <div className="mx-auto flex h-18 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Brand */}
        <Link
          to="/"
          onClick={closeMobileMenu}
          className="group flex items-center transition-transform hover:opacity-90 active:scale-95 py-1"
          aria-label="RepoGenius Home"
        >
          <Logo className="h-11 sm:h-13 md:h-14 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-6 md:flex"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="GitHub Repository"
            aria-label="GitHub Repository"
          >
            <Github className="h-5 w-5" />
          </a>

          <Link to="/login">
            <Button
              variant="ghost"
              className="cursor-pointer text-sm font-medium"
            >
              Log In
            </Button>
          </Link>

          <Link to="/register">
            <Button className="cursor-pointer gap-2 text-sm shadow-md transition-all hover:shadow-lg">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-b border-border bg-background px-4 pb-6 pt-2 md:hidden"
        >
          <div className="space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={closeMobileMenu}
                className="block py-2 text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
            <Link to="/login" onClick={closeMobileMenu}>
              <Button
                variant="outline"
                className="w-full justify-center"
              >
                Log In
              </Button>
            </Link>

            <Link to="/register" onClick={closeMobileMenu}>
              <Button className="w-full justify-center gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}