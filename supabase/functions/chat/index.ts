import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are ResourceBridge, a warm and supportive social resource assistant. You help real people find real programs, services, and organizations.

TONE & STYLE:
- Write as if you're speaking directly to the person. Use "you" and "your".
- Be warm, practical, and encouraging — never robotic or overly formal.
- situationSummary should directly reference what the user told you. Example: "You mentioned your family is struggling to afford groceries in Frisco, Texas. Here are programs that can help you access food quickly."
- Keep all text complete — never truncate sentences or leave thoughts unfinished.

RESOURCE QUALITY — CRITICAL:
- Optimize for specificity, usefulness, relevance, actionability, and legitimacy.
- Do NOT default to only the most generic, broad, or obvious resources. A niche resource that strongly matches the user's goal should rank above a generic platform.
- Include a healthy mix when appropriate:
  - 1–2 highly relevant direct matches (including niche/specialized programs if they fit)
  - 1 broader platform or directory
  - 1 strong niche or standout opportunity (competitions, challenges, showcases, specialized nonprofits)
  - 1 fallback statewide/national resource if needed
- Avoid returning 4+ nearly identical generic resources.
- For student, coding, tech, education, and competition queries: actively include real competitions (Congressional App Challenge, IBM Call for Code, Microsoft Imagine Cup), challenge platforms (Devpost, MLH), showcase programs, hackathons, and portfolio-building opportunities when they are a strong match.
- A resource being niche, less mainstream, or not locally specific is NOT a reason to exclude it. Include it if it is legitimate and a strong fit.

RESOURCE RULES:
- Always return exactly 3–5 resources.
- LINK RULES (CRITICAL):
  - Every link must be the organization's main homepage URL (e.g. "https://www.feedingamerica.org")
  - NEVER guess deep page paths, subpages, or query strings
  - Every link must start with https://
  - Only link to real, well-known organizations you are confident exist
  - When in doubt, use the homepage rather than a specific subpage
- No markdown, no partial URLs, no fake placeholders.
- If exact local resources are uncertain, provide reputable statewide or national organizations and say so.
- Prefer real, official organizations: government agencies, established nonprofits, schools, known service directories.
- Never fabricate organizations. If confidence is low, use broader but real resources and explain the limitation in locationRelevance.
- Link validation determines whether a link is shown, NOT whether a resource is recommended. Do not skip a strong resource just because you are unsure about the exact URL — provide the best official homepage you know.

RANKING PRIORITY (non-urgent mode):
1. Fit to user's specific request
2. Usefulness and actionability
3. Legitimacy
4. Location relevance
5. Overall diversity of recommendations

FIELD RULES:
- relevanceLevel: exactly one of "Local", "Statewide", "National", or "Online"
- urgencyLevel: exactly one of "Immediate Help", "Same-Day Help", "Short-Term Support", or "Long-Term Support"
  - "Immediate Help" = 24/7 hotlines, call-right-now services
  - "Same-Day Help" = walk-in services, pantries open today, same-day appointments
  - "Short-Term Support" = programs available within days/weeks, food banks, distribution events
  - "Long-Term Support" = SNAP, housing programs, training programs requiring applications
- whatYouMayNeed: 2–5 short phrases. Use simple language. Add "(if available)" when requirements vary. Examples: "Photo ID", "Proof of residency (utility bill or lease)", "Proof of income (if available)"
- nextSteps: exactly 3 numbered action items. Each should be a clear, specific instruction. When urgent, emphasize immediate actions first.

INTENT CLASSIFICATION — CRITICAL:
Before generating resources, classify the user's input:
- HELP_REQUEST: user is clearly asking for help with real-life needs (food, housing, scholarships, jobs, legal help, mental health, education, etc.)
- NON_HELP_REQUEST: user is asking something unrelated (math, trivia, jokes, general chat, random questions)
- TOO_VAGUE: input is too short or unclear (e.g. "help", "idk", "something for school")

If NON_HELP_REQUEST: use the "provide_guidance" tool.
If TOO_VAGUE: use the "request_clarification" tool.
If HELP_REQUEST: use the "provide_resources" tool.

