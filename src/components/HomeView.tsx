import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { AccountMenu } from "./AccountMenu";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const ADMIN_EMAIL = "mvlasceanu26.vm@gmail.com";

interface HomeViewProps {
  onStart: () => void;
  tokenBalance?: number | null;
}

export const HomeView = ({ onStart, tokenBalance = null }: HomeViewProps) => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.email === ADMIN_EMAIL) setIsAdmin(true);
    });
  }, []);

  const hasTokens = tokenBalance === null || tokenBalance > 0;
  const tokenLabel = tokenBalance === null ? "" : tokenBalance === 0 ? "0 tokens — top up to continue" : `${tokenBalance} token${tokenBalance !== 1 ? "s" : ""} remaining`;

  return (
    <div className="hero-glow relative flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 pt-6 sm:px-10 sm:pt-8">
        <Logo size="md" />
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => navigate("/app/admin")}
              className="rounded-lg border border-primary/40 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10"
            >
              Admin
            </button>
          )}
          <AccountMenu />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
          AI-powered · Built for solo founders
        </p>

        <h1 className="font-display text-balance text-4xl leading-[1.1] text-foreground sm:text-5xl md:text-6xl md:leading-[1.05]">
          Turn your idea into a
          <br className="hidden sm:block" />{" "}
          <span className="text-primary">complete business blueprint</span>
        </h1>

        <p className="mx-auto mt-6 max-w-[480px] text-balance text-base text-muted-foreground sm:text-lg">
          Answer 5 quick questions. Get a 14-section blueprint with tools,
          pricing, outreach scripts and a 7-day action plan. In under 60 seconds.
        </p>

        <button
          onClick={onStart}
          className="mt-10 w-full max-w-[300px] rounded-xl bg-primary px-6 py-4 text-base font-semibold text-primary-foreground shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.6)] transition hover:brightness-110 active:scale-[0.98]"
        >
          {hasTokens ? "Build My Blueprint →" : "Get Tokens →"}
        </button>

        {tokenLabel && (
          <p className={`mt-4 text-xs font-medium ${tokenBalance === 0 ? "text-primary" : "text-muted-foreground"}`}>
            🪙 {tokenLabel}
          </p>
        )}
        {tokenBalance === null && (
          <p className="mt-4 text-xs text-muted-foreground">Your first blueprint is free</p>
        )}

        {/* What you'll get */}
        <div className="mt-12 w-full max-w-lg">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3 text-center">Your blueprint includes</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {["Idea Diagnosis", "Market Research", "Target Audience", "Clear Offer", "AI Tool Stack", "Launch Plan", "Pricing Strategy", "Outreach Scripts", "7-Day Plan", "Scale Path"].map((s) => (
              <span key={s} className="rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-[11px] text-indigo-600 font-medium">{s}</span>
            ))}
          </div>
        </div>

        <div className="mt-14 flex w-full max-w-2xl flex-wrap items-center justify-center gap-2.5">
          {[
            "✓ 14-section blueprint",
            "✓ Tools & pricing in £",
            "✓ 7-day action plan",
            "✓ Copy-paste outreach scripts",
          ].map((pill) => (
            <span
              key={pill}
              className="rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2 text-xs text-indigo-600 font-medium sm:text-sm"
            >
              {pill}
            </span>
          ))}
        </div>
      </main>

      <footer className="px-6 pb-6 text-center text-xs text-muted-foreground">
        SoloBlueprint · soloblueprint.co.uk
      </footer>
    </div>
  );
};
