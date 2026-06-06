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
  answers: Record<string, string>;
}

interface BlueprintTag {
  blueprint_id: string;
  industry: string | null;
  quality: string | null;
  status: string | null;
  notes: string | null;
}

interface DayStat { date: string; count: number; }

const INDUSTRIES = ["Digital Product", "SaaS", "Service", "Creator", "Physical", "Marketplace", "Other"];
const QUALITIES  = ["⭐ Excellent", "✓ Good", "~ Average", "✗ Poor"];
const STATUSES   = ["New", "Reviewed", "Featured", "Flagged"];

const FILTER_OPTIONS = ["All", ...INDUSTRIES, "⭐ Excellent", "✓ Good", "Featured", "Flagged", "Untagged"];

const qualityColor = (q: string) => {
  if (q === "⭐ Excellent") return "bg-yellow-50 border-yellow-200 text-yellow-800";
  if (q === "✓ Good")      return "bg-green-50 border-green-200 text-green-700";
  if (q === "~ Average")   return "bg-gray-50 border-gray-200 text-gray-600";
  if (q === "✗ Poor")      return "bg-red-50 border-red-200 text-red-600";
  return "";
};

const statusColor = (s: string) => {
  if (s === "Featured") return "bg-purple-50 border-purple-200 text-purple-700";
  if (s === "Reviewed") return "bg-blue-50 border-blue-200 text-blue-700";
  if (s === "Flagged")  return "bg-red-50 border-red-200 text-red-600";
  if (s === "New")      return "bg-indigo-50 border-indigo-200 text-indigo-600";
  return "";
};

const AMOUNTS = [1, 3, 5, 10];
const REASONS = [
  { value: "refund_failed_generation", label: "Failed generation" },
  { value: "goodwill", label: "Goodwill" },
  { value: "beta_tester", label: "Beta tester" },
  { value: "referral", label: "Referral reward" },
  { value: "support", label: "Support issue" },
  { value: "promo", label: "Promo" },
];

interface GiftLog { email: string; amount: number; reason: string; time: string; }

