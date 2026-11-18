"use client";

import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Clock3,
  Cpu,
  FileText,
  Layers3,
  Loader2,
  MessageSquareText,
  Mic,
  Paperclip,
  Route,
  Search,
  Send,
  Sparkles,
  User,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@/hooks/use-chat";
import { ATTACHMENT_ACCEPT, readMarkdownFile } from "@/lib/attachment";
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
  const { messages, isLoading, error, lastResult, attachment, setAttachment, submit } = useChat();
  const [attachError, setAttachError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  async function onFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset so selecting the same file again still fires onChange.
    event.target.value = "";
    if (!file) return;
    const result = await readMarkdownFile(file);
    if (result.ok) {
      setAttachError(null);
      setAttachment(result.attachment);
    } else {
      setAttachError(result.error);
    }
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
      className="relative min-h-[calc(100vh-6rem)] overflow-hidden border border-border bg-background"
    >

      <div className="relative grid min-h-[calc(100vh-6rem)] grid-rows-[auto_1fr_auto] px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-none border border-border bg-card">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <button className="text-sm font-medium text-foreground" type="button">
              Assistant v2.6
            </button>
          </div>

          <div className="hidden text-sm font-semibold text-foreground sm:block">Daily OmniRoute</div>

          <div className="h-9 w-9" aria-hidden="true" />
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
                    <p className="text-sm font-medium text-primary">OmniRoute AI workspace</p>
                    <h1 className="mt-4 text-4xl font-semibold leading-[1.05] text-foreground sm:text-5xl">
                      Hi Rishi, ready to route your next task?
                    </h1>
                  </motion.div>

                  <div className="mt-10 grid gap-3 md:grid-cols-3">
                    {starterCards.map((card, index) => {
                      const Icon = card.icon;
                      return (
                        <motion.div
                          key={card.title}
                          initial={{ opacity: 0, y: 18 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.08 * index, duration: 0.35 }}
                          className="min-h-44 rounded-none border border-border bg-card p-5"
                        >
                          <div className={`flex h-10 w-10 items-center justify-center rounded-none border border-border bg-muted`}>
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <p className="mt-8 text-base font-semibold leading-snug text-foreground">{card.title}</p>
                          <p className="mt-4 text-xs text-muted-foreground">{card.caption}</p>
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
                                ? "rounded-none bg-primary px-5 py-3 text-sm leading-6 text-primary-foreground"
                                : "rounded-none border border-border bg-card px-5 py-4 text-sm leading-6 text-foreground"
                            }
                          >
                            {message.attachmentName && (
                              <p className="mb-2 inline-flex items-center gap-1.5 rounded-none bg-black/15 px-2.5 py-1 text-[11px] font-medium">
                                <FileText className="h-3 w-3" />
                                {message.attachmentName}
                              </p>
                            )}
                            {message.content ? (
                              <p className="whitespace-pre-wrap">{message.content}</p>
                            ) : (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                <span className="text-xs">Routing through agents...</span>
                              </div>
                            )}
                            {message.metadata && (
                              <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
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
                className="mx-auto mt-4 w-full max-w-4xl rounded-none border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100"
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
                <div key={`${step.agent}-${step.status}`} className="rounded-none border border-border bg-card p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">{step.agent}</p>
                    <Badge variant="secondary" className="rounded-none border-border bg-card text-[10px] text-foreground">
                      {step.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{step.detail}</p>
                </div>
              ))}
            </InsightPanel>
          </aside>
        </main>

        <form onSubmit={onSubmit} className="mx-auto w-full max-w-3xl">
          <div className="rounded-none border border-border bg-card p-2">
            <div className="flex items-start gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={ATTACHMENT_ACCEPT}
                className="hidden"
                onChange={onFileSelected}
                data-testid="md-file-input"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-none text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
                aria-label="Attach a Markdown (.md) file"
                title="Attach a Markdown (.md) file"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <Textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Example: "Explain quantum computing in simple terms"'
                className="min-h-11 resize-none border-0 bg-transparent px-0 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
                rows={1}
              />
              <button
                type="button"
                className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-none text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Voice input"
              >
                <Mic className="h-4 w-4" />
              </button>
              <Button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                size="icon"
                className="mt-1 h-9 w-9 shrink-0 rounded-none bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            {(attachment || attachError) && (
              <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-border pt-2">
                {attachment && (
                  <span className="inline-flex max-w-full items-center gap-2 rounded-none bg-primary/15 py-1 pl-3 pr-1 text-xs font-medium text-foreground">
                    <FileText className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="truncate">{attachment.filename}</span>
                    <span className="shrink-0 text-muted-foreground">{compactNumber(attachment.content.length)} chars</span>
                    <button
                      type="button"
                      onClick={() => setAttachment(null)}
                      disabled={isLoading}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-none text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
                      aria-label={`Remove ${attachment.filename}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}
                {attachError && (
                  <span role="alert" className="text-xs text-red-300">
                    {attachError}
                  </span>
                )}
              </div>
            )}
            <div className="mt-2 flex flex-wrap gap-2 border-t border-border pt-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => setPrompt(action.label)}
                    className="inline-flex h-8 items-center gap-2 rounded-none bg-muted px-3 text-xs font-medium text-foreground transition hover:bg-muted hover:text-foreground"
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

function Avatar({ icon, tone }: { icon: ReactNode; tone: "assistant" | "user" }) {
  return (
    <div
      className={
        tone === "assistant"
          ? "mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-none border border-primary/20 bg-primary/[0.12] text-primary"
          : "mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-none border border-border bg-card text-muted-foreground"
      }
    >
      {icon}
    </div>
  );
}

function MetaChip({ icon, value }: { icon?: ReactNode; value: string }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-none bg-card px-2.5 py-1 text-[10px] text-muted-foreground">
      {icon}
      {value}
    </span>
  );
}

function InsightPanel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-none border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function SideMetric({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-3 rounded-none border border-border bg-card px-4 text-sm">
      <span className="inline-flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="truncate text-right text-xs font-semibold text-foreground">{value}</span>
    </div>
  );
}
