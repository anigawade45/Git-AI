import React, { useRef } from 'react';
import { flushSync } from 'react-dom';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function AnimatedThemeToggler({ className, ...props }) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  const buttonRef = useRef(null);

  const handleToggle = (e) => {
    const nextTheme = isDark ? 'light' : 'dark';

    // Fallback if View Transitions API is not supported
    if (
      !document.startViewTransition ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setTheme(nextTheme);
      return;
    }

    const rect = buttonRef.current?.getBoundingClientRect() || {
      left: e.clientX,
      top: e.clientY,
      width: 0,
      height: 0,
    };

    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setTheme(nextTheme);
      });
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 450,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  };

  return (
    <Button
      ref={buttonRef}
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={cn(
        'relative w-9 h-9 rounded-lg hover:bg-accent transition-transform active:scale-95 cursor-pointer',
        className
      )}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      aria-label="Toggle Theme"
      {...props}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        <Sun
          className={cn(
            'w-4 h-4 text-amber-400 absolute transition-all duration-300',
            isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          )}
        />
        <Moon
          className={cn(
            'w-4 h-4 text-slate-700 dark:text-slate-200 absolute transition-all duration-300',
            isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          )}
        />
      </div>
    </Button>
  );
}

export default AnimatedThemeToggler;
