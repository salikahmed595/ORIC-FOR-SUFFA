// faculty3.jsx — Evidence Hub, Reports, Profile
const { useState:uS3 } = React;
const { C:E, F:EF, SHADOW:ES } = window.DSU;

/* ── File helpers ─────────────────────────────────────────── */
function getFileKindLocal(mimeType) {
  if (!mimeType) return 'file';
  if (mimeType.startsWith('image/'))                                          return 'img';
  if (mimeType.includes('excel')||mimeType.includes('spreadsheet')||mimeType==='text/csv') return 'xls';
  if (mimeType.includes('word')||mimeType.includes('document'))               return 'doc';
  if (mimeType==='application/pdf')                                           return 'pdf';
  if (mimeType.includes('presentation')||mimeType.includes('powerpoint'))     return 'ppt';
  return 'file';
}
function formatFileSize(bytes) {
  if (!bytes||bytes===0) return '—';
  if (bytes<1024)        return bytes+' B';
  if (bytes<1048576)     return (bytes/1024).toFixed(1)+' KB';
  return (bytes/1048576).toFixed(1)+' MB';
}
const KIND_COLOR  = { pdf:'#C62828', xls:'#2E7D32', img:'#1565C0', doc:'#1A237E', ppt:'#E65100', file:'#757575' };
const KIND_ACCEPT = '*';

