"use client";

import { motion } from "framer-motion";
import { Activity, Clock3, Coins, Sigma, TrendingDown, Zap } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/animations";

const metrics = [
  { icon: Coins, label: "Cost Savings", value: "67%", description: "Average reduction in API costs", trend: "-67%" },
  { icon: Clock3, label: "Avg Latency", value: "180ms", description: "End-to-end response time", trend: "-42%" },
  { icon: Sigma, label: "Token Efficiency", value: "3.2x", description: "More output per token spent", trend: "+220%" },
  { icon: Activity, label: "Routing Accuracy", value: "98.5%", description: "Correct model selection rate", trend: "+12%" },
  { icon: TrendingDown, label: "Error Rate", value: "0.3%", description: "Failed routing attempts", trend: "-89%" },
  { icon: Zap, label: "Throughput", value: "1.2K/s", description: "Requests processed per second", trend: "+340%" },
];

export function AnalyticsSection() {
  return (
    <section id="models" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Analytics</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Real-time <span className="gradient-text">performance metrics</span>
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Monitor every aspect of your routing pipeline with live dashboards.
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const isPositive = metric.trend.startsWith("+") || metric.trend.startsWith("-6") || metric.trend.startsWith("-8") || metric.trend.startsWith("-4");
            return (
              <motion.div
                key={metric.label}
                variants={staggerItem}
                className="glass-card group rounded-xl p-6 transition-all hover:border-primary/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                    {metric.trend}
                  </span>
                </div>
                <p className="mt-4 text-3xl font-bold">{metric.value}</p>
                <p className="mt-1 text-sm font-medium text-foreground/80">{metric.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{metric.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
