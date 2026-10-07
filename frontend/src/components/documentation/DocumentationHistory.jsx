import React from 'react';
import { History } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import DocumentationVersion from './DocumentationVersion';

export default function DocumentationHistory({ history = [], onViewVersion }) {
  if (!history || history.length === 0) return null;

  return (
    <Card className="border-border/80 bg-card/90 backdrop-blur shadow-md">
      <CardHeader className="p-5 pb-3 border-b border-border/60">
        <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          <span>Documentation History & Versions</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {history.map((ver) => (
          <DocumentationVersion
            key={ver.version}
            versionItem={ver}
            onViewVersion={onViewVersion}
          />
        ))}
      </CardContent>
    </Card>
  );
}
