import React from 'react';
import {
  GitBranch,
  Database,
  MessageSquareCode,
  CheckCircle,
} from 'lucide-react';

import StepCard from './StepCard';

const steps = [
  {
    number: '01',
    icon: GitBranch,
    title: 'Import Repository',
    description:
      'Paste a public GitHub repository URL to start importing and analyzing the codebase.',
  },
  {
    number: '02',
    icon: Database,
    title: 'Index & Understand Code',
    description:
      'The system processes repository files and prepares relevant code context for AI-powered retrieval.',
  },
  {
    number: '03',
    icon: MessageSquareCode,
    title: 'Ask Questions',
    description:
      'Ask questions in plain English, request code explanations, or explore how different parts of the codebase work.',
  },
  {
    number: '04',
    icon: CheckCircle,
    title: 'Get AI Answers',
    description:
      'Receive contextual answers with file names, line references, and relevant code snippets.',
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-y border-border/60 bg-card/30 py-20"
    >
      <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary">
            Workflow
          </h2>

          <p className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            How GitHub Assistant Works
          </p>

          <p className="text-base text-muted-foreground sm:text-lg">
            Four simple steps from repository URL to deep AI-powered code
            understanding.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <StepCard
              key={step.number}
              number={step.number}
              icon={step.icon}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
