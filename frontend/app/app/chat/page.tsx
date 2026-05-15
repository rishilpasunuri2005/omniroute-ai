"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Clock3, Cpu, Loader2, Send, Sparkles, User, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@/hooks/use-chat";
import { compactNumber, formatMs } from "@/lib/utils";

export default function ChatPage() {
  const [prompt, setPrompt] = useState("");
  const { messages, isLoading, error, lastResult, submit } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextPrompt = prompt;
    setPrompt("");
    await submit(nextPrompt);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (prompt.trim() && !isLoading) {
        void onSubmit(e as unknown as FormEvent);
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid h-[calc(100vh-4rem)] gap-5 xl:grid-cols-[minmax(0,1fr)_360px]"
    >
      {/* Chat Panel */}
      <section className="flex flex-col overflow-hidden rounded-xl border border-white/6 bg-black/20 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Chat Console</h1>
            <p className="text-xs text-muted-foreground">Send prompts to see intelligent routing</p>
          </div>
          <Badge className="border-primary/20 bg-primary/10 text-primary">
            <Sparkles className="mr-1 h-3 w-3" />
            Live Routing
          </Badge>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div className="flex max-w-[85%] gap-3">
                  {/* Avatar */}
                  {message.role === "assistant" && (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}

                  <div
                    className={
                      message.role === "user"
                        ? "rounded-xl rounded-tr-sm bg-primary px-4 py-3 text-sm text-primary-foreground"
                        : "rounded-xl rounded-tl-sm border border-white/6 bg-white/[0.03] px-4 py-3 text-sm"
                    }
                  >
                    {/* Content */}
                    {message.content ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span className="text-xs">Routing through agents...</span>
                      </div>
                    )}

                    {/* Metadata */}
                    {message.metadata && (
                      <div className="mt-3 flex flex-wrap gap-2 border-t border-white/5 pt-3">
                        <MetaChip icon={<Cpu className="h-3 w-3" />} value={message.metadata.model ?? ""} />
                        <MetaChip icon={<Clock3 className="h-3 w-3" />} value={formatMs(message.metadata.latencyMs ?? 0)} />
                        <MetaChip value={`${compactNumber(message.metadata.usage?.total_tokens ?? 0)} tokens`} />
                        <MetaChip value={message.metadata.classification?.complexity ?? ""} />
                      </div>
                    )}
                  </div>

                  {/* Avatar */}
                  {message.role === "user" && (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300"
            >
              {error}
            </motion.div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={onSubmit} className="border-t border-white/5 p-4">
          <div className="flex gap-3">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask for code, planning, extraction, summarization, or reasoning..."
              className="min-h-12 resize-none bg-white/[0.03] border-white/8 focus:border-primary/30"
              rows={1}
            />
            <Button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              size="icon"
              className="h-12 w-12 shrink-0"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </form>
      </section>

      {/* Side Panel */}
      <aside className="hidden space-y-5 xl:block">
        {/* Routing Decision */}
        <Card className="border-white/6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-primary" />
              Routing Decision
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <SideMetric label="Model" value={lastResult?.model_used ?? "Awaiting prompt"} icon={<Cpu className="h-4 w-4" />} />
            <SideMetric label="Complexity" value={lastResult?.classification.complexity ?? "—"} icon={<Zap className="h-4 w-4" />} />
            <SideMetric label="Task Type" value={lastResult?.classification.task_type ?? "—"} icon={<Bot className="h-4 w-4" />} />
            <SideMetric
              label="Confidence"
              value={lastResult ? `${Math.round(lastResult.classification.confidence * 100)}%` : "—"}
            />
          </CardContent>
        </Card>

        {/* Workflow Trace */}
        <Card className="border-white/6">
          <CardHeader>
            <CardTitle className="text-sm">Agent Workflow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {(lastResult?.workflow_trace ?? [
              { agent: "Router Agent", status: "idle", detail: "Classifies prompt and selects model" },
              { agent: "Specialized Agent", status: "idle", detail: "Executes task with chosen model" },
              { agent: "Validation Agent", status: "idle", detail: "Checks quality and completeness" },
            ]).map((step) => (
              <div
                key={`${step.agent}-${step.status}`}
                className="rounded-lg border border-white/5 bg-white/[0.02] p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium">{step.agent}</p>
                  <Badge variant="secondary" className="text-[10px]">
                    {step.status}
                  </Badge>
                </div>
                <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{step.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </aside>
    </motion.div>
  );
}

function MetaChip({ icon, value }: { icon?: ReactNode; value: string }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-muted-foreground">
      {icon}
      {value}
    </span>
  );
}

function SideMetric({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-sm">
      <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="truncate text-right text-xs font-medium">{value}</span>
    </div>
  );
}
