import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface AccountMenuProps {
  blueprintCount?: number;
}

export const AccountMenu = ({ blueprintCount = 0 }: AccountMenuProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email ?? "");
    });
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleChangePassword = async () => {
    if (!email) return;
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    setOpen(false);
    alert("Password reset email sent.");
  };

  const initial = email ? email[0].toUpperCase() : "?";
  const plan = blueprintCount === 0 ? "Free — 1 blueprint available" : blueprintCount === 1 ? "Free used — upgrade to continue" : "Paid";

  return (
    <div className="relative" ref={ref}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm transition hover:brightness-110"
        aria-label="Account menu"
      >
        {initial}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-10 z-50 w-64 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
          {/* User info */}
          <div className="border-b border-border bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{email}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{plan}</p>
              </div>
            </div>
          </div>

          {/* Usage bar */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Blueprint usage</p>
              <p className="text-[11px] font-semibold text-foreground">{blueprintCount} / 1 free</p>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${blueprintCount >= 1 ? "bg-primary" : "bg-primary/40"}`}
                style={{ width: `${Math.min(blueprintCount, 1) * 100}%` }}
              />
            </div>
            {blueprintCount >= 1 && (
              <p className="mt-1.5 text-[11px] text-primary font-medium">Upgrade to generate more →</p>
            )}
          </div>

          {/* Actions */}
          <div className="py-1">
            <button
              onClick={() => { navigate("/history"); setOpen(false); }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              My blueprints
            </button>
            <button
              onClick={handleChangePassword}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Change password
            </button>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
