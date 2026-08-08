import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { buildItemText, generateEmbeddings, EMBEDDING_MODEL } from "../_shared/embeddings.ts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const payload = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const contentId: string | undefined = payload.contentId;
    const force: boolean = payload.force === true;
    const limit: number = Math.min(Number(payload.limit) || 200, 500);

    let query = admin
      .from("contents")
      .select("id,type,title,subtitle,description,body,author,tags,category,embedding")
      .limit(limit);

    if (contentId) query = query.eq("id", contentId);
    else if (!force) query = query.is("embedding", null);

    const { data: rows, error } = await query;
    if (error) throw error;
    if (!rows || rows.length === 0) return json({ updated: 0, message: "Nothing to embed" });

    const texts = rows.map((r) => buildItemText(r as any));
    const vectors = await generateEmbeddings(texts);

    let updated = 0;
    for (let i = 0; i < rows.length; i++) {
      const { error: upErr } = await admin
        .from("contents")
        .update({ embedding: JSON.stringify(vectors[i]), embedding_model: EMBEDDING_MODEL })
        .eq("id", rows[i].id);
      if (upErr) throw upErr;
      updated++;
    }

    return json({ updated, model: EMBEDDING_MODEL });
  } catch (err) {
    console.error("embed-contents error", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("429") ? 429 : message.includes("402") ? 402 : 500;
    return json({ error: message }, status);
  }
});
