// app/db.jsx — Supabase client, auth, file upload, data-access helpers

const SUPABASE_URL = 'https://tjrpffnbeqkhciwmlypb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_MJDG46Fa8O3gJvVf3KGJdw_WBZrkPgV';
const ACTIVE_PERIOD_ID = '00000000-0000-0000-0000-000000000001';

let _db = null;
let _connected = false;

function getDB() {
  if (!_db) {
    if (!window.supabase) { console.warn('[DSUdb] Supabase CDN not loaded.'); return null; }
    _db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession:    true,   // store session in localStorage
        autoRefreshToken:  true,   // silently refresh before expiry
        detectSessionInUrl:false,
        // no custom storageKey — use Supabase default so saved sessions are found
      },
    });
  }
  return _db;
}

/* Listen for auth state changes (INITIAL_SESSION, SIGNED_IN, SIGNED_OUT) */
function onAuthChange(callback) {
  const db = getDB();
  if (!db) { callback(null, null); return ()=>{}; }
  const { data:{ subscription } } = db.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
}

/* ── Helpers ────────────────────────────────────────────────── */
function getFileKind(mimeType) {
  if (!mimeType) return 'file';
  if (mimeType.startsWith('image/'))            return 'img';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet') || mimeType === 'text/csv') return 'xls';
  if (mimeType.includes('word') || mimeType.includes('document'))  return 'doc';
  if (mimeType === 'application/pdf')            return 'pdf';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'ppt';
  return 'file';
}

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024)        return bytes + ' B';
  if (bytes < 1048576)     return (bytes / 1024).toFixed(1)   + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

/* ── Connection ─────────────────────────────────────────────── */
async function ping() {
  const db = getDB();
  if (!db) return false;
  try {
    const { error } = await db.from('kpi_categories').select('id').limit(1);
    _connected = !error;
    return _connected;
  } catch { _connected = false; return false; }
}

/* ══════════════════════════════════════════════════════════════
   AUTH
══════════════════════════════════════════════════════════════ */

async function signIn(email, password) {
  const db = getDB();
  if (!db) return { error: 'Database not available.' };
  try {
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('email not confirmed'))
        return { error: 'Please confirm your email first, or ask the admin to confirm your account.' };
      if (msg.includes('invalid login') || msg.includes('invalid credentials'))
        return { error: 'Incorrect email or password. Please try again.' };
      return { error: error.message };
    }
    const profile = await getProfile(data.user.id);
    if (!profile) return { error: 'Account exists but profile not found. Contact admin.' };
    await _audit(profile.full_name, 'LOGIN', 'users', data.user.id, null);
    return { user: data.user, profile };
  } catch (err) { return { error: err.message || 'Login failed.' }; }
}

async function signUp(email, password, fullName, role, department) {
  const db = getDB();
  if (!db) return { error: 'Database not available.' };
  try {
    const { data, error } = await db.auth.signUp({ email, password });
    if (error) return { error: error.message };

    const { error: profileErr } = await db.from('profiles').insert({
      id:        data.user.id,
      full_name: fullName,
      email:     email,
      role:      role || 'FACULTY',
      department: department || '',
    });
    if (profileErr) return { error: profileErr.message };

    const profile = await getProfile(data.user.id);
    await _audit(fullName, 'LOGIN', 'users', data.user.id, { action: 'SIGNUP' });
    return { user: data.user, profile };
  } catch (err) { return { error: err.message || 'Sign up failed.' }; }
}

async function signOut() {
  const db = getDB();
  if (db) await db.auth.signOut();
}

async function getSession() {
  const db = getDB();
  if (!db) return null;
  try {
    const { data } = await db.auth.getSession();
    return data?.session || null;
  } catch { return null; }
}

async function getProfile(userId) {
  const db = getDB();
  if (!db) return null;
  try {
    const { data } = await db.from('profiles').select('*').eq('id', userId).single();
    return data;
  } catch { return null; }
}

/* ══════════════════════════════════════════════════════════════
   DATA — KPI + SCORES
══════════════════════════════════════════════════════════════ */

