import React, { useState } from 'react';
import DocumentationToolbar from './DocumentationToolbar';
import DocumentationOutline from './DocumentationOutline';
import MarkdownPreview from './MarkdownPreview';
import DocumentationSection from './DocumentationSection';
import { Card, CardContent } from '@/components/ui/card';

export default function DocumentationPreview({
  documentation,
  onModeChange,
  onCopy,
  onDownload,
  onRegenerate,
  onRegenerateSection,
}) {
  const [activeSectionId, setActiveSectionId] = useState('introduction');

  if (!documentation) return null;

  const handleSelectSection = (sectionId) => {
    setActiveSectionId(sectionId);
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Action Toolbar */}
      <DocumentationToolbar
        mode="preview"
        onModeChange={onModeChange}
        onCopy={onCopy}
        onDownload={onDownload}
        onRegenerate={onRegenerate}
        docTitle={`${documentation.type?.toUpperCase() || 'README'}.md`}
      />

      {/* Main Preview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: TOC Outline */}
        <div className="hidden md:block md:col-span-3">
          <DocumentationOutline
            sections={documentation.sections}
            activeSectionId={activeSectionId}
            onSelectSection={handleSelectSection}
          />
        </div>

        {/* Right Column: Formatted Markdown / Sections */}
        <div className="md:col-span-9 space-y-4">
          <Card className="border-border/80 bg-card/90 backdrop-blur shadow-md p-6 sm:p-8">
            <CardContent className="p-0 space-y-6">
              {documentation.sections && documentation.sections.length > 0 ? (
                documentation.sections.map((sec) => (
                  <DocumentationSection
                    key={sec.id}
                    section={sec}
                    onRegenerateSection={onRegenerateSection}
                  />
                ))
              ) : (
                <MarkdownPreview markdown={documentation.content} />
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
