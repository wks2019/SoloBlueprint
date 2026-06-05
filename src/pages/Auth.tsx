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
    // Check if this is a password reset callback
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      setMode("reset");
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session && mode !== "reset") navigate("/");
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("reset");
      } else if (session && mode !== "reset") {
        navigate("/");
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth` },
        });
        if (error) throw error;
        toast({ title: "Account created", description: "Check your email to confirm, then sign in." });
        setMode("signin");
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        toast({ title: "Reset email sent", description: "Check your inbox for a password reset link." });
        setMode("signin");
      } else if (mode === "reset") {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        toast({ title: "Password updated", description: "You can now sign in with your new password." });
        await supabase.auth.signOut();
        setMode("signin");
        navigate("/auth");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const titles: Record<Mode, string> = {
    signin: "Sign in",
    signup: "Create account",
    forgot: "Reset password",
    reset: "Set new password",
  };

  const subs: Record<Mode, string> = {
    signin: "Welcome back.",
    signup: "Start building your blueprint.",
    forgot: "We'll send you a reset link.",
    reset: "Enter your new password below.",
  };

  const btnLabels: Record<Mode, string> = {
    signin: "Sign in",
    signup: "Sign up",
    forgot: "Send reset link",
    reset: "Update password",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
        <h1 className="font-display text-2xl text-foreground">{titles[mode]}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subs[mode]}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          {mode !== "reset" && (
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          )}
          {(mode === "signin" || mode === "signup") && (
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          )}
          {mode === "reset" && (
            <input
              type="password"
              required
              minLength={6}
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {loading ? "…" : btnLabels[mode]}
          </button>
        </form>

        <div className="mt-4 flex flex-col gap-2 text-center">
          {mode === "signin" && (
            <>
              <button onClick={() => setMode("forgot")} className="text-xs text-muted-foreground hover:text-foreground">
                Forgot password?
              </button>
              <button onClick={() => setMode("signup")} className="text-xs text-muted-foreground hover:text-foreground">
                Need an account? Sign up
              </button>
            </>
          )}
          {mode === "signup" && (
            <button onClick={() => setMode("signin")} className="text-xs text-muted-foreground hover:text-foreground">
              Have an account? Sign in
            </button>
          )}
          {(mode === "forgot" || mode === "reset") && (
            <button onClick={() => setMode("signin")} className="text-xs text-muted-foreground hover:text-foreground">
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
