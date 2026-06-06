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
  "diagnosis",
  "problem_and_demand",
  "target_audience",
  "clear_offer",
  "tools_needed",
  "ai_nocode_stack",
  "launch_plan",
  "pricing_strategy",
  "distribution_channels",
  "outreach_scripts",
  "proof_needed",
  "honest_risks",
  "seven_day_plan",
  "how_to_scale",
] as const;

const launchPlanSchema = {
  type: "object",
  description:
    "Step-by-step launch plan as 5 sequential phases covering days 1-14. Must be deeply specific to the founder's idea — real procedures, real tools, real example copy, real timelines. No generic advice.",
  properties: {
    phases: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      description: "Exactly 5 phases in order: Days 1-3, Days 4-7, Days 8-9, Day 10, Days 11-14.",
      items: {
        type: "object",
        properties: {
          title: { type: "string", description: "Short phase title, e.g. 'Manual Validation Before You Automate Anything'." },
          timeframe: { type: "string", description: "e.g. 'Days 1-3'." },
          what_to_do: { type: "string", description: "1-3 sentence overview of the phase goal." },
          exact_steps: {
            type: "array",
            minItems: 3,
            description: "Numbered procedural steps. Each item is a full instruction (1-3 sentences). Reference real tools and tactics specific to the founder's idea.",
            items: { type: "string" },
          },
          real_life_example: {
            type: "string",
            description: "A real, named example from a real founder/company/post including a quoted post or message and a concrete result.",
          },
          tools: {
            type: "array",
            minItems: 1,
            description: "Tools to use in this phase. Each entry: 'Tool Name (URL) — what it does — £price or free'.",
            items: { type: "string" },
          },
          success_looks_like: { type: "string", description: "1-2 sentences defining the concrete outcome that ends this phase." },
        },
        required: ["title", "timeframe", "what_to_do", "exact_steps", "real_life_example", "tools", "success_looks_like"],
        additionalProperties: false,
      },
    },
  },
  required: ["phases"],
  additionalProperties: false,
};

const sectionProperties = SECTION_KEYS.reduce<Record<string, unknown>>((acc, key) => {
  if (key === "launch_plan") {
    acc[key] = launchPlanSchema;
  } else {
    acc[key] = {
      type: "string",
      description: `The "${key}" section. 3-6 sentences. Concrete, actionable, UK-flavoured (use £).`,
    };
  }
  return acc;
}, {});

