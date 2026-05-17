import type { AnalyticsResponse, ChatMessage, ModelInfo, StreamEvent } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function authHeaders(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function streamChat(
  token: string | null,
  prompt: string,
  conversationId: string | null,
  history: ChatMessage[],
  onEvent: (event: StreamEvent) => void,
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90_000);

  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify({ prompt, conversation_id: conversationId, history, stream: true }),
      signal: controller.signal,
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
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      onEvent({ type: "error", message: "Request timed out after 90 seconds. Please try a simpler prompt." } as StreamEvent);
      return;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchAnalyticsWithToken(token: string | null) {
  return parseResponse<AnalyticsResponse>(
    await fetch(`${API_URL}/analytics`, { cache: "no-store", headers: authHeaders(token) }),
  );
}

export async function fetchModels(token: string | null) {
  return parseResponse<ModelInfo[]>(
    await fetch(`${API_URL}/models`, { cache: "no-store", headers: authHeaders(token) }),
  );
}
