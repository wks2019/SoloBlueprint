const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not configured");

    const { ideaName, country, businessType, tone, blueprintId } = await req.json();

    const c = country || "United Kingdom";
    const bt = businessType || "online";

    const systemPrompt = `You are SoloBlueprint. Return a 6-week action roadmap as JSON.
Country: ${c}. Business type: ${bt}.
No em dashes. Plain English. Be specific to the idea.

Return ONLY a JSON object with one key "weeks" containing an array of exactly 6 objects.
Each object: { "week": number, "phase": string, "title": string, "hours": string, "task": string, "why": string, "resource": { "type": "BOOK" or "VIDEO" or "TOOL", "title": string, "description": string } }
Phases: FOUNDATION (weeks 1-2), VALIDATION (weeks 3-4), LAUNCH (weeks 5-6).
Return ONLY valid JSON. No markdown.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2500,
        system: systemPrompt,
        messages: [{ role: "user", content: `Business idea: ${ideaName}\nCountry: ${c}\nBusiness type: ${bt}\nGenerate the 6-week roadmap now.` }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const err = await response.text();
      console.error("Claude error:", response.status, err);
      return new Response(JSON.stringify({ error: "Roadmap generation failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "";

    let roadmap: Record<string, unknown> = {};
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      roadmap = JSON.parse(clean);
    } catch (_) {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) { try { roadmap = JSON.parse(match[0]); } catch (_) {} }
    }

    if (!roadmap?.weeks) {
      console.error("No weeks in roadmap:", text.slice(0, 200));
      return new Response(JSON.stringify({ error: "Roadmap parse failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save roadmap to blueprint if we have an ID
    if (blueprintId && SUPABASE_URL && SERVICE_ROLE) {
      try {
        const bpRes = await fetch(`${SUPABASE_URL}/rest/v1/blueprints?id=eq.${blueprintId}&select=report`, {
          headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` },
        });
        const bpData = await bpRes.json();
        const currentReport = bpData?.[0]?.report ?? {};
        await fetch(`${SUPABASE_URL}/rest/v1/blueprints?id=eq.${blueprintId}`, {
          method: "PATCH",
          headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}`, "Content-Type": "application/json", Prefer: "return=minimal" },
          body: JSON.stringify({ report: { ...currentReport, roadmap } }),
        });
      } catch (_) {}
    }

    return new Response(JSON.stringify({ roadmap }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("generate-roadmap error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
