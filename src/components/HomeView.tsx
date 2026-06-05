import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const ADMIN_EMAIL = "mvlasceanu26.vm@gmail.com";

interface HomeViewProps {
  onStart: () => void;
  blueprintCount?: number;
}

export const HomeView = ({ onStart, blueprintCount = 0 }: HomeViewProps) => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const hasUsedFree = blueprintCount >= 1;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.email === ADMIN_EMAIL) setIsAdmin(true);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="hero-glow relative flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 pt-6 sm:px-10 sm:pt-8">
        <Logo size="md" />
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => navigate("/admin")}
              className="rounded-lg border border-primary/40 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10"
            >
              Admin
            </button>
          )}
          <button
            onClick={handleLogout}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
          >
            Log out
          </button>
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
          {hasUsedFree ? "Build Another Blueprint →" : "Build My Blueprint →"}
        </button>

        <p className="mt-4 text-xs text-muted-foreground">
          {hasUsedFree ? (
            <span className="text-primary font-medium">Your free blueprint has been used · Unlock from £9</span>
          ) : (
            "Your first blueprint is free"
          )}
        </p>

        <div className="mt-14 flex w-full max-w-2xl flex-wrap items-center justify-center gap-2.5">
          {[
            "✓ 14-section blueprint",
            "✓ Tools & pricing in £",
            "✓ 7-day action plan",
            "✓ Copy-paste outreach scripts",
          ].map((pill) => (
            <span
              key={pill}
              className="rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground sm:text-sm"
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
