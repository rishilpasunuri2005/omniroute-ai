"use client";

import { motion } from "framer-motion";
import { Lock, ShieldCheck, KeyRound, Eye, Fingerprint, ServerCrash } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/animations";

const securityFeatures = [
  {
    icon: ShieldCheck,
    title: "Input Sanitization",
    description: "Every prompt is sanitized before reaching any AI model to prevent injection attacks.",
  },
  {
    icon: Eye,
    title: "Output Validation",
    description: "Responses are validated for quality, completeness, and safety before delivery.",
  },
  {
    icon: KeyRound,
    title: "JWT Authentication",
    description: "Clerk-powered JWT tokens secure every API request with per-user identity.",
  },
  {
    icon: ServerCrash,
    title: "Rate Limiting",
    description: "Per-user and per-IP rate limits prevent abuse and ensure fair usage.",
  },
  {
    icon: Lock,
    title: "Encrypted Transit",
    description: "All data is encrypted in transit with TLS 1.3 and strict CSP headers.",
  },
  {
    icon: Fingerprint,
    title: "Token Budgets",
    description: "Per-user daily token budgets prevent runaway costs and resource exhaustion.",
  },
];

export function SecuritySection() {
  return (
    <section id="security" className="relative py-24 lg:py-32">
      <div className="dot-pattern absolute inset-0 opacity-20" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Security</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Enterprise-grade <span className="gradient-text">security built in</span>
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Every layer of the routing pipeline is hardened for production workloads.
          </p>
        </motion.div>

        {/* Security Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {securityFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={staggerItem}
                className="feature-card glass-card group rounded-xl p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/10 text-emerald-400 transition-colors group-hover:bg-emerald-400/20">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
