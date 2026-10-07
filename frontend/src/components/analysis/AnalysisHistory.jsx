import React from 'react';
import { History, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AnalysisHistory({ history = [] }) {
  if (!history || history.length === 0) return null;

  return (
    <Card className="border-border/80 bg-card/90 backdrop-blur shadow-md">
      <CardHeader className="p-5 pb-3 border-b border-border/60">
        <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          <span>Historical Audit Reports</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 space-y-2">
        {history.map((report) => (
          <div
            key={report.id}
            className="p-3.5 rounded-xl bg-card border border-border/60 backdrop-blur flex items-center justify-between gap-4 text-xs hover:border-primary/40 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold font-mono">
                {report.healthScore}%
              </div>
              <div>
                <p className="font-bold text-foreground">{report.date}</p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  {report.issuesCount} issues recorded • {report.status}
                </p>
              </div>
            </div>

            <Button variant="outline" size="sm" className="h-8 text-xs gap-1 cursor-pointer">
              <span>View Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
