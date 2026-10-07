import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import DocumentationScope from './DocumentationScope';
import DocumentationLanguage from './DocumentationLanguage';
import DocumentationTone from './DocumentationTone';

export default function DocumentationOptions({
  scope,
  onScopeChange,
  language,
  onLanguageChange,
  tone,
  onToneChange,
  detailLevel,
  onDetailLevelChange,
}) {
  const detailLevels = ['Brief', 'Standard', 'Detailed'];

  return (
    <Card className="border-border/80 bg-card/90 backdrop-blur shadow-md space-y-4 p-5">
      <CardHeader className="p-0 pb-3 border-b border-border/60">
        <CardTitle className="text-base font-bold text-foreground">
          Configuration & Options
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        <DocumentationScope scope={scope} onChange={onScopeChange} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DocumentationLanguage language={language} onChange={onLanguageChange} />
          <DocumentationTone tone={tone} onChange={onToneChange} />
        </div>

        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Detail Level</label>
          <div className="flex items-center gap-2">
            {detailLevels.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => onDetailLevelChange(lvl)}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  detailLevel === lvl
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-muted/40 border-border/80 text-muted-foreground hover:text-foreground hover:bg-card'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
