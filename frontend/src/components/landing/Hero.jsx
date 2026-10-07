import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Sparkles, Folder, FileCode, CheckCircle2, Bot, ChevronRight, ChevronDown, ExternalLink, Code2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import HeroInput from './HeroInput';

export default function Hero({ onAnalyze, isAnalyzing = false }) {
  const heroRef = useRef(null);
  const badgeRef = useRef(null);
  const headingRef = useRef(null);
  const subtitleRef = useRef(null);
  const inputRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Animate Top Badge
      if (badgeRef.current) {
        tl.fromTo(
          badgeRef.current,
          { y: -25, opacity: 0, scale: 0.9 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6 }
        );
      }

      // Animate Headline Words explicitly scoped to heroRef
      const words = heroRef.current?.querySelectorAll('.gsap-word');
      if (words && words.length > 0) {
        tl.fromTo(
          words,
          {
            y: 45,
            opacity: 0,
            rotateX: -35,
            filter: 'blur(8px)',
            scale: 0.96,
          },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            filter: 'blur(0px)',
            scale: 1,
            duration: 0.85,
            stagger: 0.09,
          },
          '-=0.3'
        );
      }

      // Animate Subtitle
      if (subtitleRef.current) {
        tl.fromTo(
          subtitleRef.current,
          { y: 25, opacity: 0, filter: 'blur(5px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.7 },
          '-=0.45'
        );
      }

      // Animate Hero Input Box
      if (inputRef.current) {
        tl.fromTo(
          inputRef.current,
          { y: 25, opacity: 0, scale: 0.96 },
          { y: 0, opacity: 1, scale: 1, duration: 0.7 },
          '-=0.4'
        );
      }

      // Animate Hero Preview Box
      if (previewRef.current) {
        tl.fromTo(
          previewRef.current,
          { y: 40, opacity: 0, scale: 0.98 },
          { y: 0, opacity: 1, scale: 1, duration: 0.8 },
          '-=0.4'
        );
      }

      // Continuous shimmer loop scoped to heroRef
      const shimmerElems = heroRef.current?.querySelectorAll('.gsap-shimmer');
      if (shimmerElems && shimmerElems.length > 0) {
        gsap.to(shimmerElems, {
          backgroundPosition: '200% center',
          duration: 8,
          repeat: -1,
          ease: 'none',
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Glow background accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-primary/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center space-y-6">

        {/* Top Announcement Badge */}
        <div ref={badgeRef} className="inline-flex items-center justify-center">
          <Badge variant="outline" className="py-1 px-3.5 text-xs sm:text-sm font-medium rounded-full bg-card/80 border-primary/20 backdrop-blur shadow-sm hover:border-primary/40 transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-primary mr-1.5" />
            <span>AI-Powered GitHub Knowledge Assistant</span>
            <span className="ml-1.5 text-xs text-primary font-bold font-mono">v2.0</span>
          </Badge>
        </div>

        {/* Main Heading */}
        <h1
          ref={headingRef}
          className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.2] text-center [text-wrap:balance] [perspective:1000px]"
        >
          <span className="gsap-word inline-block">Understand</span>{' '}
          <span className="gsap-word inline-block">Any</span>{' '}
          <span className="gsap-word gsap-shimmer inline-block bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-500 dark:from-purple-400 dark:via-pink-400 dark:to-cyan-300 bg-clip-text text-transparent bg-[length:200%_auto]">
            GitHub Repository
          </span>{' '}
          <span className="gsap-word inline-block">with</span>{' '}
          <span className="gsap-word inline-block bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-300 dark:to-blue-400 bg-clip-text text-transparent">
            AI
          </span>
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto font-normal leading-relaxed text-center [text-wrap:balance]"
        >
          Import a repository, ask natural-language questions about the codebase, and get instant contextual answers with source code line citations.
        </p>

        {/* URL Input Form */}
        <div ref={inputRef} className="pt-2 w-full flex justify-center">
          <HeroInput onAnalyze={onAnalyze} isAnalyzing={isAnalyzing} />
        </div>

        {/* Hero Visual / Redesigned IDE Workspace Mock Preview Box */}
        <div ref={previewRef} className="pt-8 max-w-5xl mx-auto w-full">
          <div className="relative rounded-2xl border border-border/80 bg-card/95 shadow-2xl overflow-hidden backdrop-blur-xl ring-1 ring-white/10 dark:ring-zinc-800">
            
            {/* IDE Window Title Bar */}
            <div className="h-11 bg-muted/80 px-4 border-b border-border/60 flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/90 shadow-sm" />
                <div className="w-3 h-3 rounded-full bg-amber-500/90 shadow-sm" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/90 shadow-sm" />
              </div>

              {/* Active Repository Breadcrumb Pill */}
              <div className="text-xs font-mono text-muted-foreground flex items-center gap-2 bg-background/90 px-3.5 py-1 rounded-lg border border-border/60 shadow-inner">
                <Folder className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="text-foreground font-semibold">github.com/facebook/react</span>
                <span className="text-muted-foreground/60">/</span>
                <span className="text-primary font-medium">main</span>
              </div>

              {/* Indexed Status Badge */}
              <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-mono font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden sm:inline">124 Files Indexed</span>
              </div>
            </div>

            {/* Mock IDE Workspace Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-0 text-left min-h-[360px]">

              {/* Left File Tree Explorer Sidebar */}
              <div className="md:col-span-4 border-r border-border/60 bg-muted/20 p-4 space-y-2 text-xs font-mono hidden md:block select-none">
                <div className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mb-3 flex items-center justify-between">
                  <span>Explorer</span>
                  <span className="text-[10px] text-muted-foreground/60">REACT DB</span>
                </div>

                <div className="space-y-1">
                  {/* Folder: packages */}
                  <div className="flex items-center gap-1.5 text-foreground font-medium py-1">
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    <Folder className="w-4 h-4 text-blue-400" />
                    <span>packages</span>
                  </div>

                  {/* Folder: react-dom */}
                  <div className="pl-4 flex items-center gap-1.5 text-foreground font-medium py-1">
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    <Folder className="w-3.5 h-3.5 text-blue-400" />
                    <span>react-dom</span>
                  </div>

                  {/* Active File: ReactDOMRoot.js */}
                  <div className="pl-8 flex items-center justify-between gap-2 text-primary font-bold bg-primary/15 py-1.5 px-2.5 rounded-lg border border-primary/20 shadow-sm">
                    <div className="flex items-center gap-2 truncate">
                      <FileCode className="w-4 h-4 text-primary shrink-0" />
                      <span className="truncate">ReactDOMRoot.js</span>
                    </div>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  </div>

                  {/* Folder: scheduler */}
                  <div className="pl-4 flex items-center gap-1.5 text-muted-foreground py-1">
                    <ChevronRight className="w-3.5 h-3.5" />
                    <Folder className="w-3.5 h-3.5 text-blue-400/80" />
                    <span>scheduler</span>
                  </div>

                  {/* Folder: scripts */}
                  <div className="flex items-center gap-1.5 text-muted-foreground py-1">
                    <ChevronRight className="w-3.5 h-3.5" />
                    <Folder className="w-4 h-4 text-blue-400/80" />
                    <span>scripts</span>
                  </div>

                  {/* File: package.json */}
                  <div className="flex items-center gap-1.5 text-muted-foreground/80 py-1 pl-5">
                    <FileCode className="w-3.5 h-3.5 text-amber-400" />
                    <span>package.json</span>
                  </div>
                </div>
              </div>

              {/* Right AI Chat Workspace */}
              <div className="md:col-span-8 p-5 sm:p-6 flex flex-col justify-between space-y-4 bg-card/40">

                {/* User Prompt Bubble */}
                <div className="flex gap-3 justify-end items-end">
                  <div className="bg-primary text-primary-foreground text-xs sm:text-sm px-4 py-2.5 rounded-2xl rounded-tr-none shadow-md max-w-md font-medium leading-relaxed">
                    Where is concurrent rendering initialized in ReactDOM?
                  </div>
                </div>

                {/* AI Assistant Response Card */}
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>

                  <div className="bg-card border border-border/80 text-xs sm:text-sm p-4 rounded-2xl rounded-tl-none space-y-3 max-w-xl shadow-lg">
                    <p className="text-foreground leading-relaxed">
                      Concurrent rendering is initialized via <code className="bg-muted px-2 py-0.5 rounded-md text-xs font-mono font-bold text-primary border border-border/40">createRoot()</code> inside <span className="font-mono text-xs font-bold text-foreground">ReactDOMRoot.js</span>.
                    </p>

                    {/* Source Code Citation Box */}
                    <div className="rounded-xl border border-border/80 bg-muted/40 font-mono text-xs overflow-hidden shadow-inner">
                      
                      {/* Citation Header */}
                      <div className="px-3.5 py-2 bg-muted/80 border-b border-border/60 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 font-bold text-foreground truncate">
                          <FileCode className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="truncate">ReactDOMRoot.js:L34-L42</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold uppercase text-[9px] border border-primary/20 shrink-0">
                          Source Reference
                        </span>
                      </div>

                      {/* Code Snippet Lines */}
                      <div className="p-3 space-y-1 text-[11px] leading-relaxed overflow-x-auto text-foreground/90">
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground/60 w-4 text-right shrink-0 select-none">34</span>
                          <span className="text-emerald-500 font-bold">+ export function createRoot(container, options) &#123;</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground/60 w-4 text-right shrink-0 select-none">35</span>
                          <span className="text-emerald-500 font-bold">+   return new ReactDOMRoot(container, options);</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground/60 w-4 text-right shrink-0 select-none">36</span>
                          <span className="text-muted-foreground">&#125;</span>
                        </div>
                      </div>

                    </div>

                    {/* Source Link Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/60 border border-border text-[11px] font-mono text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                        <ExternalLink className="w-3 h-3 text-primary" />
                        <span>packages/react-dom/src/client/ReactDOMRoot.js</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
