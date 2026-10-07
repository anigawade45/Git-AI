import React from 'react';
import { Cpu } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function FunctionAnalysis({ functions = [] }) {
  if (!functions || functions.length === 0) return null;

  return (
    <Card className="border-border/80 bg-card/90 backdrop-blur shadow-md">
      <CardHeader className="p-5 pb-3 border-b border-border/60">
        <CardTitle className="text-base font-bold text-foreground">
          Most Complex Functions
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 space-y-1">
        {functions.map((fn, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/40 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <Cpu className="w-4 h-4 text-purple-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold font-mono text-foreground truncate">{fn.name}</p>
                <p className="text-[10px] font-mono text-muted-foreground truncate">{fn.file}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-mono font-semibold text-muted-foreground">
                Complexity: <strong className="text-foreground">{fn.complexity}</strong>
              </span>
              <span
                className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                  fn.rating === 'High'
                    ? 'bg-destructive/10 text-destructive border border-destructive/20'
                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                }`}
              >
                {fn.rating}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
