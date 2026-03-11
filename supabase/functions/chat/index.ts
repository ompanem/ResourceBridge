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

FIELD RULES:
- relevanceLevel: exactly one of "Local", "Statewide", "National", or "Online"
- urgencyLevel: exactly one of "Immediate Help", "Same-Day Help", "Short-Term Support", or "Long-Term Support"
  - "Immediate Help" = 24/7 hotlines, call-right-now services
  - "Same-Day Help" = walk-in services, pantries open today, same-day appointments
  - "Short-Term Support" = programs available within days/weeks, food banks, distribution events
  - "Long-Term Support" = SNAP, housing programs, training programs requiring applications
- whatYouMayNeed: 2–5 short phrases. Use simple language. Add "(if available)" when requirements vary. Examples: "Photo ID", "Proof of residency (utility bill or lease)", "Proof of income (if available)"
- nextSteps: exactly 3 numbered action items. Each should be a clear, specific instruction. When urgent, emphasize immediate actions first. Example: "1. Call 2-1-1 to find food pantries open today in your area."`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { situation, state, city, category, simplifyLanguage, urgent } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let userPrompt = situation || "";
    if (category) userPrompt += `\nCategory focus: ${category}`;

    let systemContent = SYSTEM_PROMPT;
    if (state) {
      systemContent += `\n\nThe user is located in ${state}${city ? `, ${city}` : ""}. Prioritize local resources in or near this area.`;
    }
    if (simplifyLanguage) {
      systemContent += `\n\nIMPORTANT: Use very simple words, short sentences, and a 5th-grade reading level. Avoid jargon and complex terms. Be extra clear and direct.`;
    }
    if (urgent) {
      systemContent += `\n\nURGENT MODE — CRITICAL:
- The user needs help RIGHT NOW, today, or within 24 hours.
- You MUST provide a "startHere" field: a single clear sentence telling the user the #1 immediate action to take right now. Example: "Call 2-1-1 right now to speak with a specialist who can locate food pantries open today in your area."
- Order resources by speed of access:
  Priority 1: Immediate contact — 24/7 hotlines, crisis lines (urgencyLevel: "Immediate Help")
  Priority 2: Same-day walk-in services — food pantries, shelters, clinics (urgencyLevel: "Same-Day Help")
  Priority 3: Short-term regional programs — food banks, distribution events (urgencyLevel: "Short-Term Support")
  Priority 4: Long-term application-based programs — SNAP, housing (urgencyLevel: "Long-Term Support")
- For each resource, mention in the description HOW QUICKLY help is available (e.g. "Available 24/7", "Walk-in hours Mon-Fri 9am-4pm", "Same-day assistance").
- Prefer local same-day options over national programs with longer processes.
- nextSteps should focus on what to do RIGHT NOW.`;
    } else {
      systemContent += `\n\nSet startHere to null since this is not an urgent request.`;
    }

    const toolParams: Record<string, unknown> = {
      situationSummary: { type: "string", description: "Warm, conversational summary referencing the user's situation directly. Use 'you' and 'your'. 1-2 sentences." },
      startHere: { type: ["string", "null"], description: "If urgent: one clear sentence with the #1 immediate action. If not urgent: null." },
      resources: {
        type: "array",
        items: {
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
        },
      },
      nextSteps: {
        type: "array",
        items: { type: "string" },
        description: "Exactly 3 numbered action items. Clear, specific instructions. Start each with a number and period.",
      },
    };

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
        tools: [
          {
            type: "function",
            function: {
              name: "provide_resources",
              description: "Return structured resource recommendations for the user's situation.",
              parameters: {
                type: "object",
                properties: toolParams,
                required: ["situationSummary", "startHere", "resources", "nextSteps"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "provide_resources" } },
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
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();

    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(result));
      return new Response(JSON.stringify({
        situationSummary: "We found some resources that may help.",
        startHere: null,
        resources: [],
        nextSteps: ["Please try rephrasing your request for better results."],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(toolCall.function.arguments);
    } catch {
      console.error("Failed to parse tool call arguments:", toolCall.function.arguments);
      return new Response(JSON.stringify({
        situationSummary: "We found some resources that may help.",
        startHere: null,
        resources: [],
        nextSteps: ["Please try again with more detail about your situation."],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ensure startHere has a default
    if (parsed.startHere === undefined) parsed.startHere = null;

    // Validate links in parallel — set link to null for broken URLs
    if (parsed.resources && Array.isArray(parsed.resources)) {
      await Promise.all(
        parsed.resources.map(async (r: Record<string, unknown>) => {
          if (!r.relevanceLevel) r.relevanceLevel = "National";
          if (!r.urgencyLevel) r.urgencyLevel = "Long-Term Support";
          if (!Array.isArray(r.whatYouMayNeed)) r.whatYouMayNeed = [];

          const link = r.link as string | null | undefined;
          if (!link || !link.startsWith("https://")) {
            r.link = null;
            return;
          }
          try {
            const check = await fetch(link, {
              method: "HEAD",
              redirect: "follow",
              signal: AbortSignal.timeout(5000),
            });
            if (check.status < 400) return;
            if (check.status === 405) {
              const getCheck = await fetch(link, {
                method: "GET",
                redirect: "follow",
                signal: AbortSignal.timeout(5000),
              });
              if (getCheck.status < 400) return;
            }
            console.warn(`Link failed: ${r.name} — ${link} (${check.status})`);
            r.link = null;
          } catch (err) {
            console.warn(`Link error: ${r.name} — ${link}`, err);
            r.link = null;
          }
        })
      );
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
