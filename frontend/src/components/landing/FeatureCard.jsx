import React from 'react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  badge,
}) {
  return (
    <Card
      className="
        group
        border-border/80
        bg-card/80
        backdrop-blur
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-primary/40
        hover:shadow-lg
      "
    >
      <CardHeader className="space-y-4 p-6 pb-2">

        {/* Icon + Badge */}
        <div className="flex items-center justify-between gap-4">
          <div
            className="
              flex h-12 w-12 shrink-0 items-center justify-center
              rounded-xl
              border border-primary/20
              bg-primary/10
              text-primary
              transition-all
              duration-300
              group-hover:scale-105
              group-hover:bg-primary
              group-hover:text-primary-foreground
            "
          >
            {Icon && <Icon className="h-6 w-6" />}
          </div>

          {badge && (
            <Badge
              variant="purple"
              className="shrink-0"
            >
              {badge}
            </Badge>
          )}
        </div>

        {/* Title */}
        <CardTitle
          className="
            text-xl
            font-bold
            text-foreground
            transition-colors
            duration-200
            group-hover:text-primary
          "
        >
          {title}
        </CardTitle>

      </CardHeader>

      {/* Description */}
      <CardContent className="p-6 pt-0">
        <CardDescription className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}