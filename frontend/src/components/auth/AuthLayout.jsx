import React from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Sparkles,
  MessageSquareCode,
  Search,
  ShieldCheck,
} from 'lucide-react';

import ThemeToggle from '@/components/common/ThemeToggle';

export default function AuthLayout({ children }) {
  return (
    <div className="relative flex min-h-dvh w-full flex-col justify-between overflow-hidden bg-background text-foreground selection:bg-primary/20 selection:text-primary transition-colors duration-200">

      {/* --------------------------------
          Background Glow
      -------------------------------- */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/4 top-1/3 -z-0 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[130px]"
      />

      {/* --------------------------------
          Header
      -------------------------------- */}
      <header className="relative z-10 mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Brand */}
        <Link
          to="/"
          aria-label="GitHub Knowledge Assistant home"
          className="group flex items-center gap-2.5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
            <Code2 className="h-5 w-5" />
          </div>

          <span className="flex items-center gap-1.5 text-lg font-semibold tracking-tight text-foreground">
            GitHub Assistant

            <span className="rounded border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              AI
            </span>
          </span>
        </Link>

        {/* Theme */}
        <ThemeToggle />
      </header>

      {/* --------------------------------
          Main Content
      -------------------------------- */}
      <main className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">

        <div className="grid w-full max-w-5xl grid-cols-1 items-center gap-8 lg:grid-cols-12">

          {/* --------------------------------
              Brand / Promotional Panel
          -------------------------------- */}
          <section
            aria-labelledby="auth-hero-title"
            className="hidden flex-col justify-center space-y-8 pr-6 lg:col-span-6 lg:flex"
          >

            {/* Badge */}
            <div className="inline-flex w-fit items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />

                <span>
                  Next-Gen Developer Assistant
                </span>
              </span>
            </div>

            {/* Hero */}
            <div className="space-y-4">
              <h1
                id="auth-hero-title"
                className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl"
              >
                Understand Any Codebase with{' '}

                <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent dark:from-purple-400 dark:via-pink-400 dark:to-indigo-300">
                  AI Context
                </span>
              </h1>

              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                Connect your repositories, ask natural-language
                questions, and get precise code explanations with
                exact file and line citations.
              </p>
            </div>

            {/* --------------------------------
                Features
            -------------------------------- */}
            <div className="space-y-4 text-sm font-medium">

              {/* AI Chat */}
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 p-3 backdrop-blur">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400">
                  <MessageSquareCode className="h-4 w-4" />
                </div>

                <span>
                  AI Code Chat with Source Citations
                </span>
              </div>

              {/* Vector Search */}
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 p-3 backdrop-blur">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
                  <Search className="h-4 w-4" />
                </div>

                <span>
                  Semantic Repository Vector Search
                </span>
              </div>

              {/* Security */}
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 p-3 backdrop-blur">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>

                <span>
                  Automated Quality &amp; Security Audits
                </span>
              </div>

            </div>
          </section>

          {/* --------------------------------
              Authentication Content
          -------------------------------- */}
          <section
            aria-label="Authentication"
            className="w-full max-w-md lg:col-span-6 lg:mx-auto"
          >
            {children}
          </section>

        </div>
      </main>

      {/* --------------------------------
          Footer
      -------------------------------- */}
      <footer className="relative z-10 px-4 py-4 text-center text-xs text-muted-foreground">
        © 2026 GitHub Knowledge Assistant. All rights reserved.
      </footer>
    </div>
  );
}
