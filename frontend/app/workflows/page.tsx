import { ArrowRight, CheckCircle2, Code2, GitBranch, Route, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  { title: "Router Agent", icon: Route, detail: "Classifies task type, complexity, confidence, and routing constraints." },
  { title: "Planner Agent", icon: GitBranch, detail: "Adds an execution plan for medium and complex requests." },
  { title: "Coding Agent", icon: Code2, detail: "Handles implementation, debugging, API, and architecture prompts." },
  { title: "Validation Agent", icon: ShieldCheck, detail: "Checks empty output, malformed JSON, hallucination markers, and completeness." },
];

export default function WorkflowsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Agent Workflows</h1>
        <p className="mt-1 text-sm text-muted-foreground">The runtime path from user prompt to validated response.</p>
      </div>

      <section className="rounded-lg border border-border bg-black/18 p-5 backdrop-blur-xl">
        <div className="grid gap-4 xl:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="relative rounded-lg border border-border bg-card/78 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-primary/30 bg-primary/12 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge>Step {index + 1}</Badge>
                </div>
                <h2 className="mt-4 text-base font-semibold">{step.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.detail}</p>
                {index < steps.length - 1 ? (
                  <ArrowRight className="absolute -right-5 top-1/2 hidden h-5 w-5 text-primary xl:block" />
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Routing Rules</CardTitle>
            <CardDescription>Rules are deterministic first, provider-agnostic by design.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Short and simple prompts use llama3.",
              "Coding and debugging prompts use deepseek-coder.",
              "Complex reasoning prompts use deepseek-r1.",
              "Low classifier confidence escalates to the stronger reasoning route.",
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-md border border-border bg-white/[0.04] p-3 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Future Providers</CardTitle>
            <CardDescription>Ollama is the default provider, with room for commercial model APIs.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            {["OpenAI GPT APIs", "Anthropic Claude APIs", "Google Gemini APIs", "ChromaDB retrieval"].map((item) => (
              <div key={item} className="rounded-md border border-border bg-white/[0.04] p-4">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

