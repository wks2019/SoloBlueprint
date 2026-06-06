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
            Built for solo founders who are done overthinking
          </div>

          <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-4xl sm:text-6xl md:text-7xl leading-[1.05] tracking-tight text-gray-900 mb-6">
            Turn your idea into a{" "}
            <em className="text-indigo-600 not-italic">complete business blueprint</em>{" "}
            in minutes
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed font-light">
            You have an idea. You don't have a plan. SoloBlueprint fixes that — in under 60 seconds.
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
              { num: "AI", label: "Powered by AI" },
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
      <section className="bg-gray-50 border-y border-gray-100 px-4 py-16 sm:px-10 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <FadeUp><p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-3 text-center">How it works</p></FadeUp>
          <FadeUp delay={100}><h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl sm:text-4xl text-gray-900 text-center mb-4">From idea to blueprint in three steps</h2></FadeUp>
          <FadeUp delay={200}><p className="text-gray-500 text-center max-w-md mx-auto mb-14 font-light">Stop planning to plan. Here's how it actually works.</p></FadeUp>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { num: "01", icon: "✏️", title: "Describe your idea", body: "Pick your idea type or describe your own. Tell us your budget, time, and goal. 90 seconds max." },
              { num: "02", icon: "⚡", title: "AI builds your plan", body: "Our AI does the heavy lifting — market research, pricing, tools, scripts. All tailored to your situation." },
              { num: "03", icon: "🚀", title: "Launch with clarity", body: "You get a full 14-section plan. Download it, share it, pitch it. You finally know what to do." },
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

      {/* SOCIAL PROOF */}
      <section className="px-4 py-16 sm:px-10 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <FadeUp><p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-3 text-center">Early users</p></FadeUp>
          <FadeUp delay={100}><h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl sm:text-4xl text-gray-900 text-center mb-14">Real results from real founders</h2></FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { q: "I've been sitting on my idea for 6 months. SoloBlueprint gave me a clear plan in under a minute. I launched my first product the following week.", name: "James M.", role: "Freelance consultant, London" },
              { q: "The outreach scripts alone were worth it. Sent 12 DMs using the template, got 4 replies and 2 paying customers in the first week.", name: "Sarah R.", role: "Digital product creator" },
              { q: "Finally something that doesn't give generic advice. It knew my budget, my hours, and gave me a realistic plan. No fluff.", name: "David K.", role: "First-time founder" },
            ].map((t, i) => (
              <FadeUp key={t.name} delay={i * 100}>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 h-full">
                  <p className="text-sm text-gray-600 leading-relaxed mb-5 italic">"{t.q}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">
                      {t.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div><p className="text-sm font-semibold text-gray-900">{t.name}</p><p className="text-xs text-gray-400">{t.role}</p></div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="px-4 py-16 sm:px-10 sm:py-20 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto">
          <FadeUp><p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-3 text-center">Pricing</p></FadeUp>
          <FadeUp delay={100}><h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl sm:text-4xl text-gray-900 text-center mb-4">Simple token pricing</h2></FadeUp>
          <FadeUp delay={200}><p className="text-gray-500 text-center max-w-md mx-auto mb-14 font-light">One token. One blueprint. No subscriptions forced on you. Tokens never expire.</p></FadeUp>
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
                  <p className="text-xs text-gray-400 mb-4">{plan.tokens}</p>
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
                { q: "Is the first blueprint actually free?", a: "Yes. Sign up, get 1 free token, generate your full blueprint. No card, no trial period, no catch. If it's not useful, you've lost nothing." },
                { q: "Do tokens expire?", a: "Never. Buy tokens today, use them in 6 months. Monthly subscription tokens roll over too — unused credits don't disappear." },
                { q: "What if the blueprint isn't good?", a: "You see the first 3 sections before spending a token. If the quality isn't there, don't unlock it. If you paid and you're not happy — email support@soloblueprint.co.uk and we'll make it right." },
                { q: "Can I use it commercially?", a: "It's yours. Every blueprint you generate belongs to you. Pitch it, publish it, build from it, sell it. No restrictions." },
                { q: "Is this just generic AI output?", a: "No. We built a detailed system that forces the AI to give you specific tools, real UK prices, and copy-paste scripts — not vague advice. Every output is shaped around your idea, budget, and goals." },
                { q: "How is this different from ChatGPT?", a: "ChatGPT gives you words. SoloBlueprint gives you a structured 14-section plan with actual tool names, £ prices, outreach scripts ready to send, and a day-by-day action plan. One click. Done." },
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
          <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl sm:text-4xl text-white mb-4">Stop sitting on your idea.</h2>
          <p className="text-indigo-200 mb-8 font-light max-w-md mx-auto">Your first blueprint is free. No card needed. You're 60 seconds away from knowing exactly what to do.</p>
          <button onClick={handleCTA} className="w-full sm:w-auto rounded-xl bg-white px-8 py-4 text-base font-semibold text-indigo-600 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">
            I want my blueprint →
          </button>
        </FadeUp>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 bg-white px-4 py-10 sm:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap items-start justify-between gap-8 mb-8">
            <div>
              <span style={{ fontFamily: "'DM Serif Display', serif" }} className="text-xl text-gray-900">SoloBlueprint</span>
              <p className="text-sm text-gray-400 mt-2 max-w-xs leading-relaxed">Most solo founders never launch because they don't have a clear plan. We fix that.</p>
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
