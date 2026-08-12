import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const WINDOW_MINUTES = 15;
const MAX_ATTEMPTS = 8;
const BLOCK_MINUTES = 15;

const admin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } },
);

function clientIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("cf-connecting-ip") ??
    "unknown"
  );
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "");
    const ip = clientIp(req);
    const userAgent = req.headers.get("user-agent") ?? null;

    // Resolve the caller (optional) from the bearer token.
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const { data } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
      userId = data.user?.id ?? null;
    }

    if (action === "check-rate-limit" || action === "record-failure") {
      const identifier = `${ip}:${String(body.email ?? "").toLowerCase().slice(0, 255)}`;
      const now = new Date();
      const { data: row } = await admin
        .from("auth_rate_limits")
        .select("*")
        .eq("identifier", identifier)
        .eq("action", "login")
        .maybeSingle();

      if (row?.blocked_until && new Date(row.blocked_until) > now) {
        return json({
          allowed: false,
          retryAfterSeconds: Math.ceil((new Date(row.blocked_until).getTime() - now.getTime()) / 1000),
        });
      }

      if (action === "check-rate-limit") return json({ allowed: true });

      const windowExpired =
        !row || new Date(row.window_start).getTime() + WINDOW_MINUTES * 60_000 < now.getTime();
      const attempts = windowExpired ? 1 : (row?.attempts ?? 0) + 1;
      const blockedUntil =
        attempts >= MAX_ATTEMPTS ? new Date(now.getTime() + BLOCK_MINUTES * 60_000).toISOString() : null;

      await admin.from("auth_rate_limits").upsert(
        {
          identifier,
          action: "login",
          attempts,
          window_start: windowExpired ? now.toISOString() : row!.window_start,
          blocked_until: blockedUntil,
          updated_at: now.toISOString(),
        },
        { onConflict: "identifier,action" },
      );

      await admin.from("audit_logs").insert({
        user_id: null,
        action: "login_failed",
        entity: "auth",
        metadata: { attempts },
        ip_address: ip,
        user_agent: userAgent,
      });

      return json({ allowed: !blockedUntil, attempts, blocked: !!blockedUntil });
    }

    if (action === "log") {
      const event = String(body.event ?? "").slice(0, 100);
      if (!event) return json({ error: "event is required" }, 400);

      await admin.from("audit_logs").insert({
        user_id: userId,
        action: event,
        entity: body.entity ? String(body.entity).slice(0, 100) : null,
        entity_id: body.entityId ? String(body.entityId).slice(0, 100) : null,
        metadata: typeof body.metadata === "object" && body.metadata ? body.metadata : {},
        ip_address: ip,
        user_agent: userAgent,
      });

      // Clear the rate-limit counter on a successful sign-in.
      if (event === "login_success" && body.email) {
        await admin
          .from("auth_rate_limits")
          .delete()
          .eq("identifier", `${ip}:${String(body.email).toLowerCase()}`)
          .eq("action", "login");
      }

      return json({ ok: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (error) {
    console.error("auth-guard error", error);
    return json({ error: "Internal error" }, 500);
  }
});
