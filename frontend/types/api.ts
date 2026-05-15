export type TaskType = "summarization" | "coding" | "reasoning" | "extraction" | "planning" | "debugging";
export type Complexity = "simple" | "medium" | "complex";

export interface Classification {
  task_type: TaskType;
  complexity: Complexity;
  confidence: number;
}

export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface ValidationResult {
  passed: boolean;
  risk_level: "low" | "medium" | "high";
  issues: string[];
}

export interface WorkflowStep {
  agent: string;
  status: string;
  detail: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  conversation_id: string;
  response: string;
  model_used: string;
  latency_ms: number;
  usage: Usage;
  classification: Classification;
  validation: ValidationResult;
  workflow_trace: WorkflowStep[];
  estimated_cost: number;
}

export interface AnalyticsResponse {
  total_requests: number;
  total_tokens: number;
  average_latency_ms: number;
  estimated_cost: number;
  estimated_cost_savings: number;
  routing_distribution: Record<string, number>;
  model_utilization: Record<string, number>;
  task_type_distribution: Record<string, number>;
  recent_activity: Array<{
    id: string;
    prompt: string;
    model_used: string;
    complexity: string;
    task_type: string;
    latency_ms: number;
    created_at: string;
  }>;
}

export interface ModelInfo {
  name: string;
  role: string;
  provider: string;
  available: boolean;
  context_window: number | null;
}

export type StreamEvent =
  | { type: "status"; message: string }
  | { type: "metadata"; model_used: string; classification: Classification; latency_ms: number; usage: Usage }
  | { type: "token"; content: string }
  | { type: "done"; result: ChatResponse };

