import React from 'react';

export default function AuthHeader({ title, description }) {
  return (
    <div className="text-center space-y-1.5 mb-6">
      <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
      {description && (
        <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
