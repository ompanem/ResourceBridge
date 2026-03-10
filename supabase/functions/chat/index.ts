import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are ResourceBridge, a helpful social resource assistant. Your job is to help users find real programs, services, and organizations that could assist them.

Rules:
- Always return 3–5 resources
- LINK RULES (CRITICAL):
  - Every link must be the organization's main homepage URL (e.g. "https://www.feedingamerica.org" NOT "https://www.feedingamerica.org/find-your-local-foodbank/results")
  - NEVER guess deep page paths, subpages, or query strings — only use the root domain or a well-known top-level path you are certain exists
  - Every link must start with https://
  - Only link to real, well-known organizations you are confident exist
  - When in doubt, use the broadest valid URL (homepage) rather than a specific subpage
- No markdown links, no partial URLs, no fake placeholders
- If exact local resources are uncertain, provide reputable statewide or national organizations and say so clearly
- Your tone should be supportive, simple, and practical
- Focus on actionable information`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { situation, state, city, category, simplifyLanguage } = await req.json();
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
                properties: {
                  situationSummary: { type: "string", description: "Brief summary of the user's situation in 1-2 sentences." },
                  resources: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        category: { type: "string" },
                        description: { type: "string" },
                        whyThisHelps: { type: "string" },
                        locationRelevance: { type: "string" },
                        link: { type: "string", description: "Full absolute URL starting with https://" },
                      },
                      required: ["name", "category", "description", "whyThisHelps", "locationRelevance", "link"],
                      additionalProperties: false,
                    },
                  },
                  nextSteps: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: ["situationSummary", "resources", "nextSteps"],
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

    // Extract tool call arguments
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(result));
      return new Response(JSON.stringify({
        situationSummary: "We found some resources that may help.",
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
        resources: [],
        nextSteps: ["Please try again with more detail about your situation."],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
