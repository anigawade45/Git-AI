import React from 'react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export default function StepCard({
  number,
  icon: Icon,
  title,
  description,
}) {
  return (
    <Card
      className="
        group
        relative
        overflow-hidden
        border-border/80
        bg-card/60
        backdrop-blur
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-primary/40
        hover:shadow-lg
      "
    >
      {/* Background Step Number */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          right-4
          top-3
          select-none
          font-mono
          text-4xl
          font-extrabold
          text-muted-foreground/15
          transition-colors
          duration-300
          group-hover:text-primary/20
        "
      >
        {number}
      </div>

      <CardHeader className="space-y-3 p-6">

        {/* Icon */}
        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-lg
            border
            border-primary/20
            bg-primary/10
            text-primary
            transition-all
            duration-300
            group-hover:scale-105
            group-hover:bg-primary
            group-hover:text-primary-foreground
          "
        >
          {Icon && <Icon className="h-5 w-5" />}
        </div>

        {/* Title */}
        <CardTitle className="text-lg font-bold text-foreground">
          {title}
        </CardTitle>

        {/* Description */}
        <CardDescription className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </CardDescription>

      </CardHeader>
    </Card>
  );
}