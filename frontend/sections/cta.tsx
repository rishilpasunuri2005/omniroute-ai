"use client";

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-20 lg:py-28 border-t border-[var(--color-rule)]">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-8 lg:px-12">
        <div className="surface-plate p-8 sm:p-12 lg:p-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-xl">
            <span className="text-xs text-[var(--color-muted)] block mb-2">
              Ready to deploy
            </span>
            <h2 className="text-[var(--text-section)] text-[var(--color-ink)]">
              Build with multi-model routing
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[var(--color-muted)] leading-relaxed">
              Start dispatching tasks across specialized models today. Free local sandbox included.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/app/chat"
              className="btn-primary active:opacity-85 focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
            >
              Launch console
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
            <a
              href="https://github.com/rishilpasunuri2005/omniroute-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary active:opacity-85 focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
            >
              <BookOpen className="h-3.5 w-3.5 mr-1 text-[var(--color-muted)]" />
              Documentation
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
