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
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not configured");

    const { ideaName, country, businessType, tone, blueprintId } = await req.json();

    const systemPrompt = `You are SoloBlueprint. Generate a personal 6-week action roadmap for a solo founder.
The founder's country is: ${country || "United Kingdom"}.
The business type is: ${businessType || "online"}.
Write in plain, direct English. No em dashes. No filler words. No corporate language.
Be specific to the idea. Every week must feel like it was written for this exact business.

Return a JSON object with one key: "weeks" — an array of exactly 6 week objects.
Each week object must have exactly these keys:
{ "week": number, "phase": string, "title": string, "hours": string, "task": string, "why": string, "resource": { "type": "BOOK" or "VIDEO" or "TOOL", "title": string, "description": string } }

Phase names: "FOUNDATION" for weeks 1-2, "VALIDATION" for weeks 3-4, "LAUNCH" for weeks 5-6.
Each task: specific, actionable, completable by one person in that week.
Each resource: a real named book, YouTube video, or tool — relevant to this exact idea.
Return ONLY valid JSON. No markdown. No explanation.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: "user", content: `Business idea: ${ideaName}\nCountry: ${country || "United Kingdom"}\nBusiness type: ${businessType || "online"}\n\nGenerate the 6-week roadmap.` }],
      }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Roadmap generation failed." }), {
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

    // Update blueprint record with roadmap if we have an ID
    if (blueprintId && SUPABASE_URL && SERVICE_ROLE && roadmap?.weeks) {
      try {
        // Get current report
        const bpRes = await fetch(`${SUPABASE_URL}/rest/v1/blueprints?id=eq.${blueprintId}&select=report`, {
          headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` },
        });
        const bpData = await bpRes.json();
        const currentReport = bpData?.[0]?.report ?? {};
        // Merge roadmap into report
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
