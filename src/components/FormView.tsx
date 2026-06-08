import { useMemo } from "react";

export interface FormAnswers {
  ideaName: string;          // unified idea name: from grid or derived from description
  selectedIdea: string | null; // grid pick (for display)
  ideaDescription: string;   // free-text description (context)
  country: string;
  businessType: string | null;
  tone: string | null;
  background: string;
  budget: string | null;
  hours: string | null;
  experience: string | null;
  goal: string | null;
}

export const IDEAS: { name: string; emoji: string }[] = [
  { emoji: "🎬", name: "AI Content Repurposing Service" },
  { emoji: "⚙️", name: "AI Automation Setup for SMBs" },
  { emoji: "🎨", name: "Canva Template Shop" },
  { emoji: "📋", name: "Notion Template Shop" },
  { emoji: "📄", name: "Resume & LinkedIn Profile Writer" },
  { emoji: "🌐", name: "Simple Landing Page Service" },
  { emoji: "✉️", name: "AI-Written Email Newsletter" },
  { emoji: "🔍", name: "Digital Product Audit & Funnel Fix" },
  { emoji: "📅", name: "Niche Booking Tool (Micro-SaaS)" },
  { emoji: "📊", name: "Lead List Service" },
];

const BUDGETS = ["£0 – £50","£50 – £200","£200 – £1k","£1k – £10k","£10k – £100k","£100k – £1M"];
const HOURS = ["1 – 5 hours","5 – 15 hours","15+ hours"];
const EXPERIENCE = ["Complete beginner","Some experience","Technical background"];
const GOALS = ["Earn my first £500","Replace my income","Build a product"];
const TONES = [
  { value: "direct",     emoji: "🎯", label: "Straight talker", desc: "Short, blunt, no hand-holding" },
  { value: "detailed",   emoji: "📖", label: "Step by step",    desc: "Explain the why behind everything" },
  { value: "aggressive", emoji: "🚀", label: "Push me hard",    desc: "Bold moves, fast timelines, high targets" },
];
const BUSINESS_TYPES = [
  { value: "online",    label: "Online",          emoji: "💻", desc: "Fully digital: website, app, SaaS" },
  { value: "remote",    label: "Remote service",  emoji: "🌍", desc: "You deliver a service from anywhere" },
  { value: "physical",  label: "Physical",        emoji: "🏪", desc: "Requires a location, stock, or in-person" },
  { value: "hybrid",    label: "Hybrid",          emoji: "⚡", desc: "Mix of online and physical" },
];

// Derive a clean idea name from description (first sentence or first 6 words)
const deriveNameFromDescription = (desc: string): string => {
  const trimmed = desc.trim();
  if (!trimmed) return "";
  const firstSentence = trimmed.split(/[.!?]/)[0].trim();
  const words = firstSentence.split(/\s+/).slice(0, 8).join(" ");
  return words;
};

interface FormViewProps {
  answers: FormAnswers;
  setAnswers: (next: FormAnswers) => void;
  onBack: () => void;
  onSubmit: () => void;
}

