import React from 'react';

export default function MarkdownPreview({ markdown = '' }) {
  if (!markdown) return null;

  // Simple Markdown renderer
  const paragraphs = markdown.split('\n\n');

  return (
    <div className="prose dark:prose-invert max-w-none space-y-4 font-sans text-xs sm:text-sm leading-relaxed">
      {paragraphs.map((para, idx) => {
        // H1 Heading
        if (para.startsWith('# ')) {
          return (
            <h1 key={idx} className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground pb-2 border-b border-border/60 mt-4">
              {para.replace('# ', '')}
            </h1>
          );
        }

        // H2 Heading
        if (para.startsWith('## ')) {
          const title = para.replace('## ', '');
          const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return (
            <h2 id={id} key={idx} className="text-lg font-bold tracking-tight text-foreground pb-1 border-b border-border/40 mt-6 scroll-mt-20">
              {title}
            </h2>
          );
        }

        // H3 Heading
        if (para.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-base font-bold text-foreground mt-4">
              {para.replace('### ', '')}
            </h3>
          );
        }

        // Code Block
        if (para.startsWith('```')) {
          const lines = para.split('\n');
          const codeText = lines.slice(1, -1).join('\n');
          return (
            <div key={idx} className="my-3 rounded-xl border border-border/80 bg-muted/40 p-3.5 font-mono text-xs overflow-x-auto text-foreground">
              <pre>{codeText}</pre>
            </div>
          );
        }

        // Table
        if (para.includes('|')) {
          const lines = para.split('\n');
          return (
            <div key={idx} className="my-3 overflow-x-auto rounded-xl border border-border/80 bg-card">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <tbody>
                  {lines.map((line, lIdx) => {
                    if (line.includes('---')) return null;
                    const cells = line.split('|').filter(Boolean);
                    return (
                      <tr key={lIdx} className={lIdx === 0 ? 'bg-muted/60 font-bold border-b border-border/60' : 'border-b border-border/40 hover:bg-accent/30'}>
                        {cells.map((c, cIdx) => (
                          <td key={cIdx} className="p-2.5 px-3">
                            {c.trim()}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        }

        // List Items
        if (para.startsWith('- ') || para.startsWith('1. ')) {
          const items = para.split('\n');
          return (
            <ul key={idx} className="list-disc list-inside space-y-1.5 text-muted-foreground my-2">
              {items.map((item, iIdx) => (
                <li key={iIdx} className="leading-relaxed">
                  {item.replace(/^- /, '').replace(/^\d+\. /, '')}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={idx} className="text-muted-foreground leading-relaxed">
            {para}
          </p>
        );
      })}
    </div>
  );
}
