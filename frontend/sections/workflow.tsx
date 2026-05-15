"use client";

import { motion } from "framer-motion";
import { Zap, GitBranch, Bot, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Zap,
    title: "Prompt Intake",
    description: "User sends a prompt or task",
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-400/20",
  },
  {
    icon: GitBranch,
    title: "Router Agent",
    description: "Classifies complexity, task type, and confidence",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
  },
  {
    icon: Bot,
    title: "Specialized Agent",
    description: "Routes to optimal model for the task",
    color: "text-violet-400",
    bgColor: "bg-violet-400/10",
    borderColor: "border-violet-400/20",
  },
  {
    icon: ShieldCheck,
    title: "Validation Agent",
    description: "Checks quality, completeness, and safety",
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/20",
  },
  {
    icon: CheckCircle2,
    title: "Output",
    description: "Validated response delivered to user",
    color: "text-sky-400",
    bgColor: "bg-sky-400/10",
    borderColor: "border-sky-400/20",
  },
];

export function WorkflowSection() {
  return (
    <section id="workflows" className="relative py-24 lg:py-32">
      <div className="dot-pattern absolute inset-0 opacity-30" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Workflows</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            See the <span className="gradient-text">routing pipeline</span> in action
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Every prompt flows through an intelligent pipeline of classification, routing, execution, and validation.
          </p>
        </motion.div>

        {/* Pipeline */}
        <div className="mt-16">
          <div className="relative mx-auto max-w-4xl">
            {/* Desktop Pipeline */}
            <div className="hidden lg:block">
              <div className="flex items-start justify-between">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={step.title}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.15, duration: 0.5 }}
                      className="relative flex w-40 flex-col items-center text-center"
                    >
                      {/* Connector Line */}
                      {index < steps.length - 1 && (
                        <motion.div
                          initial={{ scaleX: 0 }}
                          whileInView={{ scaleX: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.15 + 0.3, duration: 0.4 }}
                          className="absolute left-[60%] top-7 h-px w-[calc(100%-20px)] origin-left bg-gradient-to-r from-primary/40 to-primary/10"
                        />
                      )}

                      {/* Node */}
                      <div
                        className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-xl border ${step.borderColor} ${step.bgColor}`}
                      >
                        <Icon className={`h-6 w-6 ${step.color}`} />
                      </div>

                      {/* Label */}
                      <p className="mt-3 text-sm font-semibold">{step.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Pipeline */}
            <div className="space-y-4 lg:hidden">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${step.borderColor} ${step.bgColor}`}
                    >
                      <Icon className={`h-5 w-5 ${step.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{step.title}</p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                    {index < steps.length - 1 && (
                      <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground/40" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
