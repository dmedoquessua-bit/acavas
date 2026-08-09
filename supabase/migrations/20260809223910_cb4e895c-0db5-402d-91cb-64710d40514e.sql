-- SAVED ITEMS
CREATE TABLE public.user_saved (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content_id uuid NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, content_id)
);
GRANT SELECT, INSERT, DELETE ON public.user_saved TO authenticated;
GRANT ALL ON public.user_saved TO service_role;
ALTER TABLE public.user_saved ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own saved" ON public.user_saved FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX user_saved_user_created_idx ON public.user_saved (user_id, created_at DESC);

-- CONTENT PURCHASES
CREATE TABLE public.content_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content_id uuid NOT NULL REFERENCES public.contents(id) ON DELETE CASCADE,
  amount_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BRL',
  status text NOT NULL DEFAULT 'pending',
  provider text NOT NULL DEFAULT 'stripe',
  provider_reference text,
  checkout_session_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.content_purchases TO authenticated;
GRANT ALL ON public.content_purchases TO service_role;
ALTER TABLE public.content_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own content purchases" ON public.content_purchases FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins view all content purchases" ON public.content_purchases FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update content purchases" ON public.content_purchases FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_content_purchases_updated_at BEFORE UPDATE ON public.content_purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX content_purchases_user_idx ON public.content_purchases (user_id, status);

CREATE OR REPLACE FUNCTION public.owns_content(_user_id uuid, _content_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.content_purchases
    WHERE user_id = _user_id AND content_id = _content_id AND status = 'paid'
  )
$$;

-- COMPOSITE INDEXES FOR CURSOR PAGINATION AND FILTERS
CREATE INDEX IF NOT EXISTS contents_type_published_created_idx
  ON public.contents (type, published, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS contents_published_views_idx
  ON public.contents (published, views DESC, id DESC);
CREATE INDEX IF NOT EXISTS contents_published_rating_idx
  ON public.contents (published, rating DESC, id DESC);
CREATE INDEX IF NOT EXISTS contents_published_price_idx
  ON public.contents (published, price_cents, id DESC);
CREATE INDEX IF NOT EXISTS contents_tags_gin_idx ON public.contents USING gin (tags);
CREATE INDEX IF NOT EXISTS contents_category_idx ON public.contents (category);
CREATE INDEX IF NOT EXISTS contents_language_idx ON public.contents (language);