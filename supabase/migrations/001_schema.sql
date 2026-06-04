-- ============================================================
-- 001_schema.sql — DSU ORIC PMS core schema
-- Run in Supabase SQL Editor or via: supabase db push
-- ============================================================

-- KPI Categories (A, B, C, D)
CREATE TABLE IF NOT EXISTS kpi_categories (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  max_score    INTEGER NOT NULL,
  accent_color TEXT NOT NULL DEFAULT '#6B1A1A',
  sort_order   INTEGER NOT NULL DEFAULT 0
);

-- KPI Indicators (A1-A6, B1-B11, C1-C8, D1-D6)
CREATE TABLE IF NOT EXISTS kpi_indicators (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code              TEXT UNIQUE NOT NULL,
  category_id       TEXT NOT NULL REFERENCES kpi_categories(id),
  name              TEXT NOT NULL,
  description       TEXT,
  max_score         DECIMAL(5,2) NOT NULL,
  scoring_guide     TEXT,
  unit              TEXT DEFAULT 'items',
  denominator       INTEGER,
  denominator_label TEXT,
  evidence_required BOOLEAN DEFAULT TRUE,
  required_docs     JSONB DEFAULT '[]'::JSONB,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Assessment Periods
CREATE TABLE IF NOT EXISTS assessment_periods (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label      TEXT NOT NULL,
  year_from  INTEGER NOT NULL,
  year_to    INTEGER NOT NULL,
  status     TEXT NOT NULL DEFAULT 'ACTIVE'
               CHECK (status IN ('DRAFT','ACTIVE','CLOSED')),
  deadline   DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Score Entries (one per indicator per period)
CREATE TABLE IF NOT EXISTS score_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id       UUID NOT NULL REFERENCES assessment_periods(id) ON DELETE CASCADE,
  kpi_code        TEXT NOT NULL REFERENCES kpi_indicators(code),
  self_score      DECIMAL(5,2) NOT NULL DEFAULT 0,
  hec_score       DECIMAL(5,2),
  reported_number DECIMAL(10,2),
  remarks         TEXT DEFAULT '',
  status          TEXT NOT NULL DEFAULT 'DRAFT'
                    CHECK (status IN (
                      'DRAFT','SUBMITTED','UNDER_REVIEW',
                      'APPROVED','REJECTED','RETURNED',
                      'SUBMITTED_TO_HEC','CLOSED'
                    )),
  submitted_by    TEXT,
  submitted_at    TIMESTAMPTZ,
  approved_by     TEXT,
  approved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(period_id, kpi_code)
);

-- Evidence Documents
CREATE TABLE IF NOT EXISTS evidence_documents (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  score_entry_id UUID NOT NULL REFERENCES score_entries(id) ON DELETE CASCADE,
  file_name      TEXT NOT NULL,
  file_size      TEXT DEFAULT '—',
  file_kind      TEXT DEFAULT 'pdf' CHECK (file_kind IN ('pdf','xls','img')),
  storage_path   TEXT,
  uploaded_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Review Feedback
CREATE TABLE IF NOT EXISTS review_feedback (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  score_entry_id UUID NOT NULL REFERENCES score_entries(id) ON DELETE CASCADE,
  rating         TEXT NOT NULL CHECK (rating IN ('perfect','minor','bad')),
  comment        TEXT DEFAULT '',
  reviewer_name  TEXT DEFAULT 'HEC Reviewer',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs (append-only — never UPDATE or DELETE)
CREATE TABLE IF NOT EXISTS audit_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name  TEXT NOT NULL,
  action     TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id  TEXT,
  old_value  JSONB,
  new_value  JSONB,
  ip_address TEXT DEFAULT '—',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_score_entries_period   ON score_entries(period_id);
CREATE INDEX IF NOT EXISTS idx_score_entries_status   ON score_entries(status);
CREATE INDEX IF NOT EXISTS idx_evidence_entry         ON evidence_documents(score_entry_id);
CREATE INDEX IF NOT EXISTS idx_audit_created          ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kpi_category           ON kpi_indicators(category_id);
CREATE INDEX IF NOT EXISTS idx_review_entry           ON review_feedback(score_entry_id);

-- ── updated_at trigger ──────────────────────────────────────
CREATE OR REPLACE FUNCTION _update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_score_entries_updated_at ON score_entries;
CREATE TRIGGER trg_score_entries_updated_at
  BEFORE UPDATE ON score_entries
  FOR EACH ROW EXECUTE FUNCTION _update_updated_at();

DROP TRIGGER IF EXISTS trg_periods_updated_at ON assessment_periods;
CREATE TRIGGER trg_periods_updated_at
  BEFORE UPDATE ON assessment_periods
  FOR EACH ROW EXECUTE FUNCTION _update_updated_at();
