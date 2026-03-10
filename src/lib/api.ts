import type { AIResponse } from "@/types/resources";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export interface ChatRequest {
  situation: string;
  state: string;
  city?: string;
  category?: string;
  simplifyLanguage?: boolean;
}

/**
 * Calls the chat edge function and returns structured JSON.
 * No streaming — we need valid JSON back.
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

  // Validate basic shape
  if (!data.situationSummary || !Array.isArray(data.resources) || !Array.isArray(data.nextSteps)) {
    throw new Error("Received an unexpected response format. Please try again.");
  }

  return data as AIResponse;
}
