import { Logo } from "./Logo";

interface HomeViewProps {
  onStart: () => void;
}

export const HomeView = ({ onStart }: HomeViewProps) => {
  return (
    <div className="hero-glow relative flex min-h-screen flex-col">
      {/* Top bar */}
      <header className="px-6 pt-6 sm:px-10 sm:pt-8">
        <Logo size="md" />
      </header>

      {/* Centre content */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
          Free · No account needed
        </p>

        <h1 className="font-display text-balance text-4xl leading-[1.1] text-foreground sm:text-5xl md:text-6xl md:leading-[1.05]">
          Turn your business idea into a
          <br className="hidden sm:block" />{" "}
          <span className="text-foreground">step-by-step launch plan</span>
        </h1>

        <p className="mx-auto mt-6 max-w-[480px] text-balance text-base text-muted-foreground sm:text-lg">
          Answer 5 quick questions. Get a complete blueprint for your solo
          business — in under 60 seconds.
        </p>

        <button
          onClick={onStart}
          className="mt-10 w-full max-w-[280px] rounded-xl bg-primary px-6 py-4 text-base font-semibold text-primary-foreground shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.6)] transition hover:brightness-110 active:scale-[0.98]"
        >
          Build My Blueprint →
        </button>

        <p className="mt-4 text-xs text-muted-foreground">
          Used by solo founders to launch faster
        </p>

        {/* Feature pills */}
        <div className="mt-14 flex w-full max-w-2xl flex-wrap items-center justify-center gap-2.5">
          {[
            "✓ Step-by-step plan",
            "✓ Tools & pricing included",
            "✓ 7-day action plan",
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

      {/* Footer */}
      <footer className="px-6 pb-6 text-center text-xs text-muted-foreground">
        SoloBlueprint · soloblueprint.co.uk
      </footer>
    </div>
  );
};
