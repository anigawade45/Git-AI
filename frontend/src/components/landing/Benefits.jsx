import React, { useState } from 'react';
import {
  Zap,
  Brain,
  Search,
  BookOpen,
  Bug,
  Network,
  CheckCircle2,
} from 'lucide-react';

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

const benefitsList = [
  {
    icon: Zap,
    title: '10x Faster Code Onboarding',
    description:
      'Stop spending days reading outdated documentation. Ask targeted questions and quickly understand unfamiliar or complex repositories.',
  },
  {
    icon: Brain,
    title: 'AI-Powered Context Accuracy',
    description:
      'Retrieve relevant repository context before generating answers so responses are grounded in the actual source code.',
  },
  {
    icon: Search,
    title: 'Intelligent Code Search',
    description:
      'Search by functionality and intent instead of guessing exact function names across hundreds of files.',
  },
  {
    icon: BookOpen,
    title: 'Automatic Documentation',
    description:
      'Generate useful architecture summaries, API explanations, README content, and inline documentation from your codebase.',
  },
  {
    icon: Bug,
    title: 'Code Quality Insights',
    description:
      'Identify potential bugs, edge cases, code smells, and maintainability issues with AI-assisted repository analysis.',
  },
  {
    icon: Network,
    title: 'Clear System Architecture',
    description:
      'Understand module relationships, component dependencies, and repository structure through automated architecture insights.',
  },
];

export default function Benefits() {
  const [openIndex, setOpenIndex] = useState(3);

  return (
    <section
      id="benefits"
      className="mx-auto max-w-7xl space-y-12 px-4 py-20 sm:px-6 lg:px-8"
    >
      {/* Section Header */}
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <h2 className="text-xs font-bold uppercase tracking-widest text-primary">
          Why Choose GitHub Assistant?
        </h2>

        <p className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Built for Developers Who Value Speed
        </p>

        <p className="text-base text-muted-foreground sm:text-lg">
          Transform raw code repositories into an interactive,
          AI-powered knowledge base.
        </p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2">

        {/* Primary Benefits */}
        <div className="space-y-4">
          {benefitsList.slice(0, 3).map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="
                  group
                  space-y-3
                  rounded-xl
                  border border-border/80
                  bg-card/60
                  p-5
                  backdrop-blur
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:border-primary/40
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex h-9 w-9 shrink-0 items-center justify-center
                      rounded-lg
                      border border-primary/20
                      bg-primary/10
                      text-primary
                      transition-colors
                      group-hover:bg-primary
                      group-hover:text-primary-foreground
                    "
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex items-center gap-2 text-lg font-bold text-foreground">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                    <span>{item.title}</span>
                  </div>
                </div>

                <p className="pl-12 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Additional Benefits */}
        <div className="space-y-4">
          <Accordion className="overflow-hidden rounded-xl border border-border/80 bg-card/60 backdrop-blur">
            {benefitsList.slice(3).map((item, idx) => {
              const actualIdx = idx + 3;
              const isOpen = openIndex === actualIdx;
              const Icon = item.icon;

              return (
                <AccordionItem
                  key={item.title}
                  className="border-border/60"
                >
                  <AccordionTrigger
                    isOpen={isOpen}
                    onToggle={() =>
                      setOpenIndex(isOpen ? -1 : actualIdx)
                    }
                    className="px-5 text-base font-semibold text-foreground hover:text-primary"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>

                      <span>{item.title}</span>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent
                    isOpen={isOpen}
                    className="px-5 pb-5 pl-16"
                  >
                    {item.description}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

      </div>
    </section>
  );
}