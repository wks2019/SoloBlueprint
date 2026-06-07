import { jsPDF } from "jspdf";

interface LaunchPhase {
  title: string;
  timeframe: string;
  what_to_do: string;
  exact_steps: string[];
  real_life_example: string;
  tools: string[];
  success_looks_like: string;
}

type LaunchPlan = string | { phases: LaunchPhase[] };

interface RoadmapWeek {
  week: number;
  phase: string;
  title: string;
  hours: string;
  task: string;
  why: string;
  resource: { type: string; title: string; description: string };
}

interface ReportData {
  diagnosis: string;
  problem_and_demand: string;
  target_audience: string;
  clear_offer: string;
  tools_needed: string;
  ai_nocode_stack: string;
  launch_plan: LaunchPlan;
  pricing_strategy: string;
  distribution_channels: string;
  outreach_scripts: string;
  proof_needed: string;
  honest_risks: string;
  seven_day_plan: string;
  how_to_scale: string;
  roadmap?: { weeks: RoadmapWeek[] };
}

export const flattenLaunchPlan = (lp: LaunchPlan): string => {
  if (typeof lp === "string") return lp;
  if (!lp?.phases?.length) return "";
  return lp.phases
    .map((p, i) => {
      const steps = p.exact_steps.map((s, j) => `  ${j + 1}. ${s}`).join("\n");
      const tools = p.tools.map((t) => `  • ${t}`).join("\n");
      return `PHASE ${i + 1} : ${p.timeframe}: ${p.title}

What to do:
${p.what_to_do}

Exact steps:
${steps}

Real-life example:
${p.real_life_example}

Tools:
${tools}

What success looks like:
${p.success_looks_like}`;
    })
    .join("\n\n---\n\n");
};

interface FormAnswersLike {
  budget: string | null;
  hours: string | null;
  experience: string | null;
  goal: string | null;
}

const SECTIONS: { num: string; title: string; key: keyof ReportData }[] = [
  { num: "01", title: "Business Idea Diagnosis", key: "diagnosis" },
  { num: "02", title: "Real Problem & Demand", key: "problem_and_demand" },
  { num: "03", title: "Target Audience", key: "target_audience" },
  { num: "04", title: "Your Clear Offer", key: "clear_offer" },
  { num: "05", title: "Tools You Need", key: "tools_needed" },
  { num: "06", title: "AI & No-Code Stack", key: "ai_nocode_stack" },
  { num: "07", title: "Step-by-Step Launch Plan", key: "launch_plan" },
  { num: "08", title: "Pricing Strategy", key: "pricing_strategy" },
  { num: "09", title: "Distribution Channels", key: "distribution_channels" },
  { num: "10", title: "Outreach Scripts", key: "outreach_scripts" },
  { num: "11", title: "Proof & Demo to Create", key: "proof_needed" },
  { num: "12", title: "Honest Risks", key: "honest_risks" },
  { num: "13", title: "Your First 7-Day Action Plan", key: "seven_day_plan" },
  { num: "14", title: "How to Scale Later", key: "how_to_scale" },
];

// Brand palette (RGB) : matches the dark SoloBlueprint theme
const BG = [10, 15, 30] as const;          // #0a0f1e
const CARD = [13, 21, 38] as const;        // #0d1526
const BORDER = [30, 45, 74] as const;      // #1e2d4a
const TEXT = [240, 244, 255] as const;     // near-white
const MUTED = [148, 163, 184] as const;    // slate-400
const PRIMARY = [99, 102, 241] as const;   // indigo-500

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 16;
const CONTENT_W = PAGE_W - MARGIN * 2;

const paintBackground = (doc: jsPDF) => {
  doc.setFillColor(BG[0], BG[1], BG[2]);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");
};

const drawFooter = (doc: jsPDF, pageNum: number, totalPages: number) => {
  doc.setFontSize(8);
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  doc.text("SoloBlueprint · soloblueprint.co.uk", MARGIN, PAGE_H - 8);
  doc.text(`${pageNum} / ${totalPages}`, PAGE_W - MARGIN, PAGE_H - 8, { align: "right" });
};

