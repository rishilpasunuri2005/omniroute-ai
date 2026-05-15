"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  Clock3,
  Coins,
  GitFork,
  Layers3,
  MessageSquare,
  RefreshCcw,
  Sigma,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchAnalyticsWithToken } from "@/services/api";
import type { AnalyticsResponse } from "@/types/api";
import { compactNumber, formatMs } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statCards = [
    { label: "Total Requests", value: compactNumber(data?.total_requests ?? 0), icon: Activity, trend: "+12%" },
    { label: "Total Tokens", value: compactNumber(data?.total_tokens ?? 0), icon: Sigma, trend: "+8%" },
    { label: "Avg Latency", value: formatMs(data?.average_latency_ms ?? 0), icon: Clock3, trend: "-15%" },
    { label: "Cost Saved", value: `$${(data?.estimated_cost_savings ?? 0).toFixed(4)}`, icon: Coins, trend: "+67%" },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor your routing pipeline performance
          </p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading} className="gap-2">
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </motion.div>

      {/* Onboarding Card */}
      <motion.div variants={staggerItem}>
        <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 p-6">
          <div className="absolute right-4 top-4">
            <Sparkles className="h-8 w-8 text-primary/20" />
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 glow-border">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold">Welcome to OmniRoute AI</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Start by sending a prompt in the Chat console to see intelligent routing in action.
              </p>
            </div>
            <Link href="/app/chat">
              <Button className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Open Chat
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div variants={staggerItem} className="rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </motion.div>
      )}

      {/* Stats */}
      <motion.div variants={staggerItem} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="group transition-all hover:border-primary/20">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <p className="mt-2 text-2xl font-bold">{loading ? "—" : card.value}</p>
                  <span className="mt-1 inline-block rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                    {card.trend}
                  </span>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Distribution Charts */}
      <motion.div variants={staggerItem} className="grid gap-5 xl:grid-cols-3">
        <DistributionCard
          title="Routing Distribution"
          icon={<GitFork className="h-4 w-4" />}
          data={data?.routing_distribution ?? {}}
          loading={loading}
        />
        <DistributionCard
          title="Model Utilization"
          icon={<Layers3 className="h-4 w-4" />}
          data={data?.model_utilization ?? {}}
          loading={loading}
        />
        <DistributionCard
          title="Task Types"
          icon={<Activity className="h-4 w-4" />}
          data={data?.task_type_distribution ?? {}}
          loading={loading}
        />
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="mt-1">Latest routed prompts and runtime metrics</CardDescription>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <Activity className="mr-1 h-3 w-3" />
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-20 w-full" />
                ))}
              </div>
            ) : (data?.recent_activity ?? []).length === 0 ? (
              <div className="rounded-lg border border-border bg-white/[0.02] p-6 text-center text-sm text-muted-foreground">
                <Bot className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2">No routed requests yet. Send a prompt to get started.</p>
              </div>
            ) : (
              data?.recent_activity.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-3 rounded-lg border border-border bg-white/[0.02] p-4 transition-colors hover:border-primary/10 md:grid-cols-[1fr_160px_100px]"
                >
                  <div>
                    <p className="line-clamp-2 text-sm">{item.prompt}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge variant="secondary">{item.task_type}</Badge>
                      <Badge variant="secondary">{item.complexity}</Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">{item.model_used}</p>
                    <p className="text-xs">{new Date(item.created_at).toLocaleString()}</p>
                  </div>
                  <div className="text-sm font-semibold text-primary">{formatMs(item.latency_ms)}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function DistributionCard({
  title,
  data,
  icon,
  loading,
}: {
  title: string;
  data: Record<string, number>;
  icon: React.ReactNode;
  loading: boolean;
}) {
  const total = Object.values(data).reduce((sum, v) => sum + v, 0) || 1;
  const entries = Object.entries(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-8 w-full" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet.</p>
        ) : (
          entries.map(([key, value]) => (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="capitalize text-muted-foreground">{key}</span>
                <span className="font-medium">{value}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(value / total) * 100}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
