import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DocumentationSection({ section, onRegenerateSection }) {
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    if (onRegenerateSection) {
      await onRegenerateSection(section.id);
    }
    setIsRegenerating(false);
  };

  return (
    <div id={section.id} className="group relative space-y-2 p-4 rounded-2xl border border-transparent hover:border-border/60 hover:bg-card/40 transition-all scroll-mt-20">
      
      {/* Section Header & AI Regenerate Trigger */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-foreground">
          {section.title}
        </h3>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="opacity-0 group-hover:opacity-100 transition-opacity h-7 text-[10px] font-semibold gap-1 px-2 cursor-pointer text-primary hover:bg-primary/10"
        >
          {isRegenerating ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Regenerating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Regenerate Section</span>
            </>
          )}
        </Button>
      </div>

      {/* Section Content */}
      <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-sans">
        {section.content}
      </div>

    </div>
  );
}
