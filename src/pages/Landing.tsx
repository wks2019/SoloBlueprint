import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Landing = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setIsLoggedIn(true);
    });
  }, []);

  const handleCTA = () => navigate(isLoggedIn ? "/app" : "/app/auth");

  return (
    <div className="min-h-screen bg-white font-sans" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur border-b border-gray-100 sm:px-10">
        <span className="font-display text-xl text-gray-900" style={{ fontFamily: "'DM Serif Display', serif" }}>
          SoloBlueprint
        </span>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/app/auth")} className="text-sm text-gray-500 hover:text-gray-900 transition">
            {isLoggedIn ? "My account" : "Sign in"}
          </button>
          <button
            onClick={handleCTA}
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            {isLoggedIn ? "Open app →" : "Get started free"}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-24 pb-16 text-center overflow-hidden">
        {/* Glow */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-indigo-100/60 blur-3xl opacity-60" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
            AI-Powered · Built for Solo Founders
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl leading-[1.05] tracking-tight text-gray-900 mb-6" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Turn your idea into a{" "}
            <em className="text-indigo-600 not-italic">complete business blueprint</em>{" "}
            in minutes
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed font-light">
            Answer 5 questions. Get a 14-section launch plan with real tools, pricing in £, outreach scripts, and a 7-day action plan. Powered by Claude AI.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            <button
              onClick={handleCTA}
              className="rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-[0_8px_30px_rgba(79,70,229,0.35)] transition hover:bg-indigo-700 hover:-translate-y-0.5"
            >
              Build my blueprint →
            </button>
            <button
              onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}
              className="rounded-xl border border-gray-200 px-8 py-4 text-base font-medium text-gray-600 transition hover:border-indigo-200 hover:text-indigo-600"
            >
              See how it works
            </button>
          </div>

          {/* Proof pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {["✓ 14-section blueprint", "✓ Tools & pricing in £", "✓ 7-day action plan", "✓ Copy-paste outreach scripts", "✓ First blueprint free"].map((p) => (
              <span key={p} className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs text-gray-500">{p}</span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 mt-16 flex flex-wrap justify-center gap-10">
          {[["14", "Blueprint sections"], ["<60s", "Time to generate"], ["£0", "To get started"], ["AI", "Powered by Claude"]].map(([num, label]) => (
            <div key={label} className="text-center">
              <p className="font-display text-3xl text-indigo-600" style={{ fontFamily: "'DM Serif Display', serif" }}>{num}</p>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-gray-50 border-y border-gray-100 px-6 py-20 sm:px-10">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-3 text-center">How it works</p>
          <h2 className="font-display text-3xl sm:text-4xl text-gray-900 text-center mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>
            From idea to blueprint in three steps
          </h2>
          <p className="text-gray-500 text-center max-w-md mx-auto mb-14 font-light">No consultants. No templates. Just your idea and 60 seconds.</p>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { num: "01", icon: "✏️", title: "Describe your idea", body: "Pick from popular ideas or describe your own. Tell us your budget, hours per week, experience level, and 90-day goal." },
              { num: "02", icon: "⚡", title: "AI builds your plan", body: "Claude AI researches your market and generates a complete 14-section blueprint tailored to your exact situation." },
              { num: "03", icon: "🚀", title: "Launch with clarity", body: "Download your blueprint, share it with co-founders, or use it to validate before you build anything." },
            ].map((step) => (
              <div key={step.num} className="rounded-2xl border border-gray-200 bg-white p-6 hover:border-indigo-200 hover:shadow-sm transition">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{step.icon}</span>
                  <span className="font-display text-3xl text-indigo-100" style={{ fontFamily: "'DM Serif Display', serif" }}>{step.num}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>

          {/* Section tags */}
          <div className="mt-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4 text-center">Your blueprint includes</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Idea Diagnosis", "Problem & Demand", "Target Audience", "Clear Offer", "Tools & AI Stack", "Launch Plan", "Pricing Strategy", "Distribution", "Outreach Scripts", "Proof Strategy", "Honest Risks", "7-Day Plan", "Scale Path", "Financial Overview"].map((s) => (
                <span key={s} className="rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs text-indigo-600 font-medium">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="px-6 py-20 sm:px-10">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-3 text-center">Pricing</p>
          <h2 className="font-display text-3xl sm:text-4xl text-gray-900 text-center mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Simple token pricing
          </h2>
          <p className="text-gray-500 text-center max-w-md mx-auto mb-14 font-light">1 token = 1 complete blueprint. Buy what you need. Tokens never expire.</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Starter", tokens: "3 tokens", price: "£9", per: "£3/token", desc: "Try a few ideas", featured: false },
              { name: "Builder", tokens: "10 tokens", price: "£19", per: "£1.90/token", desc: "Validate seriously", featured: true },
              { name: "Pro Pack", tokens: "30 tokens", price: "£39", per: "£1.30/token", desc: "Full research mode", featured: false },
              { name: "Monthly", tokens: "20 tokens/mo", price: "£19/mo", per: "Rollover unused", desc: "Best for regulars", featured: false },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-2xl border p-6 relative ${plan.featured ? "border-indigo-500 bg-indigo-50/50 shadow-[0_0_0_1px_rgb(99,102,241)]" : "border-gray-200 bg-white"}`}>
                {plan.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">Best value</span>
                )}
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">{plan.name}</p>
                <p className="font-display text-3xl text-gray-900 mb-0.5" style={{ fontFamily: "'DM Serif Display', serif" }}>{plan.price}</p>
                <p className="text-xs text-gray-400 mb-3">{plan.tokens}</p>
                <p className="text-sm text-gray-500 mb-4">{plan.desc} · {plan.per}</p>
                <button
                  onClick={handleCTA}
                  className={`w-full rounded-lg py-2.5 text-sm font-semibold transition ${plan.featured ? "bg-indigo-600 text-white hover:bg-indigo-700" : "border border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-600"}`}
                >
                  Get started
                </button>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">First blueprint always free · No credit card to sign up · Tokens never expire</p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-indigo-600 px-6 py-20 text-center sm:px-10">
        <h2 className="font-display text-3xl sm:text-4xl text-white mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>
          Your blueprint is waiting.
        </h2>
        <p className="text-indigo-200 mb-8 font-light max-w-md mx-auto">No credit card required. Your first blueprint is completely free.</p>
        <button
          onClick={handleCTA}
          className="rounded-xl bg-white px-8 py-4 text-base font-semibold text-indigo-600 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          Build my blueprint free →
        </button>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 bg-white px-6 py-8 sm:px-10">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <span className="font-display text-gray-900" style={{ fontFamily: "'DM Serif Display', serif" }}>SoloBlueprint</span>
          <div className="flex gap-6 text-xs text-gray-400">
            <button onClick={() => navigate("/terms")} className="hover:text-gray-700 transition">Terms</button>
            <button onClick={() => navigate("/privacy")} className="hover:text-gray-700 transition">Privacy</button>
            <a href="mailto:support@soloblueprint.co.uk" className="hover:text-gray-700 transition">Contact</a>
          </div>
          <p className="text-xs text-gray-400">© 2026 SoloBlueprint · AI outputs are for informational purposes only.</p>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
