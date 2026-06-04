-- ============================================================
-- 003_rls.sql — Row Level Security policies
-- Run AFTER 002_seed.sql
-- NOTE: Prototype uses open policies. Tighten before production.
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE kpi_categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_indicators      ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_periods  ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_entries       ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_documents  ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_feedback     ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs          ENABLE ROW LEVEL SECURITY;

-- ── Prototype: open access for anon + authenticated ──────────
-- Replace these with scoped policies before going to production.

CREATE POLICY "kpi_categories_open"     ON kpi_categories     FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "kpi_indicators_open"     ON kpi_indicators     FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "assessment_periods_open" ON assessment_periods FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "score_entries_open"      ON score_entries      FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "evidence_documents_open" ON evidence_documents FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "review_feedback_open"    ON review_feedback    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
-- Audit logs: allow insert + select; no update/delete
CREATE POLICY "audit_logs_insert"       ON audit_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "audit_logs_select"       ON audit_logs FOR SELECT TO anon, authenticated USING (true);

-- ── Production template (commented out) ──────────────────────
-- Replace open policies with these when auth is wired up:
--
-- CREATE POLICY "score_entries_by_user"
--   ON score_entries FOR ALL TO authenticated
--   USING (
--     auth.uid()::text = submitted_by
--     OR EXISTS (
--       SELECT 1 FROM users u
--       WHERE u.id = auth.uid()
--         AND u.role IN ('ORIC_HEAD','UNIVERSITY_ADMIN','SUPER_ADMIN')
--     )
--   );
