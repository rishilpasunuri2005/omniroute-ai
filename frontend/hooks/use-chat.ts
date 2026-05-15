"use client";

import { useMemo, useState } from "react";

import { streamChat } from "@/services/api";
import type { ChatMessage, ChatResponse, Classification, Usage, WorkflowStep } from "@/types/api";

interface UiMessage extends ChatMessage {
  id: string;
  metadata?: {
    model?: string;
    latencyMs?: number;
    usage?: Usage;
    classification?: Classification;
    workflow?: WorkflowStep[];
  };
}

export function useChat() {
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Route a prompt through OmniRoute AI to see complexity classification, model selection, validation, latency, and token usage.",
    },
  ]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ChatResponse | null>(null);

  const apiHistory = useMemo(
    () => messages.filter((item) => item.id !== "welcome").map(({ role, content }) => ({ role, content })),
    [messages],
  );

  async function submit(prompt: string) {
    if (!prompt.trim() || isLoading) return;
    setError(null);
    setIsLoading(true);
    const userMessage: UiMessage = { id: crypto.randomUUID(), role: "user", content: prompt.trim() };
    const assistantId = crypto.randomUUID();
    setMessages((current) => [
      ...current,
      userMessage,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    try {
      await streamChat(prompt.trim(), conversationId, apiHistory, (event) => {
        if (event.type === "token") {
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantId ? { ...message, content: message.content + event.content } : message,
            ),
          );
        }
        if (event.type === "metadata") {
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantId
                ? {
                    ...message,
                    metadata: {
                      model: event.model_used,
                      latencyMs: event.latency_ms,
                      usage: event.usage,
                      classification: event.classification,
                    },
                  }
                : message,
            ),
          );
        }
        if (event.type === "done") {
          setConversationId(event.result.conversation_id);
          setLastResult(event.result);
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantId
                ? {
                    ...message,
                    content: event.result.response,
                    metadata: {
                      model: event.result.model_used,
                      latencyMs: event.result.latency_ms,
                      usage: event.result.usage,
                      classification: event.result.classification,
                      workflow: event.result.workflow_trace,
                    },
                  }
                : message,
            ),
          );
        }
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to route request");
    } finally {
      setIsLoading(false);
    }
  }

  return { messages, isLoading, error, lastResult, submit };
}

