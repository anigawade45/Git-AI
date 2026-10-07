import React, { useState } from 'react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

import {
  Bot,
  FileCode,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';

const codeSnippet = `export function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token missing' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}`;

export default function ChatDemo() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeSnippet);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  return (
    <section
      id="chat-demo"
      className="mx-auto max-w-7xl space-y-12 px-4 py-20 sm:px-6 lg:px-8"
    >
      {/* Section Header */}
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <h2 className="text-xs font-bold uppercase tracking-widest text-primary">
          Interactive AI Demo
        </h2>

        <p className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Conversational Code Intelligence
        </p>

        <p className="text-base text-muted-foreground sm:text-lg">
          Ask questions like you're talking to a senior engineer who
          understands your entire codebase.
        </p>
      </div>

      {/* Chat Window */}
      <div className="mx-auto max-w-4xl">
        <Card className="overflow-hidden border-border/80 bg-card/90 shadow-2xl backdrop-blur">

          {/* Header */}
          <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border/60 bg-muted/40 p-4">

            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>

              <div>
                <CardTitle className="text-sm font-semibold text-foreground">
                  AI Code Assistant
                </CardTitle>

                <div className="text-xs text-muted-foreground">
                  Active Session:{' '}
                  <span className="font-mono text-foreground">
                    expressjs/express
                  </span>
                </div>
              </div>
            </div>

            <Badge
              variant="purple"
              className="hidden text-[11px] sm:inline-flex"
            >
              RAG + AI Active
            </Badge>

          </CardHeader>

          {/* Messages */}
          <CardContent className="space-y-6 p-6">

            {/* User Message */}
            <div className="flex items-start justify-end gap-3">
              <div className="space-y-1.5 text-right">
                <div className="rounded-2xl rounded-tr-none bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm">
                  Where is JWT authentication and token verification implemented?
                </div>

                <div className="text-[10px] text-muted-foreground">
                  User • 10:42 AM
                </div>
              </div>

              <Avatar className="h-8 w-8 border border-primary/30 bg-primary/20">
                <AvatarFallback className="font-bold text-primary">
                  U
                </AvatarFallback>
              </Avatar>
            </div>

            {/* AI Response */}
            <div className="flex items-start gap-3">

              <Avatar className="h-8 w-8 shrink-0 border border-purple-500/30 bg-purple-500/15">
                <AvatarFallback className="font-bold text-purple-600 dark:text-purple-400">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>

              <div className="max-w-2xl space-y-3">

                {/* Answer */}
                <div className="space-y-2 rounded-2xl rounded-tl-none border border-border/80 bg-muted/40 px-4 py-3 text-sm text-foreground">

                  <p>
                    Authentication and token validation are encapsulated
                    within{' '}
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-purple-600 dark:text-purple-400">
                      verifyToken()
                    </code>{' '}
                    middleware inside{' '}
                    <span className="font-mono text-xs font-semibold">
                      src/middleware/auth.js
                    </span>.
                  </p>

                  <p className="text-xs text-muted-foreground">
                    It extracts the Bearer token from the{' '}
                    <code className="font-mono">
                      Authorization
                    </code>{' '}
                    header and validates it using{' '}
                    <code className="font-mono">
                      jwt.verify()
                    </code>.
                  </p>

                  {/* Code Block */}
                  <div className="mt-3 overflow-hidden rounded-xl border border-border/80 bg-background/90 font-mono text-xs">

                    {/* Code Header */}
                    <div className="flex h-8 items-center justify-between border-b border-border/60 bg-muted/60 px-3 text-[11px] text-muted-foreground">

                      <span className="flex items-center gap-1.5 font-semibold text-foreground">
                        <FileCode className="h-3.5 w-3.5 text-blue-500" />

                        src/middleware/auth.js
                        <span className="hidden sm:inline">
                          (Lines 18-27)
                        </span>
                      </span>

                      <button
                        type="button"
                        onClick={handleCopy}
                        className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                        aria-label="Copy code"
                      >
                        {copied ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}

                        {copied ? 'Copied' : 'Copy'}
                      </button>

                    </div>

                    {/* Code */}
                    <pre className="overflow-x-auto p-3 leading-relaxed text-foreground/90">
                      <code>{codeSnippet}</code>
                    </pre>

                  </div>
                </div>

                {/* Source References */}
                <div className="flex flex-wrap items-center gap-2">

                  <Badge
                    variant="outline"
                    className="cursor-pointer gap-1 text-[11px] transition-colors hover:border-primary"
                  >
                    <FileCode className="h-3 w-3 text-blue-500" />
                    src/middleware/auth.js
                  </Badge>

                  <Badge
                    variant="outline"
                    className="cursor-pointer gap-1 text-[11px] transition-colors hover:border-primary"
                  >
                    <FileCode className="h-3 w-3 text-blue-500" />
                    src/routes/authRoutes.js
                  </Badge>

                </div>

              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </section>
  );
}