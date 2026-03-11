/** Shape returned by the AI edge function */
export interface Resource {
  name: string;
  category: string;
  description: string;
  whyThisHelps: string;
  locationRelevance: string;
  relevanceLevel: "Local" | "Statewide" | "National" | "Online";
  urgencyLevel?: "Immediate Help" | "Same-Day Help" | "Short-Term Support" | "Long-Term Support";
  whatYouMayNeed: string[];
  link: string | null;
}

export interface AIResponse {
  situationSummary: string;
  startHere?: string | null;
  resources: Resource[];
  nextSteps: string[];
}

export interface SavedResource extends Resource {
  savedAt: string;
  situationSummary: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content?: string;
  data?: AIResponse;
  isLoading?: boolean;
}
