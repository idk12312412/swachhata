import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image_base64 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a waste classification expert. Analyze the image and return a JSON response with these exact fields:
- classification_type: one of "recycle", "reuse", "keep", or "dispose"
- material_type: the primary material (e.g., "plastic", "glass", "paper", "metal", "organic", "e-waste", "textile", "mixed")
- co2_saved: estimated CO₂ savings in kg (numeric, 0.1-5.0 range)
- confidence: your confidence level 0.0-1.0
- item_description: brief description of the item (2-5 words)
- recycling_steps: step-by-step instructions for proper disposal/recycling (2-4 steps)
- condition_warning: if the item is in very bad condition and shouldn't be recycled, include a warning message. Otherwise null.
- is_flagged: set to true ONLY if confidence is below 0.5

If the item is severely damaged/contaminated, set classification_type to "dispose" and include a condition_warning.

Return ONLY valid JSON, no markdown.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Classify this waste item." },
              { type: "image_url", image_url: { url: image_base64 } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI classification failed");
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content;

    // Parse JSON from response (handle potential markdown wrapping)
    let parsed;
    try {
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", content);
      // Return a flagged result
      parsed = {
        classification_type: null,
        material_type: "unknown",
        co2_saved: 0,
        confidence: 0.1,
        item_description: "Unrecognized item",
        recycling_steps: "",
        condition_warning: null,
        is_flagged: true,
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("classify-waste error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
