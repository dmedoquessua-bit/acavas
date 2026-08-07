import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type Book = {
  id: string;
  title: string;
  author: string;
  description: string;
  cover_url: string | null;
  price_cents: number;
  currency: string;
  category: string;
  published: boolean;
  featured: boolean;
  created_at: string;
};

export type NewsItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_url: string | null;
  category: string;
  published: boolean;
  published_at: string;
};

export type Chapter = {
  id: string;
  book_id: string;
  title: string;
  content: string;
  position: number;
  is_free_preview: boolean;
};

export type Purchase = {
  id: string;
  user_id: string;
  book_id: string;
  amount_cents: number;
  currency: string;
  status: string;
  created_at: string;
};

export const useBooks = () =>
  useQuery({
    queryKey: ["books"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Book[];
    },
  });

export const useBook = (id?: string) =>
  useQuery({
    queryKey: ["book", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("books").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data as Book | null;
    },
  });

export const useChapters = (bookId?: string) =>
  useQuery({
    queryKey: ["chapters", bookId],
    enabled: !!bookId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("book_id", bookId!)
        .order("position", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Chapter[];
    },
  });

export const useNews = () =>
  useQuery({
    queryKey: ["news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as NewsItem[];
    },
  });

export const useArticle = (slug?: string) =>
  useQuery({
    queryKey: ["news", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase.from("news").select("*").eq("slug", slug!).maybeSingle();
      if (error) throw error;
      return data as NewsItem | null;
    },
  });

export const usePurchases = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["purchases", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchases")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Purchase[];
    },
  });
};
