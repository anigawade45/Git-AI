import React, { useState } from 'react';
import { Bot, Copy, Check, Code2, Loader2 } from 'lucide-react';
import SourceReferences from './SourceReferences';
import MessageActions from './MessageActions';

function CodeBlock({ language, codeText }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  return (
    <div className="my-3 rounded-xl border border-border/80 bg-zinc-950 text-zinc-100 overflow-hidden shadow-sm font-mono text-xs">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[11px] text-zinc-400">
        <span className="flex items-center gap-1.5 uppercase font-semibold text-zinc-300">
          <Code2 className="w-3.5 h-3.5 text-purple-400" />
          <span>{language || 'code'}</span>
        </span>
        <button
          type="button"
          aria-label={copied ? 'Code copied' : 'Copy code'}
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto leading-relaxed text-xs">
        <code>{codeText}</code>
      </pre>
    </div>
  );
}

const formatInlineText = (text) => {
  if (!text) return null;
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-muted/80 font-mono text-[11px] text-purple-600 dark:text-purple-300 font-semibold">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
};

export default function AIMessage({ message, onRegenerate, repoId }) {
  const content = typeof message?.content === 'string' ? message.content : '';
  const hasSources = message?.sources && message.sources.length > 0;
  const isThinking = !content;

  const renderFormattedText = (rawContent) => {
    if (!rawContent) return null;

    // Split content into code blocks vs standard text
    const parts = rawContent.split(/(```[\s\S]*?```)/g);

    return parts.map((part, idx) => {
      if (part.startsWith('```')) {
        const match = part.match(/^```(\w+)?\n?([\s\S]*?)```$/);
        const lang = match ? match[1] || 'plaintext' : 'plaintext';
        const codeText = match ? match[2].trim() : part.replace(/```/g, '').trim();
        return <CodeBlock key={idx} language={lang} codeText={codeText} />;
      }

      // Paragraph formatting
      const paragraphs = part.split('\n\n');
      return paragraphs.map((para, pIdx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        // Headings (#, ##, ###, ####)
        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={`${idx}-${pIdx}`} className="text-base font-bold text-foreground mt-4 mb-2">
              {formatInlineText(trimmed.replace('# ', ''))}
            </h2>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={`${idx}-${pIdx}`} className="text-sm font-bold text-foreground mt-3.5 mb-1.5">
              {formatInlineText(trimmed.replace('## ', ''))}
            </h3>
          );
        }
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={`${idx}-${pIdx}`} className="text-xs font-bold text-foreground mt-3 mb-1">
              {formatInlineText(trimmed.replace('### ', ''))}
            </h4>
          );
        }
        if (trimmed.startsWith('#### ')) {
          return (
            <h5 key={`${idx}-${pIdx}`} className="text-xs font-semibold text-foreground mt-2 mb-1">
              {formatInlineText(trimmed.replace('#### ', ''))}
            </h5>
          );
        }

        // Blockquotes (> )
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote key={`${idx}-${pIdx}`} className="border-l-2 border-primary/50 pl-3 my-2 text-xs italic text-muted-foreground">
              {formatInlineText(trimmed.replace(/^>\s*/, ''))}
            </blockquote>
          );
        }

        // Numbered lists (1. , 2. )
        if (/^\d+\.\s+/.test(trimmed)) {
          const items = trimmed.split('\n');
          return (
            <ol key={`${idx}-${pIdx}`} className="list-decimal pl-5 space-y-1 text-xs sm:text-sm text-foreground my-1.5">
              {items.map((item, iIdx) => (
                <li key={iIdx}>{formatInlineText(item.replace(/^\d+\.\s+/, ''))}</li>
              ))}
            </ol>
          );
        }

        // Bullet lists (- , * )
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const items = trimmed.split('\n');
          return (
            <ul key={`${idx}-${pIdx}`} className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-foreground my-1.5">
              {items.map((item, iIdx) => (
                <li key={iIdx}>{formatInlineText(item.replace(/^[-*]\s+/, ''))}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={`${idx}-${pIdx}`} className="text-xs sm:text-sm text-foreground leading-relaxed my-1.5 whitespace-pre-wrap">
            {formatInlineText(trimmed)}
          </p>
        );
      });
    });
  };

  return (
    <div className="flex gap-3 max-w-3xl items-start animate-in fade-in-0 slide-in-from-bottom-2">
      {/* AI Bot Avatar */}
      <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
        <Bot className="w-4 h-4" />
      </div>

      {/* AI Response Card */}
      <div className="flex-1 p-4 rounded-2xl bg-card border border-border/80 shadow-md space-y-3">
        {/* Thinking Indicator */}
        {isThinking && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-500" />
              <span>{hasSources ? 'Generating AI response...' : 'Analyzing repository codebase...'}</span>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
              {hasSources ? 'Synthesizing answer from retrieved code context...' : 'Searching codebase for relevant context chunks...'}
            </p>
          </div>
        )}

        {/* Main Content */}
        {content ? (
          <div className="prose dark:prose-invert max-w-none">
            {renderFormattedText(content)}
          </div>
        ) : null}

        {/* Source References & Citations */}
        {hasSources && (
          <SourceReferences sources={message.sources} repoId={repoId} />
        )}

        {/* Message Actions */}
        {content ? (
          <MessageActions
            messageContent={content}
            onRegenerate={onRegenerate}
          />
        ) : null}
      </div>
    </div>
  );
}
