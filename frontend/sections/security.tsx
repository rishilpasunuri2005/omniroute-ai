"use client";

import { Lock, ShieldCheck, KeyRound, Eye, Fingerprint, ServerCrash } from "lucide-react";

const securityFeatures = [
  {
    icon: ShieldCheck,
    title: "Input sanitization",
    description: "Every incoming prompt is sanitized before reaching model providers to mitigate injection risks.",
  },
  {
    icon: Eye,
    title: "Output validation",
    description: "Model responses are tested for syntax validity and schema conformance before release.",
  },
  {
    icon: KeyRound,
    title: "JWT authentication",
    description: "Clerk-verified RS256 JWT tokens secure all API endpoints with per-user tenant context.",
  },
  {
    icon: ServerCrash,
    title: "Rate limiting",
    description: "SlowAPI throttles requests by verified identity and IP address to prevent denial of service.",
  },
  {
    icon: Lock,
    title: "Request boundaries",
    description: "Streaming size limits and Content-Security-Policy headers isolate backend worker resources.",
  },
  {
    icon: Fingerprint,
    title: "Token budgets",
    description: "Per-user daily quotas cap third-party API spend and stop runaway model execution.",
  },
];

export function SecuritySection() {
  return (
    <section id="security" className="py-20 lg:py-28 border-t border-[var(--color-rule)]">
      <div className="mx-auto max-w-[var(--container)] px-4 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="max-w-2xl">
          <span className="text-xs text-[var(--color-muted)] block mb-2">
            Defense in depth
          </span>
          <h2 className="text-[var(--text-section)] text-[var(--color-ink)]">
            Verified boundary controls
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[var(--color-muted)] leading-relaxed">
            Every layer of the routing and execution pipeline is hardened against cross-tenant leaks and quota exhaustion.
          </p>
        </div>

        {/* Security Feature Grid */}
        <div className="mt-12 grid gap-px bg-[var(--color-rule)] sm:grid-cols-2 lg:grid-cols-3 border border-[var(--color-rule)]">
          {securityFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-[var(--color-paper-2)] p-6 sm:p-8 flex flex-col justify-between feature-card"
              >
                <div>
                  <div className="flex h-9 w-9 items-center justify-center border border-[var(--color-rule)] bg-[var(--color-paper)] text-[var(--color-ink)]">
                    <Icon className="h-4 w-4 text-[var(--color-accent)]" />
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
