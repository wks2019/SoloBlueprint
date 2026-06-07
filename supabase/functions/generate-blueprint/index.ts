const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface FormAnswers {
  selectedIdea: string | null;
  customIdea: string;
  ideaDescription: string;
  country: string;
  businessType: string | null;
  tone: string | null;
  background: string;
  budget: string | null;
  hours: string | null;
  experience: string | null;
  goal: string | null;
}

const buildSystemPrompt = (country: string, businessType: string, tone: string) => `You are SoloBlueprint — the world's most specific AI business advisor for solo founders.
Your job is not to give generic advice. Your job is to give the exact blueprint for THIS idea, in THIS country, as if you spent a week researching it.

The founder's country is: ${country || "United Kingdom"}.
The business type is: ${businessType || "online"} (online / remote / physical / hybrid).
Use the local currency of ${country || "United Kingdom"} for all prices.
Write in plain, direct English. No jargon, no hype, no filler.
Tone: ${
  tone === "direct"
    ? "Concise and blunt. No hand-holding. Every sentence is an action or a fact."
    : tone === "aggressive"
    ? "Bold and urgent. Push hard timelines. Use high revenue targets. Assume the founder is going all in."
    : "Explain the reasoning behind every recommendation. Use examples. Write for someone completely new to business."
}

Return a JSON object with exactly these 14 keys:
diagnosis, problem_and_demand, target_audience, clear_offer, tools_needed, ai_nocode_stack, launch_plan, pricing_strategy, distribution_channels, outreach_scripts, proof_needed, honest_risks, seven_day_plan, how_to_scale

RULES FOR EVERY SECTION:
- Minimum 6 sentences per section. Be specific, not general.
- Use real business names, real platforms, real tools relevant to this idea and country.
- Use real price ranges, real margins, real timelines.
- Reference real case studies, real founders, real companies that built something similar.
- Never say "consider" or "you could" — say exactly what to do and why.
- If the idea has physical components, include suppliers, logistics, fulfilment specifics.
- If the idea is digital, include exact platforms, tech stack, and pricing models.
- Never assume the founder has prior knowledge.
- Never use em dashes. Use a colon, comma, or rewrite the sentence instead.
- Write like a straight-talking founder advisor. Short sentences. No filler words. No "leverage", "synergy", "holistic", or "game-changing".

SECTION-SPECIFIC RULES:
- diagnosis: Assess the idea honestly. Name the real opportunity AND the real obstacle. Reference a comparable business that succeeded.
- problem_and_demand: Name the exact pain. Cite real evidence of demand (search volume, market size, trend, or named competitor doing well).
- target_audience: Describe one specific person — their job, age, location, frustration, and where they spend time online.
- clear_offer: Write the exact offer in one sentence. Include price, deliverable, and timeframe. No vagueness.
- tools_needed: List every tool needed. Name, purpose, price. Specific to this idea and country.
- ai_nocode_stack: List AI and no-code tools that give this founder an unfair advantage. Include exact use case per tool.
- launch_plan: Plain string. 5 phases over 30 days. Each phase: what to do, how long, what done looks like.
- pricing_strategy: Give 3 pricing tiers with exact numbers in local currency. Explain the psychology behind each.
- distribution_channels: Name 3 specific channels. For each: exact platform, exact method, realistic result in 30 days.
- outreach_scripts: 2 copy-paste ready scripts with [VARIABLES]. One cold, one warm. Specific to this idea.
- proof_needed: Exactly what social proof, portfolio, or demo to build before first sale. Name the format and platform.
- honest_risks: 3 real risks. For each: what it is, how likely, how to reduce it. No sugarcoating.
- seven_day_plan: Label each day "Day 1: exact action (time estimate)". Must be completable by a solo founder.
- how_to_scale: 3 specific scaling moves for when revenue hits 3x the starting goal. Named tactics, not theory.

Return ONLY valid JSON. No markdown. No explanation. No extra keys.`;

const refundToken = async (userId: string, supabaseUrl: string, serviceRole: string) => {
  try {
    const balRes = await fetch(`${supabaseUrl}/rest/v1/token_balance?user_id=eq.${userId}&select=balance,total_used`, {
      headers: { apikey: serviceRole, Authorization: `Bearer ${serviceRole}` },
    });
    const balData = await balRes.json();
    await fetch(`${supabaseUrl}/rest/v1/token_balance?user_id=eq.${userId}`, {
      method: "PATCH",
      headers: { apikey: serviceRole, Authorization: `Bearer ${serviceRole}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ balance: (balData?.[0]?.balance ?? 0) + 1, total_used: Math.max(0, (balData?.[0]?.total_used ?? 0) - 1), updated_at: new Date().toISOString() }),
    });
    await fetch(`${supabaseUrl}/rest/v1/token_transactions`, {
      method: "POST",
      headers: { apikey: serviceRole, Authorization: `Bearer ${serviceRole}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ user_id: userId, amount: 1, reason: "refund_failed_generation" }),
    });
  } catch (_) {}
};

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

    // Auth
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

    // Token check + deduct
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

    const ideaDescription = answers.ideaDescription?.trim() ?? "";
    const country = answers.country?.trim() || "United Kingdom";
    const tone = answers.tone || "detailed";
    const businessType = answers.businessType || "online";
    const background = answers.background?.trim() ?? "";

    const userPrompt = `Business idea: ${ideaName}
${ideaDescription ? `Founder's description: ${ideaDescription}` : ""}
Country: ${country}
Business type: ${businessType}
Budget: ${answers.budget ?? "flexible"}
Hours/week: ${answers.hours ?? "flexible"}
Experience: ${answers.experience ?? "beginner"}
Goal: ${answers.goal ?? "make money"}
${background ? `Founder background: ${background}. Use this ONLY to identify transferable advantages for this specific idea. Do not redirect or anchor the blueprint to this background.` : ""}

Return the JSON blueprint for this exact idea.`;

    // Call Claude — blueprint only (14 sections, no roadmap)
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 4500,
        system: buildSystemPrompt(country, businessType, tone),
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      if (userId && !isAdmin && SUPABASE_URL && SERVICE_ROLE) await refundToken(userId, SUPABASE_URL, SERVICE_ROLE);
      const errText = await response.text();
      console.error("Claude API error:", response.status, errText);
      return new Response(JSON.stringify({ error: "Failed to generate plan. Your token has been refunded." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "";

    let report: Record<string, unknown> = {};
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      report = JSON.parse(clean);
    } catch (_) {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) { try { report = JSON.parse(match[0]); } catch (_) {} }
    }

    if (!report || Object.keys(report).length < 6) {
      console.error("Invalid report structure:", text.slice(0, 500));
      if (userId && !isAdmin && SUPABASE_URL && SERVICE_ROLE) await refundToken(userId, SUPABASE_URL, SERVICE_ROLE);
      return new Response(JSON.stringify({ error: "Blueprint generation incomplete. Your token has been refunded." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save blueprint — without roadmap for now
    let blueprintId: string | null = null;
    if (userId && SUPABASE_URL && SERVICE_ROLE) {
      try {
        const saveRes = await fetch(`${SUPABASE_URL}/rest/v1/blueprints`, {
          method: "POST",
          headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}`, "Content-Type": "application/json", Prefer: "return=representation" },
          body: JSON.stringify({ user_id: userId, idea_name: ideaName, answers, report }),
        });
        const saved = await saveRes.json();
        blueprintId = saved?.[0]?.id ?? null;
      } catch (_) {}
    }

    // Return blueprint immediately — roadmap generates separately
    return new Response(JSON.stringify({ ideaName, report, blueprintId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("generate-blueprint error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
