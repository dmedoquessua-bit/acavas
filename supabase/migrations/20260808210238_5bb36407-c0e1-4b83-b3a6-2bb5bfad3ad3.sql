CREATE OR REPLACE FUNCTION public.match_contents(
  query_embedding vector(1536),
  match_count integer DEFAULT 12,
  filter_type public.content_type DEFAULT NULL,
  exclude_ids uuid[] DEFAULT '{}'
)
RETURNS TABLE (id uuid, similarity double precision)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT c.id, 1 - (c.embedding <=> query_embedding) AS similarity
  FROM public.contents c
  WHERE c.published = true
    AND c.embedding IS NOT NULL
    AND (filter_type IS NULL OR c.type = filter_type)
    AND NOT (c.id = ANY(exclude_ids))
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
$$;

CREATE OR REPLACE FUNCTION public.user_taste_embedding(_user_id uuid, _history integer DEFAULT 20)
RETURNS vector(1536)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT AVG(c.embedding)::vector(1536)
  FROM (
    SELECT DISTINCT ON (i.content_id) i.content_id, i.created_at
    FROM public.user_interactions i
    WHERE i.user_id = _user_id AND _user_id = auth.uid()
    ORDER BY i.content_id, i.created_at DESC
  ) recent
  JOIN public.contents c ON c.id = recent.content_id
  WHERE c.embedding IS NOT NULL
$$;