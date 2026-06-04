// app/db.jsx — Supabase client + data-access helpers for the web prototype
// The publishable key is intentionally public (browser-safe).
// The DB password / service-role key MUST stay in .env only.

const SUPABASE_URL = 'https://tjrpffnbeqkhciwmlypb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_MJDG46Fa8O3gJvVf3KGJdw_WBZrkPgV';

// Active period UUID seeded in 002_seed.sql
const ACTIVE_PERIOD_ID = '00000000-0000-0000-0000-000000000001';

let _db = null;
let _connected = false;

function getDB() {
  if (!_db) {
    if (!window.supabase) {
      console.warn('[DSUdb] Supabase CDN not loaded — falling back to static data.');
      return null;
    }
    _db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return _db;
}

/* ── Connection check ──────────────────────────────────────── */
async function ping() {
  const db = getDB();
  if (!db) return false;
  try {
    const { error } = await db.from('kpi_categories').select('id').limit(1);
    _connected = !error;
    return _connected;
  } catch {
    _connected = false;
    return false;
  }
}

/* ── Fetch all indicators + current score entries ──────────── */
async function loadAllData(periodId = ACTIVE_PERIOD_ID) {
  const db = getDB();
  if (!db) return null;
  try {
    const [catRes, indRes, entryRes, evidenceRes, reviewRes] = await Promise.all([
      db.from('kpi_categories').select('*').order('sort_order'),
      db.from('kpi_indicators').select('*').order('sort_order'),
      db.from('score_entries').select('*').eq('period_id', periodId),
      db.from('evidence_documents').select('*'),
      db.from('review_feedback').select('*'),
    ]);

    if (catRes.error || indRes.error) {
      console.error('[DSUdb] Load error:', catRes.error || indRes.error);
      return null;
    }

    // Build indicator list matching the shape window.DSUData.INDICATORS expects
    const entries = entryRes.data || [];
    const evidence = evidenceRes.data || [];
    const reviews  = reviewRes.data || [];

    const indicators = (indRes.data || []).map(ind => {
      const entry = entries.find(e => e.kpi_code === ind.code) || {};
      const docs   = evidence.filter(ev => ev.score_entry_id === entry.id)
        .map(ev => ({ name: ev.file_name, size: ev.file_size, kind: ev.file_kind }));
      const review = reviews.find(rv => rv.score_entry_id === entry.id);

      return {
        // indicator metadata
        code:       ind.code,
        section:    ind.category_id,
        name:       ind.name,
        desc:       ind.description,
        max:        Number(ind.max_score),
        guide:      ind.scoring_guide,
        unit:       ind.unit,
        denom:      ind.denominator || null,
        denomLabel: ind.denominator_label || null,
        reqDocs:    Array.isArray(ind.required_docs) ? ind.required_docs : JSON.parse(ind.required_docs || '[]'),
        // score entry data
        _entryId:   entry.id || null,
        score:      Number(entry.self_score  || 0),
        hecScore:   entry.hec_score ? Number(entry.hec_score) : null,
        value:      Number(entry.reported_number || 0),
        remarks:    entry.remarks || '',
        status:     entry.status  || 'DRAFT',
        docs,
        // review feedback
        review: review ? {
          rating:   review.rating,
          comment:  review.comment,
          reviewer: review.reviewer_name,
          date:     new Date(review.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short' }),
        } : null,
      };
    });

    const sections = (catRes.data || []).map(c => ({
      id:     c.id,
      name:   c.name,
      max:    c.max_score,
      accent: c.accent_color,
    }));

    return { indicators, sections };
  } catch (err) {
    console.error('[DSUdb] loadAllData exception:', err);
    return null;
  }
}

/* ── Upsert a score entry ───────────────────────────────────── */
async function saveScore(code, patch, periodId = ACTIVE_PERIOD_ID) {
  const db = getDB();
  if (!db) return false;
  try {
    const row = {
      period_id:       periodId,
      kpi_code:        code,
      self_score:      patch.score    ?? undefined,
      reported_number: patch.value    ?? undefined,
      remarks:         patch.remarks  ?? undefined,
      status:          patch.status   ?? undefined,
    };
    // Remove undefined keys
    Object.keys(row).forEach(k => row[k] === undefined && delete row[k]);

    const { error } = await db
      .from('score_entries')
      .upsert(row, { onConflict: 'period_id,kpi_code' });

    if (error) { console.error('[DSUdb] saveScore error:', error); return false; }

    // Write audit log
    await _audit('Dr. Ahmed Raza', patch.status === 'SUBMITTED' ? 'SUBMIT' : 'EDIT',
      'score_entries', code, row);
    return true;
  } catch (err) {
    console.error('[DSUdb] saveScore exception:', err);
    return false;
  }
}

/* ── Save reviewer feedback ─────────────────────────────────── */
async function saveReview(entryId, rating, comment, hecScore) {
  const db = getDB();
  if (!db) return false;
  try {
    // Update hec_score and status on score_entry
    const statusMap = { perfect:'APPROVED', minor:'RETURNED', bad:'REJECTED' };
    await db.from('score_entries').update({
      hec_score: hecScore,
      status:    statusMap[rating],
      approved_by: 'HEC Reviewer',
      approved_at: new Date().toISOString(),
    }).eq('id', entryId);

    // Insert review feedback
    const { error } = await db.from('review_feedback').insert({
      score_entry_id: entryId,
      rating, comment,
      reviewer_name: 'HEC Reviewer',
    });
    if (error) { console.error('[DSUdb] saveReview error:', error); return false; }

    await _audit('HEC Reviewer', statusMap[rating] === 'APPROVED' ? 'APPROVE' : 'REJECT',
      'score_entries', entryId, { rating, comment });
    return true;
  } catch (err) {
    console.error('[DSUdb] saveReview exception:', err);
    return false;
  }
}

/* ── Add an evidence document ───────────────────────────────── */
async function addEvidence(entryId, fileName, fileSize, fileKind) {
  const db = getDB();
  if (!db) return false;
  try {
    const { error } = await db.from('evidence_documents').insert({
      score_entry_id: entryId, file_name: fileName,
      file_size: fileSize, file_kind: fileKind || 'pdf',
    });
    if (error) { console.error('[DSUdb] addEvidence error:', error); return false; }
    await _audit('Dr. Ahmed Raza', 'UPLOAD', 'evidence_documents', entryId, { fileName });
    return true;
  } catch { return false; }
}

/* ── Audit log writer ───────────────────────────────────────── */
async function _audit(userName, action, tableName, recordId, newValue) {
  const db = getDB();
  if (!db) return;
  try {
    await db.from('audit_logs').insert({
      user_name: userName, action, table_name: tableName,
      record_id: String(recordId), new_value: newValue || null,
      ip_address: '—',
    });
  } catch { /* audit failures are silent */ }
}

/* ── Status check helper ────────────────────────────────────── */
function isConnected() { return _connected; }

// Export to window for use in other JSX files
window.DSUdb = {
  ping, loadAllData, saveScore, saveReview,
  addEvidence, isConnected,
  ACTIVE_PERIOD_ID,
};
