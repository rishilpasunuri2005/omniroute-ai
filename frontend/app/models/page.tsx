"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Bot, CheckCircle2, CircleAlert, DatabaseZap, RefreshCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchModels } from "@/services/api";
import type { ModelInfo } from "@/types/api";
import { compactNumber } from "@/lib/utils";

export default function ModelsPage() {
  const { getToken } = useAuth();
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setModels(await fetchModels(await getToken()));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load models");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Model Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Configured Ollama models, routing roles, and availability.</p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {error ? <div className="rounded-md border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {models.map((model) => (
          <Card key={`${model.name}-${model.role}`}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-primary" />
                    {model.name}
                  </CardTitle>
                  <CardDescription className="mt-2 capitalize">{model.role} route</CardDescription>
                </div>
                <Badge className={model.available ? "border-primary/30 bg-primary/12 text-primary" : "border-amber-300/30 bg-amber-300/10 text-amber-200"}>
                  {model.available ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <CircleAlert className="mr-1 h-3 w-3" />}
                  {model.available ? "Ready" : "Missing"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-md border border-border bg-white/[0.04] p-3">
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <DatabaseZap className="h-4 w-4" />
                  Provider
                </span>
                <span>{model.provider}</span>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border bg-white/[0.04] p-3">
                <span className="text-muted-foreground">Context</span>
                <span>{model.context_window ? compactNumber(model.context_window) : "Unknown"}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Fallback Strategy</CardTitle>
          <CardDescription>Missing local models do not block routing in development unless strict Ollama mode is enabled.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-3">
          <div className="rounded-md border border-border bg-white/[0.04] p-4">
            <p className="font-medium">Retry</p>
            <p className="mt-2 text-muted-foreground">Transient Ollama failures retry with backoff before fallback.</p>
          </div>
          <div className="rounded-md border border-border bg-white/[0.04] p-4">
            <p className="font-medium">Escalate</p>
            <p className="mt-2 text-muted-foreground">Low-confidence routing escalates to the reasoning model.</p>
          </div>
          <div className="rounded-md border border-border bg-white/[0.04] p-4">
            <p className="font-medium">Repair</p>
            <p className="mt-2 text-muted-foreground">Validation failures are retried through the fallback model.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
