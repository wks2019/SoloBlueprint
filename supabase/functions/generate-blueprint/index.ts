const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface FormAnswers {
  selectedIdea: string | null;
  customIdea: string;
  budget: string | null;
  hours: string | null;
  experience: string | null;
  goal: string | null;
}

const SECTION_KEYS = [
  "diagnosis","problem_and_demand","target_audience","clear_offer",
  "tools_needed","ai_nocode_stack","launch_plan","pricing_strategy",
  "distribution_channels","outreach_scripts","proof_needed",
  "honest_risks","seven_day_plan","how_to_scale",
];

const SYSTEM_PROMPT = `You are SoloBlueprint, a business coach for solo founders in the UK.
Return a JSON object with exactly these 14 keys:
diagnosis, problem_and_demand, target_audience, clear_offer, tools_needed, ai_nocode_stack, launch_plan, pricing_strategy, distribution_channels, outreach_scripts, proof_needed, honest_risks, seven_day_plan, how_to_scale

Rules:
- British English, £ for all prices
- Each value: 2-4 sentences, specific and actionable
- Real tool names with £ prices (Notion free, Carrd £15/yr, Stripe 1.5%+20p, Tally free)
- No hype or filler
- seven_day_plan: label each day "Day 1: action (time)"
- outreach_scripts: ready to copy-paste with [VARIABLES]
- launch_plan: write as a plain string describing 5 phases over 14 days
- Return ONLY valid JSON, no markdown, no explanation`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not configured");

    const { answers } = (await req.json()) as { answers: FormAnswers };
    const ideaName = (answers.selectedIdea ?? answers.customIdea ?? "").trim();
    if (!ideaName) {
      return new Response(JSON.stringify({ error: "Idea is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Token check
    let userId: string | null = null;
    let isAdmin = false;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ") && SUPABASE_URL && SERVICE_ROLE) {
      try {
        const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
          headers: { Authorization: authHeader, apikey: SERVICE_ROLE },
        });
        if (userRes.ok) {
          const u = await userRes.json();
          userId = u?.id ?? null;
          isAdmin = u?.email === "mvlasceanu26.vm@gmail.com";
        }
      } catch (_) {}
    }

    if (userId && !isAdmin && SUPABASE_URL && SERVICE_ROLE) {
      const balRes = await fetch(
        `${SUPABASE_URL}/rest/v1/token_balance?user_id=eq.${userId}&select=balance,total_used`,
        { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` } }
      );
      const balData = await balRes.json();
      const balance = balData?.[0]?.balance ?? 0;

      if (balance <= 0) {
        return new Response(JSON.stringify({ error: "NO_TOKENS" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Deduct token
      await fetch(`${SUPABASE_URL}/rest/v1/token_balance?user_id=eq.${userId}`, {
        method: "PATCH",
        headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}`, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ balance: balance - 1, total_used: (balData?.[0]?.total_used ?? 0) + 1, updated_at: new Date().toISOString() }),
      });

      await fetch(`${SUPABASE_URL}/rest/v1/token_transactions`, {
        method: "POST",
        headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}`, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ user_id: userId, amount: -1, reason: "blueprint_generated" }),
      });
    }

    const userPrompt = `Business idea: ${ideaName}
Budget: ${answers.budget ?? "flexible"}
Hours/week: ${answers.hours ?? "flexible"}
Experience: ${answers.experience ?? "beginner"}
Goal: ${answers.goal ?? "make money"}

Return the JSON blueprint for this exact idea.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      // Refund token on failure
      if (userId && !isAdmin && SUPABASE_URL && SERVICE_ROLE) {
        try {
          const balRes = await fetch(
            `${SUPABASE_URL}/rest/v1/token_balance?user_id=eq.${userId}&select=balance,total_used`,
            { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` } }
          );
          const balData = await balRes.json();
          await fetch(`${SUPABASE_URL}/rest/v1/token_balance?user_id=eq.${userId}`, {
            method: "PATCH",
            headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}`, "Content-Type": "application/json", Prefer: "return=minimal" },
            body: JSON.stringify({ balance: (balData?.[0]?.balance ?? 0) + 1, total_used: Math.max(0, (balData?.[0]?.total_used ?? 0) - 1), updated_at: new Date().toISOString() }),
          });
          await fetch(`${SUPABASE_URL}/rest/v1/token_transactions`, {
            method: "POST",
            headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}`, "Content-Type": "application/json", Prefer: "return=minimal" },
            body: JSON.stringify({ user_id: userId, amount: 1, reason: "refund_failed_generation" }),
          });
        } catch (_) {}
      }
      const errText = await response.text();
      console.error("Claude API error:", response.status, errText);
      return new Response(JSON.stringify({ error: "Failed to generate plan. Your token has been refunded." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "";

    // Parse JSON from response
    let report: Record<string, unknown> = {};
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      report = JSON.parse(clean);
    } catch (_) {
      // Try to extract JSON from response
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try { report = JSON.parse(match[0]); } catch (_) {}
      }
    }

    if (!report || Object.keys(report).length < 6) {
      console.error("Invalid report structure:", text.slice(0, 500));
      // Refund token
      if (userId && !isAdmin && SUPABASE_URL && SERVICE_ROLE) {
        try {
          const balRes = await fetch(`${SUPABASE_URL}/rest/v1/token_balance?user_id=eq.${userId}&select=balance,total_used`, { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` } });
          const balData = await balRes.json();
          await fetch(`${SUPABASE_URL}/rest/v1/token_balance?user_id=eq.${userId}`, {
            method: "PATCH",
            headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}`, "Content-Type": "application/json", Prefer: "return=minimal" },
            body: JSON.stringify({ balance: (balData?.[0]?.balance ?? 0) + 1, updated_at: new Date().toISOString() }),
          });
        } catch (_) {}
      }
      return new Response(JSON.stringify({ error: "Blueprint generation incomplete. Your token has been refunded." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save blueprint
    if (userId && SUPABASE_URL && SERVICE_ROLE) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/blueprints`, {
          method: "POST",
          headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}`, "Content-Type": "application/json", Prefer: "return=minimal" },
          body: JSON.stringify({ user_id: userId, idea_name: ideaName, answers, report }),
        });
      } catch (_) {}
    }

    return new Response(JSON.stringify({ ideaName, report }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("generate-blueprint error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
