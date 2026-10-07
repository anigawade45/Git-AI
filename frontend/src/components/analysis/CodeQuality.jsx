import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2 } from 'lucide-react';

export default function CodeQuality({ metrics }) {
  if (!metrics) return null;

  const items = [
    { label: 'Maintainability Index', value: metrics.maintainability || 86 },
    { label: 'Cyclomatic Complexity', value: metrics.complexity || 72 },
    { label: 'Code Duplication', value: metrics.duplication || 91 },
    { label: 'Readability Rating', value: metrics.readability || 88 },
    { label: 'Test Coverage', value: metrics.testCoverage || 74 },
  ];

  return (
    <Card className="border-border/80 bg-card/90 backdrop-blur shadow-md">
      <CardHeader className="p-5 pb-3 border-b border-border/60">
        <CardTitle className="text-base font-bold text-foreground flex items-center justify-between">
          <span>Code Quality Metrics</span>
          <span className="text-xs font-mono font-bold text-emerald-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Grade: A
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {items.map((item) => (
          <div key={item.label} className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-foreground">{item.label}</span>
              <span className="font-mono font-bold text-muted-foreground">{item.value}%</span>
            </div>
            <Progress value={item.value} className="h-2 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
