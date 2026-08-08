CREATE EXTENSION IF NOT EXISTS vector;

CREATE TYPE public.content_type AS ENUM ('book','webtoon','news','academic');

CREATE TABLE public.contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.content_type NOT NULL DEFAULT 'book',
  title text NOT NULL,
  subtitle text,
  description text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  author text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  category text NOT NULL DEFAULT 'Geral',
  slug text UNIQUE,
  cover text,
  rating numeric(3,2) NOT NULL DEFAULT 0,
  rating_count integer NOT NULL DEFAULT 0,
  formats text[] NOT NULL DEFAULT '{}',
  language text NOT NULL DEFAULT 'pt',
  year integer,
  size text,
  views integer NOT NULL DEFAULT 0,
  read_time integer,
  episode_count integer NOT NULL DEFAULT 0,
  price_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BRL',
  published boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  collection text,
  embedding vector(1536),
  embedding_model text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.contents TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contents TO authenticated;
GRANT ALL ON public.contents TO service_role;
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone views published contents" ON public.contents FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admins view all contents" ON public.contents FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert contents" ON public.contents FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update contents" ON public.contents FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete contents" ON public.contents FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE INDEX contents_embedding_hnsw_idx ON public.contents USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX contents_type_idx ON public.contents (type);
CREATE INDEX contents_views_idx ON public.contents (views DESC);
CREATE INDEX contents_created_idx ON public.contents (created_at DESC);

CREATE TRIGGER update_contents_updated_at BEFORE UPDATE ON public.contents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.content_episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
  number integer NOT NULL DEFAULT 1,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  images text[] NOT NULL DEFAULT '{}',
  is_free boolean NOT NULL DEFAULT false,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (content_id, number)
);

GRANT SELECT ON public.content_episodes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_episodes TO authenticated;
GRANT ALL ON public.content_episodes TO service_role;
ALTER TABLE public.content_episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone views episodes of published contents" ON public.content_episodes FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.contents c WHERE c.id = content_id AND c.published = true));
CREATE POLICY "Admins manage episodes" ON public.content_episodes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE INDEX content_episodes_content_idx ON public.content_episodes (content_id, number);
CREATE TRIGGER update_content_episodes_updated_at BEFORE UPDATE ON public.content_episodes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.user_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content_id uuid NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
  action text NOT NULL DEFAULT 'view',
  progress integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.user_interactions TO authenticated;
GRANT ALL ON public.user_interactions TO service_role;
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own interactions" ON public.user_interactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own interactions" ON public.user_interactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own interactions" ON public.user_interactions FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all interactions" ON public.user_interactions FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE INDEX user_interactions_user_idx ON public.user_interactions (user_id, created_at DESC);

CREATE TABLE public.user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content_id uuid NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
  episode_id uuid REFERENCES public.content_episodes(id) ON DELETE SET NULL,
  progress_percentage integer NOT NULL DEFAULT 0,
  last_read_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, content_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_progress TO authenticated;
GRANT ALL ON public.user_progress TO service_role;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own progress" ON public.user_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX user_progress_user_idx ON public.user_progress (user_id, last_read_at DESC);
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.match_contents(
  query_embedding vector(1536),
  match_count integer DEFAULT 12,
  filter_type public.content_type DEFAULT NULL,
  exclude_ids uuid[] DEFAULT '{}'
)
RETURNS TABLE (id uuid, similarity double precision)
LANGUAGE sql
STABLE
SECURITY DEFINER
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
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT AVG(c.embedding)::vector(1536)
  FROM (
    SELECT DISTINCT ON (i.content_id) i.content_id, i.created_at
    FROM public.user_interactions i
    WHERE i.user_id = _user_id
    ORDER BY i.content_id, i.created_at DESC
  ) recent
  JOIN public.contents c ON c.id = recent.content_id
  WHERE c.embedding IS NOT NULL
$$;

GRANT EXECUTE ON FUNCTION public.match_contents(vector, integer, public.content_type, uuid[]) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.user_taste_embedding(uuid, integer) TO authenticated, service_role;