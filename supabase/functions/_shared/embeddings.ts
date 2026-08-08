// Shared embedding helpers (Lovable AI Gateway, OpenAI-compatible /v1/embeddings)

export const EMBEDDING_MODEL = "openai/text-embedding-3-small"; // 1536 dims
export const EMBEDDING_DIMS = 1536;

export type EmbeddableItem = {
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  author?: string | null;
  tags?: string[] | null;
  category?: string | null;
  type?: string | null;
  body?: string | null;
};

/** Concatenates the semantic fields of an item into one text blob. */
export function buildItemText(item: EmbeddableItem): string {
  const parts = [
    item.title,
    item.subtitle,
    item.author,
    item.type,
    item.category,
    (item.tags ?? []).join(", "),
    item.description,
    (item.body ?? "").slice(0, 4000),
  ];
  return parts.filter((p) => p && String(p).trim().length > 0).join("\n").slice(0, 20000);
}

export async function generateEmbedding(text: string): Promise<number[]> {
  return (await generateEmbeddings([text]))[0];
}

/** Batched embeddings. Keeps batches small enough for the provider limits. */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

  const out: number[][] = [];
  const BATCH = 32;
  for (let i = 0; i < texts.length; i += BATCH) {
    const batch = texts.slice(i, i + BATCH);
    const res = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: EMBEDDING_MODEL, input: batch }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Embedding request failed (${res.status}): ${body}`);
    }
    const json = await res.json();
    const sorted = [...json.data].sort((a: any, b: any) => a.index - b.index);
    for (const row of sorted) out.push(row.embedding as number[]);
  }
  return out;
}

/** Element-wise mean of several vectors (used for the "taste" vector). */
export function averageEmbeddings(embeddings: number[][]): number[] {
  if (embeddings.length === 0) throw new Error("averageEmbeddings: empty input");
  const dims = embeddings[0].length;
  const sum = new Array(dims).fill(0);
  for (const vec of embeddings) {
    for (let i = 0; i < dims; i++) sum[i] += vec[i];
  }
  return sum.map((v) => v / embeddings.length);
}