export const downloadBlueprintPdf = (
  ideaName: string,
  answers: FormAnswersLike,
  report: ReportData,
) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // ---------- COVER PAGE ----------
  paintBackground(doc);

  // Accent bar
  doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.rect(MARGIN, 40, 14, 2, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  doc.text("YOUR SOLOBLUEPRINT FOR", MARGIN, 50);

  // Title (idea name) : wrap if long
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(TEXT[0], TEXT[1], TEXT[2]);
  const titleLines = doc.splitTextToSize(ideaName, CONTENT_W);
  doc.text(titleLines, MARGIN, 64);

  // Meta box
  const metaY = 64 + titleLines.length * 11 + 14;
  const meta = [
    ["Budget", answers.budget],
    ["Hours / week", answers.hours],
    ["Experience", answers.experience],
    ["90-day goal", answers.goal],
  ].filter(([, v]) => Boolean(v)) as [string, string][];

  doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
  doc.setFillColor(CARD[0], CARD[1], CARD[2]);
  const metaH = meta.length * 9 + 10;
  doc.roundedRect(MARGIN, metaY, CONTENT_W, metaH, 3, 3, "FD");

  meta.forEach(([label, value], i) => {
    const y = metaY + 9 + i * 9;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text(label.toUpperCase(), MARGIN + 6, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(TEXT[0], TEXT[1], TEXT[2]);
    doc.text(value, MARGIN + 50, y);
  });

  // Cover footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  doc.text(
    `Generated ${new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`,
    MARGIN,
    PAGE_H - 24,
  );
  doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.setFont("helvetica", "bold");
  doc.text("SoloBlueprint", MARGIN, PAGE_H - 16);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
  doc.text("Build your solo business · soloblueprint.co.uk", MARGIN + 32, PAGE_H - 16);

  // ---------- CONTENT PAGES ----------
  let y = PAGE_H; // force new page on first section
  const startNewPage = () => {
    doc.addPage();
    paintBackground(doc);
    y = MARGIN + 6;
  };

  for (const section of SECTIONS) {
    const rawBody = report[section.key] ?? "";
    const body = section.key === "launch_plan" ? flattenLaunchPlan(rawBody as LaunchPlan) : (rawBody as string);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    const titleH = 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const bodyLines = doc.splitTextToSize(body, CONTENT_W - 8);
    const bodyH = bodyLines.length * 5.6;
    const cardH = titleH + 6 + bodyH + 10;

    // New page if not enough room
    if (y + cardH > PAGE_H - 18) startNewPage();

    // Card background
    doc.setFillColor(CARD[0], CARD[1], CARD[2]);
    doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
    doc.roundedRect(MARGIN, y, CONTENT_W, cardH, 3, 3, "FD");

    // Left accent stripe
    doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
    doc.rect(MARGIN, y, 1.2, cardH, "F");

    // Section number + title
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text(section.num, MARGIN + 6, y + 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(TEXT[0], TEXT[1], TEXT[2]);
    doc.text(section.title, MARGIN + 16, y + 8);

    // Body
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(220, 226, 240);
    doc.text(bodyLines, MARGIN + 6, y + 16);

    y += cardH + 6;
  }

  // ---------- ROADMAP PAGES ----------
  if (report.roadmap?.weeks?.length) {
    startNewPage();

    // Roadmap header
    doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
    doc.rect(MARGIN, y, 14, 2, "F");
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(TEXT[0], TEXT[1], TEXT[2]);
    doc.text("Your Personal Roadmap", MARGIN, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text("Week by week. No noise. One resource per step.", MARGIN, y);
    y += 10;

    const PHASE_COLOURS_PDF: Record<string, [number, number, number]> = {
      FOUNDATION: [99, 102, 241],
      VALIDATION: [234, 88, 12],
      LAUNCH:     [22, 163, 74],
    };

    for (const week of report.roadmap.weeks) {
      const phaseColour = PHASE_COLOURS_PDF[week.phase] ?? PHASE_COLOURS_PDF.FOUNDATION;
      const taskLines = doc.splitTextToSize(week.task, CONTENT_W - 16);
      const whyLines = doc.splitTextToSize(`Why: ${week.why}`, CONTENT_W - 16);
      const resLines = doc.splitTextToSize(`${week.resource.type}: ${week.resource.title} : ${week.resource.description}`, CONTENT_W - 16);
      const cardH = 10 + taskLines.length * 5.2 + whyLines.length * 5.2 + resLines.length * 5.2 + 14;

      if (y + cardH > PAGE_H - 18) startNewPage();

      doc.setFillColor(CARD[0], CARD[1], CARD[2]);
      doc.setDrawColor(BORDER[0], BORDER[1], BORDER[2]);
      doc.roundedRect(MARGIN, y, CONTENT_W, cardH, 3, 3, "FD");

      // Phase colour stripe
      doc.setFillColor(phaseColour[0], phaseColour[1], phaseColour[2]);
      doc.rect(MARGIN, y, 1.2, cardH, "F");

      // Week + phase badge
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(phaseColour[0], phaseColour[1], phaseColour[2]);
      doc.text(`WEEK ${week.week} : ${week.phase}`, MARGIN + 6, y + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
      doc.text(week.hours, PAGE_W - MARGIN - 2, y + 7, { align: "right" });

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(TEXT[0], TEXT[1], TEXT[2]);
      doc.text(week.title, MARGIN + 6, y + 14);

      let wy = y + 20;

      // Task
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(220, 226, 240);
      doc.text(taskLines, MARGIN + 6, wy);
      wy += taskLines.length * 5.2 + 3;

      // Why
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
      doc.text(whyLines, MARGIN + 6, wy);
      wy += whyLines.length * 5.2 + 3;

      // Resource
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(phaseColour[0], phaseColour[1], phaseColour[2]);
      doc.text(resLines, MARGIN + 6, wy);

      y += cardH + 5;
    }
  }

  // ---------- FOOTERS ----------
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(doc, p, totalPages);
  }

  const safeName = ideaName.replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 50) || "blueprint";
  doc.save(`soloblueprint-${safeName}.pdf`);
};

// ============================================================
// Marketing AI mega-prompt : paste into ChatGPT / Claude / Gemini
// ============================================================
export const buildMarketingPrompt = (
  ideaName: string,
  answers: FormAnswersLike,
  report: ReportData,
): string => {
  return `You are my dedicated marketing strategist and copywriter.

I am a solo founder launching a new business and I want you to act as my full-time marketing partner. Use the SoloBlueprint below as the single source of truth for every piece of copy, ad, post, email, script and campaign you produce. Never invent facts that contradict it.

═══════════════════════════════════════════
MY BUSINESS CONTEXT
═══════════════════════════════════════════
Idea: ${ideaName}
Starting budget: ${answers.budget ?? "not specified"}
Hours per week: ${answers.hours ?? "not specified"}
Experience level: ${answers.experience ?? "not specified"}
90-day goal: ${answers.goal ?? "not specified"}

═══════════════════════════════════════════
MY SOLOBLUEPRINT (full plan)
═══════════════════════════════════════════

01 · BUSINESS IDEA DIAGNOSIS
${report.diagnosis}

02 · REAL PROBLEM & DEMAND
${report.problem_and_demand}

03 · TARGET AUDIENCE
${report.target_audience}

04 · MY CLEAR OFFER
${report.clear_offer}

05 · TOOLS I'M USING
${report.tools_needed}

06 · AI & NO-CODE STACK
${report.ai_nocode_stack}

07 · STEP-BY-STEP LAUNCH PLAN
${flattenLaunchPlan(report.launch_plan)}

08 · PRICING STRATEGY
${report.pricing_strategy}

09 · DISTRIBUTION CHANNELS
${report.distribution_channels}

10 · OUTREACH SCRIPTS (baseline)
${report.outreach_scripts}

11 · PROOF & DEMO TO CREATE
${report.proof_needed}

12 · HONEST RISKS
${report.honest_risks}

13 · MY FIRST 7-DAY ACTION PLAN
${report.seven_day_plan}

14 · HOW I'LL SCALE LATER
${report.how_to_scale}

═══════════════════════════════════════════
HOW I WANT YOU TO WORK
═══════════════════════════════════════════
1. Always speak directly to my exact target audience (section 03) : never to "everyone".
2. Lead every piece of copy with the real pain from section 02, then bridge to my offer (section 04).
3. Tone: clear, plain English, confident, zero hype, zero emojis unless I ask. UK spelling, £ for prices.
4. Every output must be copy-paste ready : no placeholders like [your name], no "insert here" gaps. Use the data above to fill everything.
5. Match the channel: short and scroll-stopping for X/IG, value-led for LinkedIn, conversational for cold DMs and emails.
6. When relevant, build in a soft CTA tied to my 90-day goal (${answers.goal ?? "growth"}).
7. If I ask for a campaign or sequence, give me a numbered plan with channel, format, hook, body and CTA for each asset.
8. Push back honestly when an idea contradicts the blueprint or the honest risks (section 12).

═══════════════════════════════════════════
HOW TO START
═══════════════════════════════════════════
Reply with:
A) A 1-paragraph summary of how YOU understand my business and audience (so I can confirm you've got it right).
B) A menu of 6 marketing assets you can produce for me right now (e.g. LinkedIn launch post, cold email sequence, landing page hero copy, X thread, IG carousel script, paid ad variations).

Then wait for me to pick.

: End of brief :`;
};
