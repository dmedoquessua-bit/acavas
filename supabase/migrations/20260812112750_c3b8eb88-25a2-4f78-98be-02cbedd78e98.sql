
-- ============ SOFT DELETE ============
ALTER TABLE public.contents ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE public.content_episodes ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE public.content_purchases ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE public.user_saved ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE public.user_progress ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_contents_not_deleted ON public.contents (created_at DESC) WHERE deleted_at IS NULL;

-- public read policies exclude soft-deleted rows
DROP POLICY IF EXISTS "Anyone views published contents" ON public.contents;
CREATE POLICY "Anyone views published contents" ON public.contents FOR SELECT TO anon, authenticated
USING (published = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Anyone views published books" ON public.books;
CREATE POLICY "Anyone views published books" ON public.books FOR SELECT TO anon, authenticated
USING (published = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Anyone views published news" ON public.news;
CREATE POLICY "Anyone views published news" ON public.news FOR SELECT TO anon, authenticated
USING (published = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Anyone views free previews" ON public.chapters;
CREATE POLICY "Anyone views free previews" ON public.chapters FOR SELECT TO anon, authenticated
USING (is_free_preview = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Anyone views episodes of published contents" ON public.content_episodes;
CREATE POLICY "Anyone views episodes of published contents" ON public.content_episodes FOR SELECT TO anon, authenticated
USING (deleted_at IS NULL AND EXISTS (SELECT 1 FROM public.contents c WHERE c.id = content_episodes.content_id AND c.published = true AND c.deleted_at IS NULL));

-- ============ USER CONSENTS ============
CREATE TABLE IF NOT EXISTS public.user_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  terms_accepted boolean NOT NULL DEFAULT false,
  privacy_accepted boolean NOT NULL DEFAULT false,
  terms_version text NOT NULL DEFAULT '1.0',
  cookie_preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  accepted_at timestamptz,
  ip_address text,
  deleted_at timestamptz DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_consents_user_unique UNIQUE (user_id),
  CONSTRAINT user_consents_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

GRANT SELECT, INSERT, UPDATE ON public.user_consents TO authenticated;
GRANT ALL ON public.user_consents TO service_role;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own consents" ON public.user_consents FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own consents" ON public.user_consents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own consents" ON public.user_consents FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_user_consents_updated_at BEFORE UPDATE ON public.user_consents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ AUDIT LOGS ============
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity text,
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT audit_logs_action_len CHECK (char_length(action) BETWEEN 1 AND 100)
);

GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users view own audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON public.audit_logs (user_id, created_at DESC);

-- ============ RATE LIMITS (server-only) ============
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action text NOT NULL DEFAULT 'login',
  attempts integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  blocked_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT auth_rate_limits_unique UNIQUE (identifier, action)
);

GRANT ALL ON public.auth_rate_limits TO service_role;
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;
-- no policies: only service_role (which bypasses RLS) can touch it
