import React from 'react';
import {
  MessageSquare,
  Search,
  Brain,
  Bug,
  Network,
  FileText,
} from 'lucide-react';

import FeatureCard from './FeatureCard';

const featureList = [
  {
    icon: MessageSquare,
    title: 'AI Code Chat',
    description:
      'Ask natural-language questions about functions, files, or overall architecture and receive accurate, context-aware answers.',
    badge: 'Conversational',
  },
  {
    icon: Search,
    title: 'Semantic Code Search',
    description:
      'Find relevant functions, types, and logic based on meaning and intent rather than relying only on exact keyword matching.',
    badge: 'Semantic Search',
  },
  {
    icon: Brain,
    title: 'Deep Code Explanation',
    description:
      'Understand complex algorithms, unfamiliar patterns, and multi-file logic through clear, step-by-step AI explanations.',
    badge: 'Context Aware',
  },
  {
    icon: Bug,
    title: 'Code Quality Analysis',
    description:
      'Identify potential bugs, edge cases, code smells, and maintainability issues across your repository.',
    badge: 'AI Analysis',
  },
  {
    icon: Network,
    title: 'Architecture Mapping',
    description:
      'Explore component relationships, module dependencies, and code structure to understand the architecture faster.',
    badge: 'Graph Analysis',
  },
  {
    icon: FileText,
    title: 'Documentation Assistant',
    description:
      'Generate useful documentation including README content, API explanations, inline documentation, and architecture summaries.',
    badge: 'Auto Docs',
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="mx-auto max-w-7xl space-y-12 px-4 py-20 sm:px-6 lg:px-8"
    >
      {/* Section Header */}
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <h2 className="text-xs font-bold uppercase tracking-widest text-primary">
          Capabilities
        </h2>

        <p className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Everything You Need to Master Any Codebase
        </p>

        <p className="text-base text-muted-foreground sm:text-lg">
          Built for developers, team leads, students, and open-source
          contributors who need to understand complex repositories faster.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {featureList.map((feature) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            badge={feature.badge}
          />
        ))}
      </div>
    </section>
  );
}