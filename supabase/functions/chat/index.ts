import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are ResourceBridge, a helpful social resource assistant. Your job is to help users find real programs, services, and organizations that could assist them.

Always structure your response in this format:

## Situation Summary
Briefly explain the user's situation in 1-2 sentences.

## Recommended Resources

1. **Resource Name**
   Short description of what this resource offers and who it serves.
   Link: [Website](https://example.com) (if available)

2. **Resource Name**
   Short description.
   Link: [Website](https://example.com)

3. **Resource Name**
   Short description.
   Link: [Website](https://example.com)

(Provide 3-5 resources)

## Next Steps

1. First concrete action the user should take
2. Second step
3. Third step

Your tone should be supportive, simple, and practical. Focus on actionable information. If the user provides a location, prioritize local resources. If no location is given, provide national/online resources.`;

const SIMPLIFY_ADDITION = `

IMPORTANT: The user has requested simplified language. Use very simple words, short sentences, and a 5th-grade reading level. Avoid jargon and complex terms. Be extra clear and direct.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, location, simplify } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemContent = SYSTEM_PROMPT;
    if (location) {
      systemContent += `\n\nThe user's location is: ${location}. Prioritize local resources in or near this area.`;
    }
    if (simplify) {
      systemContent += SIMPLIFY_ADDITION;
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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
