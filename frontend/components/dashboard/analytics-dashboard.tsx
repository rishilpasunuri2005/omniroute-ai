"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Activity, Clock3, Coins, GitFork, Layers3, RefreshCcw, Sigma } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchAnalyticsWithToken } from "@/services/api";
import type { AnalyticsResponse } from "@/types/api";
import { compactNumber, formatMs } from "@/lib/utils";

export function AnalyticsDashboard() {
  const auth = useAuth();
  const getToken = auth?.getToken || (async () => null);
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchAnalyticsWithToken(await getToken()));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load analytics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const cards = [
    { label: "Requests", value: compactNumber(data?.total_requests ?? 0), icon: Activity },
    { label: "Tokens", value: compactNumber(data?.total_tokens ?? 0), icon: Sigma },
    { label: "Avg Latency", value: formatMs(data?.average_latency_ms ?? 0), icon: Clock3 },
    { label: "Cost Saved", value: `$${(data?.estimated_cost_savings ?? 0).toFixed(4)}`, icon: Coins },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Routing Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Token usage, routing distribution, latency, and model utilization.</p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {error ? <div className="rounded-md border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="mt-2 text-2xl font-semibold">{card.value}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-md border border-primary/30 bg-primary/12 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <DistributionCard title="Routing Distribution" icon={<GitFork className="h-4 w-4" />} data={data?.routing_distribution ?? {}} />
        <DistributionCard title="Model Utilization" icon={<Layers3 className="h-4 w-4" />} data={data?.model_utilization ?? {}} />
        <DistributionCard title="Task Types" icon={<Activity className="h-4 w-4" />} data={data?.task_type_distribution ?? {}} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest routed prompts and runtime metrics.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(data?.recent_activity ?? []).length === 0 ? (
            <div className="rounded-md border border-border bg-white/[0.04] p-4 text-sm text-muted-foreground">
              No routed requests yet.
            </div>
          ) : (
            data?.recent_activity.map((item) => (
              <div key={item.id} className="grid gap-3 rounded-md border border-border bg-white/[0.04] p-4 md:grid-cols-[1fr_160px_120px]">
                <div>
                  <p className="line-clamp-2 text-sm">{item.prompt}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge>{item.task_type}</Badge>
                    <Badge>{item.complexity}</Badge>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="text-foreground">{item.model_used}</p>
                  <p>{new Date(item.created_at).toLocaleString()}</p>
                </div>
                <div className="text-sm font-medium">{formatMs(item.latency_ms)}</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DistributionCard({ title, data, icon }: { title: string; data: Record<string, number>; icon: ReactNode }) {
  const total = Object.values(data).reduce((sum, value) => sum + value, 0) || 1;
  const entries = Object.entries(data);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet.</p>
        ) : (
          entries.map(([key, value]) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="capitalize text-muted-foreground">{key}</span>
                <span>{value}</span>
              </div>
              <div className="h-2 rounded-full bg-white/8">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${(value / total) * 100}%` }} />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
