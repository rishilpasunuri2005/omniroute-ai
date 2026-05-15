"use client";

import { motion } from "framer-motion";
import {
  GitBranch,
  Brain,
  DollarSign,
  BarChart3,
  Layers3,
  ShieldCheck,
} from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/animations";

const features = [
  {
    icon: GitBranch,
    title: "Intelligent Routing",
    description:
      "Automatically classify task complexity and route to the optimal model — fast, accurate, and cost-efficient.",
  },
  {
    icon: Brain,
    title: "Multi-Agent Workflows",
    description:
      "Chain specialized agents together for planning, coding, reasoning, and validation in a single pipeline.",
  },
  {
    icon: DollarSign,
    title: "Cost Optimization",
    description:
      "Route simple tasks to lightweight models and reserve expensive models for complex reasoning — save up to 70%.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description:
      "Monitor token usage, latency, routing decisions, and model utilization with live dashboards.",
  },
  {
    icon: Layers3,
    title: "Open Model Support",
    description:
      "Connect any LLM provider — Groq, OpenRouter, OpenAI, Anthropic, or self-hosted models via Ollama.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Security",
    description:
      "Built-in input sanitization, output validation, rate limiting, and JWT-based authentication.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Features</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need for
            <span className="gradient-text"> intelligent orchestration</span>
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            A complete platform for routing, monitoring, and optimizing your AI workflows.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={staggerItem}
                className="feature-card glass-card group rounded-xl p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
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
