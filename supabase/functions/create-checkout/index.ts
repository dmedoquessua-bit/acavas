import Stripe from "https://esm.sh/stripe@18.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return json({ error: "Pagamentos não configurados" }, 500);

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return json({ error: "Não autenticado" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authClient = createClient(supabaseUrl, anonKey);
    const { data: userData, error: userErr } = await authClient.auth.getUser(token);
    if (userErr || !userData.user) return json({ error: "Sessão inválida" }, 401);
    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const contentId = typeof body.contentId === "string" ? body.contentId : "";
    const origin = typeof body.origin === "string" ? body.origin : req.headers.get("origin") ?? "";
    if (!contentId) return json({ error: "contentId é obrigatório" }, 400);

    // service-role client: never signs in, only writes the pending purchase
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const { data: content, error: contentErr } = await admin
      .from("contents")
      .select("id,title,description,cover,price_cents,currency,published")
      .eq("id", contentId)
      .maybeSingle();
    if (contentErr) throw contentErr;
    if (!content || !content.published) return json({ error: "Conteúdo indisponível" }, 404);
    if (content.price_cents <= 0) return json({ error: "Este conteúdo é gratuito" }, 400);

    const { data: existing } = await admin
      .from("content_purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("content_id", contentId)
      .eq("status", "paid")
      .maybeSingle();
    if (existing) return json({ error: "Você já possui este item" }, 409);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email ?? undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: String(content.currency ?? "brl").toLowerCase(),
            unit_amount: content.price_cents,
            product_data: {
              name: content.title,
              description: (content.description ?? "").slice(0, 300) || undefined,
              images: content.cover ? [content.cover] : undefined,
            },
          },
        },
      ],
      metadata: { userId: user.id, contentId: content.id },
      success_url: `${origin}/compra/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/compra/cancelada`,
    });

    await admin.from("content_purchases").insert({
      user_id: user.id,
      content_id: content.id,
      amount_cents: content.price_cents,
      currency: content.currency,
      status: "pending",
      provider: "stripe",
      checkout_session_id: session.id,
    });

    return json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("create-checkout error", err);
    return json({ error: (err as Error).message }, 500);
  }
});