const Pill = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button type="button" onClick={onClick}
    className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${
      active
        ? "border-indigo-500 bg-indigo-600 text-white shadow-[0_4px_16px_rgba(79,70,229,0.35)] scale-[1.02]"
        : "border-indigo-100 bg-indigo-50 text-indigo-600 hover:border-indigo-300 hover:bg-indigo-100"
    }`}>
    {children}
  </button>
);

const QuestionLabel = ({ index, label, optional }: { index: number; label: string; optional?: boolean }) => (
  <div className="mb-4 flex items-baseline gap-3">
    <span className="font-mono text-xs text-muted-foreground">{String(index).padStart(2, "0")}</span>
    <h3 className="text-base font-semibold text-foreground sm:text-lg">
      {label}
      {optional && <span className="ml-2 text-[11px] font-normal uppercase tracking-wider text-muted-foreground">Optional</span>}
    </h3>
  </div>
);

export const FormView = ({ answers, setAnswers, onBack, onSubmit }: FormViewProps) => {
  const update = (patch: Partial<FormAnswers>) => setAnswers({ ...answers, ...patch });

  // Unified idea name: grid pick takes priority, else derive from description
  const displayIdeaName = answers.selectedIdea || deriveNameFromDescription(answers.ideaDescription);

  const isComplete = useMemo(() =>
    !!displayIdeaName &&
    !!answers.businessType &&
    !!answers.tone &&
    !!answers.budget &&
    !!answers.hours &&
    !!answers.experience &&
    !!answers.goal,
    [displayIdeaName, answers]
  );

  const wordCount = answers.ideaDescription.trim()
    ? answers.ideaDescription.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-[680px] px-4 py-6 sm:px-6 sm:py-12">
        <button onClick={onBack} className="mb-8 text-sm text-muted-foreground transition hover:text-foreground">
          ← Back
        </button>

        <header className="mb-10">
          <h2 className="font-display text-3xl text-foreground sm:text-4xl">Tell us about your idea</h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Describe your idea or pick one below. That's it. We'll handle the rest.
          </p>
        </header>

        {/* Q1: UNIFIED IDEA INPUT */}
        <section className="mb-12">
          <QuestionLabel index={1} label="What business do you want to launch?" />

          {/* Primary: description textarea */}
          <textarea
            value={answers.ideaDescription}
            onChange={(e) => {
              const words = e.target.value.trim().split(/\s+/).filter(Boolean);
              if (words.length <= 200) {
                update({ ideaDescription: e.target.value, ideaName: deriveNameFromDescription(e.target.value) });
              }
            }}
            placeholder="Describe your idea here: this is all you need. What is it? Who is it for? What problem does it solve? The more detail you give, the better your blueprint."
            rows={4}
            className="w-full rounded-xl border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none sm:text-base"
          />
          <p className="mt-1.5 text-right text-[11px] text-muted-foreground">{wordCount} / 200 words</p>

          {/* OR divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Not sure where to start?</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <p className="text-xs text-muted-foreground mb-3">These are popular ideas. Tap one to use it as your starting point, then add your own details above.</p>

          {/* Idea grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3">
            {IDEAS.map((idea) => {
              const active = answers.selectedIdea === idea.name;
              return (
                <button key={idea.name} type="button"
                  onClick={() => update({
                    selectedIdea: active ? null : idea.name,
                    ideaName: active ? deriveNameFromDescription(answers.ideaDescription) : idea.name,
                  })}
                  className={`group relative rounded-xl border bg-card p-3 text-left transition ${
                    active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                  }`}>
                  {active && (
                    <span className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">✓</span>
                  )}
                  <div className="mb-2 text-2xl">{idea.emoji}</div>
                  <div className={`text-xs font-semibold leading-snug sm:text-sm ${active ? "text-primary" : "text-foreground"}`}>{idea.name}</div>
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-xs text-muted-foreground text-center">
            Don't see your idea? Just describe it in the box above. That's all you need.
          </p>

          {/* YOUR IDEA confirmation bar */}
          {displayIdeaName && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-0.5">Your idea</p>
                <p className="text-sm font-semibold text-foreground truncate">{displayIdeaName}</p>
              </div>
              <button type="button"
                onClick={() => update({ selectedIdea: null, ideaName: "", ideaDescription: "" })}
                className="text-[11px] text-muted-foreground hover:text-red-500 transition flex-shrink-0">
                ✕ Clear
              </button>
            </div>
          )}
        </section>

        {/* Q2 */}
        <section className="mb-10">
          <QuestionLabel index={2} label="Where will this business operate?" />
          <input type="text" value={answers.country}
            onChange={(e) => update({ country: e.target.value })}
            placeholder="Your country: e.g. United Kingdom, Nigeria, Canada..."
            className="mb-4 w-full rounded-xl border border-border bg-card py-3.5 px-4 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:text-base"
          />
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {BUSINESS_TYPES.map((bt) => {
              const active = answers.businessType === bt.value;
              return (
                <button key={bt.value} type="button"
                  onClick={() => update({ businessType: active ? null : bt.value })}
                  className={`relative rounded-xl border bg-card p-3 text-left transition ${active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                  {active && <span className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">✓</span>}
                  <div className="mb-1 text-2xl">{bt.emoji}</div>
                  <div className="text-xs font-semibold text-foreground sm:text-sm">{bt.label}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{bt.desc}</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Q3 */}
        <section className="mb-10">
          <QuestionLabel index={3} label="How do you want your blueprint written?" />
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {TONES.map((t) => {
              const active = answers.tone === t.value;
              return (
                <button key={t.value} type="button"
                  onClick={() => update({ tone: active ? null : t.value })}
                  className={`relative rounded-xl border bg-card p-3 text-left transition ${active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                  {active && <span className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">✓</span>}
                  <div className="mb-1 text-2xl">{t.emoji}</div>
                  <div className="text-xs font-semibold text-foreground sm:text-sm">{t.label}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{t.desc}</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Q4 */}
        <section className="mb-10">
          <QuestionLabel index={4} label="What is your available starting budget?" />
          <div className="flex flex-wrap gap-2.5">
            {BUDGETS.map((b) => <Pill key={b} active={answers.budget === b} onClick={() => update({ budget: b })}>{b}</Pill>)}
          </div>
        </section>

        {/* Q5 */}
        <section className="mb-10">
          <QuestionLabel index={5} label="How many hours per week can you commit?" />
          <div className="flex flex-wrap gap-2.5">
            {HOURS.map((h) => <Pill key={h} active={answers.hours === h} onClick={() => update({ hours: h })}>{h}</Pill>)}
          </div>
        </section>

        {/* Q6 */}
        <section className="mb-10">
          <QuestionLabel index={6} label="What is your experience level?" />
          <div className="flex flex-wrap gap-2.5">
            {EXPERIENCE.map((e) => <Pill key={e} active={answers.experience === e} onClick={() => update({ experience: e })}>{e}</Pill>)}
          </div>
        </section>

        {/* Q7 */}
        <section className="mb-10">
          <QuestionLabel index={7} label="What is your main goal in the next 90 days?" />
          <div className="flex flex-wrap gap-2.5">
            {GOALS.map((g) => <Pill key={g} active={answers.goal === g} onClick={() => update({ goal: g })}>{g}</Pill>)}
          </div>
        </section>

        {/* Q8: optional background */}
        <section className="mb-12">
          <QuestionLabel index={8} label="What is your background?" optional />
          <textarea value={answers.background}
            onChange={(e) => update({ background: e.target.value })}
            placeholder="e.g. I am a nurse with 5 years experience. I have tried dropshipping before. I speak Spanish and English."
            rows={3}
            className="w-full rounded-xl border border-border bg-card px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none sm:text-base"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">Used only to spot transferable advantages. Never used to limit your idea.</p>
        </section>

        <button type="button" onClick={onSubmit} disabled={!isComplete}
          className={`w-full rounded-xl px-6 py-4 text-base font-semibold transition ${
            isComplete
              ? "bg-primary text-primary-foreground shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.6)] hover:brightness-110 active:scale-[0.99]"
              : "cursor-not-allowed bg-muted text-muted-foreground"
          }`}>
          Generate My Blueprint →
        </button>
      </div>
    </div>
  );
};
