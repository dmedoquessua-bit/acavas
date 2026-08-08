import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { Content, ContentType } from "./useContents";

type RecAction = "similar" | "for-you" | "continue-reading" | "because-you-read";

const fetchRecommendations = async (params: {
  action: RecAction;
  itemId?: string;
  limit?: number;
  type?: ContentType | "all";
}): Promise<Content[]> => {
  const search = new URLSearchParams({ action: params.action });
  if (params.itemId) search.set("itemId", params.itemId);
  if (params.limit) search.set("limit", String(params.limit));
  if (params.type && params.type !== "all") search.set("type", params.type);

  const { data, error } = await supabase.functions.invoke(`recommendations?${search.toString()}`, {
    method: "GET",
  });
  if (error) throw error;
  return (data?.items ?? []) as Content[];
};

/** GET /api/recommendations/similar/:itemId */
export const useSimilar = (itemId?: string, limit = 8, type?: ContentType | "all") =>
  useQuery({
    queryKey: ["recommendations", "similar", itemId, limit, type],
    enabled: !!itemId,
    queryFn: () => fetchRecommendations({ action: "similar", itemId, limit, type }),
  });

/** GET /api/recommendations/because-you-read/:itemId */
export const useBecauseYouRead = (itemId?: string, limit = 8) =>
  useQuery({
    queryKey: ["recommendations", "because-you-read", itemId, limit],
    enabled: !!itemId,
    queryFn: () => fetchRecommendations({ action: "because-you-read", itemId, limit }),
  });

/** GET /api/recommendations/for-you */
export const useForYou = (limit = 8, type: ContentType | "all" = "all") =>
  useQuery({
    queryKey: ["recommendations", "for-you", limit, type],
    queryFn: () => fetchRecommendations({ action: "for-you", limit, type }),
  });

/** GET /api/recommendations/continue-reading */
export const useContinueReading = (limit = 8) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["recommendations", "continue-reading", user?.id, limit],
    enabled: !!user,
    queryFn: () => fetchRecommendations({ action: "continue-reading", limit }),
  });
};
