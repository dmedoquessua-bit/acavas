import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Stripe posts the raw body; no CORS needed for server-to-server calls.
Deno.serve(async (req) => {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) return new Response("not configured", { status: 500 });

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("missing signature", { status: 400 });

  const raw = await req.text();
  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(raw, signature, webhookSecret);
  } catch (err) {
    console.error("signature verification failed", (err as Error).message);
    return new Response("invalid signature", { status: 400 });
  }

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const contentId = session.metadata?.contentId;

      if (userId && contentId) {
        // Idempotent: only flips a row that is not already paid.
        const { data: updated, error } = await admin
          .from("content_purchases")
          .update({
            status: "paid",
            provider_reference: typeof session.payment_intent === "string" ? session.payment_intent : null,
          })
          .eq("checkout_session_id", session.id)
          .neq("status", "paid")
          .select("id");
        if (error) throw error;

        // Fallback when the pending row is missing (e.g. created out of band).
        if (!updated || updated.length === 0) {
          const { data: already } = await admin
            .from("content_purchases")
            .select("id")
            .eq("checkout_session_id", session.id)
            .maybeSingle();
          if (!already) {
            await admin.from("content_purchases").insert({
              user_id: userId,
              content_id: contentId,
              amount_cents: session.amount_total ?? 0,
              currency: (session.currency ?? "brl").toUpperCase(),
              status: "paid",
              provider: "stripe",
              checkout_session_id: session.id,
              provider_reference: typeof session.payment_intent === "string" ? session.payment_intent : null,
            });
          }
        }
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      await admin
        .from("content_purchases")
        .update({ status: "cancelled" })
        .eq("checkout_session_id", session.id)
        .eq("status", "pending");
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("webhook handling error", err);
    return new Response("handler error", { status: 500 });
  }
});
