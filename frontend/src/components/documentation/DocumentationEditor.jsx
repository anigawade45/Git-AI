import React, { useState } from 'react';
import { Save, Eye, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import DocumentationToolbar from './DocumentationToolbar';

export default function DocumentationEditor({
  content = '',
  onSave,
  onModeChange,
  onCopy,
  onDownload,
  onRegenerate,
}) {
  const [markdown, setMarkdown] = useState(content);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (onSave) onSave(markdown);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      <DocumentationToolbar
        mode="editor"
        onModeChange={onModeChange}
        onCopy={onCopy}
        onDownload={onDownload}
        onRegenerate={onRegenerate}
      />

      <Card className="border-border/80 bg-card/90 backdrop-blur shadow-md">
        <CardHeader className="p-4 pb-2 border-b border-border/60 flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Raw Markdown Editor
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-muted-foreground">
              {markdown.length} characters
            </span>
            <Button
              size="sm"
              onClick={handleSave}
              className="h-7 text-xs font-bold gap-1 px-3 cursor-pointer bg-primary text-primary-foreground"
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            rows={20}
            className="w-full font-mono text-xs sm:text-sm bg-muted/30 p-4 rounded-xl border border-border/80 text-foreground focus:outline-none focus:border-primary leading-relaxed resize-y"
            placeholder="Write markdown documentation..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
