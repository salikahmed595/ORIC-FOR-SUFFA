-- ============================================================
-- 004_profiles.sql — User profiles + Storage bucket + evidence updates
-- Run AFTER 003_rls.sql
-- ============================================================

-- ── User Profiles (linked to Supabase Auth) ──────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'FACULTY'
                    CHECK (role IN ('FACULTY','HOD','DEAN','ORIC_HEAD','UNIVERSITY_ADMIN','SUPER_ADMIN','AUDITOR')),
  department      TEXT DEFAULT '',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_open" ON profiles
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION _update_updated_at();

-- ── Add user tracking to score_entries ───────────────────────
ALTER TABLE score_entries
  ADD COLUMN IF NOT EXISTS user_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS user_name TEXT DEFAULT '';

-- ── Extend evidence_documents ─────────────────────────────────
ALTER TABLE evidence_documents
  ADD COLUMN IF NOT EXISTS file_type   TEXT DEFAULT 'application/octet-stream',
  ADD COLUMN IF NOT EXISTS storage_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS user_name   TEXT DEFAULT '';

-- ── Supabase Storage bucket for evidence files ────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('evidence', 'evidence', true, 52428800)   -- 50 MB max per file
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: allow any user to upload/read/delete
CREATE POLICY "evidence_insert" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'evidence');

CREATE POLICY "evidence_select" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'evidence');

CREATE POLICY "evidence_delete" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'evidence');