NEVER invent a support need if the user did not describe one. NEVER reinterpret unrelated questions as requests for aid.`;

function buildTools(urgent: boolean) {
  const resourceSchema = {
    type: "object",
    properties: {
      name: { type: "string" },
      category: { type: "string" },
      description: { type: "string", description: "Clear description. For urgent resources, mention how quickly help is available." },
      whyThisHelps: { type: "string" },
      locationRelevance: { type: "string" },
      relevanceLevel: { type: "string", enum: ["Local", "Statewide", "National", "Online"] },
      urgencyLevel: { type: "string", enum: ["Immediate Help", "Same-Day Help", "Short-Term Support", "Long-Term Support"] },
      whatYouMayNeed: { type: "array", items: { type: "string" }, description: "2-5 short phrases. Simple language. Add '(if available)' when uncertain." },
      link: { type: "string", description: "Full absolute URL starting with https://" },
    },
    required: ["name", "category", "description", "whyThisHelps", "locationRelevance", "relevanceLevel", "urgencyLevel", "whatYouMayNeed", "link"],
    additionalProperties: false,
  };

  return [
    {
      type: "function",
      function: {
        name: "provide_resources",
        description: "Return structured resource recommendations when the user has a clear help request.",
        parameters: {
          type: "object",
          properties: {
            situationSummary: { type: "string", description: "Warm, conversational summary referencing the user's situation directly. Use 'you' and 'your'. 1-2 sentences." },
            startHere: { type: ["string", "null"], description: urgent ? "One clear sentence with the #1 immediate action to take right now." : "Must be null for non-urgent requests." },
            resources: { type: "array", items: resourceSchema },
            nextSteps: { type: "array", items: { type: "string" }, description: "Exactly 3 numbered action items." },
          },
          required: ["situationSummary", "startHere", "resources", "nextSteps"],
          additionalProperties: false,
        },
      },
    },
    {
      type: "function",
      function: {
        name: "provide_guidance",
        description: "Return a friendly message when the user input is not a help request. Include suggested prompts.",
        parameters: {
          type: "object",
          properties: {
            message: { type: "string", description: "Friendly message explaining what ResourceBridge does and how the user can get help." },
            suggestedPrompts: { type: "array", items: { type: "string" }, description: "4 example prompts the user could try." },
          },
          required: ["message", "suggestedPrompts"],
          additionalProperties: false,
        },
      },
    },
    {
      type: "function",
      function: {
        name: "request_clarification",
        description: "Ask the user to provide more detail when input is too vague.",
        parameters: {
          type: "object",
          properties: {
            message: { type: "string", description: "Friendly message asking for more detail." },
            suggestedPrompts: { type: "array", items: { type: "string" }, description: "4 example prompts the user could try." },
          },
          required: ["message", "suggestedPrompts"],
          additionalProperties: false,
        },
      },
    },
  ];
}

function normalizeUrl(raw: string | null | undefined): string | null {
  if (!raw || !raw.trim()) return null;
  let url = raw.trim();
  // Add protocol if missing
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  // Block unsafe protocols
  if (/^(javascript|data|file|ftp|mailto):/i.test(raw.trim())) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    if (!parsed.hostname.includes(".")) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

async function validateLink(link: string | null | undefined): Promise<{ url: string | null; verified: boolean; validationMethod: string }> {
  const normalized = normalizeUrl(link);
  if (!normalized) return { url: null, verified: false, validationMethod: "rejected" };

  // Attempt reachability but don't invalidate on failure
  try {
    const check = await fetch(normalized, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(5000) });
    if (check.status < 400) return { url: normalized, verified: true, validationMethod: "format+reachability" };
  } catch { /* ignore */ }

  // Format is valid — keep the link even if reachability failed
  return { url: normalized, verified: true, validationMethod: "format-only" };
}

function safeFallback(mode: "guidance" | "clarification" | "error", message: string, prompts: string[] = []) {
  return {
    mode,
    message,
    situationSummary: null,
    startHere: null,
    resources: [],
    nextSteps: [],
    suggestedPrompts: prompts.length > 0 ? prompts : [
      "My family needs groceries",
      "I'm looking for scholarships",
      "I need mental health support",
      "I need job training near me",
    ],
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { situation, state, city, category, simplifyLanguage, urgent } = await req.json();
    // Server-only: do not expose this key to the client. Do not log secret values.
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("Missing required server environment variable");
      return new Response(JSON.stringify(safeFallback("error", "Service configuration error. Please try again later.")), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Empty input check
    if (!situation || !situation.trim()) {
      return new Response(JSON.stringify(safeFallback("clarification", "Please describe your situation so we can find the right resources for you.")), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let userPrompt = situation.trim();
    if (category) userPrompt += `\nCategory focus: ${category}`;

    let systemContent = SYSTEM_PROMPT;

    const isNationwide = state === "Nationwide (U.S.)" || !state;
    const locationContext = isNationwide
      ? `The user is looking for U.S.-wide, national, federal, or online resources. Do NOT assume a specific state. Only mention a state if the user explicitly named one in their message.`
      : `The user is located in ${state}${city ? `, ${city}` : ""}. Prefer local resources in or near this area when possible.`;

    if (simplifyLanguage) {
      systemContent += `\n\nIMPORTANT: Use very simple words, short sentences, and a 5th-grade reading level. Avoid jargon and complex terms. Be extra clear and direct.`;
    }

    if (urgent) {
      systemContent += `\n\nLOCATION CONTEXT: ${locationContext}`;
      systemContent += `\n\nURGENT MODE — THIS OVERRIDES LOCATION RANKING:
