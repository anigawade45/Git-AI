import React from 'react';
import { Link } from 'react-router-dom';

export default function AuthFooter({ promptText, linkText, linkTo }) {
  return (
    <p className="text-center text-xs sm:text-sm text-muted-foreground">
      {promptText}{' '}
      <Link
        to={linkTo}
        className="font-semibold text-primary hover:underline transition-colors"
      >
        {linkText}
      </Link>
    </p>
  );
}