const SYSTEM_PROMPT = `You are SoloBlueprint, an expert business coach for absolute beginner solo founders in the UK.
You produce concise, brutally honest, action-first launch plans grounded in REAL-WORLD examples.

Rules:
- Use British English and £ for currency.
- Never invent stats or fake case studies. If you cite a number, it must be one you genuinely know.
- Speak plainly. No hype, no fluff, no AI-sounding filler ("in today's fast-paced world", "leverage synergies", etc.).
- Tailor every section to the user's specific idea, budget, hours, experience and goal.
- Each section: 4-7 sentences, packed with specific tools, prices and steps the founder can act on today.

GROUNDING IN REALITY (critical):
- Reference REAL companies, founders, products and creators by name whenever it strengthens the point. Examples you can draw on: Pieter Levels (Nomad List, Photo AI, RemoteOK), Marc Lou (ShipFast, indie SaaS portfolio), Justin Welsh (solopreneur newsletter, £4M+ solo), Arvid Kahl (FeedbackPanda exit, "The Embedded Entrepreneur"), Sahil Lavingia (Gumroad), Tony Dinh (TypingMind, BlackMagic), Daniel Vassallo (small bets portfolio), Sam Parr (The Hustle exit), Codie Sanchez (boring businesses), Ali Abdaal (creator economy), Charlie Bleecker, Dan Koe, Jay Clouse (Creator Science). UK-specific: Steven Bartlett, Chris Donnelly, Daniel Priestley (Dent Global, "Key Person of Influence"), Grace Beverley (TALA/Shreddy).
- Cite REAL books with author when relevant: "The Mom Test" (Rob Fitzpatrick) for customer interviews, "$100M Offers" / "$100M Leads" (Alex Hormozi) for offers, "Company of One" (Paul Jarvis), "Anything You Want" (Derek Sivers), "The 1-Page Marketing Plan" (Allan Dib), "Make" (Pieter Levels), "Show Your Work" (Austin Kleon), "Built to Sell" (John Warrillow), "Lost and Founder" (Rand Fishkin).
- Cite REAL tools with actual current pricing in £ (convert from $ at ~£0.79/$1): e.g. "Cursor (£16/mo)", "Lovable (free tier + £20/mo Pro)", "Beehiiv (free up to 2.5k subs)", "Stripe (1.5% + 20p UK cards)", "Make.com (free 1k ops/mo)", "Notion (free for solo)", "Cal.com (free)", "Senja (£15/mo)", "Tally (free forms)".
- When giving pricing strategy, name a real comparable: "Justin Welsh charges £125 for his LinkedIn OS — anchor near that."
- When describing demand, point to a real Reddit sub, Indie Hackers thread, X account, or YouTube channel where the audience actually hangs out — name it specifically.

FORMAT RULES:
- Outreach scripts: first person, ready to copy-paste, with [BRACKETS] for variables. Include subject line for emails, opener for DMs.
- 7-day plan: exact daily actions labelled "Day 1: ... Day 2: ..." with a time estimate per day.
- Tools section: bullet-style list "Tool — what it does — £price/mo".

LAUNCH PLAN (section 07) — SPECIAL FORMAT:
This section is a STRUCTURED object with exactly 5 phases, written like someone who has actually launched a product before. No generic advice — real procedures, real tools, real example copy, real timelines.

Phase breakdown (use these EXACT timeframes and intents):
1. Days 1-3: Manual Validation Before You Automate Anything — validate demand in public, manually. Post on X/LinkedIn, DM responders, collect raw feedback before building infra.
2. Days 4-7: Collect Testimonials the Right Way — use Senja (or Testimonial.to) to collect 3-5 specific written testimonials with real outcomes.
3. Days 8-9: Set Up Early Bird Pricing — Lemon Squeezy product, time-limited discount that actually expires, anchor pricing reasoning.
4. Day 10: Launch on Product Hunt — Ship pre-launch page, hunter, assets (tagline/screenshots/Loom video), maker comment template, launch-day tactics.
5. Days 11-14: Post-Launch Momentum — recap post with real numbers, Indie Hackers "Show IH" post, email Ship subscribers, submit to free AI/tool directories.

For EACH phase you MUST return:
- title, timeframe, what_to_do, exact_steps, real_life_example, tools, success_looks_like

Tailor every phase to the founder's specific idea, budget, hours and goal. Use £ for all prices. Do NOT return the launch_plan as a string — it must be the structured object.`;

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
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Token check ──
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ") && SUPABASE_URL && SERVICE_ROLE) {
      try {
        const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
          headers: { Authorization: authHeader, apikey: SERVICE_ROLE },
        });
        if (userRes.ok) {
          const u = await userRes.json();
          userId = u?.id ?? null;
        }
      } catch (_) { /* anonymous */ }
    }

    if (userId && SUPABASE_URL && SERVICE_ROLE) {
      // Admin bypasses token system entirely
      const isAdmin = (await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: { Authorization: authHeader ?? "", apikey: SERVICE_ROLE },
      }).then(r => r.json()).catch(() => ({}))).email === "mvlasceanu26.vm@gmail.com";

      if (!isAdmin) {
        const balRes = await fetch(
          `${SUPABASE_URL}/rest/v1/token_balance?user_id=eq.${userId}&select=balance`,
          { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` } }
        );
        const balData = await balRes.json();
        const balance = balData?.[0]?.balance ?? 0;

        if (balance <= 0) {
          return new Response(JSON.stringify({ error: "NO_TOKENS", message: "You have no tokens left. Purchase more to continue." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
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
    }

    const userPrompt = `Generate a complete SoloBlueprint launch plan for this founder.

Business idea: ${ideaName}
Starting budget: ${answers.budget ?? "unspecified"}
Hours per week: ${answers.hours ?? "unspecified"}
Experience level: ${answers.experience ?? "unspecified"}
90-day goal: ${answers.goal ?? "unspecified"}

Fill in all 14 sections of the blueprint tool. Be specific to this exact idea — no generic advice.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8192,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
        tools: [
          {
            name: "return_blueprint",
            description: "Return the complete 14-section SoloBlueprint plan.",
            input_schema: {
              type: "object",
              properties: sectionProperties,
              required: [...SECTION_KEYS],
              additionalProperties: false,
            },
          },
        ],
        tool_choice: { type: "tool", name: "return_blueprint" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const errText = await response.text();
      console.error("Claude API error:", response.status, errText);
      return new Response(JSON.stringify({ error: "Failed to generate plan" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolUse = data?.content?.find((b: { type: string }) => b.type === "tool_use");
    if (!toolUse?.input) {
      console.error("No tool use in response", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "AI did not return a structured plan" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const report = toolUse.input;

    // Log every generation (best effort, never blocks the response)
    try {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (SUPABASE_URL && SERVICE_ROLE) {
        let userId: string | null = null;
        const authHeader = req.headers.get("Authorization");
        if (authHeader?.startsWith("Bearer ")) {
          try {
            const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
              headers: { Authorization: authHeader, apikey: SERVICE_ROLE },
            });
            if (userRes.ok) {
              const u = await userRes.json();
              userId = u?.id ?? null;
            }
          } catch (_) { /* anonymous */ }
        }
        await fetch(`${SUPABASE_URL}/rest/v1/blueprints`, {
          method: "POST",
          headers: {
            apikey: SERVICE_ROLE,
            Authorization: `Bearer ${SERVICE_ROLE}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ idea_name: ideaName, answers, report, user_id: userId }),
        });
      }
    } catch (logErr) {
      console.error("blueprint log failed:", logErr);
    }

    return new Response(JSON.stringify({ ideaName, report }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-blueprint error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
