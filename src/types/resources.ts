/** Shape returned by the AI edge function */
export interface Resource {
  name: string;
  category: string;
  description: string;
  whyThisHelps: string;
  locationRelevance: string;
  relevanceLevel: "Local" | "Statewide" | "National" | "Online";
  whatYouMayNeed: string[];
  link: string | null;
}

export interface AIResponse {
  situationSummary: string;
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
  content?: string;          // user text
  data?: AIResponse;         // structured AI response
  isLoading?: boolean;
}
