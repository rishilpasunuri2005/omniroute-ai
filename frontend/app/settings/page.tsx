import { SlidersHorizontal } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const settings = [
  ["API URL", "NEXT_PUBLIC_API_URL", "http://localhost:8000"],
  ["Ollama URL", "OLLAMA_BASE_URL", "http://localhost:11434"],
  ["Confidence Threshold", "ROUTE_CONFIDENCE_THRESHOLD", "0.62"],
  ["Fallback Model", "FALLBACK_MODEL", "phi3"],
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Runtime configuration is environment-driven for deployable services.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            Environment Variables
          </CardTitle>
          <CardDescription>Edit `.env` files or container environment values to change these settings.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {settings.map(([label, key, value]) => (
            <label key={key} className="space-y-2">
              <span className="text-sm text-muted-foreground">{label}</span>
              <Input readOnly value={`${key}=${value}`} />
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Production Notes</CardTitle>
          <CardDescription>Recommended hardening before public deployment.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-3">
          <div className="rounded-md border border-border bg-white/[0.04] p-4">Add auth and per-user rate limits.</div>
          <div className="rounded-md border border-border bg-white/[0.04] p-4">Move schema creation to Alembic migrations.</div>
          <div className="rounded-md border border-border bg-white/[0.04] p-4">Add provider adapters for hosted model APIs.</div>
        </CardContent>
      </Card>
    </div>
  );
}

