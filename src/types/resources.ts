/** Response mode from the AI edge function */
export type ResponseMode = "resources" | "guidance" | "clarification" | "error";

export type RelevanceLevel = "Local" | "Statewide" | "National" | "Online";

export type UrgencyLevel =
  | "Immediate Help"
  | "Same-Day Help"
  | "Short-Term Support"
  | "Long-Term Support";

/** Shape of a single resource returned by the AI */
export interface Resource {
  name: string;
  category: string;
  description: string;
  whyThisHelps: string;
  locationRelevance: string;
  relevanceLevel: RelevanceLevel;
  urgencyLevel?: UrgencyLevel;
  whatYouMayNeed: string[];
  link: string | null;
  isVerifiedLink?: boolean;
}

/** Full AI response envelope */
export interface AIResponse {
  mode: ResponseMode;
  message?: string | null;
  situationSummary?: string | null;
  startHere?: string | null;
  resources: Resource[];
  nextSteps: string[];
  suggestedPrompts: string[];
}

export interface SavedResource extends Resource {
  savedAt: string;
  situationSummary: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content?: string;
  location?: string | null;
  data?: AIResponse;
  isLoading?: boolean;
}
