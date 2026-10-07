import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

import { Github } from '@/components/common/Icons';
import { Button } from '@/components/ui/button';

export default function CTA() {
  return (
    <section className="relative overflow-hidden py-20">

      {/* Background Glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          -z-10
          h-[250px]
          w-[500px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-primary/15
          blur-[100px]
        "
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div
          className="
            relative
            space-y-8
            rounded-3xl
            border border-primary/20
            bg-gradient-to-b
            from-card
            to-background
            p-10
            text-center
            shadow-2xl
            backdrop-blur
            sm:p-16
          "
        >

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Instant Repository Onboarding</span>
          </div>

          {/* Heading */}
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
            Ready to Understand Your Codebase with AI?
          </h2>

          {/* Description */}
          <p className="mx-auto max-w-xl text-base text-muted-foreground sm:text-lg">
            Paste a public GitHub repository link and start exploring your
            codebase with AI-powered answers and source-code references.
          </p>

          {/* Actions */}
          <div className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row">

            <Link to="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="
                  h-12
                  w-full
                  gap-2
                  rounded-xl
                  px-8
                  text-base
                  font-medium
                  shadow-lg
                  transition-all
                  hover:shadow-xl
                  sm:w-auto
                "
              >
                <Github className="h-5 w-5" />

                <span>Get Started Free</span>

                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>

            <Link to="/docs" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="
                  h-12
                  w-full
                  rounded-xl
                  px-8
                  text-base
                  font-medium
                  sm:w-auto
                "
              >
                View Documentation
              </Button>
            </Link>

          </div>

          {/* Trust Message */}
          <p className="pt-4 text-xs text-muted-foreground">
            Free to get started • Analyze public GitHub repositories
          </p>

        </div>
      </div>
    </section>
  );
}