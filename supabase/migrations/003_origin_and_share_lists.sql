-- País de origem nas Leituras + link de lista (opt-in, mesmo token, live)

ALTER TABLE public.books
  ADD COLUMN IF NOT EXISTS origin_country VARCHAR(2);

CREATE INDEX IF NOT EXISTS books_user_origin_idx
  ON public.books (user_id, origin_country);

CREATE TABLE IF NOT EXISTS public.share_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  include_quero_comprar boolean NOT NULL DEFAULT true,
  include_owned boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  CONSTRAINT share_links_token_key UNIQUE (token),
  CONSTRAINT share_links_includes_check CHECK (
    include_quero_comprar OR include_owned
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS share_links_one_active_per_user
  ON public.share_links (user_id)
  WHERE revoked_at IS NULL;

ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own share links" ON public.share_links;
CREATE POLICY "Users can view own share links"
  ON public.share_links FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own share links" ON public.share_links;
CREATE POLICY "Users can insert own share links"
  ON public.share_links FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own share links" ON public.share_links;
CREATE POLICY "Users can update own share links"
  ON public.share_links FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

GRANT SELECT, INSERT, UPDATE ON public.share_links TO authenticated;
REVOKE ALL ON public.share_links FROM anon;

CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.get_shared_lists(p_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  link_user uuid;
  include_wish boolean;
  include_have boolean;
  owner_name text;
  payload jsonb;
BEGIN
  SELECT sl.user_id, sl.include_quero_comprar, sl.include_owned
    INTO link_user, include_wish, include_have
  FROM public.share_links sl
  WHERE sl.token = p_token
    AND sl.revoked_at IS NULL;

  IF link_user IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT p.username INTO owner_name
  FROM public.profiles p
  WHERE p.id = link_user;

  SELECT jsonb_build_object(
    'username', owner_name,
    'include_quero_comprar', include_wish,
    'include_owned', include_have,
    'readings', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', b.id,
          'title', b.title,
          'author', b.author,
          'image_url', b.image_url,
          'status', b.status,
          'origin_country', b.origin_country
        )
        ORDER BY b.id DESC
      )
      FROM public.books b
      WHERE b.user_id = link_user
        AND (
          (include_wish AND b.status = 'quero_comprar')
          OR (include_have AND b.status IS DISTINCT FROM 'quero_comprar')
        )
    ), '[]'::jsonb)
  )
  INTO payload;

  RETURN payload;
END;
$$;

REVOKE ALL ON FUNCTION private.get_shared_lists(uuid) FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.get_shared_lists(p_token uuid)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT private.get_shared_lists(p_token);
$$;

REVOKE ALL ON FUNCTION public.get_shared_lists(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_lists(uuid) TO anon, authenticated;
