"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Bot, CheckCircle2, CircleAlert, DatabaseZap, RefreshCcw, Wifi } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchModels } from "@/services/api";
import type { ModelInfo } from "@/types/api";
import { compactNumber } from "@/lib/utils";

export default function ModelsPage() {
  const auth = useAuth();
  const getToken = auth?.getToken || (async () => null);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={staggerItem} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Model Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Connected AI models, routing roles, and availability status
          </p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading} className="gap-2">
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </motion.div>

      {error && (
        <motion.div variants={staggerItem} className="rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </motion.div>
      )}

      <motion.div variants={staggerItem} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? [1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-48 w-full rounded-xl" />
            ))
          : models.map((model) => (
              <Card
                key={`${model.name}-${model.role}`}
                className="group transition-all hover:border-primary/20"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Bot className="h-4 w-4 text-primary" />
                        <span className="truncate">{model.name}</span>
                      </CardTitle>
                      <CardDescription className="mt-1 capitalize">{model.role} route</CardDescription>
                    </div>
                    <Badge
                      className={
                        model.available
                          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
                          : "border-amber-400/20 bg-amber-400/10 text-amber-400"
                      }
                    >
                      {model.available ? (
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                      ) : (
                        <CircleAlert className="mr-1 h-3 w-3" />
                      )}
                      {model.available ? "Ready" : "Offline"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3 text-sm">
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      <DatabaseZap className="h-3.5 w-3.5" />
                      Provider
                    </span>
                    <span className="text-xs font-medium">{model.provider}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3 text-sm">
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Wifi className="h-3.5 w-3.5" />
                      Context
                    </span>
                    <span className="text-xs font-medium">
                      {model.context_window ? compactNumber(model.context_window) : "Unknown"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
      </motion.div>

      {/* Fallback Strategy */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Fallback Strategy</CardTitle>
            <CardDescription>How OmniRoute handles model failures</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {[
              { title: "Retry", desc: "Transient failures retry with exponential backoff" },
              { title: "Escalate", desc: "Low-confidence routing escalates to reasoning model" },
              { title: "Repair", desc: "Validation failures are retried through fallback model" },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
