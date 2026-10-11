import React from 'react';
import logoDark from '@/assets/logo_dark.png';
import logoLight from '@/assets/logo_light.png';

export default function Logo({
  className = 'h-10 sm:h-12 w-auto',
  variant, // optional: 'dark' to always show dark-mode logo, 'light' to always show light-mode logo
  alt = 'RepoGenius',
  ...props
}) {
  if (variant === 'dark') {
    return (
      <img
        src={logoDark}
        alt={alt}
        className={`object-contain ${className}`}
        {...props}
      />
    );
  }

  if (variant === 'light') {
    return (
      <img
        src={logoLight}
        alt={alt}
        className={`object-contain ${className}`}
        {...props}
      />
    );
  }

  return (
    <div className={`relative inline-flex items-center ${className}`} {...props}>
      {/* Light Theme Logo (visible in light mode, hidden in dark mode) */}
      <img
        src={logoLight}
        alt={alt}
        className="h-full w-auto object-contain dark:hidden"
      />
      {/* Dark Theme Logo (hidden in light mode, visible in dark mode) */}
      <img
        src={logoDark}
        alt={alt}
        className="h-full w-auto object-contain hidden dark:block"
      />
    </div>
  );
}
