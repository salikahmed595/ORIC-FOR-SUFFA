// faculty3.jsx — Evidence Hub, Reports, Profile
const { useState:uS3, useRef:rS3, useEffect:eS3 } = React;
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
const KIND_ACCEPT = '*';   // accept all file formats

/* ═══════════════════════════════════════════════════════════════
   EVIDENCE HUB
═══════════════════════════════════════════════════════════════ */
function EvidenceScreen({ store }) {
  const { indicators, sections, currentUser } = store;
  const [tab, setTab]         = uS3('All');
  const [open, setOpen]       = uS3(null);
  const [uploading, setUploading] = uS3(null); // kpi code being uploaded
  const fileInputRef = rS3(null);
  const activeKpiRef = rS3(null);

  const tabs    = ['All', ...sections.map(s=>'Section '+s.id)];
  const list    = indicators.filter(k=> tab==='All' || k.section===tab.split(' ')[1]);
  const withAll = indicators.filter(k=>k.docs.length>=k.reqDocs.length).length;
  const totalDocs = indicators.reduce((s,k)=>s+k.docs.length,0);

  function triggerUpload(kpiCode) {
    activeKpiRef.current = kpiCode;
    if (fileInputRef.current) { fileInputRef.current.value=''; fileInputRef.current.click(); }
  }

  async function handleFileSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const kpiCode = activeKpiRef.current;
    const ind = indicators.find(k=>k.code===kpiCode);
    if (!ind) return;

    setUploading(kpiCode);
    const kind = getFileKindLocal(file.type);
    const size = formatFileSize(file.size);

    let storageUrl = '';
    let entryId = ind._entryId;

    if (window.DSUdb?.isConnected()) {
      // 1. Upload file to Supabase Storage
      const upload = await window.DSUdb.uploadFile(file, kpiCode, currentUser?.id);
      if (upload) storageUrl = upload.url;

      // 2. Ensure a score_entry exists (upsert DRAFT)
      if (!entryId) {
        await window.DSUdb.saveScore(kpiCode, { score:0, value:0, remarks:'' },
          window.DSUdb.ACTIVE_PERIOD_ID, currentUser);
        // Re-fetch to get the new entry ID
        const fresh = await window.DSUdb.loadAllData();
        if (fresh) {
          const newInd = fresh.indicators.find(k=>k.code===kpiCode);
          entryId = newInd?._entryId || null;
          store.update(kpiCode, { _entryId: entryId });
        }
      }

      // 3. Save evidence_document record
      if (entryId) {
        await window.DSUdb.addEvidence(
          entryId, file.name, size, kind, file.type,
          storageUrl, currentUser?.id, currentUser?.full_name||currentUser?.name
        );
      }
    }

    // Update local state immediately
    const newDoc = { name: file.name, size, kind, url: storageUrl };
    store.update(kpiCode, { docs: [...ind.docs, newDoc] });
    store.toast(`${file.name} uploaded`, 'success');
    setUploading(null);
  }

  return (
    <>
      {/* Hidden file input — accepts all formats */}
      <input ref={fileInputRef} type="file" accept={KIND_ACCEPT}
        style={{ display:'none' }} onChange={handleFileSelected}/>

      <Scroll>
        <InstructionBanner id="evidence">Upload proof documents for each KPI indicator.
          All file formats accepted — PDF, Word, Excel, images, and more.</InstructionBanner>

        {/* Section filter tabs */}
        <div className="dsu-scroll" style={{ display:'flex', gap:8, overflowX:'auto', margin:'0 -16px 14px', padding:'0 16px' }}>
          {tabs.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{ ...btnReset, flexShrink:0, height:32, padding:'0 14px',
              borderRadius:16, fontFamily:EF.body, fontWeight:600, fontSize:12.5,
              background:tab===t?E.maroon:'#fff', color:tab===t?'#fff':E.ink2,
              border:`1px solid ${tab===t?E.maroon:E.border}` }}>{t}</button>
          ))}
        </div>

        {/* Summary card */}
        <Card style={{ marginBottom:16 }}>
          <div style={{ fontFamily:EF.body, fontSize:12.5, color:E.ink, marginBottom:9 }}>
            <b style={{ fontFamily:EF.mono }}>{withAll} of {indicators.length}</b> indicators have all required documents
          </div>
          <ProgressBar value={withAll} max={indicators.length}/>
          <div style={{ fontFamily:EF.body, fontSize:11.5, color:E.ink2, marginTop:8 }}>
            {totalDocs} document{totalDocs!==1?'s':''} total
          </div>
        </Card>

        {/* Indicator list */}
        {list.map(k=>{
          const sec  = sections.find(s=>s.id===k.section);
          const full = k.docs.length>=k.reqDocs.length;
          const dot  = full?E.success:(k.docs.length>0?E.yellow:E.error);
          const expanded = open===k.code;

          return (
            <div key={k.code} style={{ background:'#fff', border:`1px solid ${E.border}`, borderRadius:14,
              boxShadow:ES.card, marginBottom:11, overflow:'hidden' }}>

              {/* Header row */}
              <div onClick={()=>setOpen(expanded?null:k.code)} className="dsu-card-tap"
                style={{ display:'flex', alignItems:'center', gap:11, padding:'13px 14px', cursor:'pointer' }}>
                <span style={{ width:11, height:11, borderRadius:'50%', background:dot, flexShrink:0 }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <CodeBadge code={k.code} color={sec?.accent||E.maroon}/>
                    <span style={{ fontFamily:EF.display, fontWeight:500, fontSize:13.5, color:E.ink,
                      whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{k.name}</span>
                  </div>
                  <div style={{ fontFamily:EF.body, fontSize:11.5, color:E.ink2, marginTop:3 }}>
                    {k.docs.length} of {k.reqDocs.length} document{k.reqDocs.length!==1?'s':''} uploaded
                  </div>
                </div>
                {k.docs.length>0 && (
                  <span style={{ minWidth:22, height:22, padding:'0 6px', borderRadius:11, background:E.yellow,
                    color:E.maroonDark, fontFamily:EF.mono, fontWeight:700, fontSize:11,
                    display:'flex', alignItems:'center', justifyContent:'center' }}>{k.docs.length}</span>
                )}
                {/* Review badge */}
                {k.review && (
                  <ReviewMini review={k.review}/>
                )}
                <Icon name={expanded?'chevD':'chevR'} size={18} color={E.ink3}/>
              </div>

              {/* Expanded body */}
              {expanded && (
                <div style={{ padding:'0 14px 14px', borderTop:`1px solid ${E.border}` }}>

                  {/* Review block (if reviewed) */}
                  {k.review && (
                    <div style={{ marginTop:12, marginBottom:4 }}>
                      <ReviewBlock review={k.review}/>
                    </div>
                  )}

                  {/* Required docs checklist */}
                  {k.reqDocs.length>0 && (
                    <div style={{ background:E.yellowSoft, borderRadius:10, padding:'10px 12px', margin:'12px 0 10px' }}>
                      <div style={{ fontFamily:EF.display, fontWeight:600, fontSize:12.5, color:E.brown, marginBottom:7 }}>
                        Required documents
                      </div>
                      {k.reqDocs.map((d,n)=>{
                        const have = n<k.docs.length;
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

                  {/* Uploaded file list */}
                  {k.docs.length>0 && (
                    <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:12 }}>
                      {k.docs.map((doc,n)=>{
                        const kind  = doc.kind || 'file';
                        const color = KIND_COLOR[kind] || KIND_COLOR.file;
                        return (
                          <div key={n} style={{ display:'flex', alignItems:'center', gap:10, background:E.surface,
                            border:`1px solid ${E.border}`, borderRadius:10, padding:'9px 11px' }}>
                            <div style={{ width:38, height:38, borderRadius:8, background:color+'15',
                              border:`1px solid ${color}30`, display:'flex', alignItems:'center',
                              justifyContent:'center', flexShrink:0 }}>
                              <Icon name="file" size={19} color={color}/>
                            </div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontFamily:EF.display, fontWeight:500, fontSize:12.5, color:E.ink,
                                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{doc.name}</div>
                              <div style={{ fontFamily:EF.body, fontSize:11, color:E.ink2, display:'flex', gap:8 }}>
                                <span>{doc.size}</span>
                                <span style={{ color, fontWeight:600, fontSize:10 }}>{kind.toUpperCase()}</span>
                              </div>
                            </div>
                            {doc.url && (
                              <a href={doc.url} target="_blank" rel="noreferrer" style={{ ...btnReset }}>
                                <Icon name="download" size={17} color={E.maroon}/>
                              </a>
                            )}
                            <span style={{ width:20, height:20, borderRadius:'50%', background:E.success,
                              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <Icon name="check" size={11} color="#fff" sw={3}/>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Upload button */}
                  {['DRAFT','RETURNED'].includes(k.status) && (
                    uploading===k.code ? (
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                        border:`2px dashed ${E.maroon}`, borderRadius:14, padding:'18px',
                        background:E.maroonTint }}>
                        <span className="dsu-spin" style={{ borderTopColor:E.maroon, borderColor:E.border+'80' }}/>
                        <span style={{ fontFamily:EF.display, fontWeight:600, fontSize:14, color:E.maroon }}>Uploading…</span>
                      </div>
                    ) : (
                      <button onClick={()=>triggerUpload(k.code)} className="dsu-press"
                        style={{ ...btnReset, width:'100%', flexDirection:'column', gap:5,
                          border:`2px dashed ${E.maroon}`, borderRadius:14, background:E.maroonTint,
                          padding:'18px 16px', justifyContent:'center' }}>
                        <Icon name="cloud" size={28} color={E.maroon}/>
                        <span style={{ fontFamily:EF.display, fontWeight:600, fontSize:14, color:E.maroon }}>
                          {k.docs.length>0 ? 'Add Another Document' : 'Upload Document'}
                        </span>
                        <span style={{ fontFamily:EF.body, fontSize:11.5, color:E.ink2 }}>
                          PDF, Word, Excel, Images — any format · Max 50 MB
                        </span>
                      </button>
                    )
                  )}

                  {/* Read-only upload zone for submitted entries */}
                  {!['DRAFT','RETURNED'].includes(k.status) && (
                    <div style={{ marginTop:4 }}>
                      <SecondaryBtn icon="clipboard" onClick={()=>store.nav('entry',{code:k.code})}>
                        View Full Entry
                      </SecondaryBtn>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </Scroll>
    </>
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

  function generate(name){ setGen('loading'); setTimeout(()=>setGen(name), 1400); }

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
            {[['download','Download'],['share','Share'],['print','Print']].map(([ic,l])=>(
              <button key={l} onClick={()=>store.toast(l+' started','success')} className="dsu-press"
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
