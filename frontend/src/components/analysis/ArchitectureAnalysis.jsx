import React from 'react';
import { Layers, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function ArchitectureAnalysis() {
  const stack = [
    { category: 'Frontend Framework', tech: 'React.js + Vite + Tailwind CSS v4' },
    { category: 'Backend Architecture', tech: 'Node.js + Express.js REST API' },
    { category: 'Database & ORM', tech: 'MongoDB + Mongoose Models' },
    { category: 'Design Pattern', tech: 'Layered MVC (Controllers, Services, Models)' },
  ];

  return (
    <Card className="border-border/80 bg-card/90 backdrop-blur shadow-md">
      <CardHeader className="p-5 pb-3 border-b border-border/60">
        <CardTitle className="text-base font-bold text-foreground flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-500" />
            <span>Architecture & Framework Analysis</span>
          </span>
          <span className="text-xs font-mono font-bold text-purple-500">Score: 84%</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5 space-y-3">
        {stack.map((item, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-card border border-border/60 flex items-center justify-between text-xs gap-3">
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{item.category}</p>
              <p className="font-semibold text-foreground font-mono">{item.tech}</p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
