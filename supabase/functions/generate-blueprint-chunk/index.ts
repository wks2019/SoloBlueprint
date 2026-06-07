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

const CHUNKS: Record<number, string[]> = {
  0: ["diagnosis", "problem_and_demand", "target_audience", "clear_offer"],
  1: ["tools_needed", "ai_nocode_stack", "launch_plan", "pricing_strategy"],
  2: ["distribution_channels", "outreach_scripts", "proof_needed", "honest_risks"],
  3: ["seven_day_plan", "how_to_scale"],
};

const CHUNK_RULES: Record<number, string> = {
  0: `- diagnosis: Assess the idea honestly. Name the real opportunity AND the real obstacle. Reference a comparable business that succeeded.
- problem_and_demand: Name the exact pain. Cite real evidence of demand (search volume, market size, trend, or named competitor doing well).
- target_audience: Describe one specific person — their job, age, location, frustration, and where they spend time online.
- clear_offer: Write the exact offer in one sentence. Include price, deliverable, and timeframe. No vagueness.`,
  1: `- tools_needed: List every tool needed. Name, purpose, price. Specific to this idea and country.
- ai_nocode_stack: List AI and no-code tools that give this founder an unfair advantage. Include exact use case per tool.
- launch_plan: Plain string. 5 phases over 30 days. Each phase: what to do, how long, what done looks like.
- pricing_strategy: Give 3 pricing tiers with exact numbers in local currency. Explain the psychology behind each.`,
  2: `- distribution_channels: Name 3 specific channels. For each: exact platform, exact method, realistic result in 30 days.
- outreach_scripts: 2 copy-paste ready scripts with [VARIABLES]. One cold, one warm. Specific to this idea.
- proof_needed: Exactly what social proof, portfolio, or demo to build before first sale. Name the format and platform.
- honest_risks: 3 real risks. For each: what it is, how likely, how to reduce it. No sugarcoating.`,
  3: `- seven_day_plan: Label each day "Day 1: exact action (time estimate)". Must be completable by a solo founder.
- how_to_scale: 3 specific scaling moves for when revenue hits 3x the starting goal. Named tactics, not theory.`,
};

const buildChunkPrompt = (country: string, businessType: string, tone: string, chunkIndex: number) => {
  const keys = CHUNKS[chunkIndex].join(", ");
  return `You are SoloBlueprint — a specific AI business advisor for solo founders.
Generate ONLY these sections for the given business idea: ${keys}

Country: ${country || "United Kingdom"}
Business type: ${businessType || "online"}
Use the local currency of ${country || "United Kingdom"} for all prices.
Tone: ${
  tone === "direct"
    ? "Concise and blunt. Every sentence is an action or a fact."
    : tone === "aggressive"
    ? "Bold and urgent. High revenue targets. Assume the founder is going all in."
    : "Explain the reasoning behind every recommendation. Write for someone new to business."
}

RULES:
- Minimum 6 sentences per section. Be specific, not general.
- Use real business names, platforms, tools relevant to this idea and country.
- Real price ranges, real margins, real timelines.
- Reference real case studies or companies that built something similar.
- Never say "consider" or "you could" — say exactly what to do and why.
- Never use em dashes. Use a colon, comma, or rewrite instead.
- No filler words. No "leverage", "synergy", "holistic", "game-changing".

SECTION RULES:
${CHUNK_RULES[chunkIndex]}

Return a JSON object with ONLY these keys: ${keys}
Return ONLY valid JSON. No markdown. No explanation.`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not configured");

    const { answers, chunkIndex } = await req.json() as { answers: FormAnswers; chunkIndex: number };

    if (chunkIndex === undefined || !CHUNKS[chunkIndex]) {
      return new Response(JSON.stringify({ error: "Invalid chunkIndex" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ideaName = (answers.selectedIdea ?? answers.customIdea ?? "").trim();
    const ideaDescription = answers.ideaDescription?.trim() ?? "";
    const country = answers.country?.trim() || "United Kingdom";
    const businessType = answers.businessType || "online";
    const tone = answers.tone || "detailed";
    const background = answers.background?.trim() ?? "";

    const userPrompt = `Business idea: ${ideaName}
${ideaDescription ? `Founder's description: ${ideaDescription}` : ""}
Country: ${country}
Business type: ${businessType}
Budget: ${answers.budget ?? "flexible"}
Hours/week: ${answers.hours ?? "flexible"}
Experience: ${answers.experience ?? "beginner"}
Goal: ${answers.goal ?? "make money"}
${background ? `Founder background: ${background}. Use ONLY to identify transferable advantages. Do not redirect the blueprint.` : ""}

Return ONLY these sections: ${CHUNKS[chunkIndex].join(", ")}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1800,
        system: buildChunkPrompt(country, businessType, tone, chunkIndex),
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Claude error:", response.status, err);
      return new Response(JSON.stringify({ error: "Chunk generation failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "";

    let sections: Record<string, unknown> = {};
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      sections = JSON.parse(clean);
    } catch (_) {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) { try { sections = JSON.parse(match[0]); } catch (_) {} }
    }

    return new Response(JSON.stringify({ sections, chunkIndex }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("generate-blueprint-chunk error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
