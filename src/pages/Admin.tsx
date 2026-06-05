import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ResultsView } from "@/components/ResultsView";

interface BlueprintRow {
  id: string;
  user_id: string | null;
  idea_name: string;
  answers: any;
  report: any;
  created_at: string;
}

interface ProfileRow {
  user_id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
}

type Tab = "blueprints" | "users" | "stats";

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState<Tab>("blueprints");
  const [blueprints, setBlueprints] = useState<BlueprintRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [viewing, setViewing] = useState<BlueprintRow | null>(null);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        navigate("/auth");
        return;
      }
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", sess.session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!roleRow) {
        toast({
          title: "Not an admin",
          description: "Your account doesn't have admin access yet.",
          variant: "destructive",
        });
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setIsAdmin(true);
      const [bp, pr] = await Promise.all([
        supabase.from("blueprints").select("*").order("created_at", { ascending: false }).limit(500),
        supabase.from("profiles").select("user_id,email,display_name,created_at").order("created_at", { ascending: false }),
      ]);
      if (bp.data) setBlueprints(bp.data as BlueprintRow[]);
      if (pr.data) setProfiles(pr.data as ProfileRow[]);
      setLoading(false);
    })();
  }, [navigate]);

  const stats = useMemo(() => {
    const total = blueprints.length;
    const today = new Date().toISOString().slice(0, 10);
    const todayCount = blueprints.filter((b) => b.created_at.slice(0, 10) === today).length;
    const last7 = Date.now() - 7 * 86400000;
    const last7Count = blueprints.filter((b) => new Date(b.created_at).getTime() > last7).length;
    const ideaCounts: Record<string, number> = {};
    blueprints.forEach((b) => { ideaCounts[b.idea_name] = (ideaCounts[b.idea_name] ?? 0) + 1; });
    const topIdeas = Object.entries(ideaCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
    return { total, todayCount, last7Count, topIdeas, users: profiles.length };
  }, [blueprints, profiles]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-foreground">You're signed in but not an admin.</p>
        <button onClick={signOut} className="rounded-md border border-border px-4 py-2 text-sm">Sign out</button>
      </div>
    );
  }

  if (viewing) {
    return (
      <div>
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/90 px-4 py-2 backdrop-blur">
          <button onClick={() => setViewing(null)} className="text-sm text-muted-foreground hover:text-foreground">← Back to admin</button>
          <span className="text-xs text-muted-foreground">{new Date(viewing.created_at).toLocaleString()}</span>
        </div>
        <ResultsView
          ideaName={viewing.idea_name}
          answers={viewing.answers}
          report={viewing.report}
          onStartOver={() => setViewing(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <h1 className="font-display text-xl text-foreground">Admin</h1>
          <div className="flex gap-2">
            <a href="/" className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">App</a>
            <button onClick={signOut} className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Sign out</button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 px-4 pb-2">
          {(["blueprints", "users", "stats"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium uppercase tracking-wider ${
                tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {tab === "stats" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total blueprints" value={stats.total} />
            <StatCard label="Today" value={stats.todayCount} />
            <StatCard label="Last 7 days" value={stats.last7Count} />
            <StatCard label="Registered users" value={stats.users} />
            <div className="sm:col-span-2 lg:col-span-4 rounded-xl border border-border bg-card p-5">
              <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Top ideas</p>
              {stats.topIdeas.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {stats.topIdeas.map(([idea, n]) => (
                    <li key={idea} className="flex justify-between text-sm">
                      <span className="text-foreground truncate pr-3">{idea}</span>
                      <span className="font-mono-num text-primary">{n}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {tab === "blueprints" && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Idea</th>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Created</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {blueprints.map((b) => (
                  <tr key={b.id} className="border-t border-border">
                    <td className="px-4 py-3 text-foreground">{b.idea_name}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{b.user_id ? b.user_id.slice(0, 8) : "anon"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(b.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setViewing(b)} className="rounded-md border border-border px-2.5 py-1 text-xs hover:border-primary/50">View</button>
                    </td>
                  </tr>
                ))}
                {blueprints.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-sm">No blueprints yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === "users" && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Joined</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.user_id} className="border-t border-border">
                    <td className="px-4 py-3 text-foreground">{p.email ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.display_name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {profiles.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground text-sm">No users yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-xl border border-border bg-card p-5">
    <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className="mt-2 font-mono-num text-3xl text-foreground">{value}</p>
  </div>
);

export default Admin;
