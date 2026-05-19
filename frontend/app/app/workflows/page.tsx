"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  GitBranch,
  PlayCircle,
  Route,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    title: "Router Agent",
    icon: Route,
    detail: "Classifies task type, complexity, confidence, and routing constraints.",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
  },
  {
    title: "Planner Agent",
    icon: GitBranch,
    detail: "Adds an execution plan for medium and complex requests.",
    color: "text-violet-400",
    bgColor: "bg-violet-400/10",
    borderColor: "border-violet-400/20",
  },
  {
    title: "Coding Agent",
    icon: Code2,
    detail: "Handles implementation, debugging, API, and architecture prompts.",
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-400/20",
  },
  {
    title: "Validation Agent",
    icon: ShieldCheck,
    detail: "Checks empty output, malformed JSON, hallucination markers, and completeness.",
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/20",
  },
];

const workflows = [
  {
    name: "Code Generation Pipeline",
    status: "Active",
    agents: 4,
    runs: 1243,
    avgLatency: "320ms",
  },
  {
    name: "Document Summarization",
    status: "Active",
    agents: 3,
    runs: 876,
    avgLatency: "180ms",
  },
  {
    name: "Data Extraction Flow",
    status: "Draft",
    agents: 3,
    runs: 0,
    avgLatency: "—",
  },
];

export default function WorkflowsPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-bold tracking-tight">Agent Workflows</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The runtime path from user prompt to validated response
        </p>
      </motion.div>

      {/* Pipeline Visualization */}
      <motion.div variants={staggerItem}>
        <div className="rounded-xl border border-white/6 bg-black/20 p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Routing Pipeline</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className={`rounded-xl border ${step.borderColor} bg-white/[0.02] p-5 transition-all hover:bg-white/[0.04]`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${step.bgColor}`}>
                        <Icon className={`h-5 w-5 ${step.color}`} />
                      </div>
                      <Badge variant="secondary" className="text-[10px]">Step {index + 1}</Badge>
                    </div>
                    <h3 className="mt-4 text-sm font-semibold">{step.title}</h3>
                    <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{step.detail}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="absolute -right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-primary/40 xl:block" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Workflow List */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <PlayCircle className="h-4 w-4 text-primary" />
                  Workflow Templates
                </CardTitle>
                <CardDescription className="mt-1">Pre-configured routing pipelines</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {workflows.map((wf) => (
              <div
                key={wf.name}
                className="flex flex-wrap items-center gap-4 rounded-lg border border-white/5 bg-white/[0.02] p-4 transition hover:border-primary/10"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{wf.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{wf.agents} agents · {wf.runs} runs</p>
                </div>
                <div className="text-xs text-muted-foreground">Avg: {wf.avgLatency}</div>
                <Badge
                  className={
                    wf.status === "Active"
                      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
                      : "border-white/10 bg-white/5 text-muted-foreground"
                  }
                >
                  {wf.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Routing Rules + Future Providers */}
      <motion.div variants={staggerItem} className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Routing Rules</CardTitle>
            <CardDescription>Deterministic first, provider-agnostic by design</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              "Short and simple prompts route to lightweight models",
              "Coding and debugging prompts use specialized code models",
              "Complex reasoning prompts use the strongest available model",
              "Low classifier confidence escalates to the reasoning route",
            ].map((rule) => (
              <div key={rule} className="flex gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-xs text-muted-foreground">{rule}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Connected Providers</CardTitle>
            <CardDescription>Multi-provider support for maximum flexibility</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {["Groq (Llama)", "OpenRouter", "NVIDIA NIM", "OpenAI APIs", "Anthropic Claude"].map((provider) => (
              <div key={provider} className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs font-medium">
                {provider}
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
