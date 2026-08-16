-- Unique usernames + login lookup (email or handle)
-- Username uniqueness lives in profiles, not in user_metadata.

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT profiles_username_format CHECK (username ~ '^[a-z0-9_]{3,20}$'),
  CONSTRAINT profiles_username_key UNIQUE (username)
);

CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles (username);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

GRANT SELECT, INSERT ON public.profiles TO authenticated;
REVOKE ALL ON public.profiles FROM anon;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uname text;
BEGIN
  uname := lower(trim(coalesce(NEW.raw_user_meta_data->>'username', '')));
  IF uname = '' THEN
    RETURN NEW;
  END IF;
  INSERT INTO public.profiles (id, username) VALUES (NEW.id, uname);
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Maps a username to the account email so signInWithPassword can run.
-- Does not take auth.uid() because login happens before a session exists.
CREATE OR REPLACE FUNCTION public.email_for_login(identifier text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized text;
  found_email text;
BEGIN
  normalized := lower(trim(coalesce(identifier, '')));
  IF normalized = '' OR position('@' in normalized) > 0 THEN
    RETURN NULL;
  END IF;

  SELECT u.email
    INTO found_email
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE p.username = normalized
  LIMIT 1;

  RETURN found_email;
END;
$$;

REVOKE ALL ON FUNCTION public.email_for_login(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.email_for_login(text) TO anon, authenticated;
