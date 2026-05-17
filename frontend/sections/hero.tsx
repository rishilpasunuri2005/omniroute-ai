"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles, Zap, Bot, GitBranch } from "lucide-react";
import { fadeUp, staggerContainer, staggerItem, floatAnimation } from "@/lib/animations";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
      {/* Background Effects */}
      <div className="hero-gradient absolute inset-0" />
      <div className="dot-pattern absolute inset-0 opacity-40" />

      {/* Floating Orbs */}
      <motion.div
        animate={floatAnimation}
        className="absolute left-[10%] top-[20%] h-64 w-64 rounded-full bg-primary/5 blur-3xl"
      />
      <motion.div
        animate={{ ...floatAnimation, transition: { ...floatAnimation.transition, delay: 1 } }}
        className="absolute right-[15%] top-[30%] h-48 w-48 rounded-full bg-primary/8 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-4xl text-center"
        >
          {/* Badge */}
          <motion.div variants={staggerItem} className="flex justify-center">
            <div className="glass-card inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">Powered by Intelligent Routing</span>
              <div className="h-1 w-1 rounded-full bg-primary animate-pulse-glow" />
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={staggerItem}
            className="mt-8 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl"
          >
            <span className="block">Intelligent AI Routing</span>
            <span className="gradient-text mt-2 block">for Modern Agentic Workflows</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={staggerItem}
            className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg"
          >
            Dynamically route tasks to the best AI models and agents based on complexity, cost, and
            performance. Build smarter workflows in minutes.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={staggerItem} className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/app/chat"
              className="group inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow transition-all hover:bg-primary/90 hover:shadow-glow-lg"
            >
              Start Building
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <button className="group inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-foreground backdrop-blur transition-all hover:border-white/20 hover:bg-white/8">
              <Play className="h-4 w-4 text-primary" />
              Watch Demo
            </button>
          </motion.div>
        </motion.div>

        {/* Hero Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-20 max-w-3xl"
        >
          <div className="glass-card rounded-2xl p-8">
            {/* Routing Visualization */}
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
              {/* Input */}
              <RoutingNode icon={<Zap className="h-5 w-5" />} label="Prompt" sublabel="User Input" delay={0.6} />

              {/* Animated Connection */}
              <div className="hidden items-center sm:flex">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="h-px w-12 origin-left bg-gradient-to-r from-primary/60 to-primary/20"
                />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.0 }}
                  className="h-2 w-2 rounded-full bg-primary animate-pulse-glow"
                />
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.1, duration: 0.5 }}
                  className="h-px w-12 origin-left bg-gradient-to-r from-primary/20 to-primary/60"
                />
              </div>
              <div className="h-8 w-px bg-gradient-to-b from-primary/60 to-primary/20 sm:hidden" />

              {/* Router */}
              <RoutingNode icon={<GitBranch className="h-5 w-5" />} label="Router" sublabel="Classify & Route" delay={0.9} active />

              {/* Animated Connection */}
              <div className="hidden items-center sm:flex">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.3, duration: 0.5 }}
                  className="h-px w-12 origin-left bg-gradient-to-r from-primary/60 to-primary/20"
                />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.5 }}
                  className="h-2 w-2 rounded-full bg-primary animate-pulse-glow"
                />
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.6, duration: 0.5 }}
                  className="h-px w-12 origin-left bg-gradient-to-r from-primary/20 to-primary/60"
                />
              </div>
              <div className="h-8 w-px bg-gradient-to-b from-primary/60 to-primary/20 sm:hidden" />

              {/* Agent */}
              <RoutingNode icon={<Bot className="h-5 w-5" />} label="Agent" sublabel="Execute Task" delay={1.2} />
            </div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="mt-8 grid grid-cols-3 gap-4 rounded-xl bg-white/[0.02] p-4"
            >
              <StatChip label="Latency" value="< 200ms" />
              <StatChip label="Cost Savings" value="67%" />
              <StatChip label="Accuracy" value="98.5%" />
            </motion.div>
          </div>

          {/* Glow effect behind the card */}
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-primary/5 blur-2xl" />
        </motion.div>
      </div>
    </section>
  );
}

function RoutingNode({
  icon,
  label,
  sublabel,
  delay = 0,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  delay?: number;
  active?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className={`flex flex-col items-center gap-2 ${active ? "scale-105" : ""}`}
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-xl ${
          active
            ? "bg-primary/20 text-primary glow-teal-sm glow-border"
            : "bg-white/5 text-muted-foreground border border-white/8"
        }`}
      >
        {icon}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-[11px] text-muted-foreground">{sublabel}</p>
      </div>
    </motion.div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-lg font-semibold text-primary">{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
