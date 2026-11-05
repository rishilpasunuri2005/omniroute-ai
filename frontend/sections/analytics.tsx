"use client";

import { Activity, Clock3, Coins, Sigma, TrendingDown, Zap } from "lucide-react";

const metrics = [
  { icon: Coins, label: "Cost savings", value: "67%", unit: "reduction", description: "Blended reduction across simple prompts" },
  { icon: Clock3, label: "Average latency", value: "180", unit: "ms", description: "End-to-end response time across fast tier" },
  { icon: Sigma, label: "Token efficiency", value: "3.2", unit: "×", description: "Tokens generated per unit dollar spend" },
  { icon: Activity, label: "Routing precision", value: "98.5", unit: "%", description: "Accurate complexity classification rate" },
  { icon: TrendingDown, label: "Failure rate", value: "0.3", unit: "%", description: "Fallback route interception rate" },
  { icon: Zap, label: "Throughput cap", value: "1.2", unit: "k/s", description: "Peak concurrency in loopback benchmark" },
];

export function AnalyticsSection() {
  return (
    <section id="models" className="py-20 lg:py-28 border-t border-[var(--color-rule)]">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="max-w-2xl">
          <span className="text-xs text-[var(--color-muted)] block mb-2">
            Performance telemetry
          </span>
          <h2 className="text-[var(--text-section)] text-[var(--color-ink)]">
            Observed benchmark indicators
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[var(--color-muted)] leading-relaxed">
            Measurable latency, efficiency, and cost differentials across multi-model dispatch tiers.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="mt-12 grid gap-px bg-[var(--color-rule)] sm:grid-cols-2 lg:grid-cols-3 border border-[var(--color-rule)]">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="bg-[var(--color-paper-2)] p-6 sm:p-8 flex flex-col justify-between feature-card"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--color-muted)]">{metric.label}</span>
                  <Icon className="h-4 w-4 text-[var(--color-muted)]" />
                </div>
                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-light text-[var(--color-ink)] num-tabular tracking-tight">
                    {metric.value}
                  </span>
                  <span className="text-xs text-[var(--color-muted)] font-normal">
                    {metric.unit}
                  </span>
                </div>
                <p className="mt-3 text-xs text-[var(--color-muted)] leading-relaxed">
                  {metric.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
