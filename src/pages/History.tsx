import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";

interface Blueprint {
  id: string;
  idea_name: string;
  created_at: string;
  answers: Record<string, string>;
}

const History = () => {
  const navigate = useNavigate();
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { navigate("/app/auth"); return; }
      const { data: bps } = await supabase
        .from("blueprints")
        .select("id, idea_name, created_at, answers")
        .eq("user_id", data.session.user.id)
        .order("created_at", { ascending: false });
      setBlueprints((bps as Blueprint[]) ?? []);
      setLoading(false);
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Logo size="sm" />
          <button onClick={() => navigate("/app")} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground">
            ← Back
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-display text-2xl text-foreground mb-1">Your blueprints</h1>
        <p className="text-sm text-muted-foreground mb-8">{blueprints.length} blueprint{blueprints.length !== 1 ? "s" : ""} generated</p>

        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}

        {!loading && blueprints.length === 0 && (
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-10 text-center">
            <p className="text-3xl mb-3">📋</p>
            <p className="font-display text-lg text-foreground mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>No blueprints yet</p>
            <p className="text-sm text-muted-foreground mb-6">Your first blueprint is free. Takes under 60 seconds.</p>
            <button onClick={() => navigate("/app")} className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(79,70,229,0.3)] transition hover:bg-indigo-700">
              Build your first blueprint →
            </button>
          </div>
        )}

        <div className="space-y-3">
          {blueprints.map((b) => (
            <div
              key={b.id}
              onClick={() => navigate(`/blueprint/${b.id}`)}
              className="cursor-pointer rounded-xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg text-foreground truncate">{b.idea_name}</h3>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {[b.answers?.budget, b.answers?.hours, b.answers?.experience].filter(Boolean).map((tag) => (
                      <span key={tag} className="rounded-full bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[11px] text-indigo-600 font-medium">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">
                    {new Date(b.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  <p className="mt-1 text-[11px] text-primary font-medium">View →</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default History;
