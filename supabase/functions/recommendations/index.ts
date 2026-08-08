import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { averageEmbeddings } from "../_shared/embeddings.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const CONTENT_FIELDS =
  "id,type,title,subtitle,description,author,tags,category,slug,cover,rating,rating_count,formats,language,year,size,views,read_time,episode_count,price_cents,currency,published,featured,collection,created_at";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") ?? "for-you";
    const itemId = url.searchParams.get("itemId") ?? undefined;
    const limit = Math.min(Number(url.searchParams.get("limit")) || 12, 48);
    const typeFilter = url.searchParams.get("type");
    const filterType = typeFilter && typeFilter !== "all" ? typeFilter : null;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Optional user context
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await admin.auth.getClaims(token);
      userId = (data?.claims?.sub as string) ?? null;
    }

    const popular = async (exclude: string[] = []) => {
      let q = admin
        .from("contents")
        .select(CONTENT_FIELDS)
        .eq("published", true)
        .order("views", { ascending: false })
        .order("rating", { ascending: false })
        .limit(limit);
      if (filterType) q = q.eq("type", filterType);
      if (exclude.length) q = q.not("id", "in", `(${exclude.join(",")})`);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((c) => ({ ...c, reason: "Popular na plataforma" }));
    };

    const hydrate = async (
      matches: { id: string; similarity: number }[],
      reason: string,
    ) => {
      if (matches.length === 0) return [];
      const ids = matches.map((m) => m.id);
      const { data, error } = await admin
        .from("contents")
        .select(CONTENT_FIELDS)
        .in("id", ids)
        .eq("published", true);
      if (error) throw error;
      const byId = new Map((data ?? []).map((c) => [c.id, c]));
      return matches
        .filter((m) => byId.has(m.id))
        .map((m) => ({ ...byId.get(m.id)!, similarity: m.similarity, reason }));
    };

    const searchSimilar = async (
      embedding: number[] | string,
      exclude: string[],
      reason: string,
    ) => {
      const { data, error } = await admin.rpc("match_contents", {
        query_embedding: typeof embedding === "string" ? embedding : JSON.stringify(embedding),
        match_count: limit + exclude.length,
        filter_type: filterType,
        exclude_ids: exclude,
      });
      if (error) throw error;
      return hydrate(((data ?? []) as any[]).slice(0, limit), reason);
    };

    // ---- similar / because-you-read -------------------------------------
    if (action === "similar" || action === "because-you-read") {
      if (!itemId) return json({ error: "itemId is required" }, 400);
      const { data: item, error } = await admin
        .from("contents")
        .select("id,title,embedding")
        .eq("id", itemId)
        .maybeSingle();
      if (error) throw error;
      if (!item?.embedding) return json({ items: await popular([itemId]) });

      const reason =
        action === "because-you-read" ? `Porque você leu "${item.title}"` : "Leitores também gostaram";
      const items = await searchSimilar(item.embedding as unknown as string, [itemId], reason);
      return json({ items: items.length ? items : await popular([itemId]) });
    }

    // ---- continue reading ------------------------------------------------
    if (action === "continue-reading") {
      if (!userId) return json({ items: [] });
      const { data: progress, error } = await admin
        .from("user_progress")
        .select("content_id,progress_percentage,last_read_at,episode_id")
        .eq("user_id", userId)
        .order("last_read_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      const ids = (progress ?? []).map((p) => p.content_id);
      if (!ids.length) return json({ items: [] });
      const { data: contents, error: cErr } = await admin
        .from("contents")
        .select(CONTENT_FIELDS)
        .in("id", ids);
      if (cErr) throw cErr;
      const byId = new Map((contents ?? []).map((c) => [c.id, c]));
      const items = (progress ?? [])
        .filter((p) => byId.has(p.content_id))
        .map((p) => ({
          ...byId.get(p.content_id)!,
          progress: p.progress_percentage,
          episode_id: p.episode_id,
          last_read_at: p.last_read_at,
        }));
      return json({ items });
    }

    // ---- for you ---------------------------------------------------------
    if (action === "for-you") {
      if (!userId) return json({ items: await popular() });

      const { data: history, error } = await admin
        .from("user_interactions")
        .select("content_id,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(60);
      if (error) throw error;

      const recentIds = [...new Set((history ?? []).map((h) => h.content_id))].slice(0, 20);
      if (recentIds.length === 0) return json({ items: await popular() });

      const { data: seeds, error: sErr } = await admin
        .from("contents")
        .select("id,embedding")
        .in("id", recentIds)
        .not("embedding", "is", null);
      if (sErr) throw sErr;

      const vectors = (seeds ?? [])
        .map((s) => (typeof s.embedding === "string" ? JSON.parse(s.embedding) : s.embedding))
        .filter(Array.isArray) as number[][];
      if (vectors.length === 0) return json({ items: await popular(recentIds) });

      const taste = averageEmbeddings(vectors);
      const items = await searchSimilar(taste, recentIds, "Baseado no seu histórico");
      return json({ items: items.length ? items : await popular(recentIds) });
    }

    return json({ error: `Unknown action: ${action}` }, 400);
  } catch (err) {
    console.error("recommendations error", err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
