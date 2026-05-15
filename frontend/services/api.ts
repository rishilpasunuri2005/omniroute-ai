import type { AnalyticsResponse, ChatMessage, ChatResponse, ModelInfo, StreamEvent } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function sendChat(prompt: string, conversationId: string | null, history: ChatMessage[]) {
  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, conversation_id: conversationId, history, stream: false }),
  });
  return parseResponse<ChatResponse>(response);
}

export async function streamChat(
  prompt: string,
  conversationId: string | null,
  history: ChatMessage[],
  onEvent: (event: StreamEvent) => void,
) {
  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, conversation_id: conversationId, history, stream: true }),
  });

  if (!response.ok || !response.body) {
    throw new Error(await response.text());
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (line.trim()) onEvent(JSON.parse(line) as StreamEvent);
    }
  }
}

export async function fetchAnalytics() {
  return parseResponse<AnalyticsResponse>(await fetch(`${API_URL}/analytics`, { cache: "no-store" }));
}

export async function fetchModels() {
  return parseResponse<ModelInfo[]>(await fetch(`${API_URL}/models`, { cache: "no-store" }));
}

