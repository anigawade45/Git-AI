import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HealthScore({ score = 82, status = 'Good' }) {
  const getRatingColor = (val) => {
    if (val >= 90) return { text: 'text-emerald-500', stroke: '#10b981', badge: 'success' };
    if (val >= 75) return { text: 'text-blue-500', stroke: '#3b82f6', badge: 'default' };
    if (val >= 50) return { text: 'text-amber-500', stroke: '#f59e0b', badge: 'outline' };
    return { text: 'text-destructive', stroke: '#ef4444', badge: 'destructive' };
  };

  const rating = getRatingColor(score);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card className="border-border/80 bg-card/90 backdrop-blur shadow-md flex flex-col justify-between h-full">
      <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Overall Codebase Health
        </p>

        {/* Circular SVG Gauge */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background track */}
            <circle
              cx="50"
              cy="50"
              r="40"
              className="stroke-muted/40"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Progress track */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke={rating.stroke}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-extrabold font-mono tracking-tight ${rating.text}`}>
              {score}%
            </span>
          </div>
        </div>

        <Badge variant={rating.badge} className="px-3 py-1 text-xs font-bold">
          {status} Health
        </Badge>
      </CardContent>
    </Card>
  );
}
