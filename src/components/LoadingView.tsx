import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const STEPS = [
  { label: "Analysing your idea", duration: 3000 },
  { label: "Researching your market", duration: 5000 },
  { label: "Building your offer & pricing", duration: 5000 },
  { label: "Writing your launch plan", duration: 5000 },
  { label: "Crafting outreach scripts", duration: 4000 },
  { label: "Finalising your 7-day action plan", duration: 4000 },
  { label: "Putting it all together", duration: 4000 },
];

export const LoadingView = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let stepIndex = 0;
    let elapsed = 0;
    const total = STEPS.reduce((s, step) => s + step.duration, 0);

    const tick = setInterval(() => {
      elapsed += 100;
      setProgress(Math.min((elapsed / total) * 100, 95));

      let cumulative = 0;
      for (let i = 0; i < STEPS.length; i++) {
        cumulative += STEPS[i].duration;
        if (elapsed < cumulative) { stepIndex = i; break; }
        stepIndex = STEPS.length - 1;
      }
      setCurrentStep(stepIndex);
    }, 100);

    return () => clearInterval(tick);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-6 pt-6 sm:px-10 sm:pt-8">
        <Logo size="md" />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        {/* Animated ring */}
        <div className="relative mb-10 flex h-20 w-20 items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="4" className="text-border" />
            <circle
              cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className="text-primary transition-all duration-300"
            />
          </svg>
          <span className="text-sm font-semibold text-foreground">{Math.round(progress)}%</span>
        </div>

        <h2 className="font-display text-2xl text-foreground sm:text-3xl">
          Building your blueprint…
        </h2>

        {/* Step list */}
        <div className="mt-8 w-full max-w-[280px] sm:max-w-xs space-y-2">
          {STEPS.map((step, i) => (
            <div
              key={step.label}
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-left transition-all duration-300 ${
                i === currentStep
                  ? "bg-primary/8 border border-primary/20"
                  : i < currentStep
                  ? "opacity-40"
                  : "opacity-20"
              }`}
            >
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                i < currentStep ? "bg-primary text-white" :
                i === currentStep ? "bg-primary/20 text-primary" :
                "bg-muted text-muted-foreground"
              }`}>
                {i < currentStep ? "✓" : i + 1}
              </span>
              <span className={`text-sm ${i === currentStep ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                {step.label}
              </span>
              {i === currentStep && (
                <span className="ml-auto flex gap-0.5">
                  {[0,1,2].map(d => (
                    <span key={d} className="h-1 w-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />
                  ))}
                </span>
              )}
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-muted-foreground">This usually takes 20–40 seconds</p>
      </main>
    </div>
  );
};