async function loadAllData(periodId = ACTIVE_PERIOD_ID) {
  const db = getDB();
  if (!db) return null;
  try {
    const [catRes, indRes, entryRes, evidenceRes, reviewRes] = await Promise.all([
      db.from('kpi_categories').select('*').order('sort_order'),
      db.from('kpi_indicators').select('*').order('sort_order'),
      db.from('score_entries').select('*').eq('period_id', periodId),
      db.from('evidence_documents').select('*').order('uploaded_at'),
      db.from('review_feedback').select('*'),
    ]);
    if (catRes.error || indRes.error) return null;

    const entries  = entryRes.data  || [];
    const evidence = evidenceRes.data || [];
    const reviews  = reviewRes.data  || [];

    const indicators = (indRes.data || []).map(ind => {
      const entry  = entries.find(e => e.kpi_code === ind.code) || {};
      const docs   = evidence.filter(ev => ev.score_entry_id === entry.id)
        .map(ev => ({ name: ev.file_name, size: ev.file_size, kind: ev.file_kind || 'pdf',
          url: ev.storage_url || '', docId: ev.id }));  // docId = evidence_documents.id
      const review = reviews.find(rv => rv.score_entry_id === entry.id);
      return {
        code: ind.code, section: ind.category_id, name: ind.name,
        desc: ind.description, max: Number(ind.max_score), guide: ind.scoring_guide,
        unit: ind.unit, denom: ind.denominator || null, denomLabel: ind.denominator_label || null,
        reqDocs: Array.isArray(ind.required_docs) ? ind.required_docs : JSON.parse(ind.required_docs || '[]'),
        _entryId:  entry.id || null,
        score:     Number(entry.self_score  || 0),
        hecScore:  entry.hec_score ? Number(entry.hec_score) : null,
        value:     Number(entry.reported_number || 0),
        remarks:   entry.remarks   || '',
        status:    entry.status    || 'DRAFT',
        userName:  entry.user_name || '',
        docs,
        review: review ? {
          rating:   review.rating,
          comment:  review.comment,
          reviewer: review.reviewer_name,
          date:     new Date(review.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short' }),
        } : null,
      };
    });

    const sections = (catRes.data || []).map(c => ({
      id: c.id, name: c.name, max: c.max_score, accent: c.accent_color,
    }));
    return { indicators, sections };
  } catch (err) { console.error('[DSUdb] loadAllData:', err); return null; }
}

async function saveScore(code, patch, periodId = ACTIVE_PERIOD_ID, currentUser = null) {
  const db = getDB();
  if (!db) return false;
  try {
    const row = {
      period_id: periodId, kpi_code: code,
      ...(patch.score     !== undefined && { self_score: patch.score }),
      ...(patch.value     !== undefined && { reported_number: patch.value }),
      ...(patch.remarks   !== undefined && { remarks: patch.remarks }),
      ...(patch.status    !== undefined && { status: patch.status }),
    };
    if (patch.status === 'SUBMITTED') {
      row.submitted_at = new Date().toISOString();
      row.submitted_by  = currentUser?.full_name || 'Unknown';
      row.user_name     = currentUser?.full_name || 'Unknown';
      if (currentUser?.id) row.user_id = currentUser.id;
    }
    const { error } = await db.from('score_entries')
      .upsert(row, { onConflict: 'period_id,kpi_code' });
    if (error) { console.error('[DSUdb] saveScore:', error); return false; }
    await _audit(currentUser?.full_name || 'User',
      patch.status === 'SUBMITTED' ? 'SUBMIT' : 'EDIT', 'score_entries', code, row);
    return true;
  } catch (err) { console.error('[DSUdb] saveScore exception:', err); return false; }
}

/* ══════════════════════════════════════════════════════════════
   FILE UPLOAD — any format to Supabase Storage
══════════════════════════════════════════════════════════════ */

async function uploadFile(file, kpiCode, userId) {
  const db = getDB();
  if (!db) return null;
  try {
    const safe = file.name.replace(/[^a-zA-Z0-9._\-()]/g, '_');
    const path = `${userId || 'anon'}/${kpiCode}/${Date.now()}_${safe}`;
    const { data, error } = await db.storage
      .from('evidence')
      .upload(path, file, { cacheControl: '3600', upsert: false });
    if (error) { console.error('[DSUdb] uploadFile:', error); return null; }
    const { data: urlData } = db.storage.from('evidence').getPublicUrl(data.path);
    return { path: data.path, url: urlData.publicUrl };
  } catch (err) { console.error('[DSUdb] uploadFile exception:', err); return null; }
}

async function addEvidence(entryId, fileName, fileSize, fileKind, fileType, storageUrl, userId, userName) {
  const db = getDB();
  if (!db) return false;
  try {
    const { error } = await db.from('evidence_documents').insert({
      score_entry_id: entryId, file_name: fileName,
      file_size: fileSize, file_kind: fileKind, file_type: fileType || '',
      storage_url: storageUrl || '',
      user_id:   userId   || null,
      user_name: userName || '',
    });
    if (error) { console.error('[DSUdb] addEvidence:', error); return false; }
    await _audit(userName || 'User', 'UPLOAD', 'evidence_documents', entryId, { fileName });
    return true;
  } catch { return false; }
}

async function removeEvidence(evidenceId, userName) {
  const db = getDB();
  if (!db) return false;
  try {
    const { error } = await db.from('evidence_documents').delete().eq('id', evidenceId);
    if (error) return false;
    await _audit(userName || 'User', 'DELETE', 'evidence_documents', evidenceId, null);
    return true;
  } catch { return false; }
}

async function renameEvidence(evidenceId, newName, userName) {
  const db = getDB();
  if (!db) return false;
  try {
    const { error } = await db.from('evidence_documents')
      .update({ file_name: newName })
      .eq('id', evidenceId);
    if (error) return false;
    await _audit(userName || 'User', 'EDIT', 'evidence_documents', evidenceId, { newName });
    return true;
  } catch { return false; }
}

/* ══════════════════════════════════════════════════════════════
   REVIEW — admin rates a score entry
══════════════════════════════════════════════════════════════ */

async function saveReview(entryId, rating, comment, hecScore, reviewerName) {
  const db = getDB();
  if (!db) return false;
  try {
    const statusMap = { perfect:'APPROVED', minor:'RETURNED', bad:'REJECTED' };
    await db.from('score_entries').update({
      hec_score:   hecScore,
      status:      statusMap[rating],
      approved_by: reviewerName || 'HEC Reviewer',
      approved_at: new Date().toISOString(),
    }).eq('id', entryId);
    const { error } = await db.from('review_feedback').insert({
      score_entry_id: entryId, rating, comment,
      reviewer_name: reviewerName || 'HEC Reviewer',
    });
    if (error) { console.error('[DSUdb] saveReview:', error); return false; }
    await _audit(reviewerName || 'Reviewer',
      statusMap[rating] === 'APPROVED' ? 'APPROVE' : 'REJECT',
      'score_entries', entryId, { rating, comment });
    return true;
  } catch { return false; }
}

/* ══════════════════════════════════════════════════════════════
   ADMIN — faculty submissions
══════════════════════════════════════════════════════════════ */

async function getAllSubmissions() {
  const db = getDB();
  if (!db) return [];
  try {
    const { data, error } = await db
      .from('score_entries')
      .select('*, evidence_documents(*), review_feedback(*)')
      .neq('status', 'DRAFT')
      .order('updated_at', { ascending: false });
    if (error) return [];
    return data || [];
  } catch { return []; }
}

async function getFacultyProfiles() {
  const db = getDB();
  if (!db) return [];
  try {
    const { data } = await db.from('profiles')
      .select('*')
      .in('role', ['FACULTY','HOD','DEAN'])
      .order('full_name');
    return data || [];
  } catch { return []; }
}

/* ── Audit writer ───────────────────────────────────────────── */
async function _audit(userName, action, tableName, recordId, newValue) {
  const db = getDB();
  if (!db) return;
  try {
    await db.from('audit_logs').insert({
      user_name: userName, action, table_name: tableName,
      record_id: String(recordId), new_value: newValue || null, ip_address: '—',
    });
  } catch { /* silent */ }
}

function isConnected() { return _connected; }

window.DSUdb = {
  // connection
  ping, isConnected, ACTIVE_PERIOD_ID,
  // auth
  onAuthChange, signIn, signUp, signOut, getSession, getProfile,
  // data
  loadAllData, saveScore,
  // files
  uploadFile, addEvidence, removeEvidence, renameEvidence, getFileKind, formatSize,
  // reviews
  saveReview,
  // admin
  getAllSubmissions, getFacultyProfiles,
};
