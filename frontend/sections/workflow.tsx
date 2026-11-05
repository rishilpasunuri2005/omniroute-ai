"use client";

import { Zap, GitBranch, Bot, ShieldCheck, CheckCircle2 } from "lucide-react";

const steps = [
  {
    stage: "01",
    icon: Zap,
    title: "Prompt intake",
    description: "Accept user prompts and measure initial token length.",
  },
  {
    stage: "02",
    icon: GitBranch,
    title: "Router classifier",
    description: "Classifies complexity, task type, and confidence threshold.",
  },
  {
    stage: "03",
    icon: Bot,
    title: "Model dispatch",
    description: "Routes to specialized provider with automatic fallback.",
  },
  {
    stage: "04",
    icon: ShieldCheck,
    title: "Validation pass",
    description: "Verifies response quality, completeness, and safety.",
  },
  {
    stage: "05",
    icon: CheckCircle2,
    title: "Verified output",
    description: "Streams response and persists telemetry to session log.",
  },
];

export function WorkflowSection() {
  return (
    <section id="workflows" className="py-20 lg:py-28 border-t border-[var(--color-rule)]">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="max-w-2xl">
          <span className="text-xs text-[var(--color-muted)] block mb-2">
            Execution pipeline
          </span>
          <h2 className="text-[var(--text-section)] text-[var(--color-ink)]">
            How requests move through the graph
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[var(--color-muted)] leading-relaxed">
            Every prompt flows through an orchestrated pipeline of classification, dispatch, execution, and validation.
          </p>
        </div>

        {/* Linear Pipeline Stages */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="surface-plate p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--color-rule)]">
                    <span className="num-tabular text-xs font-mono text-[var(--color-accent)]">
                      {step.stage}
                    </span>
                    <Icon className="h-4 w-4 text-[var(--color-muted)]" />
                  </div>
                  <h3 className="mt-4 text-sm font-medium text-[var(--color-ink)]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs text-[var(--color-muted)] leading-relaxed">
                    {step.description}
                  </p>
                </div>
                <div className="meter-track mt-6">
                  <div
                    className="meter-fill"
                    style={{ width: `${((index + 1) / steps.length) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
