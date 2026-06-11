import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const IDEAS = [
  { emoji: "💻", label: "Digital Product", value: "a digital product" },
  { emoji: "🛠️", label: "Freelance Service", value: "a freelance service" },
  { emoji: "🎓", label: "Online Course", value: "an online course" },
  { emoji: "📱", label: "Content Brand", value: "a content brand" },
  { emoji: "📦", label: "Physical Product", value: "a physical product" },
  { emoji: "✨", label: "Something Else", value: "something else" },
];

const useCountUp = (target: number, duration: number, trigger: boolean) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); return; }
      setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [trigger, target, duration]);
  return count;
};

const useFadeIn = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); }
    }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
};

const FadeUp = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const { ref, visible } = useFadeIn();
  return (
    <div ref={ref} className={className} style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms` }}>
      {children}
    </div>
  );
};

const Landing = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null);
  const [heroVisible, setHeroVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const sections = useCountUp(14, 900, heroVisible);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) setIsLoggedIn(true); });
    const timer = setTimeout(() => setHeroVisible(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleCTA = () => navigate(isLoggedIn ? "/app" : "/app/auth");

  const ctaLabel = selectedIdea
    ? `Build my ${selectedIdea} blueprint →`
    : isLoggedIn ? "Open app →" : "Build my blueprint →";

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-4 bg-white/92 backdrop-blur border-b border-gray-100 sm:px-10">
        <span style={{ fontFamily: "'DM Serif Display', serif" }} className="text-xl text-gray-900 cursor-pointer" onClick={() => navigate("/")}>SoloBlueprint</span>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/app/auth")} className="text-sm text-gray-500 hover:text-gray-900 transition hidden sm:block">
            {isLoggedIn ? "My account" : "Sign in"}
          </button>
          <button onClick={handleCTA} className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">
            {isLoggedIn ? "Open app →" : "Start free"}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-24 pb-16 text-center overflow-hidden sm:px-6">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-indigo-100/60 blur-3xl opacity-60" style={{ animation: "breathe 6s ease-in-out infinite" }} />

        <style>{`@keyframes breathe{0%,100%{opacity:1;transform:translateX(-50%) scale(1)}50%{opacity:.7;transform:translateX(-50%) scale(1.05)}}`}</style>

        <div ref={heroRef} className="relative z-10 w-full max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
            No consultants. No fluff. Just your plan.
          </div>

          <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-4xl sm:text-6xl md:text-7xl leading-[1.05] tracking-tight text-gray-900 mb-6">
            Your idea deserves a{" "}
            <em className="text-indigo-600 not-italic">real plan, not another tab</em>{" "}
            left open
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed font-light">
            Most founders spend weeks researching and still don't know where to start. SoloBlueprint gives you a complete, specific plan in under 60 seconds.
          </p>

          {/* INTERACTIVE IDEA SELECTOR */}
          <div className="w-full max-w-lg mx-auto mb-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">What are you building?</p>
            <div className="grid grid-cols-3 gap-2">
              {IDEAS.map(idea => (
                <button key={idea.value} onClick={() => setSelectedIdea(idea.value)}
                  className={`rounded-xl border px-3 py-3 text-center transition-all duration-200 font-sans ${
                    selectedIdea === idea.value
                      ? "border-indigo-500 bg-indigo-50 shadow-[0_0_0_1px_#4f46e5] scale-[1.02]"
                      : "border-gray-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/40 hover:-translate-y-0.5"
                  }`}
                >
                  <span className="text-xl block mb-1">{idea.emoji}</span>
                  <span className={`text-[11px] font-medium leading-tight block ${selectedIdea === idea.value ? "text-indigo-600" : "text-gray-600"}`}>{idea.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* DYNAMIC CTA */}
          <div className="flex flex-col items-center gap-3 mb-10">
            <button onClick={handleCTA}
              className="w-full sm:w-auto rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-[0_8px_30px_rgba(79,70,229,0.35)] transition-all duration-300 hover:bg-indigo-700 hover:-translate-y-0.5">
              {ctaLabel}
            </button>
            <p className="text-xs text-gray-400">
              {selectedIdea ? "First blueprint free · No card needed · Takes 60 seconds" : "First blueprint free · No card needed"}
            </p>
          </div>

          {/* ANIMATED STATS */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            {[
              { num: `${sections}`, label: "Blueprint sections" },
              { num: "<60s", label: "Time to generate" },
              { num: "£0", label: "To get started" },
              { num: "3", label: "Free sections to preview" },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <span style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl sm:text-3xl text-indigo-600 block leading-none">{stat.num}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider mt-1 block">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-gray-50 border-y border-gray-100 px-4 py-16 sm:px-10 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <FadeUp><p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-3 text-center">How it works</p></FadeUp>
          <FadeUp delay={100}><h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl sm:text-4xl text-gray-900 text-center mb-4">From idea to blueprint in three steps</h2></FadeUp>
          <FadeUp delay={200}><p className="text-gray-500 text-center max-w-md mx-auto mb-14 font-light">Three steps. No fluff.</p></FadeUp>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { num: "01", icon: "✏️", title: "Describe your idea", body: "Tell us what you want to build, where, and how much time you have. Takes 60 seconds." },
              { num: "02", icon: "⚡", title: "We build your plan", body: "Real tools. Real prices. Real outreach scripts. A full 14-section blueprint built around your specific idea." },
              { num: "03", icon: "🚀", title: "Know exactly what to do", body: "Download your blueprint, share it, or start executing today. No more guessing. No more wasted weeks." },
            ].map((step, i) => (
              <FadeUp key={step.num} delay={i * 100}>
                <div className="rounded-2xl border border-gray-200 bg-white p-6 hover:border-indigo-200 hover:shadow-sm hover:-translate-y-1 transition-all duration-200 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{step.icon}</span>
                    <span style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl text-indigo-100">{step.num}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.body}</p>
                </div>
              </FadeUp>
            ))}
          </div>
          <FadeUp delay={300}>
            <div className="mt-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4 text-center">Your blueprint includes</p>
              <div className="flex flex-wrap justify-center gap-2">
                {["Idea Diagnosis","Problem & Demand","Target Audience","Clear Offer","Tools & AI Stack","Launch Plan","Pricing Strategy","Distribution","Outreach Scripts","Proof Strategy","Honest Risks","7-Day Plan","Scale Path","Financial Overview"].map(s => (
                  <span key={s} className="rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs text-indigo-600 font-medium">{s}</span>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* BLUEPRINT PREVIEW */}
      <section className="px-4 py-16 sm:px-10 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <FadeUp><p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-3 text-center">See it in action</p></FadeUp>
          <FadeUp delay={100}><h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl sm:text-4xl text-gray-900 text-center mb-4">This is what you get</h2></FadeUp>
          <FadeUp delay={200}><p className="text-gray-500 text-center max-w-md mx-auto mb-12 font-light">This is a real blueprint for a real idea. Generated in under 60 seconds. Yours looks exactly like this.</p></FadeUp>

          <FadeUp delay={100}>
            {/* Browser mockup */}
            <div className="rounded-2xl border border-gray-200 shadow-[0_24px_80px_rgba(0,0,0,0.10),0_4px_16px_rgba(0,0,0,0.05)] overflow-hidden">

              {/* Browser chrome */}
              <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-3 border-b border-gray-200">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 bg-white border border-gray-200 rounded-md px-3 py-1 flex items-center gap-1.5">
                  <span className="text-green-500 text-[10px]">🔒</span>
                  <span className="text-[10px] text-gray-400">soloblueprint.co.uk/app</span>
                </div>
              </div>

              {/* App header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-white">
                <span style={{ fontFamily: "'DM Serif Display', serif" }} className="text-sm text-gray-900">SoloBlueprint<span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-600 ml-1 mb-0.5" /></span>
                <div className="flex gap-1.5">
                  {["↓ PDF", "Share", "Start Over"].map(a => (
                    <span key={a} className="text-[10px] border border-gray-200 rounded-full px-2.5 py-1 text-gray-500">{a}</span>
                  ))}
                </div>
              </div>

              {/* Blueprint content */}
              <div className="bg-gray-50 p-4 sm:p-5">
                {/* Hero */}
                <div className="mb-4">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-600 mb-1">Your SoloBlueprint for:</p>
                  <p style={{ fontFamily: "'DM Serif Display', serif" }} className="text-lg sm:text-2xl text-gray-900 mb-2">AI Content Repurposing Service</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["£0–£50", "1–5 hours/week", "Complete beginner", "First £500 in 90 days"].map(t => (
                      <span key={t} className="rounded-full bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[10px] text-indigo-600 font-medium">{t}</span>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="hidden sm:flex gap-4 mb-3">
                  {[["#4f46e5","Strategy"],["#16a34a","Market"],["#ea580c","Build"],["#9333ea","Growth"]].map(([c,l]) => (
                    <div key={l} className="flex items-center gap-1.5">
                      <div className="w-2 h-1.5 rounded-full" style={{ background: c }} />
                      <span className="text-[10px] text-gray-500">{l}</span>
                    </div>
                  ))}
                </div>

                {/* Unlocked sections */}
                <div className="space-y-2">
                  {[
                    { num: "01", title: "Business Idea Diagnosis", cat: "strategy", color: "#4f46e5", bg: "#eef2ff", body: "You're entering a high-demand, low-competition niche. Creators produce 10x more content than they can repurpose, and most have no system. Your edge: you don't need a big audience to start, just 3–5 clients paying £150–300/mo. At £200/client you need just 3 to hit your £500 target in month one." },
                    { num: "02", title: "Real Problem & Demand", cat: "market", color: "#16a34a", bg: "#f0fdf4", body: "r/podcasting, r/youtubers, and r/entrepreneur are full of creators asking 'how do I repurpose my content?' LinkedIn creators with 5k+ followers regularly post about this pain. The demand is proven: you're solving a real, recurring problem that creators can't easily automate themselves yet." },
                    { num: "03", title: "Target Audience", cat: "market", color: "#16a34a", bg: "#f0fdf4", body: "Solo podcasters (100–5k listeners), LinkedIn creators (2k–20k followers), and course creators who publish weekly. They earn £500–3k/mo from content but spend 3–6 hours per piece. They'll pay £150–300/mo to get that time back. Find them on Twitter/X, LinkedIn, and in Skool communities." },
                  ].map(s => (
                    <div key={s.num} className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ borderTop: `2px solid ${s.color}` }}>
                      <div className="flex items-center gap-2 px-3.5 pt-3">
                        <div className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold flex-shrink-0" style={{ background: s.bg, color: s.color }}>{s.num}</div>
                        <span style={{ fontFamily: "'DM Serif Display', serif" }} className="text-sm text-gray-900">{s.title}</span>
                      </div>
                      <p className="px-3.5 pt-1.5 pb-3 pl-10 text-[11px] text-gray-500 leading-relaxed">{s.body}</p>
                    </div>
                  ))}

                  {/* Blurred locked sections */}
                  <div className="relative">
                    <div className="space-y-2 opacity-30 blur-[2px] pointer-events-none select-none">
                      {[
                        { num: "04", title: "Your Clear Offer", color: "#ea580c", bg: "#fff7ed", body: 'The "Content Multiplier" package: take one long-form piece per week and turn it into 5 LinkedIn posts, 3 tweet threads, 1 email newsletter draft...' },
                        { num: "05", title: "Tools You Need", color: "#9333ea", bg: "#fdf4ff", body: "Notion (free), Castmagic (£23/mo), Taplio (£39/mo), Claude AI (£16/mo)..." },
                      ].map(s => (
                        <div key={s.num} className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ borderTop: `2px solid ${s.color}` }}>
                          <div className="flex items-center gap-2 px-3.5 pt-3">
                            <div className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold flex-shrink-0" style={{ background: s.bg, color: s.color }}>{s.num}</div>
                            <span style={{ fontFamily: "'DM Serif Display', serif" }} className="text-sm text-gray-900">{s.title}</span>
                          </div>
                          <p className="px-3.5 pt-1.5 pb-3 pl-10 text-[11px] text-gray-500 leading-relaxed">{s.body}</p>
                        </div>
                      ))}
                    </div>
                    {/* Gradient fade */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/60 to-gray-50 pointer-events-none" />
                  </div>

                  {/* Paywall card */}
                  <div className="bg-white border border-indigo-100 rounded-2xl p-5 text-center shadow-[0_-4px_24px_rgba(79,70,229,0.08)]">
                    <div className="text-xl mb-2">🔓</div>
                    <p style={{ fontFamily: "'DM Serif Display', serif" }} className="text-base text-gray-900 mb-1">Unlock your full blueprint</p>
                    <p className="text-[11px] text-gray-500 mb-4">11 more sections: clear offer, tools, pricing, outreach scripts, 7-day plan.</p>
                    <div className="space-y-2 mb-4">
                      {[
                        { name: "One blueprint", desc: "This blueprint only", price: "£9", period: "one-off", selected: false },
                        { name: "10 tokens", desc: "10 blueprints · £1.90/token", price: "£19", period: "one-off", selected: true },
                        { name: "Monthly", desc: "20 tokens/mo · Rollover", price: "£19", period: "per month", selected: false },
                      ].map(p => (
                        <div key={p.name} className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left ${p.selected ? "border-indigo-500 bg-indigo-50" : "border-gray-200"}`}>
                          <div>
                            <span className="text-xs font-semibold text-gray-900">{p.name}</span>
                            {p.selected && <span className="ml-1.5 rounded-full bg-indigo-600 px-1.5 py-0.5 text-[9px] font-bold text-white">Popular</span>}
                            <p className="text-[10px] text-gray-400">{p.desc}</p>
                          </div>
                          <div className="text-right">
                            <span style={{ fontFamily: "'DM Serif Display', serif" }} className="text-base text-gray-900">{p.price}</span>
                            <p className="text-[9px] text-gray-400">{p.period}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={handleCTA} className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-[0_4px_16px_rgba(79,70,229,0.3)]">
                      Continue to payment →
                    </button>
                    <p className="mt-2 text-[10px] text-gray-400">Secure payment via Stripe · Tokens never expire</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>

          {/* Callout points */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: "🎯", title: "Built around your idea", desc: "Every section is generated for your specific business. Not a template. Not a generic answer." },
              { icon: "🇬🇧", title: "Real tools. Real prices.", desc: "Every recommendation comes with a name, a price, and a reason. No vague advice." },
              { icon: "📋", title: "Ready to send", desc: "Outreach scripts and email copy written for your exact idea. Copy it, paste it, send it." },
            ].map((c, i) => (
              <FadeUp key={c.title} delay={i * 100}>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-center h-full">
                  <div className="text-2xl mb-3">{c.icon}</div>
                  <p className="font-semibold text-gray-900 mb-2 text-sm">{c.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{c.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="px-4 py-16 sm:px-10 sm:py-20 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto">
          <FadeUp><p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-3 text-center">Pricing</p></FadeUp>
          <FadeUp delay={100}><h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl sm:text-4xl text-gray-900 text-center mb-4">Simple token pricing</h2></FadeUp>
          <FadeUp delay={200}><p className="text-gray-500 text-center max-w-md mx-auto mb-14 font-light">Pay for what you use. No subscriptions forced on you. Tokens never expire.</p></FadeUp>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Starter",  tokens: "3 tokens",    price: "£9",     per: "£3/token",      featured: false },
              { name: "Builder",  tokens: "10 tokens",   price: "£19",    per: "£1.90/token",   featured: true  },
              { name: "Pro Pack", tokens: "30 tokens",   price: "£39",    per: "£1.30/token",   featured: false },
              { name: "Monthly",  tokens: "20 tokens/mo",price: "£19/mo", per: "Rollover unused",featured: false },
            ].map((plan, i) => (
              <FadeUp key={plan.name} delay={i * 80}>
                <div className={`rounded-2xl border p-5 relative transition-all duration-200 h-full ${plan.featured ? "border-indigo-500 bg-indigo-50/50 shadow-[0_0_0_1px_rgb(99,102,241)]" : "border-gray-200 bg-white hover:border-indigo-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(79,70,229,0.12)]"}`}>
                  {plan.featured && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider whitespace-nowrap">Best value</span>}
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">{plan.name}</p>
                  <p style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl sm:text-3xl text-gray-900 mb-0.5">{plan.price}</p>
                  <p className="text-xs text-gray-400 mb-1">{plan.tokens}</p>
                  <p className="text-[11px] text-indigo-500 font-medium mb-4">{plan.per}</p>
                  <button onClick={handleCTA} className={`w-full rounded-lg py-2 text-xs sm:text-sm font-semibold transition ${plan.featured ? "bg-indigo-600 text-white hover:bg-indigo-700" : "border border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-600"}`}>
                    Get started
                  </button>
                </div>
              </FadeUp>
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-6">First blueprint free · No card needed · Tokens never expire · Cancel anytime</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-16 sm:px-10 sm:py-20 bg-white">
        <div className="max-w-2xl mx-auto">
          <FadeUp><p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-3 text-center">FAQ</p></FadeUp>
          <FadeUp delay={100}><h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl sm:text-4xl text-gray-900 text-center mb-14">Questions you're probably thinking</h2></FadeUp>
          <FadeUp delay={200}>
            <div className="space-y-3">
              {[
                { q: "Is the first blueprint actually free?", a: "Yes. Sign up, get 1 free token, generate your full blueprint. No card required. If it is not useful, you have lost nothing." },
                { q: "Do tokens expire?", a: "Never. Buy tokens today, use them whenever. Monthly tokens roll over. Nothing disappears." },
                { q: "What if the blueprint isn't good?", a: "You see the first 3 sections before spending a token. If it is not what you expected, do not unlock it. If you paid and are not happy, email support@soloblueprint.co.uk and we will sort it." },
                { q: "Can I use it commercially?", a: "It's yours. Every blueprint you generate belongs to you. Pitch it, publish it, build from it, sell it. No restrictions." },
                { q: "Is this just generic AI output?", a: "No. The system forces specific tools, real prices, and ready-to-send scripts for your exact idea. Not generic AI output. Not the same answer every time." },
                { q: "How is this different from ChatGPT?", a: "ChatGPT gives you words. SoloBlueprint gives you a 14-section plan with tool names, prices, outreach scripts, and a day-by-day action plan. Structured. Specific. Done." },
              ].map((faq, i) => (
                <details key={i} className="group rounded-2xl border border-gray-100 bg-gray-50 px-4 sm:px-6 py-4 cursor-pointer open:bg-white open:border-indigo-100 transition-colors">
                  <summary className="flex items-center justify-between text-sm font-semibold text-gray-900 list-none">
                    {faq.q}
                    <span className="ml-4 text-indigo-400 transition-transform group-open:rotate-180 flex-shrink-0">↓</span>
                  </summary>
                  <p className="mt-3 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-indigo-600 px-4 py-20 text-center sm:px-10">
        <FadeUp>
          <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl sm:text-4xl text-white mb-4">Your plan is 60 seconds away.</h2>
          <p className="text-indigo-200 mb-8 font-light max-w-md mx-auto">Free to start. No card needed. Know exactly what to do by the time you finish your coffee.</p>
          <button onClick={handleCTA} className="w-full sm:w-auto rounded-xl bg-white px-8 py-4 text-base font-semibold text-indigo-600 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">
            Build my free blueprint →
          </button>
        </FadeUp>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 bg-white px-4 py-10 sm:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap items-start justify-between gap-8 mb-8">
            <div>
              <span style={{ fontFamily: "'DM Serif Display', serif" }} className="text-xl text-gray-900">SoloBlueprint</span>
              <p className="text-sm text-gray-400 mt-2 max-w-xs leading-relaxed">You have the idea. We build the plan. You launch.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-12">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Product</p>
                <div className="flex flex-col gap-2">
                  <button onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })} className="text-sm text-gray-500 hover:text-gray-900 text-left transition">How it works</button>
                  <button onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })} className="text-sm text-gray-500 hover:text-gray-900 text-left transition">Pricing</button>
                  <button onClick={handleCTA} className="text-sm text-gray-500 hover:text-gray-900 text-left transition">Get started</button>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Legal</p>
                <div className="flex flex-col gap-2">
                  <button onClick={() => navigate("/terms")} className="text-sm text-gray-500 hover:text-gray-900 text-left transition">Terms</button>
                  <button onClick={() => navigate("/privacy")} className="text-sm text-gray-500 hover:text-gray-900 text-left transition">Privacy</button>
                  <a href="mailto:support@soloblueprint.co.uk" className="text-sm text-gray-500 hover:text-gray-900 transition">Contact</a>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-gray-400">© 2026 SoloBlueprint · AI outputs are for informational purposes only.</p>
            <p className="text-xs text-gray-300">AI-powered</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
