import type { Context } from "@netlify/functions";

const SUPABASE_URL = "https://nlpgbwhxdrxsddhkkcwc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5scGdid2h4ZHJ4c2RkaGtrY3djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0Mjk4MjMsImV4cCI6MjA5MjAwNTgyM30.osl-l7AqK6Xk_a9AuuupIgEIBJ1lvNTvtmAhAwCqIy4";

export default async (req: Request, context: Context) => {
  const start = Date.now();
  const checks: Record<string, { status: string; latency?: number; error?: string }> = {};

  // 1. Supabase check
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

  // 2. Edge function check
  try {
    const t = Date.now();
    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/generate-blueprint`,
      { method: "OPTIONS" }
    );
    checks.edge_function = res.status < 500
      ? { status: "ok", latency: Date.now() - t }
      : { status: "error", error: `HTTP ${res.status}` };
  } catch (e) {
    checks.edge_function = { status: "error", error: String(e) };
  }

  // 3. Stripe check
  try {
    const t = Date.now();
    const res = await fetch("https://api.stripe.com/v1/prices?limit=1", {
      headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY || ""}` },
    });
    checks.stripe = res.status === 200
      ? { status: "ok", latency: Date.now() - t }
      : { status: "error", error: `HTTP ${res.status}` };
  } catch (e) {
    checks.stripe = { status: "error", error: String(e) };
  }

  // 4. Anthropic check
  try {
    const t = Date.now();
    const res = await fetch("https://api.anthropic.com/v1/models", {
      headers: { "anthropic-version": "2023-06-01", "x-api-key": "test" },
    });
    // 401 means reachable but bad key — that's fine for a ping
    checks.anthropic = res.status < 500
      ? { status: "ok", latency: Date.now() - t }
      : { status: "error", error: `HTTP ${res.status}` };
  } catch (e) {
    checks.anthropic = { status: "error", error: String(e) };
  }

  const allOk = Object.values(checks).every(c => c.status === "ok");
  const totalLatency = Date.now() - start;

  const body = {
    status: allOk ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    latency_ms: totalLatency,
    version: "1.0.0",
    services: checks,
  };

  return new Response(JSON.stringify(body, null, 2), {
    status: allOk ? 200 : 503,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store",
    },
  });
};

export const config = { path: "/healthz" };
