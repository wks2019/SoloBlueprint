import { Logo } from "./Logo";

export const LoadingView = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-6 pt-6 sm:px-10 sm:pt-8">
        <Logo size="md" />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="sb-spinner mb-8" aria-hidden="true">
          <span />
        </div>
        <h2 className="font-display text-2xl text-foreground sm:text-3xl">
          Building your blueprint...
        </h2>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Putting your personalised plan together
        </p>
      </main>
    </div>
  );
};
