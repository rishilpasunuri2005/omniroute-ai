"use client";

import {
  GitBranch,
  Brain,
  DollarSign,
  BarChart3,
  Layers3,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: GitBranch,
    title: "Intelligent routing",
    description:
      "Classify task complexity and dispatch to the optimal model for fast, accurate, and cost-efficient execution.",
  },
  {
    icon: Brain,
    title: "Multi-agent workflows",
    description:
      "Chain specialized agents together for planning, execution, and validation in a single graph pipeline.",
  },
  {
    icon: DollarSign,
    title: "Cost optimization",
    description:
      "Route simple requests to lightweight models and reserve expensive reasoning for high-complexity problems.",
  },
  {
    icon: BarChart3,
    title: "Real-time analytics",
    description:
      "Monitor token usage, latency distribution, routing choices, and provider availability in live dashboards.",
  },
  {
    icon: Layers3,
    title: "Open model support",
    description:
      "Connect any upstream provider: Groq, OpenRouter, NVIDIA NIM, OpenAI, or local instances via Ollama.",
  },
  {
    icon: ShieldCheck,
    title: "Hardened security",
    description:
      "Built-in prompt sanitization, response validation, per-user rate limits, and JWT-authenticated endpoints.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-28 border-t border-[var(--color-rule)]">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="max-w-2xl">
          <span className="text-xs text-[var(--color-muted)] block mb-2">
            Architecture capabilities
          </span>
          <h2 className="text-[var(--text-section)] text-[var(--color-ink)]">
            Everything needed for model orchestration
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[var(--color-muted)] leading-relaxed">
            A unified runtime for classifying, dispatching, and monitoring multi-model agentic workloads.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="mt-12 grid gap-px bg-[var(--color-rule)] sm:grid-cols-2 lg:grid-cols-3 border border-[var(--color-rule)]">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-[var(--color-paper-2)] p-6 sm:p-8 flex flex-col justify-between feature-card"
              >
                <div>
                  <div className="flex h-9 w-9 items-center justify-center border border-[var(--color-rule)] bg-[var(--color-paper)] text-[var(--color-accent)]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="mt-6 text-base font-medium text-[var(--color-ink)]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
