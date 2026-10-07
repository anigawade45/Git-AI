import React from 'react';
import { ShieldAlert, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function IssueSummary({ issues = [] }) {
  const critical = issues.filter((i) => i.severity === 'critical').length;
  const high = issues.filter((i) => i.severity === 'high').length;
  const medium = issues.filter((i) => i.severity === 'medium').length;
  const low = issues.filter((i) => i.severity === 'low').length;

  return (
    <Card className="border-border/80 bg-card/90 backdrop-blur shadow-md">
      <CardHeader className="p-5 pb-3 border-b border-border/60">
        <CardTitle className="text-base font-bold text-foreground flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-destructive" />
            <span>Detected Issues Summary</span>
          </span>
          <span className="text-xs font-mono font-bold text-muted-foreground">{issues.length} Issues</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-destructive flex items-center justify-center gap-1">
            🔴 Critical
          </span>
          <p className="text-2xl font-extrabold font-mono text-destructive">{critical}</p>
        </div>

        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center justify-center gap-1">
            🟠 High
          </span>
          <p className="text-2xl font-extrabold font-mono text-amber-500">{high}</p>
        </div>

        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 flex items-center justify-center gap-1">
            🟡 Medium
          </span>
          <p className="text-2xl font-extrabold font-mono text-blue-500">{medium}</p>
        </div>

        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 flex items-center justify-center gap-1">
            🔵 Low
          </span>
          <p className="text-2xl font-extrabold font-mono text-emerald-500">{low}</p>
        </div>
      </CardContent>
    </Card>
  );
}