/* ── DocCard: single document row with edit (rename) + delete ── */
function DocCard({ doc, editable, onRename, onDelete }) {
  const [delConfirm, setDelConfirm] = uS3(false);
  const [editing,    setEditing]    = uS3(false);
  const [draftName,  setDraftName]  = uS3(doc.name);
  const [saving,     setSaving]     = uS3(false);

  const kind  = doc.kind || 'file';
  const color = KIND_COLOR[kind] || KIND_COLOR.file;

  async function commitRename() {
    const n = draftName.trim();
    if (!n || n === doc.name) { setEditing(false); return; }
    setSaving(true);
    await onRename(n);
    setSaving(false);
    setEditing(false);
  }

  /* ── delete-confirm row ── */
  if (delConfirm) return (
    <div style={{ display:'flex', alignItems:'center', gap:10, background:'#FFEBEE',
      border:`1px solid #EF9A9A`, borderRadius:10, padding:'9px 11px' }}>
      <Icon name="alert" size={17} color={E.error}/>
      <span style={{ flex:1, fontFamily:EF.body, fontSize:12.5, color:E.error }}>
        Delete "<b>{doc.name}</b>"?
      </span>
      <button onClick={async()=>{ await onDelete(); setDelConfirm(false); }}
        style={{ ...btnReset, height:28, padding:'0 12px', borderRadius:7, background:E.error,
          color:'#fff', fontFamily:EF.display, fontWeight:600, fontSize:12 }}>Delete</button>
      <button onClick={()=>setDelConfirm(false)}
        style={{ ...btnReset, height:28, padding:'0 12px', borderRadius:7, border:`1px solid ${E.border}`,
          fontFamily:EF.display, fontWeight:600, fontSize:12, color:E.ink2 }}>Cancel</button>
    </div>
  );

  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, background:E.surface,
      border:`1px solid ${E.border}`, borderRadius:10, padding:'9px 11px' }}>

      {/* File icon */}
      <div style={{ width:38, height:38, borderRadius:8, background:color+'15',
        border:`1px solid ${color}30`, display:'flex', alignItems:'center',
        justifyContent:'center', flexShrink:0 }}>
        <Icon name="file" size={19} color={color}/>
      </div>

      {/* Name — normal or inline edit input */}
      {editing ? (
        <input value={draftName} onChange={e=>setDraftName(e.target.value)}
          onBlur={commitRename}
          onKeyDown={e=>{ if(e.key==='Enter') commitRename(); if(e.key==='Escape'){ setEditing(false); setDraftName(doc.name); } }}
          autoFocus disabled={saving}
          style={{ flex:1, minWidth:0, height:30, border:`1.5px solid ${E.maroon}`, borderRadius:7,
            padding:'0 8px', fontFamily:EF.display, fontWeight:500, fontSize:13, color:E.ink,
            background:'#fff', outline:'none' }}/>
      ) : (
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:EF.display, fontWeight:500, fontSize:12.5, color:E.ink,
            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{doc.name}</div>
          <div style={{ fontFamily:EF.body, fontSize:11, color:E.ink2, display:'flex', gap:8 }}>
            <span>{doc.size}</span>
            <span style={{ color, fontWeight:600, fontSize:10 }}>{kind.toUpperCase()}</span>
          </div>
        </div>
      )}

      {/* Download */}
      {doc.url && !editing && (
        <a href={doc.url} target="_blank" rel="noreferrer" style={{ ...btnReset }}
          title="Download">
          <Icon name="download" size={17} color={E.maroon}/>
        </a>
      )}

      {/* Edit / delete — only when editable */}
      {editable && !editing && (
        <>
          <button onClick={()=>{ setDraftName(doc.name); setEditing(true); }}
            style={{ ...btnReset }} title="Rename">
            <Icon name="edit" size={16} color={E.ink2}/>
          </button>
          <button onClick={()=>setDelConfirm(true)}
            style={{ ...btnReset }} title="Delete">
            <Icon name="x" size={16} color={E.error}/>
          </button>
        </>
      )}

      {/* Saving spinner or done tick */}
      {saving ? (
        <span className="dsu-spin" style={{ width:16, height:16, flexShrink:0,
          borderTopColor:E.maroon, borderColor:E.border }}/>
      ) : !editable && (
        <span style={{ width:20, height:20, borderRadius:'50%', background:E.success,
          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Icon name="check" size={11} color="#fff" sw={3}/>
        </span>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EVIDENCE HUB — top "Upload Documents" button (batch/single) +
   per-indicator yellow "+", plus an "All Files" library view
═══════════════════════════════════════════════════════════════ */
function EvidenceScreen({ store }) {
  const { indicators, sections } = store;
  const [tab, setTab]   = uS3('All');
  const [view, setView] = uS3('indicators');     // 'indicators' | 'files'

  // batch-upload state
  const [pickedFiles, setPickedFiles]   = uS3([]);     // File[] chosen for batch
  const [batchTarget, setBatchTarget]   = uS3('');     // kpi code to attach to
  const [batchOpen, setBatchOpen]       = uS3(false);  // sheet open
  const [batchBusy, setBatchBusy]       = uS3(false);  // uploading

  const tabs    = ['All', ...sections.map(s=>'Section '+s.id)];
  const list    = indicators.filter(k=> tab==='All' || k.section===tab.split(' ')[1]);
  const withAll = indicators.filter(k=>k.docs.length>=k.reqDocs.length).length;
  const totalDocs = indicators.reduce((s,k)=>s+k.docs.length,0);

  // Flat list of every uploaded file across all indicators
  const allFiles = [];
  indicators.forEach(k=> (k.docs||[]).forEach((d,i)=> allFiles.push({
    ...d, kpiCode:k.code, kpiName:k.name, accent:(sections.find(s=>s.id===k.section)||{}).accent||E.maroon,
    status:k.status, docIndex:i,
  })));

  function onBatchPick(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    // default target = first editable indicator, else first overall
    const def = indicators.find(k=>['DRAFT','RETURNED'].includes(k.status)) || indicators[0];
    setPickedFiles(files);
    setBatchTarget(def?.code || '');
    setBatchOpen(true);
  }

  async function doBatchUpload() {
    const ind = indicators.find(k=>k.code===batchTarget);
    if (!ind) { store.toast('Please choose an indicator','error'); return; }
    setBatchBusy(true);

    let entryId = ind._entryId;
    if (window.DSUdb?.isConnected() && !entryId) {
      await window.DSUdb.saveScore(batchTarget, { score:0, value:0, remarks:'' },
        window.DSUdb.ACTIVE_PERIOD_ID, store.currentUser);
      const fresh = await window.DSUdb.loadAllData();
      entryId = fresh?.indicators.find(k=>k.code===batchTarget)?._entryId || null;
      if (entryId) store.update(batchTarget, { _entryId:entryId });
    }

    const newDocs = [...ind.docs];
    let added = 0;
    for (const file of pickedFiles) {
      if (file.size > 52428800) { store.toast(`${file.name} skipped — over 50 MB`,'error'); continue; }
      const kind = getFileKindLocal(file.type);
      const size = formatFileSize(file.size);
      let url = '';
      if (window.DSUdb?.isConnected()) {
        const up = await window.DSUdb.uploadFile(file, batchTarget, store.currentUser?.id);
        if (up) {
          url = up.url;
          if (entryId) await window.DSUdb.addEvidence(entryId, file.name, size, kind, file.type,
            url, store.currentUser?.id, store.currentUser?.full_name);
        }
      }
      newDocs.push({ name:file.name, size, kind, url });
      added++;
    }
    store.update(batchTarget, { docs:newDocs });
    setBatchBusy(false);
    setBatchOpen(false);
    setPickedFiles([]);
    setView('files'); // jump to the library so they see where files went
    store.toast(`${added} file${added!==1?'s':''} uploaded to ${batchTarget}`, 'success');
  }

  return (
    <>
      {/* hidden multi-file input for batch upload */}
      <input id="batch-upload" type="file" accept="*" multiple
        style={{ position:'absolute', left:'-9999px', opacity:0, width:1, height:1 }}
        onChange={onBatchPick}/>

      <Scroll>
        {/* Prominent Upload button (batch or single) */}
        <label htmlFor="batch-upload" style={{ display:'block', cursor:'pointer', marginBottom:14 }}>
          <div style={{ background:`linear-gradient(135deg, ${E.maroon}, ${E.maroonDark})`, color:'#fff',
            borderRadius:14, padding:'16px', boxShadow:ES.fab, display:'flex', alignItems:'center', gap:13 }}>
            <span style={{ width:46, height:46, borderRadius:12, background:E.yellow, flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon name="upload" size={24} color={E.maroonDark} sw={2.4}/>
            </span>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:EF.display, fontWeight:700, fontSize:16 }}>Upload Documents</div>
              <div style={{ fontFamily:EF.body, fontSize:12, opacity:.85, marginTop:2 }}>
                Select one or many files at once — any format
              </div>
            </div>
            <Icon name="chevR" size={20} color="#fff"/>
          </div>
        </label>

        {/* Summary */}
        <Card style={{ marginBottom:14 }}>
          <div style={{ fontFamily:EF.body, fontSize:12.5, color:E.ink, marginBottom:9 }}>
            <b style={{ fontFamily:EF.mono }}>{withAll} of {indicators.length}</b> indicators have all required documents
          </div>
          <ProgressBar value={withAll} max={indicators.length}/>
          <div style={{ fontFamily:EF.body, fontSize:11.5, color:E.ink2, marginTop:7 }}>
            {totalDocs} document{totalDocs!==1?'s':''} uploaded in total
          </div>
        </Card>

        {/* View toggle: By Indicator | All Files */}
        <div style={{ display:'flex', gap:6, background:E.surface, borderRadius:12, padding:4, marginBottom:14 }}>
          {[['indicators','By Indicator'],['files',`All Files (${allFiles.length})`]].map(([id,label])=>(
            <button key={id} onClick={()=>setView(id)} style={{ ...btnReset, flex:1, justifyContent:'center',
              height:36, borderRadius:9, background:view===id?'#fff':'transparent',
              boxShadow:view===id?ES.card:'none', fontFamily:EF.display, fontWeight:600, fontSize:13,
              color:view===id?E.maroon:E.ink2 }}>{label}</button>
          ))}
        </div>

        {view==='indicators' ? (
          <>
            {/* Section tabs */}
            <div className="dsu-scroll" style={{ display:'flex', gap:8, overflowX:'auto', margin:'0 -16px 14px', padding:'0 16px' }}>
              {tabs.map(t=>(
                <button key={t} onClick={()=>setTab(t)} style={{ ...btnReset, flexShrink:0, height:32, padding:'0 14px',
                  borderRadius:16, fontFamily:EF.body, fontWeight:600, fontSize:12.5,
                  background:tab===t?E.maroon:'#fff', color:tab===t?'#fff':E.ink2,
                  border:`1px solid ${tab===t?E.maroon:E.border}` }}>{t}</button>
              ))}
            </div>
            {list.map(k=>(
              <IndicatorEvidenceCard key={k.code} ind={k} store={store} sections={sections}/>
            ))}
          </>
        ) : (
          <AllFilesList allFiles={allFiles} store={store} indicators={indicators}/>
        )}
      </Scroll>

      {/* Batch upload sheet */}
      <BottomSheet open={batchOpen} onClose={()=>!batchBusy && setBatchOpen(false)}>
        <div style={{ fontFamily:EF.display, fontWeight:700, fontSize:17, color:E.ink, marginBottom:4 }}>
          Upload {pickedFiles.length} file{pickedFiles.length!==1?'s':''}
        </div>
        <div style={{ fontFamily:EF.body, fontSize:12.5, color:E.ink2, marginBottom:14 }}>
          Choose which KPI indicator these documents belong to.
        </div>

        {/* selected files preview */}
        <div style={{ maxHeight:150, overflowY:'auto', marginBottom:14, display:'flex', flexDirection:'column', gap:7 }}>
          {pickedFiles.map((f,n)=>{
            const kind = getFileKindLocal(f.type), color = KIND_COLOR[kind]||KIND_COLOR.file;
            return (
              <div key={n} style={{ display:'flex', alignItems:'center', gap:10, background:E.surface,
                border:`1px solid ${E.border}`, borderRadius:9, padding:'8px 10px' }}>
                <Icon name="file" size={18} color={color}/>
                <span style={{ flex:1, minWidth:0, fontFamily:EF.body, fontSize:12.5, color:E.ink,
                  whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{f.name}</span>
                <span style={{ fontFamily:EF.body, fontSize:11, color:E.ink2 }}>{formatFileSize(f.size)}</span>
              </div>
            );
          })}
        </div>

        {/* indicator selector */}
        <div style={{ fontFamily:EF.display, fontWeight:500, fontSize:13, color:E.maroon, marginBottom:6 }}>
          Attach to indicator
        </div>
        <select value={batchTarget} onChange={e=>setBatchTarget(e.target.value)} disabled={batchBusy}
          style={{ width:'100%', height:48, borderRadius:10, border:`1.5px solid ${E.border}`,
            padding:'0 12px', fontFamily:EF.body, fontSize:14, color:E.ink, background:'#fff',
            marginBottom:16, appearance:'menulist' }}>
          {sections.map(sec=>(
            <optgroup key={sec.id} label={`Section ${sec.id} — ${sec.name}`}>
              {indicators.filter(k=>k.section===sec.id).map(k=>(
                <option key={k.code} value={k.code}>{k.code} — {k.name}</option>
              ))}
            </optgroup>
          ))}
        </select>

        <div style={{ display:'flex', gap:10 }}>
          <SecondaryBtn onClick={()=>{ if(!batchBusy){ setBatchOpen(false); setPickedFiles([]); } }}>Cancel</SecondaryBtn>
          <PrimaryBtn onClick={doBatchUpload} loading={batchBusy} icon={batchBusy?undefined:'upload'}>
            {batchBusy ? 'Uploading…' : `Upload ${pickedFiles.length} file${pickedFiles.length!==1?'s':''}`}
          </PrimaryBtn>
        </div>
      </BottomSheet>
    </>
  );
}

/* ── All Files library — flat list of every uploaded document ── */
function AllFilesList({ allFiles, store, indicators }) {
  if (allFiles.length === 0) {
    return <EmptyState icon="folder" title="No Documents Yet"
      message="Tap 'Upload Documents' above to add your first file. It will appear here."/>;
  }
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
      {allFiles.map((doc,idx)=>{
        const kind = doc.kind || 'file';
        const color = KIND_COLOR[kind] || KIND_COLOR.file;
        const ind = indicators.find(k=>k.code===doc.kpiCode);
        const editable = ind && ['DRAFT','RETURNED'].includes(ind.status);
        return (
          <div key={idx} style={{ display:'flex', alignItems:'center', gap:11, background:'#fff',
            border:`1px solid ${E.border}`, borderRadius:12, padding:'11px 12px', boxShadow:ES.card }}>
            <div style={{ width:40, height:40, borderRadius:9, background:color+'15',
              border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Icon name="file" size={20} color={color}/>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:EF.display, fontWeight:500, fontSize:13, color:E.ink,
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{doc.name}</div>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:3 }}>
                <CodeBadge code={doc.kpiCode} color={doc.accent}/>
                <span style={{ fontFamily:EF.body, fontSize:11, color:E.ink2,
                  whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{doc.size} · {kind.toUpperCase()}</span>
              </div>
            </div>
            {doc.url && (
              <a href={doc.url} target="_blank" rel="noreferrer" style={{ ...btnReset }} title="Download / View">
                <Icon name="download" size={18} color={E.maroon}/>
              </a>
            )}
            {editable && (
              <button title="Delete" style={btnReset} onClick={async()=>{
                if (window.DSUdb?.isConnected() && doc.docId)
                  await window.DSUdb.removeEvidence(doc.docId, store.currentUser?.full_name);
                store.update(doc.kpiCode, { docs: ind.docs.filter((_,i)=>i!==doc.docIndex) });
                store.toast('Document removed','info');
              }}>
                <Icon name="x" size={17} color={E.error}/>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Per-indicator card — owns its own <input type="file"> ── */
function IndicatorEvidenceCard({ ind, store, sections }) {
  const [open, setOpen]         = uS3(false);
  const [uploading, setUploading] = uS3(false);
  const inputId  = 'ev-' + ind.code; // unique DOM id for label->input link
  const sec      = sections.find(s=>s.id===ind.section);
  const accent   = sec?.accent || E.maroon;
  const canUpload = ['DRAFT','RETURNED'].includes(ind.status);
  const full     = ind.docs.length >= ind.reqDocs.length;
  const dot      = full ? E.success : (ind.docs.length > 0 ? E.yellow : E.error);

  async function handleFile(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    e.target.value = ''; // allow re-selecting same file(s)

    setUploading(true);
    if (!open) setOpen(true); // auto-expand to show progress

    let entryId = ind._entryId;
    if (window.DSUdb?.isConnected() && !entryId) {
      await window.DSUdb.saveScore(ind.code,{score:0,value:0,remarks:''},
        window.DSUdb.ACTIVE_PERIOD_ID, store.currentUser);
      const fresh = await window.DSUdb.loadAllData();
      entryId = fresh?.indicators.find(k=>k.code===ind.code)?._entryId || null;
      if (entryId) store.update(ind.code,{_entryId:entryId});
    }

    const newDocs = [...ind.docs];
    let added = 0;
    for (const file of files) {
      if (file.size > 52428800) { store.toast(`${file.name} skipped — over 50 MB`,'error'); continue; }
      const kind = getFileKindLocal(file.type);
      const size = formatFileSize(file.size);
      let storageUrl = '';
      if (window.DSUdb?.isConnected()) {
        const up = await window.DSUdb.uploadFile(file, ind.code, store.currentUser?.id);
        if (up) {
          storageUrl = up.url;
          if (entryId) await window.DSUdb.addEvidence(entryId, file.name, size, kind, file.type,
            storageUrl, store.currentUser?.id, store.currentUser?.full_name);
        }
      }
      newDocs.push({ name:file.name, size, kind, url:storageUrl });
      added++;
    }
    store.update(ind.code,{ docs:newDocs });
    store.toast(`${added} file${added!==1?'s':''} uploaded`,'success');
    setUploading(false);
  }

  return (
    <div style={{ background:'#fff', border:`1px solid ${E.border}`, borderRadius:14,
      boxShadow:ES.card, marginBottom:11, overflow:'hidden' }}>

      {/* THE file input — hidden but directly in DOM, linked via htmlFor on every label */}
      <input id={inputId} type="file" accept="*" multiple
        style={{ position:'absolute', left:'-9999px', opacity:0, width:1, height:1 }}
        onChange={handleFile}/>

      {/* Collapsed header row */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 14px' }}>
        <span style={{ width:11, height:11, borderRadius:'50%', background:dot, flexShrink:0 }}/>

        {/* Tap to expand */}
        <div onClick={()=>setOpen(!open)} style={{ flex:1, minWidth:0, cursor:'pointer' }}>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <CodeBadge code={ind.code} color={accent}/>
            <span style={{ fontFamily:EF.display, fontWeight:500, fontSize:13, color:E.ink,
              whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{ind.name}</span>
          </div>
          <div style={{ fontFamily:EF.body, fontSize:11, color:E.ink2, marginTop:2 }}>
            {ind.docs.length} of {ind.reqDocs.length} doc{ind.reqDocs.length!==1?'s':''} uploaded
            {' · '}<span style={{ color:ind.status==='APPROVED'?E.success:ind.status==='DRAFT'?E.ink3:E.maroon }}>
              {ind.status.charAt(0)+ind.status.slice(1).toLowerCase()}
            </span>
          </div>
        </div>

        {/* Review badge */}
        {ind.review && <ReviewMini review={ind.review}/>}

        {/* Quick-upload yellow button — visible on collapsed row */}
        {canUpload && (
          <label htmlFor={inputId} title="Upload document"
            style={{ display:'flex', alignItems:'center', justifyContent:'center',
              width:34, height:34, borderRadius:9, background:E.yellow, cursor:'pointer',
              flexShrink:0 }} onClick={e=>e.stopPropagation()}>
            {uploading
              ? <span className="dsu-spin" style={{ width:14, height:14, borderTopColor:E.maroonDark, borderColor:'rgba(0,0,0,.2)' }}/>
              : <Icon name="plus" size={20} color={E.maroonDark} sw={2.6}/>}
          </label>
        )}
        {ind.docs.length>0 && (
          <span style={{ minWidth:20, height:20, padding:'0 5px', borderRadius:10, background:E.yellow,
            color:E.maroonDark, fontFamily:EF.mono, fontWeight:700, fontSize:10,
            display:'flex', alignItems:'center', justifyContent:'center' }}>{ind.docs.length}</span>
        )}

        <div onClick={()=>setOpen(!open)} style={{ cursor:'pointer' }}>
          <Icon name={open?'chevD':'chevR'} size={18} color={E.ink3}/>
        </div>
      </div>

      {/* Expanded body */}
      {open && (
        <div style={{ padding:'0 14px 14px', borderTop:`1px solid ${E.border}` }}>

          {/* Review block */}
          {ind.review && (
            <div style={{ marginTop:12, marginBottom:4 }}>
              <ReviewBlock review={ind.review}/>
            </div>
          )}

          {/* Required docs checklist */}
          {ind.reqDocs.length>0 && (
            <div style={{ background:E.yellowSoft, borderRadius:10, padding:'10px 12px', margin:'12px 0 10px' }}>
              <div style={{ fontFamily:EF.display, fontWeight:600, fontSize:12.5, color:E.brown, marginBottom:7 }}>
                Required documents for {ind.code}
              </div>
              {ind.reqDocs.map((d,n)=>{
                const have = n<ind.docs.length;
                return (
                  <div key={n} style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 0' }}>
                            <span style={{ width:17, height:17, borderRadius:5, flexShrink:0,
                              border:`1.5px solid ${have?E.success:'#C9B27A'}`,
                              background:have?E.success:'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
                              {have && <Icon name="check" size={10} color="#fff" sw={3}/>}
                            </span>
                            <span style={{ fontFamily:EF.body, fontSize:12, color:E.brown }}>{d}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

          {/* Uploaded docs with edit / delete */}
          {ind.docs.length>0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:12 }}>
              {ind.docs.map((doc,n)=>(
                <DocCard key={doc.docId||n} doc={doc}
                  editable={canUpload}
                  onRename={async newName=>{
                    if (window.DSUdb?.isConnected() && doc.docId)
                      await window.DSUdb.renameEvidence(doc.docId, newName, store.currentUser?.full_name);
                    store.update(ind.code,{docs:ind.docs.map((d,i)=>i===n?{...d,name:newName}:d)});
                  }}
                  onDelete={async()=>{
                    if (window.DSUdb?.isConnected() && doc.docId)
                      await window.DSUdb.removeEvidence(doc.docId, store.currentUser?.full_name);
                    store.update(ind.code,{docs:ind.docs.filter((_,i)=>i!==n)});
                    store.toast('Document removed','info');
                  }}
                />
              ))}
            </div>
          )}

          {/* Upload zone — label+htmlFor is the only mobile-safe method */}
          {canUpload && (
            uploading ? (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                border:`2px dashed ${E.maroon}`, borderRadius:14, padding:'20px', background:E.maroonTint }}>
                <span className="dsu-spin" style={{ borderTopColor:E.maroon, borderColor:E.border+'80' }}/>
                <span style={{ fontFamily:EF.display, fontWeight:600, fontSize:14, color:E.maroon }}>Uploading…</span>
              </div>
            ) : (
              <label htmlFor={inputId} style={{ display:'block', cursor:'pointer' }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8,
                  border:`2px dashed ${E.maroon}`, borderRadius:14, background:E.maroonTint, padding:'22px 16px' }}>
                  <Icon name="cloud" size={32} color={E.maroon}/>
                  <span style={{ fontFamily:EF.display, fontWeight:700, fontSize:15, color:E.maroon }}>
                    {ind.docs.length > 0 ? 'Add Another Document' : 'Add Document'}
                  </span>
                  <span style={{ fontFamily:EF.body, fontSize:12, color:E.ink2, textAlign:'center' }}>
                    Tap here — Any format: PDF, Word, Excel, images · Max 50 MB
                  </span>
                </div>
              </label>
            )
          )}

          {/* Read-only: submitted/approved entries */}
          {!canUpload && (
            <div style={{ marginTop:4 }}>
              <SecondaryBtn icon="clipboard" onClick={()=>store.nav('entry',{code:ind.code})}>
                View Full Entry
              </SecondaryBtn>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Small review badge shown on collapsed indicator row ─── */
function ReviewMini({ review }) {
  const c = { perfect:{bg:'#E8F5E9',fg:'#2E7D32'}, minor:{bg:'#FFF8E1',fg:'#F57F17'}, bad:{bg:'#FFEBEE',fg:'#D32F2F'} };
  const s = c[review?.rating] || c.perfect;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:3, height:20, padding:'0 7px',
      borderRadius:10, background:s.bg, fontFamily:EF.display, fontWeight:600, fontSize:10, color:s.fg }}>
      <Icon name={review.rating==='perfect'?'check':review.rating==='bad'?'x':'ret'} size={10} color={s.fg} sw={2.8}/>
      {review.rating==='perfect'?'Approved':review.rating==='minor'?'Returned':'Rejected'}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   REPORTS
═══════════════════════════════════════════════════════════════ */
function ReportsScreen({ store }) {
  const [period, setPeriod] = uS3('2024–25');
  const [gen, setGen]       = uS3(null);
  const periods = ['2024–25','2023–24','2022–23','Last 3 Years'];
  const reports = [
    { ic:'chart',  c:E.maroon, t:'My Contributions Report',   d:'Your personal KPI contributions for the period',          role:['faculty','review'] },
    { ic:'folder', c:E.info,   t:'Department Report',         d:'All faculty contributions aggregated by department',       role:['review'] },
    { ic:'shield', c:E.success,t:'University Score Card',     d:'Official HEC submission format — full score card',         role:['review'] },
  ].filter(r=>r.role.includes(store.user.role));

  function buildReportHTML(reportTitle) {
    const { indicators, sections, user } = store;
    const total = indicators.reduce((a,k)=>a+(k.status!=='DRAFT'?k.score:0),0);
    const cat   = total>=80?'W':total>=60?'X':total>=40?'Y':'Non-Complying';
    const catColor = total>=80?'#2E7D32':total>=60?'#1565C0':total>=40?'#E65100':'#D32F2F';
    const sRows = sections.map(s=>{
      const sc = indicators.filter(k=>k.section===s.id).reduce((a,k)=>a+(k.status!=='DRAFT'?k.score:0),0);
      return `<tr><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">${s.id}. ${s.name}</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-weight:700;font-family:monospace;color:#6B1A1A;text-align:right">${sc}/${s.max}</td></tr>`;
    }).join('');
    const iRows = indicators.filter(k=>k.status!=='DRAFT').map(k=>{
      const sColor={APPROVED:'#2E7D32',SUBMITTED:'#1565C0',UNDER_REVIEW:'#E65100',REJECTED:'#D32F2F',RETURNED:'#F57F17'}[k.status]||'#757575';
      return `<tr><td style="padding:7px 10px;border-bottom:1px solid #f5f5f5;font-family:monospace;font-weight:700;color:#6B1A1A">${k.code}</td><td style="padding:7px 10px;border-bottom:1px solid #f5f5f5">${k.name}</td><td style="padding:7px 10px;border-bottom:1px solid #f5f5f5;text-align:center">${k.max}</td><td style="padding:7px 10px;border-bottom:1px solid #f5f5f5;text-align:center;font-family:monospace;font-weight:700">${k.score}</td><td style="padding:7px 10px;border-bottom:1px solid #f5f5f5;text-align:center;font-family:monospace">${k.hecScore!==null?k.hecScore:'—'}</td><td style="padding:7px 10px;border-bottom:1px solid #f5f5f5;font-size:11px;font-weight:700;color:${sColor}">${k.status}</td></tr>`;
    }).join('');
    const dateStr = new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>DSU ORIC Score Card — ${period}</title><style>*{box-sizing:border-box}body{font-family:Arial,sans-serif;margin:0;padding:24px;color:#1a1a1a;font-size:13px}@media print{body{padding:8px}}</style></head><body>
<div style="background:#6B1A1A;color:#fff;border-radius:8px;padding:20px;margin-bottom:20px;display:flex;align-items:center;gap:16px">
<div style="background:#fff;border-radius:6px;padding:6px;width:56px;height:56px;display:flex;align-items:center;justify-content:center;flex-shrink:0"><div style="width:40px;height:40px;background:#6B1A1A;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#F5C518;font-weight:900;font-size:18px">DSU</div></div>
<div><div style="font-size:18px;font-weight:700">DHA Suffa University — ORIC Score Card</div><div style="opacity:.85;margin-top:4px">Period: ${period} &nbsp;·&nbsp; ${reportTitle}</div><div style="opacity:.7;margin-top:2px;font-size:12px">Prepared for: ${user.name||'—'} (${user.roleLabel||'—'}) &nbsp;·&nbsp; Generated: ${dateStr}</div></div></div>
<div style="display:flex;gap:12px;margin-bottom:20px">
<div style="flex:1;border:2px solid #6B1A1A;border-radius:8px;padding:16px;text-align:center"><div style="font-size:36px;font-weight:700;color:#6B1A1A">${total}</div><div style="color:#666;margin-top:4px">Total Score / 100</div><div style="display:inline-block;background:#F5C518;color:#4A1010;padding:3px 12px;border-radius:10px;font-weight:700;font-size:13px;margin-top:8px">Category ${cat}</div></div>
${sections.map(s=>{const sc=indicators.filter(k=>k.section===s.id).reduce((a,k)=>a+(k.status!=='DRAFT'?k.score:0),0);return`<div style="flex:1;border:1px solid #e0e0e0;border-radius:8px;padding:12px;text-align:center"><div style="font-size:22px;font-weight:700;color:${['#6B1A1A','#1565C0','#2E7D32','#E65100'][['A','B','C','D'].indexOf(s.id)]}">${sc}/${s.max}</div><div style="color:#888;font-size:11px;margin-top:4px">Section ${s.id}<br/>${s.name}</div></div>`;}).join('')}
</div>
<table style="width:100%;border-collapse:collapse;margin-bottom:20px"><thead><tr style="background:#6B1A1A;color:#fff"><td style="padding:8px 12px">Section Summary</td><td style="padding:8px 12px;text-align:right">Score</td></tr></thead><tbody>${sRows}</tbody><tfoot><tr style="background:#f5f5f5"><td style="padding:10px 12px;font-weight:700">TOTAL</td><td style="padding:10px 12px;font-weight:700;font-family:monospace;color:#6B1A1A;text-align:right">${total} / 100</td></tr></tfoot></table>
<table style="width:100%;border-collapse:collapse"><thead><tr style="background:#333;color:#fff"><td style="padding:8px 10px">Code</td><td style="padding:8px 10px">Indicator</td><td style="padding:8px 10px;text-align:center">Max</td><td style="padding:8px 10px;text-align:center">Self</td><td style="padding:8px 10px;text-align:center">HEC</td><td style="padding:8px 10px">Status</td></tr></thead><tbody>${iRows||'<tr><td colspan="6" style="padding:16px;text-align:center;color:#999">No submitted indicators yet</td></tr>'}</tbody></table>
<div style="text-align:center;margin-top:20px;color:#aaa;font-size:11px">DSU ORIC Performance Management System &nbsp;·&nbsp; HEC ORIC Policy 2021 &nbsp;·&nbsp; Confidential</div>
</body></html>`;
  }

  function doDownload(reportTitle) {
    const html = buildReportHTML(reportTitle);
    const blob = new Blob([html], { type:'text/html;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `DSU_ORIC_${reportTitle.replace(/\s+/g,'_')}_${period.replace(/[–—]/g,'-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    store.toast('Report downloaded — open the file to view or print as PDF', 'success');
  }

  function doPrint(reportTitle) {
    const html = buildReportHTML(reportTitle);
    const w = window.open('', '_blank', 'width=900,height=700');
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(()=>{ w.print(); }, 600);
  }

  async function doShare(reportTitle) {
    if (navigator.share) {
      try {
        const html = buildReportHTML(reportTitle);
        const blob = new Blob([html], { type:'text/html' });
        const file = new File([blob], `DSU_ORIC_Report_${period}.html`, { type:'text/html' });
        await navigator.share({ title:'DSU ORIC Score Card', files:[file] });
      } catch { store.toast('Share cancelled','info'); }
    } else {
      doPrint(reportTitle);
    }
  }

  function generate(name){ setGen('loading'); setTimeout(()=>setGen(name), 900); }

  if (gen && gen!=='loading') {
    return (
      <>
        <Scroll>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
            <button style={btnReset} onClick={()=>setGen(null)}><Icon name="back" size={22} color={E.ink}/></button>
            <span style={{ fontFamily:EF.display, fontWeight:600, fontSize:15, color:E.ink }}>{gen}</span>
          </div>
          <div style={{ border:`1px solid ${E.border}`, borderRadius:12, overflow:'hidden', background:'#fff' }}>
            <div style={{ background:E.maroon, color:'#fff', padding:'16px', textAlign:'center' }}>
              <img src="app/assets/dsu-logo.png" style={{ width:40, height:40, objectFit:'contain' }}/>
              <div style={{ fontFamily:EF.display, fontWeight:700, fontSize:14, marginTop:6 }}>DHA Suffa University</div>
              <div style={{ fontFamily:EF.body, fontSize:11, opacity:.85 }}>ORIC Score Card · {period}</div>
            </div>
            <div style={{ padding:16 }}>
              {store.sections.map(s=>{
                const sc = store.indicators.filter(k=>k.section===s.id).reduce((a,k)=>a+(k.status!=='DRAFT'?k.score:0),0);
                return (
                  <div key={s.id} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:`1px solid ${E.border}` }}>
                    <span style={{ fontFamily:EF.body, fontSize:12.5, color:E.ink }}>{s.id}. {s.name}</span>
                    <span style={{ fontFamily:EF.mono, fontWeight:700, fontSize:12.5, color:E.maroon }}>{sc}/{s.max}</span>
                  </div>
                );
              })}
              <div style={{ display:'flex', justifyContent:'space-between', paddingTop:11 }}>
                <span style={{ fontFamily:EF.display, fontWeight:700, fontSize:14, color:E.ink }}>Total</span>
                <span style={{ fontFamily:EF.mono, fontWeight:700, fontSize:14, color:E.maroon }}>
                  {store.indicators.reduce((a,k)=>a+(k.status!=='DRAFT'?k.score:0),0)}/100</span>
              </div>
            </div>
          </div>
        </Scroll>
        <StickyBar>
          <div style={{ display:'flex', gap:10 }}>
            {[['download','Download',()=>doDownload(gen)],['share','Share',()=>doShare(gen)],['print','Print',()=>doPrint(gen)]].map(([ic,l,fn])=>(
              <button key={l} onClick={fn} className="dsu-press"
                style={{ ...btnReset, flex:1, flexDirection:'column', gap:5, padding:'10px 0',
                  borderRadius:12, border:`1.5px solid ${E.maroon}`, justifyContent:'center' }}>
                <Icon name={ic} size={20} color={E.maroon}/>
                <span style={{ fontFamily:EF.display, fontWeight:600, fontSize:12, color:E.maroon }}>{l}</span>
              </button>
            ))}
          </div>
        </StickyBar>
      </>
    );
  }

  return (
    <Scroll>
      {gen==='loading' && (
        <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,.96)', zIndex:30,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
          <img src="app/assets/dsu-logo.png" style={{ width:54, height:54, objectFit:'contain' }}/>
          <div style={{ width:160, height:4, borderRadius:2, background:E.border, overflow:'hidden' }}>
            <div className="dsu-indef" style={{ height:'100%', width:'40%', background:E.yellow, borderRadius:2 }}/>
          </div>
          <div style={{ fontFamily:EF.body, fontSize:13, color:E.ink2 }}>Generating your report…</div>
        </div>
      )}
      <InstructionBanner id="reports">Choose a report type and period, then generate, download or share the PDF.</InstructionBanner>
      <div style={{ fontFamily:EF.display, fontWeight:500, fontSize:13, color:E.ink, marginBottom:9 }}>Assessment Period</div>
      <div className="dsu-scroll" style={{ display:'flex', gap:8, overflowX:'auto', margin:'0 -16px 20px', padding:'0 16px' }}>
        {periods.map(p=>(
          <button key={p} onClick={()=>setPeriod(p)} style={{ ...btnReset, flexShrink:0, height:34, padding:'0 15px',
            borderRadius:17, fontFamily:EF.body, fontWeight:600, fontSize:12.5,
            background:period===p?E.maroon:'#fff', color:period===p?'#fff':E.ink2,
            border:`1px solid ${period===p?E.maroon:E.border}` }}>{p}</button>
        ))}
      </div>
      {reports.map((r,n)=>(
        <Card key={n} style={{ marginBottom:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:13 }}>
            <span style={{ width:44, height:44, borderRadius:12, background:r.c+'15',
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Icon name={r.ic} size={22} color={r.c}/>
            </span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:EF.display, fontWeight:600, fontSize:14, color:E.ink }}>{r.t}</div>
              <div style={{ fontFamily:EF.body, fontSize:12, color:E.ink2, marginTop:2 }}>{r.d}</div>
            </div>
            <button onClick={()=>generate(r.t)} className="dsu-press"
              style={{ ...btnReset, height:36, padding:'0 14px', borderRadius:10, background:E.maroon, color:'#fff',
                fontFamily:EF.display, fontWeight:600, fontSize:12.5, justifyContent:'center', flexShrink:0 }}>
              Generate
            </button>
          </div>
        </Card>
      ))}
    </Scroll>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PROFILE
═══════════════════════════════════════════════════════════════ */
function ProfileScreen({ store }) {
  const u = store.user;
  const [sheet, setSheet] = uS3(false);

  const Section = ({ title, items }) => (
    <div style={{ marginBottom:18 }}>
      <div style={{ fontFamily:EF.display, fontWeight:600, fontSize:13, color:E.ink2,
        textTransform:'uppercase', letterSpacing:.5, marginBottom:8 }}>{title}</div>
      <Card pad={0}>
        {items.map((it,n)=>(
          <div key={n} onClick={it.onClick} className={it.onClick?'dsu-card-tap':''}
            style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 14px',
              borderTop:n?`1px solid ${E.border}`:'none', cursor:it.onClick?'pointer':'default' }}>
            <Icon name={it.icon} size={19} color={E.maroon}/>
            <span style={{ flex:1, fontFamily:EF.body, fontSize:13.5, color:E.ink }}>{it.label}</span>
            {it.toggle!==undefined
              ? <Toggle on={it.toggle}/>
              : <Icon name="chevR" size={17} color={E.ink3}/>}
          </div>
        ))}
      </Card>
    </div>
  );

  const adminItems = store.role==='review' ? [
    { icon:'reviewCheck', label:'Go to Faculty Submissions', onClick:()=>{ store.setTab('admin'); } },
  ] : [
    { icon:'reviewCheck', label:'Switch to Reviewer Mode', onClick:()=>store.toast('Sign in with an admin account','info') },
  ];

  return (
    <>
      <Scroll pad={0}>
        {/* Header */}
        <div style={{ background:`linear-gradient(135deg,${E.maroon},${E.maroonDark})`, padding:'24px 18px 26px',
          color:'#fff', display:'flex', alignItems:'center', gap:15 }}>
          <div style={{ width:60, height:60, borderRadius:'50%', background:'rgba(255,255,255,.15)',
            border:'2px solid rgba(255,255,255,.3)', display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:EF.display, fontWeight:700, fontSize:22 }}>{u.initials}</div>
          <div>
            <div style={{ fontFamily:EF.display, fontWeight:700, fontSize:19 }}>{u.name}</div>
            <span style={{ display:'inline-flex', alignItems:'center', height:24, padding:'0 11px', borderRadius:12,
              background:'#fff', color:E.maroon, fontFamily:EF.display, fontWeight:600, fontSize:11.5, marginTop:6 }}>
              {u.roleLabel}
            </span>
            <div style={{ fontFamily:EF.body, fontSize:12, color:'rgba(255,255,255,.75)', marginTop:6 }}>{u.dept}</div>
            <div style={{ fontFamily:EF.body, fontSize:11.5, color:'rgba(255,255,255,.6)', marginTop:2 }}>{u.email||''}</div>
          </div>
        </div>

        <div style={{ padding:16 }}>
          <Section title="Account" items={[
            { icon:'shield', label:'Change Password', onClick:()=>store.toast('Opens password reset email','info') },
            { icon:'bell',   label:'Approval Alerts',        toggle:true  },
            { icon:'clock',  label:'Submission Reminders',   toggle:true  },
          ]}/>
          <Section title="Tools" items={adminItems}/>
          <Section title="Help" items={[
            { icon:'bulb', label:'How to Use This App', onClick:()=>store.toast('Opens user guide','info') },
            { icon:'user', label:'Contact ORIC Office',  onClick:()=>store.toast('oric@dsu.edu.pk','info') },
          ]}/>

          <div style={{ textAlign:'center', fontFamily:EF.body, fontSize:11, color:E.ink3, margin:'4px 0 16px' }}>
            DSU ORIC PMS v1.0.0
          </div>

          <button onClick={()=>setSheet(true)} className="dsu-press"
            style={{ ...btnReset, width:'100%', height:50, borderRadius:12,
              border:`1.5px solid ${E.error}`, color:E.error, justifyContent:'center', gap:8,
              fontFamily:EF.display, fontWeight:600, fontSize:15 }}>
            <Icon name="logout" size={19} color={E.error}/>Log Out
          </button>
        </div>
      </Scroll>

      <BottomSheet open={sheet} onClose={()=>setSheet(false)}>
        <div style={{ textAlign:'center', marginBottom:6 }}>
          <span style={{ width:48, height:48, borderRadius:'50%', background:E.error+'15',
            display:'inline-flex', alignItems:'center', justifyContent:'center' }}>
            <Icon name="logout" size={24} color={E.error}/>
          </span>
        </div>
        <div style={{ fontFamily:EF.display, fontWeight:700, fontSize:17, color:E.ink, textAlign:'center', marginBottom:6 }}>
          Log out of your account?
        </div>
        <div style={{ fontFamily:EF.body, fontSize:13, color:E.ink2, textAlign:'center', marginBottom:18 }}>
          Your drafts are saved. You can log back in anytime.
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <SecondaryBtn onClick={()=>setSheet(false)}>Cancel</SecondaryBtn>
          <PrimaryBtn onClick={()=>{ setSheet(false); store.logout(); }}>Log Out</PrimaryBtn>
        </div>
      </BottomSheet>
    </>
  );
}

function Toggle({ on:initial }) {
  const [on,setOn] = uS3(initial);
  return (
    <button onClick={()=>setOn(!on)} style={{ ...btnReset, width:42, height:24, borderRadius:12,
      background:on?E.success:'#D2D2D2', padding:2, transition:'background .2s' }}>
      <span style={{ display:'block', width:20, height:20, borderRadius:'50%', background:'#fff',
        transform:on?'translateX(18px)':'translateX(0)', transition:'transform .2s',
        boxShadow:'0 1px 3px rgba(0,0,0,.3)' }}/>
    </button>
  );
}

Object.assign(window, { EvidenceScreen, ReportsScreen, ProfileScreen, Toggle, ReviewMini });
