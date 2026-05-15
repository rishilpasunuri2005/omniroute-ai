"use client";

import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { Bot, Clock3, Cpu, Send, Sparkles, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@/hooks/use-chat";
import { compactNumber, formatMs } from "@/lib/utils";

export function ChatConsole() {
  const [prompt, setPrompt] = useState("");
  const { messages, isLoading, error, lastResult, submit } = useChat();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextPrompt = prompt;
    setPrompt("");
    await submit(nextPrompt);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="flex min-h-[calc(100vh-8rem)] flex-col rounded-lg border border-border bg-black/18 backdrop-blur-xl">
        <div className="border-b border-border p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal">OmniRoute AI</h1>
              <p className="mt-1 text-sm text-muted-foreground">Intelligent Multi-Model Agent Orchestration Platform</p>
            </div>
            <Badge className="border-primary/30 bg-primary/12 text-primary">
              <Sparkles className="mr-1 h-3 w-3" />
              Live routing
            </Badge>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.map((message) => (
            <div key={message.id} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={
                  message.role === "user"
                    ? "max-w-[86%] rounded-lg bg-primary px-4 py-3 text-sm text-primary-foreground"
                    : "max-w-[86%] rounded-lg border border-border bg-card/80 px-4 py-3 text-sm"
                }
              >
                <p className="whitespace-pre-wrap leading-6">{message.content || "Routing through agents..."}</p>
                {message.metadata ? (
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Cpu className="h-3 w-3" />
                      {message.metadata.model}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3 w-3" />
                      {formatMs(message.metadata.latencyMs ?? 0)}
                    </span>
                    <span>{compactNumber(message.metadata.usage?.total_tokens ?? 0)} tokens</span>
                    <span>{message.metadata.classification?.complexity}</span>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          {error ? <div className="rounded-md border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}
        </div>

        <form onSubmit={onSubmit} className="border-t border-border p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <Textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Ask for code, planning, extraction, summarization, or reasoning..."
              className="min-h-24 md:min-h-14"
            />
            <Button type="submit" disabled={isLoading || !prompt.trim()} className="md:h-14 md:w-14" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </section>

      <aside className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Routing Decision</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Metric label="Model" value={lastResult?.model_used ?? "Awaiting prompt"} icon={<Cpu className="h-4 w-4" />} />
            <Metric label="Complexity" value={lastResult?.classification.complexity ?? "-"} icon={<Zap className="h-4 w-4" />} />
            <Metric label="Task Type" value={lastResult?.classification.task_type ?? "-"} icon={<Bot className="h-4 w-4" />} />
            <Metric label="Confidence" value={lastResult ? `${Math.round(lastResult.classification.confidence * 100)}%` : "-"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agent Workflow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(lastResult?.workflow_trace ?? [
              { agent: "Router Agent", status: "idle", detail: "Classifies prompt and selects model" },
              { agent: "Specialized Agent", status: "idle", detail: "Executes task with chosen model" },
              { agent: "Validation Agent", status: "idle", detail: "Checks quality and completeness" },
            ]).map((step) => (
              <div key={`${step.agent}-${step.status}`} className="rounded-md border border-border bg-white/[0.04] p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{step.agent}</p>
                  <Badge>{step.status}</Badge>
                </div>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{step.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-white/[0.04] p-3">
      <span className="inline-flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="truncate text-right font-medium">{value}</span>
    </div>
  );
}