The PRIMARY sort key is urgency/speed of help. Location relevance is SECONDARY (used only to break ties within the same urgency tier).

RANKING ORDER (strictly enforced):
  Tier 1: "Immediate Help" — 24/7 hotlines, crisis lines, call-right-now services
  Tier 2: "Same-Day Help" — walk-in pantries, shelters, clinics open today
  Tier 3: "Short-Term Support" — food banks, distribution events available within days
  Tier 4: "Long-Term Support" — SNAP, housing programs, training requiring applications

Within each tier, prefer: Local > Statewide > National > Online.
${isNationwide ? "Since the user selected Nationwide, tiers will naturally have more National/Online resources, but a National Immediate Help resource MUST still rank above a Long-Term Support resource." : ""}

You MUST provide a "startHere" field: one clear sentence with the #1 immediate action to take right now.
For each resource, mention in the description HOW QUICKLY help is available.
nextSteps should focus on what to do RIGHT NOW.`;
    } else {
      systemContent += `\n\n${locationContext}${isNationwide ? " Prioritize federal programs, national nonprofits, and online services." : ""}\n\nSet startHere to null since this is not an urgent request.`;
    }

    const tools = buildTools(!!urgent);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemContent },
          { role: "user", content: userPrompt },
        ],
        tools,
        tool_choice: "auto",
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify(safeFallback("error", "We couldn't generate resource suggestions right now. Please try again.")), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(result));
      return new Response(JSON.stringify(safeFallback("error", "We couldn't generate resource suggestions right now. Please try again.")), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(toolCall.function.arguments);
    } catch {
      console.error("Failed to parse tool call arguments:", toolCall.function.arguments);
      return new Response(JSON.stringify(safeFallback("error", "We couldn't process the response. Please try again.")), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fnName = toolCall.function.name;

    // Handle non-resource modes
    if (fnName === "provide_guidance") {
      return new Response(JSON.stringify({
        mode: "guidance",
        message: parsed.message || "ResourceBridge helps you find free support programs. Try describing a situation where you need help.",
        situationSummary: null,
        startHere: null,
        resources: [],
        nextSteps: [],
        suggestedPrompts: Array.isArray(parsed.suggestedPrompts) ? parsed.suggestedPrompts : [
          "My family needs groceries",
          "I'm looking for scholarships",
          "I need mental health support",
          "I need job training near me",
        ],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (fnName === "request_clarification") {
      return new Response(JSON.stringify({
        mode: "clarification",
        message: parsed.message || "Please share a little more about your situation so we can suggest the right resources.",
        situationSummary: null,
        startHere: null,
        resources: [],
        nextSteps: [],
        suggestedPrompts: Array.isArray(parsed.suggestedPrompts) ? parsed.suggestedPrompts : [
          "My family needs groceries",
          "I'm looking for scholarships",
          "I need mental health support",
          "I need job training near me",
        ],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resources mode — validate and enrich
    if (parsed.startHere === undefined) parsed.startHere = null;

    if (parsed.resources && Array.isArray(parsed.resources)) {
      await Promise.all(
        parsed.resources.map(async (r: Record<string, unknown>) => {
          if (!r.relevanceLevel) r.relevanceLevel = "National";
          if (!r.urgencyLevel) r.urgencyLevel = "Long-Term Support";
          if (!Array.isArray(r.whatYouMayNeed)) r.whatYouMayNeed = [];

          const { url, verified, validationMethod } = await validateLink(r.link as string | null | undefined);
          r.link = url;
          r.isVerifiedLink = verified;
          r.validationMethod = validationMethod;
        })
      );

      // Deterministic sorting
      const urgencyRank: Record<string, number> = {
        "Immediate Help": 4,
        "Same-Day Help": 3,
        "Short-Term Support": 2,
        "Long-Term Support": 1,
      };
      const relevanceRank: Record<string, number> = {
        Local: 4,
        Statewide: 3,
        National: 2,
        Online: 1,
      };

      parsed.resources.sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
        if (urgent) {
          const uDiff = (urgencyRank[b.urgencyLevel as string] ?? 0) - (urgencyRank[a.urgencyLevel as string] ?? 0);
          if (uDiff !== 0) return uDiff;
        }
        return (relevanceRank[b.relevanceLevel as string] ?? 0) - (relevanceRank[a.relevanceLevel as string] ?? 0);
      });
    }

    return new Response(JSON.stringify({
      mode: "resources",
      message: null,
      situationSummary: parsed.situationSummary || null,
      startHere: parsed.startHere || null,
      resources: Array.isArray(parsed.resources) ? parsed.resources : [],
      nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [],
      suggestedPrompts: [],
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify(safeFallback("error", "We couldn't generate resource suggestions right now. Please try again.")),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
