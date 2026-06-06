import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";

const ADMIN_EMAIL = "mvlasceanu26.vm@gmail.com";

interface BlueprintRow {
  id: string;
  idea_name: string;
  created_at: string;
  user_id: string | null;
  answers: Record<string, unknown>;
}

interface DayStat {
  date: string;
  count: number;
}

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [blueprints, setBlueprints] = useState<BlueprintRow[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [dayStats, setDayStats] = useState<DayStat[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { navigate("/app/auth"); return; }
      const email = data.session.user.email;
      if (email !== ADMIN_EMAIL) { navigate("/app"); return; }
      await loadData();
    });
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);

    const { data: bps } = await supabase
      .from("blueprints")
      .select("id, idea_name, created_at, user_id, answers")
      .order("created_at", { ascending: false })
      .limit(200);

    if (bps) {
      setBlueprints(bps as BlueprintRow[]);

      // Day stats — last 14 days
      const counts: Record<string, number> = {};
      bps.forEach((b) => {
        const day = b.created_at.slice(0, 10);
        counts[day] = (counts[day] || 0) + 1;
      });
      const sorted = Object.entries(counts)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-14)
        .map(([date, count]) => ({ date, count }));
      setDayStats(sorted);

      // Unique users
      const unique = new Set(bps.map((b) => b.user_id).filter(Boolean));
      setTotalUsers(unique.size);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/app/auth");
  };

  const maxCount = Math.max(...dayStats.map((d) => d.count), 1);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/app")}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              ← App
            </button>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
          {[
            { label: "Total blueprints", value: blueprints.length },
            { label: "Unique users", value: totalUsers },
            { label: "Today", value: dayStats.find(d => d.date === new Date().toISOString().slice(0, 10))?.count ?? 0 },
            { label: "This week", value: dayStats.slice(-7).reduce((s, d) => s + d.count, 0) },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                {stat.label}
              </p>
              <p className="font-display text-3xl text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        {dayStats.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5 mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Blueprints generated — last 14 days
            </p>
            <div className="flex items-end gap-1.5 h-24">
              {dayStats.map((d) => (
                <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[9px] text-muted-foreground">{d.count}</span>
                  <div
                    className="w-full rounded-t bg-primary/70 transition-all"
                    style={{ height: `${(d.count / maxCount) * 72}px`, minHeight: "4px" }}
                  />
                  <span className="text-[8px] text-muted-foreground rotate-[-45deg] origin-top-left mt-1">
                    {d.date.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent blueprints */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recent blueprints
            </p>
            <p className="text-xs text-muted-foreground">{blueprints.length} total</p>
          </div>
          <div className="divide-y divide-border">
            {blueprints.slice(0, 50).map((b) => (
              <div key={b.id} className="flex items-center justify-between px-5 py-3 gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{b.idea_name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {(b.answers as Record<string, string>)?.budget ?? "—"} ·{" "}
                    {(b.answers as Record<string, string>)?.hours ?? "—"} ·{" "}
                    {(b.answers as Record<string, string>)?.experience ?? "—"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(b.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60">
                    {new Date(b.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            {blueprints.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">No blueprints yet.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
