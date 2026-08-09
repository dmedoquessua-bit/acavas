import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { NewsItem } from "./useCatalog";

const PAGE_SIZE = 9;

const sel = (s: string): string => s;

export interface NewsFilters {
  category?: string;
  q?: string;
  order?: "recent" | "oldest";
}

/** Cursor-based (keyset) news feed on published_at + id. */
export const useNewsFeed = (filters: NewsFilters) =>
  useInfiniteQuery({
    queryKey: ["news-feed", filters],
    initialPageParam: null as { published_at: string; id: string } | null,
    queryFn: async ({ pageParam }) => {
      const ascending = filters.order === "oldest";
      let q = supabase
        .from("news")
        .select(sel("id,title,slug,excerpt,content,cover_url,category,published,published_at,created_at"))
        .eq("published", true);

      if (filters.category && filters.category !== "all") q = q.eq("category", filters.category);
      if (filters.q?.trim()) {
        const term = filters.q.trim().replace(/[,()]/g, " ");
        q = q.or(`title.ilike.%${term}%,excerpt.ilike.%${term}%`);
      }
      if (pageParam) {
        const op = ascending ? "gt" : "lt";
        q = q.or(
          `published_at.${op}.${pageParam.published_at},and(published_at.eq.${pageParam.published_at},id.${op}.${pageParam.id})`,
        );
      }

      const { data, error } = await q
        .order("published_at", { ascending })
        .order("id", { ascending })
        .limit(PAGE_SIZE)
        .returns<NewsItem[]>();
      if (error) throw error;

      const items = data ?? [];
      const last = items[items.length - 1];
      return {
        items,
        nextCursor:
          items.length === PAGE_SIZE && last ? { published_at: last.published_at, id: last.id } : null,
      };
    },
    getNextPageParam: (last) => last.nextCursor,
  });
