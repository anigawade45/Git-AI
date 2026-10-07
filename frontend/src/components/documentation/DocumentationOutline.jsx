import React from 'react';
import { ListTree, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function DocumentationOutline({ sections = [], activeSectionId, onSelectSection }) {
  const defaultHeadings = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'features', title: 'Features' },
    { id: 'tech-stack', title: 'Tech Stack' },
    { id: 'architecture', title: 'Architecture' },
    { id: 'installation', title: 'Installation & Setup' },
    { id: 'api', title: 'API Usage' },
    { id: 'contributing', title: 'Contributing' },
  ];

  const headingsList = sections.length > 0 ? sections : defaultHeadings;

  return (
    <Card className="border-border/80 bg-card/90 backdrop-blur shadow-md sticky top-20">
      <CardHeader className="p-4 pb-2 border-b border-border/60">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <ListTree className="w-3.5 h-3.5 text-primary" />
          <span>Document Outline</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-2 space-y-1">
        {headingsList.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectSection && onSelectSection(item.id)}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between group cursor-pointer ${
              activeSectionId === item.id
                ? 'bg-primary/10 text-primary font-bold border border-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            }`}
          >
            <span className="truncate">{item.title}</span>
            <span className="text-[10px] opacity-0 group-hover:opacity-100 text-primary font-mono transition-opacity">
              #
            </span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
