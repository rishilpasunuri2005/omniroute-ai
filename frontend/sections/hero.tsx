"use client";

import Link from "next/link";
import { ArrowRight, Cpu, GitBranch, Gauge, ShieldCheck, Zap } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Hero Content — 5 cols on lg */}
          <div className="lg:col-span-5">
            <h1 className="text-[var(--text-display-s)] lg:text-[var(--text-display)] text-[var(--color-ink)]">
              Intelligent AI routing for agentic pipelines
            </h1>

            <p className="mt-5 text-sm sm:text-base text-[var(--color-muted)] max-w-[46ch] leading-relaxed">
              Dynamically dispatch prompts across models for optimal latency, cost, and accuracy.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/app/chat"
                className="btn-primary active:opacity-85 focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
              >
                Launch console
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
              <a
                href="#workflows"
                className="btn-secondary active:opacity-85 focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
              >
                Inspect pipeline
              </a>
            </div>

            {/* Quick Specs telemetry */}
            <div className="mt-10 pt-6 border-t border-[var(--color-rule)] grid grid-cols-3 gap-4">
              <div>
                <span className="block text-[11px] text-[var(--color-muted)]">Latency avg</span>
                <span className="num-tabular text-sm font-medium text-[var(--color-ink)]">180 ms</span>
              </div>
              <div>
                <span className="block text-[11px] text-[var(--color-muted)]">Cost saving</span>
                <span className="num-tabular text-sm font-medium text-[var(--color-ink)]">67%</span>
              </div>
              <div>
                <span className="block text-[11px] text-[var(--color-muted)]">Daily budget</span>
                <span className="num-tabular text-sm font-medium text-[var(--color-ink)]">100K tok</span>
              </div>
            </div>
          </div>

          {/* Hero Signature — 7 cols on lg: Architectural Telemetry Plate */}
          <div className="lg:col-span-7">
            <div className="surface-plate p-5 sm:p-6">
              {/* Header bar */}
              <div className="flex items-center justify-between pb-4 border-b border-[var(--color-rule)]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[var(--color-accent)]" />
                  <span className="text-xs font-medium text-[var(--color-ink)] tracking-tight">
                    Pipeline Telemetry · Active Route
                  </span>
                </div>
                <span className="text-[11px] text-[var(--color-muted)] num-tabular">
                  port 8000 · status 200
                </span>
              </div>

              {/* Sample Prompt Stream */}
              <div className="mt-4 p-3.5 bg-[var(--color-paper-3)] border border-[var(--color-rule-2)]">
                <span className="text-[11px] text-[var(--color-muted)] block mb-1">
                  Input stream
                </span>
                <p className="text-xs text-[var(--color-ink)] line-clamp-2">
                  &quot;Analyze memory pressure in async event loop and suggest fixes&quot;
                </p>
              </div>

              {/* Routing Analysis Matrix */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-2.5 bg-[var(--color-paper)] border border-[var(--color-rule)]">
                  <span className="text-[10px] text-[var(--color-muted)] block">Classification</span>
                  <span className="text-xs font-medium text-[var(--color-ink)] mt-0.5 block">Debugging</span>
                </div>
                <div className="p-2.5 bg-[var(--color-paper)] border border-[var(--color-rule)]">
                  <span className="text-[10px] text-[var(--color-muted)] block">Complexity</span>
                  <span className="text-xs font-medium text-[var(--color-ink)] mt-0.5 block">Medium</span>
                </div>
                <div className="p-2.5 bg-[var(--color-paper)] border border-[var(--color-rule)]">
                  <span className="text-[10px] text-[var(--color-muted)] block">Confidence</span>
                  <span className="text-xs font-medium text-[var(--color-accent)] num-tabular mt-0.5 block">0.88</span>
                </div>
                <div className="p-2.5 bg-[var(--color-paper)] border border-[var(--color-rule)]">
                  <span className="text-[10px] text-[var(--color-muted)] block">Validation</span>
                  <span className="text-xs font-medium text-[var(--color-success)] mt-0.5 block">Passed</span>
                </div>
              </div>

              {/* Model Decision Route Plate */}
              <div className="mt-4 p-4 bg-[var(--color-paper)] border border-[var(--color-rule)]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--color-muted)]">Selected Provider</span>
                  <span className="text-[var(--color-ink)] font-medium">OpenRouter · deepseek-coder</span>
                </div>
                <div className="meter-track mt-2">
                  <div className="meter-fill w-3/4" />
                </div>
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-[var(--color-muted)] num-tabular">
                  <span>Fallback: Groq / llama-3.3-70b</span>
                  <span>142 ms latency · $0.0004 est</span>
                </div>
              </div>

              {/* Action Link Footer */}
              <div className="mt-4 pt-3 flex items-center justify-between text-xs border-t border-[var(--color-rule)] text-[var(--color-muted)]">
                <span>Deterministic token count: 184 tok</span>
                <Link
                  href="/app/chat"
                  className="text-[var(--color-accent)] hover:underline active:opacity-85 focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] inline-flex items-center gap-1"
                >
                  Test prompt in sandbox
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
