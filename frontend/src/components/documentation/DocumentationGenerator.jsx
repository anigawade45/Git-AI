import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import DocumentationTypeCard from './DocumentationTypeCard';
import DocumentationOptions from './DocumentationOptions';
import { Button } from '@/components/ui/button';

export default function DocumentationGenerator({
  types = [],
  selectedType = 'readme',
  onSelectType,
  scope,
  onScopeChange,
  language,
  onLanguageChange,
  tone,
  onToneChange,
  detailLevel,
  onDetailLevelChange,
  isGenerating = false,
  onGenerateClick,
}) {
  return (
    <div className="space-y-6">
      
      {/* Top Type Selector Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          1. Select Documentation Type
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {types.map((docType) => (
            <DocumentationTypeCard
              key={docType.id}
              docType={docType}
              selected={selectedType === docType.id}
              onSelect={onSelectType}
            />
          ))}
        </div>
      </div>

      {/* Configuration Options */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          2. Configure AI Options
        </h3>
        <DocumentationOptions
          scope={scope}
          onScopeChange={onScopeChange}
          language={language}
          onLanguageChange={onLanguageChange}
          tone={tone}
          onToneChange={onToneChange}
          detailLevel={detailLevel}
          onDetailLevelChange={onDetailLevelChange}
        />
      </div>

      {/* Main Generate Action CTA */}
      <div className="pt-2">
        <Button
          onClick={onGenerateClick}
          disabled={isGenerating}
          className="w-full h-12 text-sm font-bold gap-2 cursor-pointer shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating Documentation with AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Generate Documentation Now</span>
            </>
          )}
        </Button>
      </div>

    </div>
  );
}