const GiftTokens = () => {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState(1);
  const [reason, setReason] = useState("refund_failed_generation");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [log, setLog] = useState<GiftLog[]>([]);

  const handleGift = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setSuccess("");
    try {
      const SERVICE_ROLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5scGdid2h4ZHJ4c2RkaGtrY3djIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQyOTgyMywiZXhwIjoyMDkyMDA1ODIzfQ.dyeu2RT8FoAc_YwEOFxC9sA7ZfA_JvRw8hKR_zs216A";
      const SUPABASE_URL = "https://nlpgbwhxdrxsddhkkcwc.supabase.co";

      // Find user by email
      const userRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email.trim())}`, {
        headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` },
      });
      const userData = await userRes.json();
      const userId = userData?.users?.[0]?.id;
      if (!userId) throw new Error("User not found");

      // Get current balance
      const balRes = await fetch(`${SUPABASE_URL}/rest/v1/token_balance?user_id=eq.${userId}&select=balance,total_purchased`, {
        headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` },
      });
      const balData = await balRes.json();
      const currentBalance = balData?.[0]?.balance ?? 0;
      const totalPurchased = balData?.[0]?.total_purchased ?? 0;

      // Credit tokens
      await fetch(`${SUPABASE_URL}/rest/v1/token_balance?user_id=eq.${userId}`, {
        method: "PATCH",
        headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}`, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ balance: currentBalance + amount, total_purchased: totalPurchased + amount, updated_at: new Date().toISOString() }),
      });

      // Log transaction
      await fetch(`${SUPABASE_URL}/rest/v1/token_transactions`, {
        method: "POST",
        headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}`, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ user_id: userId, amount, reason: `gift_${reason}` }),
      });

      setSuccess(`✅ ${amount} token${amount > 1 ? "s" : ""} gifted to ${email.trim()}`);
      setLog(prev => [{ email: email.trim(), amount, reason, time: "Just now" }, ...prev.slice(0, 9)]);
      setEmail("");
    } catch (e) {
      setSuccess(`❌ ${e instanceof Error ? e.message : "Failed"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden mb-6">
      <div className="px-5 py-3 border-b border-border">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">🎁 Gift tokens to user</p>
      </div>
      <div className="p-5 space-y-4">
        {/* Email */}
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1.5">User email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="user@example.com"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition" />
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1.5">Tokens to gift</label>
          <div className="grid grid-cols-4 gap-2">
            {AMOUNTS.map(a => (
              <button key={a} onClick={() => setAmount(a)}
                className={`rounded-lg border py-2 text-sm font-semibold transition ${amount === a ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="text-xs font-semibold text-foreground block mb-1.5">Reason</label>
          <div className="flex flex-wrap gap-1.5">
            {REASONS.map(r => (
              <button key={r.value} onClick={() => setReason(r.value)}
                className={`rounded-full border px-3 py-1 text-[11px] font-medium transition ${reason === r.value ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "border-border text-muted-foreground hover:border-indigo-200"}`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Success message */}
        {success && (
          <div className={`rounded-lg px-4 py-2.5 text-sm font-medium ${success.startsWith("✅") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
            {success}
          </div>
        )}

        <button onClick={handleGift} disabled={loading || !email}
          className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(79,70,229,0.3)] transition hover:brightness-110 disabled:opacity-50">
          {loading ? "Gifting…" : `Gift ${amount} token${amount > 1 ? "s" : ""} →`}
        </button>

        {/* Gift log */}
        {log.length > 0 && (
          <div className="border-t border-border pt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Recent gifts</p>
            <div className="space-y-2">
              {log.map((g, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-foreground">{g.email}</span>
                    <span className="text-muted-foreground ml-2">{g.reason.replace(/_/g, " ")}</span>
                  </div>
                  <span className="font-bold text-primary">+{g.amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [blueprints, setBlueprints] = useState<BlueprintRow[]>([]);
  const [tags, setTags] = useState<Record<string, BlueprintTag>>({});
  const [dayStats, setDayStats] = useState<DayStat[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const [editTags, setEditTags] = useState<Record<string, Partial<BlueprintTag>>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");

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
      setDayStats(Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0])).slice(-14).map(([date, count]) => ({ date, count })));
      setTotalUsers(new Set(bps.map(b => b.user_id).filter(Boolean)).size);

      // Load tags
      const ids = bps.map(b => b.id);
      if (ids.length > 0) {
        const { data: tagData } = await supabase
          .from("blueprint_tags")
          .select("*")
          .in("blueprint_id", ids);
        if (tagData) {
          const tagMap: Record<string, BlueprintTag> = {};
          tagData.forEach((t: BlueprintTag) => { tagMap[t.blueprint_id] = t; });
          setTags(tagMap);
        }
      }
    }
    setLoading(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/app/auth"); };

  const togglePanel = (id: string) => {
    if (openPanel === id) { setOpenPanel(null); return; }
    setOpenPanel(id);
    const existing = tags[id];
    setEditTags(prev => ({
      ...prev,
      [id]: {
        industry: existing?.industry ?? null,
        quality: existing?.quality ?? null,
        status: existing?.status ?? null,
        notes: existing?.notes ?? "",
      }
    }));
  };

  const setTagField = (bpId: string, field: keyof BlueprintTag, value: string | null) => {
    setEditTags(prev => ({
      ...prev,
      [bpId]: { ...prev[bpId], [field]: prev[bpId]?.[field] === value ? null : value }
    }));
  };

  const saveTag = async (bpId: string) => {
    setSaving(bpId);
    const t = editTags[bpId] ?? {};
    const payload = { blueprint_id: bpId, industry: t.industry ?? null, quality: t.quality ?? null, status: t.status ?? null, notes: t.notes ?? null, updated_at: new Date().toISOString() };
    await supabase.from("blueprint_tags").upsert(payload, { onConflict: "blueprint_id" });
    setTags(prev => ({ ...prev, [bpId]: payload as BlueprintTag }));
    setSaving(null);
    setOpenPanel(null);
  };

  const filteredBlueprints = blueprints.filter(b => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Untagged") return !tags[b.id];
    const t = tags[b.id];
    if (!t) return false;
    return t.industry === activeFilter || t.quality === activeFilter || t.status === activeFilter;
  });

  const maxCount = Math.max(...dayStats.map(d => d.count), 1);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Logo size="sm" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-600">
              ⚙ Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/app")} className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 transition hover:bg-indigo-100">← App</button>
            <button onClick={handleLogout} className="inline-flex items-center gap-1 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-100">Log out</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total blueprints", value: blueprints.length, highlight: true },
            { label: "Unique users",     value: totalUsers },
            { label: "Today",            value: dayStats.find(d => d.date === new Date().toISOString().slice(0, 10))?.count ?? 0 },
            { label: "This week",        value: dayStats.slice(-7).reduce((s, d) => s + d.count, 0) },
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
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-5">Blueprints generated — last 14 days</p>
            <div className="flex items-end gap-1.5 h-28 pb-6 relative">
              {dayStats.map(d => (
                <div key={d.date} className="flex flex-1 flex-col items-center gap-1 relative">
                  {d.count > 0 && <span className="text-[9px] text-muted-foreground">{d.count}</span>}
                  <div className="w-full rounded-t transition-all" style={{ height: `${(d.count / maxCount) * 72}px`, minHeight: "3px", background: d.count > 0 ? "linear-gradient(180deg,#6366f1,#4f46e5)" : "#f3f4f6" }} />
                  <span className="absolute bottom-[-20px] text-[8px] text-muted-foreground whitespace-nowrap">{d.date.slice(5)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter bar */}
        <div className="flex flex-wrap gap-2 mb-4">
          {FILTER_OPTIONS.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${activeFilter === f ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-card border-border text-muted-foreground hover:border-indigo-200 hover:text-indigo-600"}`}>
              {f} {f === "All" ? `(${blueprints.length})` : ""}
            </button>
          ))}
        </div>

        {/* Gift Tokens */}
        <GiftTokens />

        {/* Blueprint catalogue */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Blueprint catalogue</p>
            <p className="text-xs text-muted-foreground">{filteredBlueprints.length} shown</p>
          </div>

          <div className="divide-y divide-border">
            {filteredBlueprints.map(b => {
              const tag = tags[b.id];
              const edit = editTags[b.id] ?? {};
              const isOpen = openPanel === b.id;

              return (
                <div key={b.id}>
                  {/* Row */}
                  <div className="flex items-center justify-between px-5 py-3.5 gap-4 hover:bg-muted/20 transition">
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/blueprint/${b.id}`)}>
                      <p className="text-sm font-medium text-foreground truncate mb-1.5">{b.idea_name}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {[(b.answers as Record<string, string>)?.budget, (b.answers as Record<string, string>)?.hours].filter(Boolean).map(t => (
                          <span key={t} className="rounded-full bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[10px] text-indigo-600 font-medium">{t}</span>
                        ))}
                        {tag?.industry && <span className="rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-[10px] text-green-700 font-medium">{tag.industry}</span>}
                        {tag?.quality  && <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${qualityColor(tag.quality)}`}>{tag.quality}</span>}
                        {tag?.status   && <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusColor(tag.status)}`}>{tag.status}</span>}
                        {!tag && <span className="text-[10px] text-muted-foreground/40 italic">Untagged</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-xs font-medium text-muted-foreground">{new Date(b.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
                        <p className="text-[10px] text-muted-foreground/40">{new Date(b.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                      <button onClick={() => togglePanel(b.id)}
                        className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition ${isOpen ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "border-border text-muted-foreground hover:border-indigo-200 hover:text-indigo-600"}`}>
                        {isOpen ? "− Close" : "+ Tag"}
                      </button>
                    </div>
                  </div>

                  {/* Inline tag panel */}
                  {isOpen && (
                    <div className="bg-muted/20 border-t border-border px-5 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                        {/* Industry */}
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Industry</p>
                          <div className="flex flex-wrap gap-1.5">
                            {INDUSTRIES.map(opt => (
                              <button key={opt} onClick={() => setTagField(b.id, "industry", opt)}
                                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${edit.industry === opt ? "bg-green-50 border-green-300 text-green-700" : "bg-card border-border text-muted-foreground hover:border-green-200"}`}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                        {/* Quality */}
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Quality</p>
                          <div className="flex flex-wrap gap-1.5">
                            {QUALITIES.map(opt => (
                              <button key={opt} onClick={() => setTagField(b.id, "quality", opt)}
                                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${edit.quality === opt ? qualityColor(opt) : "bg-card border-border text-muted-foreground hover:border-yellow-200"}`}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                        {/* Status */}
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Status</p>
                          <div className="flex flex-wrap gap-1.5">
                            {STATUSES.map(opt => (
                              <button key={opt} onClick={() => setTagField(b.id, "status", opt)}
                                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${edit.status === opt ? statusColor(opt) : "bg-card border-border text-muted-foreground hover:border-purple-200"}`}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      {/* Notes + Save */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add a note..."
                          value={edit.notes ?? ""}
                          onChange={e => setEditTags(prev => ({ ...prev, [b.id]: { ...prev[b.id], notes: e.target.value } }))}
                          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                        />
                        <button onClick={() => saveTag(b.id)} disabled={saving === b.id}
                          className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-60">
                          {saving === b.id ? "Saving…" : "Save"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredBlueprints.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">No blueprints match this filter.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
