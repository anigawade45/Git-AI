import React from 'react';
import { Code2, Heart } from 'lucide-react';
import { Github, Twitter, Linkedin } from '@/components/common/Icons';
import { Separator } from '@/components/ui/separator';

const productLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'AI Chat Demo', href: '#chat-demo' },
  { label: 'Repository Analysis', href: '#analysis' },
];

const resourceLinks = [
  {
    label: 'GitHub API Docs',
    href: 'https://docs.github.com',
  },
  {
    label: 'LangChain JS',
    href: 'https://js.langchain.com',
  },
  {
    label: 'Pinecone',
    href: 'https://www.pinecone.io',
  },
  {
    label: 'OpenAI API',
    href: 'https://platform.openai.com/docs',
  },
];

const socialLinks = [
  {
    label: 'GitHub',
    href: 'https://github.com',
    icon: Github,
  },
  {
    label: 'Twitter',
    href: 'https://twitter.com',
    icon: Twitter,
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: Linkedin,
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/60 text-card-foreground backdrop-blur">
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-14 sm:px-6 lg:px-8">

        {/* Footer Grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">

          {/* Brand */}
          <div className="space-y-4">
            <a
              href="#"
              className="flex items-center gap-2.5"
              aria-label="GitHub Assistant Home"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <Code2 className="h-4 w-4" />
              </div>

              <span className="text-base font-semibold tracking-tight text-foreground">
                GitHub Assistant
              </span>
            </a>

            <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
              AI-powered repository analysis, semantic code search, and
              contextual code understanding.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Product
            </h4>

            <ul className="space-y-2 text-xs text-muted-foreground">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Resources
            </h4>

            <ul className="space-y-2 text-xs text-muted-foreground">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Connect
            </h4>

            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;

                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    title={social.label}
                    className="
                      rounded-lg
                      bg-muted/60
                      p-2
                      text-muted-foreground
                      transition-all
                      hover:bg-accent
                      hover:text-foreground
                    "
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

        </div>

        <Separator className="opacity-60" />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 text-center text-xs text-muted-foreground sm:flex-row sm:text-left">

          <p>
            © 2026 GitHub Knowledge Assistant. All rights reserved.
          </p>

          <p className="flex items-center gap-1">
            Built with
            <Heart
              aria-hidden="true"
              className="h-3.5 w-3.5 fill-red-500 text-red-500"
            />
            using React 19, Tailwind CSS v4 & shadcn/ui
          </p>

        </div>

      </div>
    </footer>
  );
}