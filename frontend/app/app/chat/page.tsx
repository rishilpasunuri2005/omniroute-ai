"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Clock3,
  Cpu,
  Layers3,
  Loader2,
  MessageSquareText,
  Mic,
  Route,
  Search,
  Send,
  Sparkles,
  User,
  WandSparkles,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@/hooks/use-chat";
import { compactNumber, formatMs } from "@/lib/utils";

const quickActions = [
  { label: "Deep Route", icon: Route },
  { label: "Make Plan", icon: WandSparkles },
  { label: "Search Models", icon: Search },
];

const starterCards = [
  {
    title: "Route prompts across providers and keep costs visible.",
    caption: "Routing",
    icon: Layers3,
    color: "from-amber-300 to-orange-500",
  },
  {
    title: "Send coding, planning, reasoning, or extraction tasks through agents.",
    caption: "Agent flow",
    icon: MessageSquareText,
    color: "from-cyan-300 to-teal-400",
  },
  {
    title: "Track model choice, confidence, latency, validation, and usage.",
    caption: "Analytics",
    icon: Zap,
    color: "from-lime-300 to-emerald-400",
  },
];

export default function ChatPage() {
  const [prompt, setPrompt] = useState("");
  const { messages, isLoading, error, lastResult, submit } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasConversation = messages.some((message) => message.id !== "welcome");

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextPrompt = prompt.trim();
    if (!nextPrompt || isLoading) return;
    setPrompt("");
    await submit(nextPrompt);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (prompt.trim() && !isLoading) {
        void onSubmit(event as unknown as FormEvent);
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative min-h-[calc(100vh-6rem)] overflow-hidden rounded-[2rem] border border-white/10 bg-[#090b13] shadow-[0_32px_100px_rgba(0,0,0,0.45)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(45,212,191,0.18),transparent_34%),radial-gradient(circle_at_82%_10%,rgba(245,158,11,0.12),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_42%)]" />
      <div className="absolute inset-0 dot-pattern opacity-40" />

      <div className="relative grid min-h-[calc(100vh-6rem)] grid-rows-[auto_1fr_auto] px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.08]">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <button className="text-sm font-medium text-white/90" type="button">
              Assistant v2.6
            </button>
          </div>

          <div className="hidden text-sm font-semibold text-white/80 sm:block">Daily OmniRoute</div>

          <Button className="h-9 rounded-full bg-white px-4 text-xs font-semibold text-slate-950 hover:bg-white/90">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            Upgrade
          </Button>
        </header>

        <main className="grid min-h-0 gap-6 py-8 xl:grid-cols-[minmax(0,1fr)_330px]">
          <section className="relative flex min-h-0 flex-col">
            {!hasConversation ? (
              <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center">
                <div className="relative mx-auto w-full max-w-3xl">
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="max-w-xl"
                  >
                    <p className="text-sm font-medium text-teal-200/80">OmniRoute AI workspace</p>
                    <h1 className="mt-4 text-4xl font-semibold leading-[1.05] text-white sm:text-5xl">
                      Hi Rishi, ready to route your next task?
                    </h1>
                  </motion.div>

                  <AssistantVisual />

                  <div className="mt-10 grid gap-3 md:grid-cols-3">
                    {starterCards.map((card, index) => {
                      const Icon = card.icon;
                      return (
                        <motion.div
                          key={card.title}
                          initial={{ opacity: 0, y: 18 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.08 * index, duration: 0.35 }}
                          className="min-h-44 rounded-2xl border border-white/10 bg-white/[0.08] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl"
                        >
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.color}`}>
                            <Icon className="h-5 w-5 text-slate-950" />
                          </div>
                          <p className="mt-8 text-base font-semibold leading-snug text-white">{card.title}</p>
                          <p className="mt-4 text-xs text-white/50">{card.caption}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                  {messages
                    .filter((message) => message.id !== "welcome")
                    .map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className={message.role === "user" ? "mb-4 flex justify-end" : "mb-4 flex justify-start"}
                      >
                        <div className="flex max-w-[88%] gap-3">
                          {message.role === "assistant" && <Avatar icon={<Bot className="h-4 w-4" />} tone="assistant" />}
                          <div
                            className={
                              message.role === "user"
                                ? "rounded-3xl rounded-tr-md bg-primary px-5 py-3 text-sm leading-6 text-slate-950 shadow-[0_18px_40px_rgba(45,212,191,0.18)]"
                                : "rounded-3xl rounded-tl-md border border-white/10 bg-white/[0.08] px-5 py-4 text-sm leading-6 text-white backdrop-blur-xl"
                            }
                          >
                            {message.content ? (
                              <p className="whitespace-pre-wrap">{message.content}</p>
                            ) : (
                              <div className="flex items-center gap-2 text-white/60">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                <span className="text-xs">Routing through agents...</span>
                              </div>
                            )}
                            {message.metadata && (
                              <div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-3">
                                <MetaChip icon={<Cpu className="h-3 w-3" />} value={message.metadata.model ?? ""} />
                                <MetaChip icon={<Clock3 className="h-3 w-3" />} value={formatMs(message.metadata.latencyMs ?? 0)} />
                                <MetaChip value={`${compactNumber(message.metadata.usage?.total_tokens ?? 0)} tokens`} />
                                <MetaChip value={message.metadata.classification?.complexity ?? ""} />
                              </div>
                            )}
                          </div>
                          {message.role === "user" && <Avatar icon={<User className="h-4 w-4" />} tone="user" />}
                        </div>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto mt-4 w-full max-w-4xl rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100"
              >
                {error}
              </motion.div>
            )}
          </section>

          <aside className="hidden min-h-0 space-y-4 xl:block">
            <InsightPanel title="Routing Decision" icon={<Zap className="h-4 w-4 text-primary" />}>
              <SideMetric label="Model" value={lastResult?.model_used ?? "Awaiting prompt"} icon={<Cpu className="h-4 w-4" />} />
              <SideMetric label="Complexity" value={lastResult?.classification.complexity ?? "-"} icon={<Zap className="h-4 w-4" />} />
              <SideMetric label="Task Type" value={lastResult?.classification.task_type ?? "-"} icon={<Bot className="h-4 w-4" />} />
              <SideMetric label="Confidence" value={lastResult ? `${Math.round(lastResult.classification.confidence * 100)}%` : "-"} />
            </InsightPanel>

            <InsightPanel title="Agent Workflow" icon={<Route className="h-4 w-4 text-primary" />}>
              {(lastResult?.workflow_trace ?? [
                { agent: "Router Agent", status: "idle", detail: "Classifies prompt and selects model" },
                { agent: "Specialized Agent", status: "idle", detail: "Executes task with chosen model" },
                { agent: "Validation Agent", status: "idle", detail: "Checks quality and completeness" },
              ]).map((step) => (
                <div key={`${step.agent}-${step.status}`} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">{step.agent}</p>
                    <Badge variant="secondary" className="rounded-full border-white/10 bg-white/[0.08] text-[10px] text-white/70">
                      {step.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-white/50">{step.detail}</p>
                </div>
              ))}
            </InsightPanel>
          </aside>
        </main>

        <form onSubmit={onSubmit} className="mx-auto w-full max-w-3xl">
          <div className="rounded-[1.5rem] border border-white/[0.12] bg-white/[0.1] p-2 shadow-[0_24px_80px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
            <div className="flex items-start gap-2">
              <button
                type="button"
                className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
                aria-label="Attach context"
              >
                <Sparkles className="h-4 w-4" />
              </button>
              <Textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Example: "Explain quantum computing in simple terms"'
                className="min-h-11 resize-none border-0 bg-transparent px-0 py-3 text-sm text-white placeholder:text-white/40 focus-visible:ring-0"
                rows={1}
              />
              <button
                type="button"
                className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
                aria-label="Voice input"
              >
                <Mic className="h-4 w-4" />
              </button>
              <Button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                size="icon"
                className="mt-1 h-9 w-9 shrink-0 rounded-full bg-primary text-slate-950 hover:bg-primary/90"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 border-t border-white/[0.08] pt-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => setPrompt(action.label)}
                    className="inline-flex h-8 items-center gap-2 rounded-full bg-[#10121e] px-3 text-xs font-medium text-white/80 transition hover:bg-white/[0.12] hover:text-white"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

function AssistantVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.18, duration: 0.4 }}
      className="pointer-events-none absolute right-0 top-2 hidden w-56 lg:block"
    >
      <div className="ml-auto w-fit rounded-2xl bg-white px-4 py-2 text-xs font-semibold leading-4 text-slate-950 shadow-xl">
        Hey there! Need a route?
      </div>
      <div className="mx-auto mt-5 w-28">
        <div className="rounded-[1.2rem] border border-cyan-200/40 bg-slate-950 p-2 shadow-[0_20px_70px_rgba(45,212,191,0.24)]">
          <div className="flex h-12 items-center justify-center rounded-xl bg-gradient-to-b from-slate-700 to-slate-950">
            <div className="mx-1 h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.9)]" />
            <div className="mx-1 h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.9)]" />
          </div>
        </div>
        <div className="mx-auto h-14 w-20 rounded-b-[2rem] border border-white/20 bg-gradient-to-b from-white to-slate-300" />
      </div>
    </motion.div>
  );
}

function Avatar({ icon, tone }: { icon: ReactNode; tone: "assistant" | "user" }) {
  return (
    <div
      className={
        tone === "assistant"
          ? "mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/[0.12] text-primary"
          : "mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] text-white/50"
      }
    >
      {icon}
    </div>
  );
}

function MetaChip({ icon, value }: { icon?: ReactNode; value: string }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.08] px-2.5 py-1 text-[10px] text-white/60">
      {icon}
      {value}
    </span>
  );
}

function InsightPanel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-[1.5rem] border border-white/[0.12] bg-white/[0.07] p-5 backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function SideMetric({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm">
      <span className="inline-flex min-w-0 items-center gap-2 text-xs text-white/50">
        {icon}
        {label}
      </span>
      <span className="truncate text-right text-xs font-semibold text-white/80">{value}</span>
    </div>
  );
}
