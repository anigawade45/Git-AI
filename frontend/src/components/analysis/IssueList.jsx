import React from 'react';
import IssueCard from './IssueCard';
import { AlertCircle } from 'lucide-react';

export default function IssueList({ issues = [], onViewCode, onExplainAi, onViewDetails }) {
  if (!issues || issues.length === 0) {
    return (
      <div className="p-10 text-center border border-dashed border-border/80 rounded-2xl bg-card/50 backdrop-blur space-y-2">
        <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto" />
        <h4 className="text-sm font-bold text-foreground">No issues found</h4>
        <p className="text-xs text-muted-foreground">
          No matching issues for the selected filter or search query.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {issues.map((issue) => (
        <IssueCard
          key={issue.id}
          issue={issue}
          onViewCode={onViewCode}
          onExplainAi={onExplainAi}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
