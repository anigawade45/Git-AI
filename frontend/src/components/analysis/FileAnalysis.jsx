import React from 'react';
import { FileCode, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function FileAnalysis({ files = [], onViewFile }) {
  if (!files || files.length === 0) return null;

  return (
    <Card className="border-border/80 bg-card/90 backdrop-blur shadow-md">
      <CardHeader className="p-5 pb-3 border-b border-border/60">
        <CardTitle className="text-base font-bold text-foreground">
          Most Problematic Files
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 space-y-1">
        {files.map((file, idx) => (
          <div
            key={idx}
            onClick={() => onViewFile && onViewFile(file)}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/40 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <FileCode className="w-4 h-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold font-mono text-foreground truncate group-hover:text-primary transition-colors">
                  {file.name}
                </p>
                <p className="text-[10px] font-mono text-muted-foreground truncate">{file.path}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20 font-mono text-[11px] font-bold">
                {file.issues} issues
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
