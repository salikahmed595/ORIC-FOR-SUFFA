// admin2.jsx — Admin screens: Users, University Setup, Periods, Audit Logs, Faculty Submissions
const { useState:uA2, useEffect:eA2 } = React;
const { C:AD, F:AF, SHADOW:AS } = window.DSU;

/* ─── Mock static data ─── */
const MOCK_USERS = [
  { id:1, name:'Dr. Ahmed Raza',    email:'a.ahmed@dsu.edu.pk',    role:'FACULTY',          dept:'Computer Science',       active:true  },
  { id:2, name:'Dr. Sara Malik',    email:'s.malik@dsu.edu.pk',    role:'FACULTY',          dept:'Electrical Engineering', active:true  },
  { id:3, name:'Dr. Usman Tariq',   email:'u.tariq@dsu.edu.pk',    role:'HOD',              dept:'Business Administration',active:true  },
  { id:4, name:'Prof. Khalid Shah', email:'k.shah@dsu.edu.pk',     role:'DEAN',             dept:'Faculty of Engineering', active:true  },
  { id:5, name:'Dr. Amna Siddiqui', email:'a.siddiqui@dsu.edu.pk', role:'ORIC_HEAD',        dept:'ORIC',                   active:true  },
  { id:6, name:'Admin User',        email:'admin@dsu.edu.pk',      role:'UNIVERSITY_ADMIN', dept:'Administration',         active:true  },
  { id:7, name:'Dr. Fatima Khan',   email:'f.khan@dsu.edu.pk',     role:'FACULTY',          dept:'Computer Science',       active:false },
];
const ROLE_COLORS = { FACULTY:'#1565C0', HOD:'#2E7D32', DEAN:'#6A1E78', ORIC_HEAD:'#6B1A1A', UNIVERSITY_ADMIN:'#E65100', SUPER_ADMIN:'#37474F', AUDITOR:'#795548' };
const ROLE_LABELS = { FACULTY:'Faculty', HOD:'HOD', DEAN:'Dean', ORIC_HEAD:'ORIC Head', UNIVERSITY_ADMIN:'Univ. Admin', SUPER_ADMIN:'Super Admin', AUDITOR:'Auditor' };
const MOCK_PERIODS = [
  { id:'p1', label:'AY 2024–2025', from:'Jan 2024', to:'Dec 2024', status:'ACTIVE',  submitted:14, total:31, deadline:'31 Mar 2025' },
  { id:'p2', label:'AY 2023–2024', from:'Jan 2023', to:'Dec 2023', status:'CLOSED',  submitted:31, total:31, deadline:'31 Mar 2024' },
];
const MOCK_AUDIT = [
  { id:1, ts:'2025-06-04 09:42', user:'Dr. Ahmed Raza', action:'SUBMIT',  table:'score_entries',    record:'B1',  ip:'192.168.1.45' },
  { id:2, ts:'2025-06-04 09:38', user:'HEC Reviewer',   action:'APPROVE', table:'score_entries',    record:'B10', ip:'203.0.113.10' },
  { id:3, ts:'2025-06-04 08:55', user:'HEC Reviewer',   action:'REJECT',  table:'score_entries',    record:'B4',  ip:'203.0.113.10' },
  { id:4, ts:'2025-06-03 16:22', user:'Dr. Ahmed Raza', action:'UPLOAD',  table:'evidence_documents',record:'A2', ip:'192.168.1.45' },
  { id:5, ts:'2025-06-03 14:10', user:'HEC Reviewer',   action:'APPROVE', table:'score_entries',    record:'C6',  ip:'203.0.113.10' },
];
const ACTION_STYLE = { SUBMIT:{bg:'#E3F2FD',fg:'#1565C0'}, APPROVE:{bg:'#E8F5E9',fg:'#2E7D32'}, REJECT:{bg:'#FFEBEE',fg:'#D32F2F'}, RETURN:{bg:'#FFF8E1',fg:'#F57F17'}, UPLOAD:{bg:'#F3E5F5',fg:'#6A1E78'}, EDIT:{bg:'#FFF3E0',fg:'#E65100'}, LOGIN:{bg:'#F5F5F5',fg:'#757575'}, CREATE:{bg:'#E8F5E9',fg:'#2E7D32'}, DELETE:{bg:'#FFEBEE',fg:'#D32F2F'} };

