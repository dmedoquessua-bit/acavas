import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Book } from "./useCatalog";

export type ContentType = "book" | "webtoon" | "news" | "academic";

export type Content = {
  id: string;
  type: ContentType;
  title: string;
  subtitle: string | null;
  description: string;
  body?: string;
  author: string;
  tags: string[];
  category: string;
  slug: string | null;
  cover: string | null;
  rating: number;
  rating_count: number;
  formats: string[];
  language: string;
  year: number | null;
  size: string | null;
  views: number;
  read_time: number | null;
  episode_count: number;
  price_cents: number;
  currency: string;
  published: boolean;
  featured: boolean;
  collection: string | null;
  created_at: string;
  /** Extra fields returned by the recommendation endpoints */
  similarity?: number;
  reason?: string;
  progress?: number;
  last_read_at?: string;
};

export type Episode = {
  id: string;
  content_id: string;
  number: number;
  title: string;
  body: string;
  images: string[];
  is_free: boolean;
  published_at: string;
};

export const CONTENT_LABELS: Record<ContentType, string> = {
  book: "Livro",
  webtoon: "Webtoon",
  news: "Notícia",
  academic: "Acadêmico",
};

/** Route for a given content item. */
export const contentHref = (item: Content) =>
  item.type === "webtoon"
    ? `/webtoon/${item.id}`
    : item.type === "news"
      ? `/noticias/${item.slug ?? item.id}`
      : `/conteudo/${item.id}`;

/** Adapter so the existing BookCard renders any content type unchanged. */
export const contentToBook = (item: Content): Book => ({
  id: item.id,
  title: item.title,
  author: item.author,
  description: item.description,
  cover_url: item.cover,
  price_cents: item.price_cents,
  currency: item.currency,
  category: item.category,
  published: item.published,
  featured: item.featured,
  created_at: item.created_at,
});

const SELECT =
  "id,type,title,subtitle,description,author,tags,category,slug,cover,rating,rating_count,formats,language,year,size,views,read_time,episode_count,price_cents,currency,published,featured,collection,created_at";

export const useContents = (options?: { type?: ContentType; category?: string; limit?: number }) =>
  useQuery({
    queryKey: ["contents", options?.type ?? "all", options?.category ?? "all", options?.limit ?? 0],
    queryFn: async () => {
      let q = supabase.from("contents").select(SELECT).eq("published", true);
      if (options?.type) q = q.eq("type", options.type);
      if (options?.category) q = q.eq("category", options.category);
      q = q.order("created_at", { ascending: false });
      if (options?.limit) q = q.limit(options.limit);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as Content[];
    },
  });

export const useTrending = (period: "today" | "week" | "month" = "week", limit = 8) =>
  useQuery({
    queryKey: ["contents", "trending", period, limit],
    queryFn: async () => {
      const days = period === "today" ? 1 : period === "week" ? 7 : 30;
      const since = new Date(Date.now() - days * 86400000).toISOString();
      const { data, error } = await supabase
        .from("contents")
        .select(SELECT)
        .eq("published", true)
        .gte("created_at", since)
        .order("views", { ascending: false })
        .limit(limit);
      if (error) throw error;
      if ((data ?? []).length > 0) return data as unknown as Content[];
      const { data: fallback } = await supabase
        .from("contents")
        .select(SELECT)
        .eq("published", true)
        .order("views", { ascending: false })
        .limit(limit);
      return (fallback ?? []) as unknown as Content[];
    },
  });

export const useContent = (id?: string) =>
  useQuery({
    queryKey: ["content", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contents")
        .select(`${SELECT},body`)
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as Content | null;
    },
  });

export const useEpisodes = (contentId?: string) =>
  useQuery({
    queryKey: ["episodes", contentId],
    enabled: !!contentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_episodes")
        .select("*")
        .eq("content_id", contentId!)
        .order("number", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Episode[];
    },
  });

/** Records a user interaction (view, read, download, like, rate, progress). */
export const useTrackInteraction = () => {
  const { user } = useAuth();
  return async (contentId: string, action: string, progress = 0) => {
    if (!user) return;
    await supabase.from("user_interactions").insert({
      user_id: user.id,
      content_id: contentId,
      action,
      progress,
    });
  };
};

export const useProgress = (contentId?: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["progress", user?.id, contentId],
    enabled: !!user && !!contentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user!.id)
        .eq("content_id", contentId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
};

export const useSaveProgress = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { contentId: string; percentage: number; episodeId?: string | null }) => {
      if (!user) return null;
      const { error } = await supabase.from("user_progress").upsert(
        {
          user_id: user.id,
          content_id: input.contentId,
          episode_id: input.episodeId ?? null,
          progress_percentage: Math.max(0, Math.min(100, Math.round(input.percentage))),
          last_read_at: new Date().toISOString(),
        },
        { onConflict: "user_id,content_id" },
      );
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["progress"] });
      qc.invalidateQueries({ queryKey: ["recommendations", "continue-reading"] });
    },
  });
};
