import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function ScoreCard({ title, score, icon: Icon, color = 'text-primary' }) {
  const getRatingLabel = (val) => {
    if (val >= 90) return 'Excellent';
    if (val >= 75) return 'Good';
    if (val >= 50) return 'Fair';
    return 'Poor';
  };

  return (
    <Card className="border-border/80 bg-card/90 backdrop-blur shadow-md hover:border-primary/40 transition-all">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</span>
          {Icon && <Icon className={`w-4 h-4 ${color}`} />}
        </div>

        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-extrabold font-mono tracking-tight text-foreground">{score}%</span>
          <span className="text-xs font-semibold text-muted-foreground">{getRatingLabel(score)}</span>
        </div>

        <Progress value={score} className="h-1.5 w-full" />
      </CardContent>
    </Card>
  );
}
