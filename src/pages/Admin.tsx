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

interface DayStat { date: string; count: number; }

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [blueprints, setBlueprints] = useState<BlueprintRow[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [dayStats, setDayStats] = useState<DayStat[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { navigate("/app/auth"); return; }
      if (data.session.user.email !== ADMIN_EMAIL) { navigate("/app"); return; }
      await loadData();
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/app/auth");
    });
    return () => sub.subscription.unsubscribe();
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
      const counts: Record<string, number> = {};
      bps.forEach(b => { const day = b.created_at.slice(0, 10); counts[day] = (counts[day] || 0) + 1; });
      const sorted = Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0])).slice(-14).map(([date, count]) => ({ date, count }));
      setDayStats(sorted);
      setTotalUsers(new Set(bps.map(b => b.user_id).filter(Boolean)).size);
    }
    setLoading(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/app/auth"); };
  const maxCount = Math.max(...dayStats.map(d => d.count), 1);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Logo size="sm" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-600">
              ⚙ Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/app")}
              className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-100">
              ← App
            </button>
            <button onClick={handleLogout}
              className="inline-flex items-center gap-1 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-100">
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total blueprints", value: blueprints.length, highlight: true },
            { label: "Unique users",     value: totalUsers,         highlight: false },
            { label: "Today",            value: dayStats.find(d => d.date === new Date().toISOString().slice(0, 10))?.count ?? 0, highlight: false },
            { label: "This week",        value: dayStats.slice(-7).reduce((s, d) => s + d.count, 0), highlight: false },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl border border-border bg-card p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{stat.label}</p>
              <p className={`font-display text-2xl sm:text-3xl ${stat.highlight ? "text-primary" : "text-foreground"}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        {dayStats.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5 mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-5">
              Blueprints generated — last 14 days
            </p>
            <div className="flex items-end gap-1.5 h-28 pb-6 relative">
              {dayStats.map(d => (
                <div key={d.date} className="flex flex-1 flex-col items-center gap-1 relative">
                  {d.count > 0 && <span className="text-[9px] text-muted-foreground">{d.count}</span>}
                  <div
                    className="w-full rounded-t transition-all"
                    style={{
                      height: `${(d.count / maxCount) * 72}px`,
                      minHeight: "3px",
                      background: d.count > 0
                        ? "linear-gradient(180deg, #6366f1, #4f46e5)"
                        : "#f3f4f6",
                    }}
                  />
                  <span className="absolute bottom-[-20px] text-[8px] text-muted-foreground whitespace-nowrap">
                    {d.date.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent blueprints */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Recent blueprints</p>
            <p className="text-xs text-muted-foreground">{blueprints.length} total</p>
          </div>
          <div className="divide-y divide-border">
            {blueprints.slice(0, 50).map(b => (
              <div key={b.id}
                onClick={() => navigate(`/blueprint/${b.id}`)}
                className="flex items-center justify-between px-5 py-3.5 gap-4 hover:bg-muted/20 transition cursor-pointer">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate mb-1.5">{b.idea_name}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[(b.answers as Record<string, string>)?.budget, (b.answers as Record<string, string>)?.hours, (b.answers as Record<string, string>)?.experience]
                      .filter(Boolean).map(tag => (
                        <span key={tag} className="rounded-full bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[10px] text-indigo-600 font-medium">{tag}</span>
                      ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    {new Date(b.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                  <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                    {new Date(b.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-[10px] text-primary mt-1">View →</p>
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
