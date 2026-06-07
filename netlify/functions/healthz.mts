import type { Context, Config } from "@netlify/functions";

const SUPABASE_URL = "https://nlpgbwhxdrxsddhkkcwc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5scGdid2h4ZHJ4c2RkaGtrY3djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0Mjk4MjMsImV4cCI6MjA5MjAwNTgyM30.osl-l7AqK6Xk_a9AuuupIgEIBJ1lvNTvtmAhAwCqIy4";

export default async (req: Request, context: Context) => {
  const start = Date.now();
  const checks: Record<string, { status: string; latency?: number; error?: string }> = {};

  // 1. Supabase
  try {
    const t = Date.now();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/token_balance?limit=1`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
    checks.supabase = res.status < 500
      ? { status: "ok", latency: Date.now() - t }
      : { status: "error", error: `HTTP ${res.status}` };
  } catch (e) {
    checks.supabase = { status: "error", error: String(e) };
  }

  // 2. Edge function
  try {
    const t = Date.now();
    const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-blueprint`, { method: "OPTIONS" });
    checks.edge_function = res.status < 500
      ? { status: "ok", latency: Date.now() - t }
      : { status: "error", error: `HTTP ${res.status}` };
  } catch (e) {
    checks.edge_function = { status: "error", error: String(e) };
  }

  // 3. Anthropic
  try {
    const t = Date.now();
    const res = await fetch("https://api.anthropic.com/v1/models", {
      headers: { "anthropic-version": "2023-06-01", "x-api-key": "test" },
    });
    checks.anthropic = res.status < 500
      ? { status: "ok", latency: Date.now() - t }
      : { status: "error", error: `HTTP ${res.status}` };
  } catch (e) {
    checks.anthropic = { status: "error", error: String(e) };
  }

  // 4. Stripe
  try {
    const t = Date.now();
    const res = await fetch("https://api.stripe.com/healthcheck");
    checks.stripe = res.status < 500
      ? { status: "ok", latency: Date.now() - t }
      : { status: "error", error: `HTTP ${res.status}` };
  } catch (e) {
    checks.stripe = { status: "error", error: String(e) };
  }

  const allOk = Object.values(checks).every(c => c.status === "ok");

  return new Response(JSON.stringify({
    status: allOk ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    latency_ms: Date.now() - start,
    services: checks,
  }, null, 2), {
    status: allOk ? 200 : 503,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
  });
};

export const config: Config = {
  path: "/healthz"
};
