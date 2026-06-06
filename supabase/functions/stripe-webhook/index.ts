const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SERVICE_ROLE) throw new Error("Missing env vars");

    const body = await req.text();
    const event = JSON.parse(body);

    // Handle checkout completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const tokens = parseInt(session.metadata?.tokens ?? "0");
      const pack = session.metadata?.pack;
      const sessionId = session.id;

      if (!userId || !tokens) {
        console.log("Missing user_id or tokens in metadata");
        return new Response("ok", { headers: corsHeaders });
      }

      // Get current balance
      const balRes = await fetch(
        `${SUPABASE_URL}/rest/v1/token_balance?user_id=eq.${userId}&select=balance,total_purchased`,
        { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` } }
      );
      const balData = await balRes.json();
      const currentBalance = balData?.[0]?.balance ?? 0;
      const totalPurchased = balData?.[0]?.total_purchased ?? 0;

      // Credit tokens
      await fetch(`${SUPABASE_URL}/rest/v1/token_balance?user_id=eq.${userId}`, {
        method: "PATCH",
        headers: {
          apikey: SERVICE_ROLE,
          Authorization: `Bearer ${SERVICE_ROLE}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          balance: currentBalance + tokens,
          total_purchased: totalPurchased + tokens,
          updated_at: new Date().toISOString(),
        }),
      });

      // Log transaction
      await fetch(`${SUPABASE_URL}/rest/v1/token_transactions`, {
        method: "POST",
        headers: {
          apikey: SERVICE_ROLE,
          Authorization: `Bearer ${SERVICE_ROLE}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          user_id: userId,
          amount: tokens,
          reason: `purchase_${pack}`,
          stripe_session_id: sessionId,
        }),
      });

      console.log(`Credited ${tokens} tokens to user ${userId} for pack ${pack}`);
    }

    // Handle subscription renewal
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object;
      if (invoice.billing_reason === "subscription_cycle") {
        const customerId = invoice.customer;

        // Find user by Stripe customer ID from transactions
        const txRes = await fetch(
          `${SUPABASE_URL}/rest/v1/token_transactions?stripe_session_id=like.${customerId}*&select=user_id&limit=1`,
          { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` } }
        );
        const txData = await txRes.json();
        const userId = txData?.[0]?.user_id;

        if (userId) {
          const balRes = await fetch(
            `${SUPABASE_URL}/rest/v1/token_balance?user_id=eq.${userId}&select=balance,total_purchased`,
            { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` } }
          );
          const balData = await balRes.json();
          const currentBalance = balData?.[0]?.balance ?? 0;

          await fetch(`${SUPABASE_URL}/rest/v1/token_balance?user_id=eq.${userId}`, {
            method: "PATCH",
            headers: {
              apikey: SERVICE_ROLE,
              Authorization: `Bearer ${SERVICE_ROLE}`,
              "Content-Type": "application/json",
              Prefer: "return=minimal",
            },
            body: JSON.stringify({
              balance: currentBalance + 20,
              total_purchased: (balData?.[0]?.total_purchased ?? 0) + 20,
              updated_at: new Date().toISOString(),
            }),
          });
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