/* ─── Admin Home router ─── */
function AdminScreen({ store }) {
  const [sub, setSubRaw] = uA2(null);
  const [subParams, setSubParams] = uA2(null);
  function setSub(id, params=null){ setSubRaw(id); setSubParams(params); }

  if (sub==='users')        return <UsersScreen onBack={()=>setSub(null)} store={store}/>;
  if (sub==='setup')        return <UniversitySetupScreen onBack={()=>setSub(null)} store={store}/>;
  if (sub==='periods')      return <PeriodsScreen onBack={()=>setSub(null)} store={store}/>;
  if (sub==='audit')        return <AuditLogsScreen onBack={()=>setSub(null)} store={store}/>;
  if (sub==='submissions')  return <FacultySubmissionsScreen onBack={()=>setSub(null)} store={store}/>;

  const cards = [
    { id:'submissions', icon:'reviewCheck', title:'Faculty Submissions', sub:'Review uploaded documents & give ratings', color:AD.maroon, badge:true },
    { id:'users',       icon:'user',        title:'User Management',     sub:'Manage faculty, HODs, and admin roles',     color:AD.info    },
    { id:'setup',       icon:'settings',    title:'University Setup',    sub:'Institution profile and ORIC configuration', color:'#6A1E78'  },
    { id:'periods',     icon:'cal',         title:'Assessment Periods',  sub:'Create and manage assessment cycles',        color:AD.success  },
    { id:'audit',       icon:'shield',      title:'Audit Logs',          sub:'Immutable log of all system actions',        color:'#37474F'  },
  ];

  const pendingCount = store.indicators.filter(k=>['SUBMITTED','UNDER_REVIEW'].includes(k.status)).length;

  return (
    <>
      <AppHeader title="Administration"/>
      <Scroll>
        <div style={{ background:`linear-gradient(135deg,${AD.maroon},${AD.maroonDark})`, borderRadius:16,
          padding:'16px 18px', color:'#fff', marginBottom:20, boxShadow:AS.fab }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Icon name="settings" size={18} color={AD.yellow}/>
            <span style={{ fontFamily:AF.display, fontWeight:700, fontSize:17 }}>System Administration</span>
          </div>
          <div style={{ fontFamily:AF.body, fontSize:12.5, color:'rgba(255,255,255,.8)', marginTop:5 }}>DHA Suffa University · ORIC PMS v1.0</div>
          <div style={{ display:'flex', gap:10, marginTop:14 }}>
            {[['Pending',pendingCount],['Faculty',MOCK_USERS.filter(u=>u.role==='FACULTY').length],['Logs',MOCK_AUDIT.length]].map(([l,n])=>(
              <div key={l} style={{ flex:1, background:'rgba(255,255,255,.12)', borderRadius:10, padding:'8px 0', textAlign:'center' }}>
                <div style={{ fontFamily:AF.mono, fontWeight:700, fontSize:20, color:AD.yellow }}>{n}</div>
                <div style={{ fontFamily:AF.body, fontSize:10, color:'rgba(255,255,255,.75)', marginTop:1 }}>{l}</div>
              </div>))}
          </div>
        </div>

        {cards.map(c=>(
          <div key={c.id} onClick={()=>setSub(c.id)} className="dsu-card-tap"
            style={{ background:'#fff', border:`1px solid ${AD.border}`, borderLeft:`4px solid ${c.color}`,
              borderRadius:14, padding:'16px', boxShadow:AS.card, cursor:'pointer', marginBottom:13, position:'relative' }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ width:44, height:44, borderRadius:12, background:c.color+'15',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Icon name={c.icon} size={22} color={c.color}/>
              </span>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:AF.display, fontWeight:600, fontSize:15, color:AD.ink }}>{c.title}</div>
                <div style={{ fontFamily:AF.body, fontSize:12, color:AD.ink2, marginTop:2 }}>{c.sub}</div>
              </div>
              {c.badge && pendingCount>0 && (
                <span style={{ minWidth:22, height:22, padding:'0 6px', borderRadius:11, background:AD.yellow,
                  color:AD.maroonDark, fontFamily:AF.mono, fontWeight:700, fontSize:11,
                  display:'flex', alignItems:'center', justifyContent:'center' }}>{pendingCount}</span>
              )}
              <Icon name="chevR" size={18} color={AD.ink3}/>
            </div>
          </div>
        ))}
      </Scroll>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   FACULTY SUBMISSIONS + DOCUMENT REVIEW
══════════════════════════════════════════════════════════════ */
function FacultySubmissionsScreen({ onBack, store }) {
  const [submissions, setSubmissions] = uA2(null); // null=loading
  const [selected, setSelected]       = uA2(null); // selected submission for review
  const [filter, setFilter]           = uA2('All');

  eA2(()=>{
    async function load() {
      if (window.DSUdb && window.DSUdb.isConnected()) {
        const data = await window.DSUdb.getAllSubmissions();
        setSubmissions(data);
      } else {
        // Fallback: build from store indicators
        const list = store.indicators
          .filter(k=>k.status!=='DRAFT')
          .map(k=>({
            id: k._entryId || k.code,
            kpi_code: k.code,
            status: k.status,
            self_score: k.score,
            user_name: k.userName || 'Dr. Ahmed Raza',
            evidence_documents: k.docs.map(d=>({ file_name:d.name, file_size:d.size, file_kind:d.kind })),
            review_feedback: k.review ? [k.review] : [],
            _ind: k,
          }));
        setSubmissions(list);
      }
    }
    load();
  },[]);

  if (selected) {
    return <SubmissionReviewScreen entry={selected} onBack={()=>setSelected(null)} store={store}/>;
  }

  const statuses = ['All','SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED','RETURNED'];
  const shown = (submissions||[]).filter(s=> filter==='All' || s.status===filter);

  // Group by faculty name
  const byFaculty = {};
  shown.forEach(s=>{
    const name = s.user_name || 'Unknown Faculty';
    if (!byFaculty[name]) byFaculty[name] = [];
    byFaculty[name].push(s);
  });

  return (
    <>
      <AppHeader title="Faculty Submissions" onBack={onBack} breadcrumb="Administration → Submissions"/>
      <Scroll>
        {/* Filter chips */}
        <div className="dsu-scroll" style={{ display:'flex', gap:8, overflowX:'auto', margin:'0 -16px 16px', padding:'0 16px' }}>
          {statuses.map(s=>(
            <button key={s} onClick={()=>setFilter(s)} style={{ ...btnReset, flexShrink:0, height:30, padding:'0 12px',
              borderRadius:15, fontFamily:AF.body, fontWeight:600, fontSize:12,
              background:filter===s?AD.maroon:'#fff', color:filter===s?'#fff':AD.ink2,
              border:`1px solid ${filter===s?AD.maroon:AD.border}` }}>{s}</button>
          ))}
        </div>

        {submissions===null ? (
          <div style={{ textAlign:'center', padding:'32px 0' }}>
            <div className="dsu-indef" style={{ width:120, height:4, borderRadius:2, background:AD.yellow, margin:'0 auto 12px' }}/>
            <span style={{ fontFamily:AF.body, fontSize:13, color:AD.ink2 }}>Loading submissions…</span>
          </div>
        ) : shown.length===0 ? (
          <EmptyState icon="folder" title="No Submissions" message="No submissions match this filter."/>
        ) : (
          Object.entries(byFaculty).map(([facultyName, entries])=>(
            <div key={facultyName} style={{ marginBottom:18 }}>
              {/* Faculty header */}
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:AD.maroon, color:'#fff',
                  display:'flex', alignItems:'center', justifyContent:'center', fontFamily:AF.display, fontWeight:700, fontSize:13, flexShrink:0 }}>
                  {facultyName.split(' ').map(w=>w[0]).slice(0,2).join('')}
                </div>
                <div>
                  <div style={{ fontFamily:AF.display, fontWeight:600, fontSize:14, color:AD.ink }}>{facultyName}</div>
                  <div style={{ fontFamily:AF.body, fontSize:11.5, color:AD.ink2 }}>{entries.length} submission{entries.length!==1?'s':''}</div>
                </div>
              </div>

              {entries.map(entry=>{
                const ind = store.indicators.find(k=>k.code===entry.kpi_code) || {};
                const sec = store.sections.find(s=>s.id===(ind.section||entry.kpi_code?.[0]));
                const accent = sec?.accent || AD.maroon;
                const docs = entry.evidence_documents || [];
                const hasReview = (entry.review_feedback||[]).length > 0;
                return (
                  <Card key={entry.id||entry.kpi_code} stripe={accent}
                    onClick={()=>setSelected(entry)}
                    style={{ marginBottom:10, cursor:'pointer' }}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <CodeBadge code={entry.kpi_code} color={accent}/>
                        <span style={{ fontFamily:AF.display, fontWeight:600, fontSize:13.5, color:AD.ink }}>
                          {ind.name || entry.kpi_code}
                        </span>
                      </div>
                      <StatusChip status={entry.status} size="sm"/>
                    </div>
                    {/* Documents */}
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                      <Icon name="paperclip" size={14} color={docs.length>0?AD.maroon:AD.ink3}/>
                      <span style={{ fontFamily:AF.body, fontSize:12, color:AD.ink2 }}>
                        {docs.length} document{docs.length!==1?'s':''} uploaded
                      </span>
                    </div>
                    {/* Review badge */}
                    {hasReview && (() => {
                      const rv = entry.review_feedback[entry.review_feedback.length-1];
                      const rc = {perfect:{bg:'#E8F5E9',fg:'#2E7D32'}, minor:{bg:'#FFF8E1',fg:'#F57F17'}, bad:{bg:'#FFEBEE',fg:'#D32F2F'}};
                      const c = rc[rv.rating]||rc.perfect;
                      return (
                        <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:c.bg,
                          borderRadius:8, padding:'4px 9px' }}>
                          <Icon name={rv.rating==='perfect'?'check':rv.rating==='bad'?'x':'ret'} size={12} color={c.fg} sw={2.8}/>
                          <span style={{ fontFamily:AF.display, fontWeight:600, fontSize:11, color:c.fg }}>
                            {rv.rating==='perfect'?'Approved':rv.rating==='minor'?'Returned':'Rejected'}
                          </span>
                        </div>
                      );
                    })()}
                    {!hasReview && ['SUBMITTED','UNDER_REVIEW'].includes(entry.status) && (
                      <div style={{ display:'inline-flex', alignItems:'center', gap:5,
                        background:'#E3F2FD', borderRadius:8, padding:'4px 9px' }}>
                        <Icon name="clock" size={12} color='#1565C0'/>
                        <span style={{ fontFamily:AF.display, fontWeight:600, fontSize:11, color:'#1565C0' }}>Needs Review</span>
                      </div>
                    )}
                    <div style={{ display:'flex', justifyContent:'flex-end', marginTop:6 }}>
                      <span style={{ fontFamily:AF.display, fontWeight:600, fontSize:12, color:AD.maroon,
                        display:'flex', alignItems:'center', gap:4 }}>
                        {hasReview?'View Review':'Give Review'} <Icon name="chevR" size={14} color={AD.maroon}/>
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          ))
        )}
      </Scroll>
    </>
  );
}

/* ─── Submission Review Detail ─── */
function SubmissionReviewScreen({ entry, onBack, store }) {
  const ind = store.indicators.find(k=>k.code===entry.kpi_code) || {};
  const sec = store.sections.find(s=>s.id===(ind.section||entry.kpi_code?.[0]));
  const accent = sec?.accent || AD.maroon;
  const docs = entry.evidence_documents || [];
  const existingReview = (entry.review_feedback||[])[0] || (ind.review ? {
    rating: ind.review.rating, comment: ind.review.comment,
    reviewer_name: ind.review.reviewer, created_at: ind.review.date
  } : null);

  const [rating,  setRating]  = uA2(existingReview?.rating || '');
  const [hecScore,setHecScore]= uA2(Number(entry.hec_score || ind.score || 0));
  const [comment, setComment] = uA2(existingReview?.comment || '');
  const [confirm, setConfirm] = uA2(false);
  const [submitting, setSubmitting] = uA2(false);

  const RATING_MAP = {
    perfect:{ label:'Approved',  color:'#2E7D32', icon:'check' },
    minor:  { label:'Returned',  color:'#F57F17', icon:'ret'   },
    bad:    { label:'Rejected',  color:'#D32F2F', icon:'x'     },
  };
  const canSubmit = rating && (!(['minor','bad'].includes(rating)) || comment.trim().length>0);

  async function doReview(){
    setSubmitting(true);
    const entryId = entry.id;
    let ok = false;
    if (window.DSUdb && window.DSUdb.isConnected() && entryId && !entryId.startsWith('A')&&!entryId.startsWith('B')&&!entryId.startsWith('C')&&!entryId.startsWith('D')) {
      ok = await window.DSUdb.saveReview(entryId, rating, comment.trim(), hecScore,
        store.user?.name || 'HEC Reviewer');
    }
    // Also update local state
    const statusMap = { perfect:'APPROVED', minor:'RETURNED', bad:'REJECTED' };
    store.update(entry.kpi_code, {
      status:   statusMap[rating],
      hecScore: hecScore,
      review:{  rating, comment:comment.trim()||RATING_MAP[rating].label,
                reviewer: store.user?.name || 'HEC Reviewer', date:'Just now' }
    });
    setSubmitting(false);
    setConfirm(false);
    store.toast(`Review sent to ${entry.user_name||'faculty'} — ${RATING_MAP[rating].label}`,
      rating==='perfect'?'success':(rating==='bad'?'error':'warning'));
    onBack();
  }

  const docIconColor = { pdf:'#C62828', xls:'#2E7D32', img:'#1565C0', doc:'#1A237E', ppt:'#E65100', file:'#757575' };

  return (
    <>
      <AppHeader title={`Review ${entry.kpi_code}`} onBack={onBack}
        breadcrumb={`Submissions → ${entry.user_name||'Faculty'}`}/>
      <Scroll>
        {/* Faculty info */}
        <Card style={{ marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:42, height:42, borderRadius:'50%', background:AD.maroon, color:'#fff',
              display:'flex', alignItems:'center', justifyContent:'center', fontFamily:AF.display, fontWeight:700, fontSize:15 }}>
              {(entry.user_name||'?').split(' ').map(w=>w[0]).slice(0,2).join('')}
            </div>
            <div>
              <div style={{ fontFamily:AF.display, fontWeight:600, fontSize:15, color:AD.ink }}>{entry.user_name||'Unknown'}</div>
              <div style={{ fontFamily:AF.body, fontSize:12, color:AD.ink2 }}>
                {ind.name||entry.kpi_code} · Self score: <b style={{ fontFamily:AF.mono }}>{entry.self_score||0}/{ind.max||'—'}</b>
              </div>
            </div>
            <div style={{ marginLeft:'auto' }}><StatusChip status={entry.status} size="sm"/></div>
          </div>
        </Card>

        {/* Remarks */}
        {(entry.remarks||ind.remarks) && (
          <div style={{ background:AD.surface, borderRadius:10, padding:'11px 13px', marginBottom:14,
            fontFamily:AF.body, fontSize:13, color:AD.ink, lineHeight:'18px' }}>
            <b style={{ color:AD.ink2, fontSize:11.5 }}>FACULTY REMARKS</b><br/>
            {entry.remarks||ind.remarks}
          </div>
        )}

        {/* Uploaded documents */}
        <div style={{ fontFamily:AF.display, fontWeight:600, fontSize:13, color:AD.ink2,
          textTransform:'uppercase', letterSpacing:.5, marginBottom:8 }}>
          Uploaded Documents ({docs.length})
        </div>
        {docs.length===0 ? (
          <div style={{ background:AD.surface, borderRadius:10, padding:'14px', textAlign:'center', marginBottom:16,
            fontFamily:AF.body, fontSize:13, color:AD.ink2 }}>No documents uploaded</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:9, marginBottom:16 }}>
            {docs.map((doc,n)=>{
              const kind = doc.file_kind || doc.kind || 'file';
              const color = docIconColor[kind] || docIconColor.file;
              return (
                <div key={n} style={{ display:'flex', alignItems:'center', gap:10, background:'#fff',
                  border:`1px solid ${AD.border}`, borderRadius:10, padding:'10px 12px' }}>
                  <div style={{ width:38, height:38, borderRadius:8, background:color+'15',
                    border:`1px solid ${color}30`, display:'flex', alignItems:'center',
                    justifyContent:'center', flexShrink:0 }}>
                    <Icon name="file" size={20} color={color}/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:AF.display, fontWeight:500, fontSize:12.5, color:AD.ink,
                      whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                      {doc.file_name||doc.name}
                    </div>
                    <div style={{ fontFamily:AF.body, fontSize:11, color:AD.ink2 }}>
                      {(doc.file_size||doc.size||'—').toUpperCase()}
                      {kind!=='file' && <span style={{ marginLeft:8, color, fontWeight:600, fontSize:10 }}>{kind.toUpperCase()}</span>}
                    </div>
                  </div>
                  {doc.storage_url||doc.url ? (
                    <a href={doc.storage_url||doc.url} target="_blank" rel="noreferrer"
                      style={{ ...btnReset, color:AD.maroon }}>
                      <Icon name="download" size={18} color={AD.maroon}/>
                    </a>
                  ) : (
                    <button style={btnReset} onClick={()=>store.toast('File preview — open in app','info')}>
                      <Icon name="eye" size={18} color={AD.ink3}/>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Existing review */}
        {existingReview && (
          <div style={{ marginBottom:16 }}>
            <div style={{ fontFamily:AF.display, fontWeight:600, fontSize:13, color:AD.ink2,
              textTransform:'uppercase', letterSpacing:.5, marginBottom:8 }}>Previous Review</div>
            <ReviewBlock review={{ rating:existingReview.rating, comment:existingReview.comment||'',
              reviewer:existingReview.reviewer_name||'HEC Reviewer',
              date:existingReview.created_at ? new Date(existingReview.created_at).toLocaleDateString() : existingReview.date||'' }}/>
          </div>
        )}

        {/* Review panel */}
        <div style={{ fontFamily:AF.display, fontWeight:600, fontSize:13, color:AD.ink2,
          textTransform:'uppercase', letterSpacing:.5, marginBottom:8 }}>Your Assessment</div>
        <Card style={{ marginBottom:20 }}>
          {/* HEC score slider */}
          <div style={{ fontFamily:AF.display, fontWeight:500, fontSize:13, color:AD.maroon, marginBottom:8 }}>
            HEC-Assigned Score
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
            <input type="range" min="0" max={ind.max||10} step="0.5" value={hecScore}
              onChange={e=>setHecScore(+e.target.value)} className="dsu-range" style={{ flex:1 }}/>
            <span style={{ fontFamily:AF.mono, fontWeight:700, fontSize:20, color:AD.maroon, minWidth:64, textAlign:'right' }}>
              {hecScore.toFixed(1)}/{(ind.max||10).toFixed(1)}
            </span>
          </div>

          {/* Rating buttons */}
          <div style={{ fontFamily:AF.display, fontWeight:500, fontSize:13, color:AD.maroon, marginBottom:10 }}>
            Overall Rating
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
            {Object.entries(RATING_MAP).map(([key,r])=>(
              <button key={key} onClick={()=>setRating(key)} className="dsu-press"
                style={{ ...btnReset, width:'100%', padding:'11px 14px', borderRadius:11,
                  border:`${rating===key?2:1.5}px solid ${rating===key?r.color:AD.border}`,
                  background: rating===key ? r.color+'12' : AD.surface,
                  display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ width:28, height:28, borderRadius:'50%', background:r.color,
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon name={r.icon} size={14} color="#fff" sw={2.6}/>
                </span>
                <span style={{ fontFamily:AF.display, fontWeight:600, fontSize:14,
                  color: rating===key ? r.color : AD.ink }}>{r.label}</span>
                {rating===key && <Icon name="check" size={16} color={r.color} style={{ marginLeft:'auto' }} sw={2.6}/>}
              </button>
            ))}
          </div>

          {/* Comment */}
          <InputField label={`Feedback Comment${['minor','bad'].includes(rating)?' (required)':' (optional)'}`}
            value={comment} onChange={setComment}
            placeholder={rating==='bad'?'Explain what is wrong and what needs to be fixed…':'Add helpful feedback…'}
            multiline helper="This message is shown directly to the faculty member."/>
        </Card>
      </Scroll>

      <StickyBar>
        <PrimaryBtn disabled={!canSubmit||submitting} onClick={()=>setConfirm(true)}
          loading={submitting}
          style={canSubmit&&rating?{ background:RATING_MAP[rating].color, boxShadow:'none' }:{}}>
          {rating ? `Send "${RATING_MAP[rating].label}" Feedback` : 'Select a rating to continue'}
        </PrimaryBtn>
      </StickyBar>

      <BottomSheet open={confirm} onClose={()=>setConfirm(false)}>
        {rating && <>
          <div style={{ textAlign:'center', marginBottom:8 }}>
            <span style={{ width:48, height:48, borderRadius:'50%',
              background:RATING_MAP[rating].color+'18', display:'inline-flex',
              alignItems:'center', justifyContent:'center' }}>
              <Icon name={RATING_MAP[rating].icon} size={24} color={RATING_MAP[rating].color} sw={2.4}/>
            </span>
          </div>
          <div style={{ fontFamily:AF.display, fontWeight:700, fontSize:17, color:AD.ink, textAlign:'center', marginBottom:6 }}>
            Send "{RATING_MAP[rating].label}" feedback?
          </div>
          <div style={{ fontFamily:AF.body, fontSize:13, color:AD.ink2, textAlign:'center', marginBottom:18 }}>
            {entry.kpi_code} will be marked <b style={{ color:RATING_MAP[rating].color }}>{RATING_MAP[rating].label}</b> and
            your comment will appear on the faculty member's submission.
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <SecondaryBtn onClick={()=>setConfirm(false)}>Cancel</SecondaryBtn>
            <PrimaryBtn onClick={doReview} style={{ background:RATING_MAP[rating].color, boxShadow:'none' }}>Confirm</PrimaryBtn>
          </div>
        </>}
      </BottomSheet>
    </>
  );
}

/* ── Users Management ─────────────────────────────────────── */
function UsersScreen({ onBack, store }) {
  const [filter, setFilter] = uA2('All');
  const [search, setSearch] = uA2('');
  const [liveUsers, setLiveUsers] = uA2(MOCK_USERS);

  eA2(()=>{
    if (window.DSUdb?.isConnected()) {
      window.DSUdb.getFacultyProfiles().then(profiles=>{
        if (profiles?.length) {
          const mapped = profiles.map((p,i)=>({
            id:p.id||i, name:p.full_name, email:p.email,
            role:p.role, dept:p.department||'—', active:true,
          }));
          setLiveUsers(mapped.length ? mapped : MOCK_USERS);
        }
      });
    }
  },[]);

  const roles = ['All','FACULTY','HOD','DEAN','ORIC_HEAD','UNIVERSITY_ADMIN'];
  const shown = liveUsers.filter(u=>{
    const matchRole = filter==='All'||u.role===filter;
    const matchSearch = !search||u.name.toLowerCase().includes(search.toLowerCase())||u.dept.toLowerCase().includes(search.toLowerCase());
    return matchRole&&matchSearch;
  });

  return (
    <>
      <AppHeader title="User Management" onBack={onBack} breadcrumb="Administration → Users"/>
      <Scroll>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:AD.surface,
          border:`1.5px solid ${AD.border}`, borderRadius:10, padding:'0 12px', marginBottom:12, height:44 }}>
          <Icon name="search" size={17} color={AD.ink3}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or department…"
            style={{ flex:1, border:'none', outline:'none', background:'transparent', fontFamily:AF.body, fontSize:14, color:AD.ink }}/>
          {search && <button onClick={()=>setSearch('')} style={btnReset}><Icon name="x" size={15} color={AD.ink3}/></button>}
        </div>
        <div className="dsu-scroll" style={{ display:'flex', gap:8, overflowX:'auto', margin:'0 -16px 16px', padding:'0 16px' }}>
          {roles.map(r=>(
            <button key={r} onClick={()=>setFilter(r)} style={{ ...btnReset, flexShrink:0, height:30, padding:'0 12px',
              borderRadius:15, fontFamily:AF.body, fontWeight:600, fontSize:12,
              background:filter===r?AD.maroon:'#fff', color:filter===r?'#fff':AD.ink2,
              border:`1px solid ${filter===r?AD.maroon:AD.border}` }}>
              {r==='All'?'All Roles':ROLE_LABELS[r]||r}
            </button>))}
        </div>
        <div style={{ fontFamily:AF.body, fontSize:12.5, color:AD.ink2, marginBottom:10 }}>{shown.length} user{shown.length!==1?'s':''}</div>
        {shown.map(u=>(
          <div key={u.id} style={{ background:'#fff', border:`1px solid ${AD.border}`, borderRadius:13,
            padding:'13px 14px', boxShadow:AS.card, marginBottom:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:11 }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:ROLE_COLORS[u.role]||AD.maroon,
                color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:AF.display, fontWeight:700, fontSize:14, flexShrink:0 }}>
                {u.name.split(' ').map(w=>w[0]).slice(1,3).join('')}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontFamily:AF.display, fontWeight:600, fontSize:14, color:AD.ink }}>{u.name}</span>
                  {!u.active&&<span style={{ fontFamily:AF.body, fontSize:10, fontWeight:600, color:'#D32F2F', background:'#FFEBEE', padding:'1px 7px', borderRadius:5 }}>INACTIVE</span>}
                </div>
                <div style={{ fontFamily:AF.body, fontSize:11.5, color:AD.ink2 }}>{u.dept}</div>
                <div style={{ fontFamily:AF.body, fontSize:11, color:AD.ink3 }}>{u.email}</div>
              </div>
              <span style={{ display:'inline-flex', alignItems:'center', height:22, padding:'0 9px', borderRadius:11,
                background:(ROLE_COLORS[u.role]||AD.maroon)+'18', color:ROLE_COLORS[u.role]||AD.maroon,
                fontFamily:AF.display, fontWeight:600, fontSize:10.5 }}>{ROLE_LABELS[u.role]||u.role}</span>
            </div>
          </div>))}
        <div style={{ marginTop:6 }}>
          <SecondaryBtn icon="plus" onClick={()=>store.toast('User invite — opens registration link','info')}>Invite New User</SecondaryBtn>
        </div>
      </Scroll>
    </>
  );
}

/* ── University Setup ─────────────────────────────────────── */
function UniversitySetupScreen({ onBack, store }) {
  const fields = [
    ['University Name','DHA Suffa University'],['HEC Code','DSU-KHI-001'],
    ['City / Province','Karachi, Sindh'],['Type','Private'],['Website','www.dsu.edu.pk'],
    ['Vice Chancellor','Prof. Dr. Zahoor Ahmad'],['ORIC Director','Dr. Amna Siddiqui'],
    ['ORIC Email','oric@dsu.edu.pk'],['Total Faculty','312 members'],
    ['PhD Faculty','48 members (15.4%)'],['Established','2012'],['Accreditation','HEC W4 Category'],
  ];
  return (
    <>
      <AppHeader title="University Setup" onBack={onBack} breadcrumb="Administration → University"/>
      <Scroll>
        <div style={{ background:`linear-gradient(135deg,${AD.maroon},${AD.maroonDark})`, borderRadius:14,
          padding:'16px 18px', color:'#fff', marginBottom:18, display:'flex', alignItems:'center', gap:14 }}>
          <img src="app/assets/dsu-logo.png" style={{ width:48, height:48, objectFit:'contain' }}/>
          <div>
            <div style={{ fontFamily:AF.display, fontWeight:700, fontSize:17 }}>DHA Suffa University</div>
            <div style={{ fontFamily:AF.body, fontSize:12, color:'rgba(255,255,255,.8)', marginTop:3 }}>Karachi · HEC Code: DSU-KHI-001</div>
            <span style={{ display:'inline-flex', height:20, padding:'0 9px', borderRadius:10, marginTop:6,
              background:AD.yellow, color:AD.maroonDark, fontFamily:AF.display, fontWeight:700, fontSize:10 }}>W4 CATEGORY</span>
          </div>
        </div>
        <Card pad={0} style={{ marginBottom:18 }}>
          {fields.map(([k,v],n)=>(
            <div key={k} style={{ display:'flex', justifyContent:'space-between', gap:16, padding:'11px 14px',
              borderTop:n?`1px solid ${AD.border}`:'none', alignItems:'center' }}>
              <span style={{ fontFamily:AF.body, fontSize:12.5, color:AD.ink2, flexShrink:0 }}>{k}</span>
              <span style={{ fontFamily:AF.display, fontWeight:500, fontSize:13, color:AD.ink, textAlign:'right' }}>{v}</span>
            </div>))}
        </Card>
        <SecondaryBtn icon="edit" onClick={()=>store.toast('Edit requires VP Academic approval','warning')}>Edit University Profile</SecondaryBtn>
      </Scroll>
    </>
  );
}

/* ── Assessment Periods ───────────────────────────────────── */
function PeriodsScreen({ onBack, store }) {
  const [periods, setPeriods] = uA2(MOCK_PERIODS);
  const [sheet, setSheet]     = uA2(false);
  const [newYear, setNewYear] = uA2('2025–2026');
  const STATUS_C = { ACTIVE:{bg:'#E8F5E9',fg:'#2E7D32'}, CLOSED:{bg:'#F5F5F5',fg:'#757575'}, DRAFT:{bg:'#E3F2FD',fg:'#1565C0'} };

  return (
    <>
      <AppHeader title="Assessment Periods" onBack={onBack} breadcrumb="Administration → Periods"/>
      <Scroll>
        {periods.map(p=>{
          const sc = STATUS_C[p.status]||STATUS_C.DRAFT;
          return (
            <Card key={p.id} style={{ marginBottom:13 }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
                <div>
                  <div style={{ fontFamily:AF.display, fontWeight:700, fontSize:16, color:AD.ink }}>{p.label}</div>
                  <div style={{ fontFamily:AF.body, fontSize:12, color:AD.ink2, marginTop:2 }}>{p.from} – {p.to}</div>
                </div>
                <span style={{ display:'inline-flex', alignItems:'center', height:24, padding:'0 11px',
                  borderRadius:12, background:sc.bg, color:sc.fg, fontFamily:AF.display, fontWeight:600, fontSize:11 }}>{p.status}</span>
              </div>
              <ProgressBar value={p.submitted} max={p.total}/>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:7 }}>
                <span style={{ fontFamily:AF.body, fontSize:12, color:AD.ink2 }}>
                  <b style={{ color:AD.ink, fontFamily:AF.mono }}>{p.submitted}/{p.total}</b> submitted
                </span>
                <span style={{ fontFamily:AF.body, fontSize:11.5, color:AD.ink3 }}>Deadline: {p.deadline}</span>
              </div>
            </Card>);
        })}
        <PrimaryBtn icon="plus" onClick={()=>setSheet(true)}>Create New Period</PrimaryBtn>
      </Scroll>
      <BottomSheet open={sheet} onClose={()=>setSheet(false)}>
        <div style={{ fontFamily:AF.display, fontWeight:600, fontSize:16, color:AD.ink, marginBottom:12 }}>New Assessment Period</div>
        <InputField label="Academic Year" value={newYear} onChange={setNewYear} placeholder="e.g. 2025–2026" icon="cal"/>
        <div style={{ display:'flex', gap:10, marginTop:4 }}>
          <SecondaryBtn onClick={()=>setSheet(false)}>Cancel</SecondaryBtn>
          <PrimaryBtn onClick={()=>{ setPeriods(p=>[{ id:'p'+Date.now(), label:'AY '+newYear, from:'Jan '+newYear.split('–')[0], to:'Dec '+newYear.split('–')[0], status:'DRAFT', submitted:0, total:31, deadline:'31 Mar '+(+newYear.split('–')[1]) }, ...p]); setSheet(false); store.toast('Period created','success'); }} icon="check">Create</PrimaryBtn>
        </div>
      </BottomSheet>
    </>
  );
}

/* ── Audit Logs ──────────────────────────────────────────── */
function AuditLogsScreen({ onBack }) {
  const [filter, setFilter] = uA2('All');
  const actions = ['All','SUBMIT','APPROVE','REJECT','RETURN','UPLOAD','EDIT','LOGIN','CREATE'];
  const shown = filter==='All' ? MOCK_AUDIT : MOCK_AUDIT.filter(l=>l.action===filter);
  return (
    <>
      <AppHeader title="Audit Logs" onBack={onBack} breadcrumb="Administration → Audit Logs"/>
      <Scroll>
        <div className="dsu-scroll" style={{ display:'flex', gap:8, overflowX:'auto', margin:'0 -16px 16px', padding:'0 16px' }}>
          {actions.map(a=>(
            <button key={a} onClick={()=>setFilter(a)} style={{ ...btnReset, flexShrink:0, height:30, padding:'0 12px',
              borderRadius:15, fontFamily:AF.body, fontWeight:600, fontSize:12,
              background:filter===a?AD.maroon:'#fff', color:filter===a?'#fff':AD.ink2,
              border:`1px solid ${filter===a?AD.maroon:AD.border}` }}>{a}</button>))}
        </div>
        <Card pad={0} style={{ marginBottom:16 }}>
          {shown.map((l,n)=>{
            const ac = ACTION_STYLE[l.action]||ACTION_STYLE.EDIT;
            return (
              <div key={l.id} style={{ display:'flex', gap:11, padding:'11px 14px', borderTop:n?`1px solid ${AD.border}`:'none', alignItems:'flex-start' }}>
                <span style={{ display:'inline-flex', height:22, padding:'0 8px', borderRadius:6, flexShrink:0,
                  background:ac.bg, color:ac.fg, fontFamily:AF.mono, fontWeight:700, fontSize:10, marginTop:1, alignItems:'center' }}>{l.action}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:AF.body, fontSize:12.5, color:AD.ink }}>
                    <b>{l.user}</b> — {l.table}<span style={{ color:AD.maroon }}> #{l.record}</span>
                  </div>
                  <div style={{ fontFamily:AF.body, fontSize:11, color:AD.ink3, marginTop:2, display:'flex', gap:8 }}>
                    <span>{l.ts}</span><span>·</span>
                    <span style={{ fontFamily:AF.mono }}>IP {l.ip}</span>
                  </div>
                </div>
              </div>);
          })}
        </Card>
        <div style={{ textAlign:'center', fontFamily:AF.body, fontSize:12, color:AD.ink2 }}>
          Showing {shown.length} of {MOCK_AUDIT.length} entries · Logs are never deleted
        </div>
      </Scroll>
    </>
  );
}

Object.assign(window, { AdminScreen, FacultySubmissionsScreen, SubmissionReviewScreen, UsersScreen, UniversitySetupScreen, PeriodsScreen, AuditLogsScreen });
