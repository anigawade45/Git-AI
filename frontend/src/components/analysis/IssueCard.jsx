import React from 'react';
import { ShieldAlert, AlertTriangle, FileCode, Sparkles, ExternalLink, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function IssueCard({ issue, onViewCode, onExplainAi, onViewDetails }) {
  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'critical':
        return <Badge variant="destructive">🔴 Critical</Badge>;
      case 'high':
        return (
          <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10">
            🟠 High
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="outline" className="text-blue-500 border-blue-500/30 bg-blue-500/10">
            🟡 Medium
          </Badge>
        );
      case 'low':
        return <Badge variant="success">🔵 Low</Badge>;
      default:
        return <Badge variant="outline">⚪ {sev}</Badge>;
    }
  };

  return (
    <Card className="border-border/80 bg-card/90 backdrop-blur shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between">
      
      <CardHeader className="p-5 pb-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          {getSeverityBadge(issue.severity)}
          <span className="px-2 py-0.5 rounded bg-muted font-mono text-[10px] uppercase font-bold text-muted-foreground">
            {issue.category}
          </span>
        </div>

        <CardTitle className="text-base font-bold text-foreground leading-snug">
          {issue.title}
        </CardTitle>

        <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground pt-0.5">
          <FileCode className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="truncate">{issue.file}</span>
          <span>:</span>
          <span className="font-bold text-foreground">L{issue.startLine}</span>
        </div>
      </CardHeader>

      <CardContent className="px-5 py-2 flex-1 space-y-3">
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {issue.description}
        </p>
      </CardContent>

      <CardFooter className="p-5 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails && onViewDetails(issue)}
          className="text-xs gap-1 cursor-pointer"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Details</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewCode && onViewCode(issue)}
            className="text-xs gap-1 cursor-pointer"
          >
            <span>View Code</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>

          <Button
            size="sm"
            onClick={() => onExplainAi && onExplainAi(issue)}
            className="text-xs font-semibold gap-1.5 cursor-pointer shadow-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Explain AI</span>
          </Button>
        </div>
      </CardFooter>

    </Card>
  );
}
