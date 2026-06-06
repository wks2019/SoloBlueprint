import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Mode = "signin" | "signup" | "forgot" | "reset";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) { setMode("reset"); return; }
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/app");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") setMode("reset");
      else if (session) navigate("/app");
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth` } });
        if (error) throw error;
        toast({ title: "Account created", description: "Check your email to confirm, then sign in." });
        setMode("signin");
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/app/auth` });
        if (error) throw error;
        toast({ title: "Reset email sent", description: "Check your inbox for a password reset link." });
        setMode("signin");
      } else if (mode === "reset") {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        toast({ title: "Password updated" });
        await supabase.auth.signOut();
        setMode("signin");
      }
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const titles: Record<Mode, string> = { signin: "Sign in", signup: "Create account", forgot: "Reset password", reset: "Set new password" };
  const subs: Record<Mode, string> = { signin: "Welcome back.", signup: "Start building your blueprint.", forgot: "We'll send a reset link to your email.", reset: "Enter your new password below." };
  const btnLabels: Record<Mode, string> = { signin: "Sign in", signup: "Sign up", forgot: "Send reset link", reset: "Update password" };

  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* Top brand bar */}
      <header className="flex items-center justify-between px-6 pt-6 sm:px-10 sm:pt-8">
        <div className="inline-flex items-baseline gap-1.5">
          <span className="font-display text-xl text-foreground">SoloBlueprint</span>
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          {/* Card */}
          <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
            <h1 className="font-display text-2xl text-foreground">{titles[mode]}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subs[mode]}</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              {mode !== "reset" && (
                <input
                  type="email" required placeholder="Email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              )}
              {(mode === "signin" || mode === "signup") && (
                <input
                  type="password" required minLength={6} placeholder="Password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              )}
              {mode === "reset" && (
                <input
                  type="password" required minLength={6} placeholder="New password" value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              )}
              <button
                type="submit" disabled={loading}
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_4px_20px_rgba(79,70,229,0.3)] transition hover:brightness-110 disabled:opacity-60"
              >
                {loading ? "…" : btnLabels[mode]}
              </button>
            </form>

            <div className="mt-4 flex flex-col gap-2 text-center">
              {mode === "signin" && (
                <>
                  <button onClick={() => setMode("forgot")} className="text-xs text-muted-foreground transition hover:text-foreground">Forgot password?</button>
                  <button onClick={() => setMode("signup")} className="text-xs text-muted-foreground transition hover:text-foreground">Need an account? <span className="text-primary font-medium">Sign up</span></button>
                </>
              )}
              {mode === "signup" && (
                <button onClick={() => setMode("signin")} className="text-xs text-muted-foreground transition hover:text-foreground">Have an account? <span className="text-primary font-medium">Sign in</span></button>
              )}
              {(mode === "forgot" || mode === "reset") && (
                <button onClick={() => setMode("signin")} className="text-xs text-muted-foreground transition hover:text-foreground">← Back to sign in</button>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <p className="mt-4 text-center text-[11px] text-muted-foreground px-4 leading-relaxed">
            By signing up you agree to our{" "}
            <a href="/terms" className="underline hover:text-foreground">Terms</a> and{" "}
            <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>.
            AI outputs are for informational purposes only.
          </p>
        </div>
      </div>

      {/* Footer with admin link */}
      <footer className="flex items-center justify-center gap-6 px-6 pb-6 pt-2">
        <span className="text-xs text-muted-foreground">© 2026 SoloBlueprint</span>
        <button
          onClick={() => navigate("/app/admin")}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-primary"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
          </svg>
          Admin
        </button>
      </footer>

    </div>
  );
};

export default Auth;
