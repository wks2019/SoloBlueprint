const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRICE_IDS: Record<string, string> = {
  starter: "price_1TfSFoFTSPA2OpANpuBoGyNO",
  builder: "price_1TfSFpFTSPA2OpANuX78PLBF",
  pro:     "price_1TfSFpFTSPA2OpANZz2mbUeD",
  monthly: "price_1TfSFpFTSPA2OpANKrzFOeQz",
};

const TOKENS: Record<string, number> = {
  starter: 3, builder: 10, pro: 30, monthly: 20,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not set");

    const { pack } = await req.json();
    if (!pack || !PRICE_IDS[pack]) throw new Error("Invalid pack");

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    let userId = null;
    let userEmail = null;

    if (authHeader?.startsWith("Bearer ") && SUPABASE_URL && SERVICE_ROLE) {
      const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: { Authorization: authHeader, apikey: SERVICE_ROLE },
      });
      if (userRes.ok) {
        const u = await userRes.json();
        userId = u?.id ?? null;
        userEmail = u?.email ?? null;
      }
    }

    const isSubscription = pack === "monthly";
    const origin = req.headers.get("origin") || "https://www.soloblueprint.co.uk";

    const params = new URLSearchParams({
      "mode": isSubscription ? "subscription" : "payment",
      "line_items[0][price]": PRICE_IDS[pack],
      "line_items[0][quantity]": "1",
      "success_url": `${origin}/app?checkout=success&pack=${pack}`,
      "cancel_url": `${origin}/app?checkout=cancelled`,
      "metadata[pack]": pack,
      "metadata[tokens]": String(TOKENS[pack]),
    });

    if (userId) params.set("metadata[user_id]", userId);
    if (userEmail) params.set("customer_email", userEmail);

    const session = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const sessionData = await session.json();
    if (sessionData.error) throw new Error(sessionData.error.message);

    return new Response(JSON.stringify({ url: sessionData.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
