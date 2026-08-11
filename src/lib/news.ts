import type { NewsItem } from "@/hooks/useCatalog";

/** Average reading speed used for the "X MIN READ" metadata. */
const WORDS_PER_MINUTE = 220;

export const readingTime = (item: Pick<NewsItem, "content" | "excerpt">) => {
  const words = `${item.content ?? ""} ${item.excerpt ?? ""}`.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
};

/** Newsroom byline — falls back to the house name when no author is stored. */
export const byline = (item: Partial<NewsItem> & { author?: string | null }) =>
  item.author?.trim() || "Redação Worscoi";

/** Photo credit line, kept optional in the data model. */
export const photoCredit = (item: Partial<NewsItem> & { cover_credit?: string | null }) =>
  item.cover_credit?.trim() || "Foto: Acervo Worscoi";

export const NEWS_CATEGORIES = [
  "Futebol",
  "Basquetebol",
  "Voleibol",
  "Tênis",
  "Política",
  "Geopolítica",
  "Mercado",
  "Lançamentos",
  "Animes",
  "Webtoons",
  "Mangás",
  "Tecnologias",
  "Virais",
  "Culinária",
  "Listas",
];

/**
 * Curation logic for the hero slot.
 * Priority: explicit "Top Story" flag/tag → highest daily engagement → most recent.
 * The engagement metric is optional so the API can start feeding it later.
 */
export type CuratedNews = NewsItem & {
  top_story?: boolean | null;
  engagement_score?: number | null;
  author?: string | null;
  cover_credit?: string | null;
};

export const pickFeatured = (items: CuratedNews[]): CuratedNews | null => {
  if (items.length === 0) return null;
  const flagged = items.filter((i) => i.top_story || /top\s*story/i.test(i.category ?? ""));
  const pool = flagged.length > 0 ? flagged : items;
  const today = new Date().toDateString();
  const scored = [...pool].sort((a, b) => {
    const score = (i: CuratedNews) =>
      (i.engagement_score ?? 0) +
      (new Date(i.published_at).toDateString() === today ? 1000 : 0) +
      new Date(i.published_at).getTime() / 1e13;
    return score(b) - score(a);
  });
  return scored[0] ?? null;
};
