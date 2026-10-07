import React from 'react';
import {
  Star,
  GitFork,
  FileCode,
  Layers,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const repository = {
  name: 'github.com/user/ecommerce-app',
  description: 'Full-stack React & Node.js application',
  language: 'JavaScript',
  stars: '1.2k',
  forks: '340',
  status: 'Analyzed',
};

const stats = [
  {
    value: '124',
    label: 'Files',
    icon: FileCode,
    iconClass: 'text-blue-500',
  },
  {
    value: '387',
    label: 'Functions',
    icon: Cpu,
    iconClass: 'text-purple-500',
  },
  {
    value: '76',
    label: 'Components',
    icon: Layers,
    iconClass: 'text-emerald-500',
  },
];

const metrics = [
  {
    label: 'Documentation Coverage',
    score: 82,
    color: 'bg-emerald-500',
  },
  {
    label: 'Code Quality & Maintainability',
    score: 74,
    color: 'bg-blue-500',
  },
  {
    label: 'Security & Risk Assessment',
    score: 91,
    color: 'bg-purple-500',
  },
];

export default function AnalysisDemo() {
  return (
    <section
      id="analysis"
      className="border-y border-border/60 bg-card/20 py-20"
    >
      <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary">
            Automated Insights
          </h2>

          <p className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Instant Repository Analysis
          </p>

          <p className="text-base text-muted-foreground sm:text-lg">
            Get high-level architecture statistics, documentation
            completeness metrics, and repository health insights immediately
            after importing.
          </p>
        </div>

        {/* Analysis Card */}
        <div className="mx-auto max-w-4xl">
          <Card className="border-border/80 bg-card/90 shadow-xl backdrop-blur">

            {/* Repository Header */}
            <CardHeader className="flex flex-col gap-4 border-b border-border/60 p-6 sm:flex-row sm:items-center sm:justify-between">

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="break-all font-mono text-xl font-bold text-foreground">
                    {repository.name}
                  </CardTitle>

                  <Badge variant="success">
                    {repository.status}
                  </Badge>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {repository.description}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">

                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  {repository.stars}
                </span>

                <span className="flex items-center gap-1">
                  <GitFork className="h-4 w-4" />
                  {repository.forks}
                </span>

                <Badge variant="outline">
                  {repository.language}
                </Badge>

              </div>
            </CardHeader>

            <CardContent className="space-y-8 p-6">

              {/* Repository Statistics */}
              <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-3">
                {stats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.label}
                      className="rounded-xl border border-border/60 bg-muted/40 p-4"
                    >
                      <div className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </div>

                      <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <Icon className={`h-3.5 w-3.5 ${stat.iconClass}`} />
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AI Health Metrics */}
              <div className="space-y-5">

                <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                  <span>AI Quality & Health Ratings</span>

                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                </div>

                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="space-y-2"
                  >
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-foreground">
                        {metric.label}
                      </span>

                      <span className="font-mono text-muted-foreground">
                        {metric.score}%
                      </span>
                    </div>

                    <Progress
                      value={metric.score}
                      barClassName={metric.color}
                    />
                  </div>
                ))}
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
