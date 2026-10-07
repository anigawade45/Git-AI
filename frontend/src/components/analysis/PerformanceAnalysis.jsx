import React from 'react';
import { Zap, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function PerformanceAnalysis() {
  const metrics = [
    { title: 'Database Query Efficiency', status: 'Good', detail: 'Single collection lookup index needed in userService.js' },
    { title: 'API Response Patterns', status: 'Optimal', detail: 'Asynchronous non-blocking handlers used' },
    { title: 'Complex Functions Count', status: 'Warning', detail: '4 functions exceed complexity threshold (>10)' },
    { title: 'Large Files Analysis', status: 'Good', detail: 'All source files under 300 lines' },
  ];

  return (
    <Card className="border-border/80 bg-card/90 backdrop-blur shadow-md">
      <CardHeader className="p-5 pb-3 border-b border-border/60">
        <CardTitle className="text-base font-bold text-foreground flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Performance Bottleneck Audit</span>
          </span>
          <span className="text-xs font-mono font-bold text-amber-500">Score: 78%</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5 space-y-3">
        {metrics.map((m, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-card border border-border/60 flex items-center justify-between text-xs gap-3">
            <div className="space-y-0.5">
              <p className="font-semibold text-foreground">{m.title}</p>
              <p className="text-[11px] text-muted-foreground font-mono">{m.detail}</p>
            </div>
            <span
              className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase shrink-0 ${
                m.status === 'Optimal' || m.status === 'Good'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              }`}
            >
              {m.status}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
