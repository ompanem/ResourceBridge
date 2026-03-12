import type { AIResponse } from "@/types/resources";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export interface ChatRequest {
  situation: string;
  state: string;
  city?: string;
  category?: string;
  simplifyLanguage?: boolean;
  urgent?: boolean;
}

/**
 * Calls the chat edge function and returns structured JSON.
 * Handles all response modes safely.
 */
export async function fetchResources(req: ChatRequest): Promise<AIResponse> {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify(req),
  });

  if (!resp.ok) {
    if (resp.status === 429) throw new Error("Too many requests. Please wait a moment and try again.");
    if (resp.status === 402) throw new Error("Service temporarily unavailable. Please try again later.");
    throw new Error("Something went wrong. Please try again.");
  }

  const data = await resp.json();

  // Normalize to safe defaults
  return {
    mode: data.mode || "resources",
    message: data.message ?? null,
    situationSummary: data.situationSummary ?? null,
    startHere: data.startHere ?? null,
    resources: Array.isArray(data.resources) ? data.resources : [],
    nextSteps: Array.isArray(data.nextSteps) ? data.nextSteps : [],
    suggestedPrompts: Array.isArray(data.suggestedPrompts) ? data.suggestedPrompts : [],
  } as AIResponse;
}
