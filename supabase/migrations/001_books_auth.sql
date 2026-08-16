-- Lbook: tabela books com isolamento por usuário + bucket de capas
-- Rode no SQL Editor do Supabase (Dashboard → SQL → New query)

CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  image_url TEXT,
  story INTEGER DEFAULT 0,
  characters INTEGER DEFAULT 0,
  edition INTEGER DEFAULT 0,
  final_score INTEGER DEFAULT 0,
  review TEXT,
  final_rating VARCHAR(10) DEFAULT '0.0',
  status VARCHAR(20) NOT NULL DEFAULT 'biblioteca',
  current_page INTEGER DEFAULT 0,
  total_pages INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS books_user_id_idx ON books(user_id);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own books" ON books;
CREATE POLICY "Users can view own books"
  ON books FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own books" ON books;
CREATE POLICY "Users can insert own books"
  ON books FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own books" ON books;
CREATE POLICY "Users can update own books"
  ON books FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own books" ON books;
CREATE POLICY "Users can delete own books"
  ON books FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON books TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE books_id_seq TO authenticated;

-- Bucket público para URLs de capa; upload só na pasta do usuário
INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read covers" ON storage.objects;
CREATE POLICY "Public read covers"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'covers');

DROP POLICY IF EXISTS "Users upload own covers" ON storage.objects;
CREATE POLICY "Users upload own covers"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'covers'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

DROP POLICY IF EXISTS "Users update own covers" ON storage.objects;
CREATE POLICY "Users update own covers"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'covers'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  )
  WITH CHECK (
    bucket_id = 'covers'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

DROP POLICY IF EXISTS "Users delete own covers" ON storage.objects;
CREATE POLICY "Users delete own covers"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'covers'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );
