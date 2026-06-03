// admin.jsx — Reviewer (HEC / Admin) home + review detail
const { useState:uS4 } = React;
const { C:R, F:RF, SHADOW:RS, RATING:RR, STATUS:RST } = window.DSU;

// fake faculty author per indicator code
const AUTHOR = {
  A3:['Dr. Sara Malik','Electrical Engineering','SM'],
  B1:['Dr. Fatima Khan','Computer Science','FK'],
  B2:['Dr. Imran Qureshi','Computer Science','IQ'],
  C1:['Dr. Ali Hasan','Mechanical Engineering','AH'],
  C3:['Dr. Nida Aslam','Software Engineering','NA'],
  D1:['Dr. Usman Tariq','Business Administration','UT'],
  D4:['Dr. Hina Raza','Computer Science','HR'],
};
const authorOf = code => AUTHOR[code] || ['Dr. Ahmed Raza','Computer Science','AR'];

/* ───────── Reviewer Home (pending list) ───────── */
function ReviewerHome({ store }) {
  const pending = store.indicators.filter(k=>['SUBMITTED','UNDER_REVIEW'].includes(k.status));
  const reviewed = store.indicators.filter(k=>k.review);
  return (
    <Scroll>
      <div style={{ background:`linear-gradient(135deg, ${R.maroon}, ${R.maroonDark})`, borderRadius:16,
        padding:'18px', color:'#fff', marginBottom:18, boxShadow:RS.fab }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Icon name="shield" size={20} color={R.yellow}/>
          <span style={{ fontFamily:RF.display, fontWeight:700, fontSize:18 }}>HEC Review Console</span>
        </div>
        <div style={{ fontFamily:RF.body, fontSize:12.5, color:'rgba(255,255,255,.82)', marginTop:6 }}>
          DHA Suffa University · AY 2024–2025</div>
        <div style={{ display:'flex', gap:10, marginTop:16 }}>
          <Stat n={pending.length} label="Awaiting review"/>
          <Stat n={reviewed.filter(k=>k.review.rating==='perfect').length} label="Approved"/>
          <Stat n={reviewed.filter(k=>k.review.rating!=='perfect').length} label="Sent back"/>
        </div>
      </div>

      <InstructionBanner id="reviewer">Review submissions, then choose a rating and add a comment.
        Your feedback is sent straight back to the faculty member.</InstructionBanner>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:11 }}>
        <span style={{ fontFamily:RF.display, fontWeight:600, fontSize:16, color:R.ink }}>Pending Reviews</span>
        <span style={{ fontFamily:RF.body, fontSize:11.5, color:R.ink2 }}>Oldest first</span>
      </div>

      {pending.length===0
        ? <EmptyState icon="sparkle" title="You're All Caught Up!" message="No submissions waiting for your review right now."/>
        : pending.map(k=>{
            const [name,dept,ini] = authorOf(k.code);
            const sec = store.sections.find(s=>s.id===k.section);
            return (
              <Card key={k.code} onClick={()=>store.nav('review',{code:k.code})} style={{ marginBottom:12 }}>
                <div style={{ display:'flex', gap:12 }}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:sec.accent, color:'#fff',
                    display:'flex', alignItems:'center', justifyContent:'center', fontFamily:RF.display, fontWeight:700,
                    fontSize:14, flexShrink:0 }}>{ini}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:RF.display, fontWeight:600, fontSize:14.5, color:R.ink }}>{name}</div>
                    <div style={{ fontFamily:RF.body, fontSize:11.5, color:R.ink2, marginBottom:8 }}>{dept}</div>
                    <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:8 }}>
                      <CodeBadge code={k.code} color={sec.accent}/>
                      <span style={{ fontFamily:RF.body, fontSize:12.5, color:R.ink, whiteSpace:'nowrap',
                        overflow:'hidden', textOverflow:'ellipsis' }}>{k.name}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <span style={{ fontFamily:RF.body, fontSize:11.5, color:R.ink2 }}>
                        Self-score <b style={{ fontFamily:RF.mono, color:R.ink }}>{k.score.toFixed(1)}/{k.max.toFixed(1)}</b></span>
                      <span style={{ display:'flex', alignItems:'center', gap:5, fontFamily:RF.display, fontWeight:600,
                        fontSize:12.5, color:R.maroon }}>Review <Icon name="chevR" size={15} color={R.maroon}/></span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

      {reviewed.length>0 && <>
        <div style={{ fontFamily:RF.display, fontWeight:600, fontSize:16, color:R.ink, margin:'8px 0 11px' }}>Recently Reviewed</div>
        {reviewed.slice(0,4).map(k=>{
          const [name] = authorOf(k.code);
          const rr = RR[k.review.rating];
          return (
            <div key={k.code} style={{ display:'flex', alignItems:'center', gap:11, background:'#fff',
              border:`1px solid ${R.border}`, borderRadius:12, padding:'11px 13px', marginBottom:9, boxShadow:RS.card }}>
              <span style={{ width:28, height:28, borderRadius:'50%', background:rr.color, display:'flex',
                alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Icon name={rr.icon==='return'?'ret':rr.icon} size={15} color="#fff" sw={2.6}/></span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:RF.body, fontSize:12.5, color:R.ink }}>{k.code} · {name}</div>
                <div style={{ fontFamily:RF.body, fontSize:11, color:rr.color, fontWeight:600 }}>{rr.label}</div>
              </div>
              <span style={{ fontFamily:RF.body, fontSize:10.5, color:R.ink3 }}>{k.review.date}</span>
            </div>
          );
        })}
      </>}
    </Scroll>
  );
}
function Stat({ n, label }) {
  return (
    <div style={{ flex:1, background:'rgba(255,255,255,.12)', borderRadius:12, padding:'10px 8px', textAlign:'center' }}>
      <div style={{ fontFamily:RF.mono, fontWeight:700, fontSize:22, color:R.yellow }}>{n}</div>
      <div style={{ fontFamily:RF.body, fontSize:10, color:'rgba(255,255,255,.8)', marginTop:1 }}>{label}</div>
    </div>
  );
}

/* ───────── Review Detail ───────── */
function ReviewDetailScreen({ store, params }) {
  const k = store.indicators.find(x=>x.code===params.code);
  const sec = store.sections.find(s=>s.id===k.section);
  const [name,dept] = authorOf(k.code);
  const [rating, setRating] = uS4('');
  const [hecScore, setHecScore] = uS4(k.score);
  const [comment, setComment] = uS4('');
  const [dropOpen, setDropOpen] = uS4(false);
  const [confirm, setConfirm] = uS4(false);

  const needComment = rating && rating!=='perfect';
  const canSubmit = rating && (!needComment || comment.trim().length>0);

  function doSubmit(){
    const rr = RR[rating];
    store.update(k.code, { status:rr.status, score:hecScore,
      review:{ rating, comment: comment.trim() || rr.blurb, reviewer:'HEC Reviewer', date:'Just now' } });
    setConfirm(false);
    store.back();
    store.toast(`Feedback sent to ${name.split(' ')[1]} — ${rr.label}`, rating==='perfect'?'success':(rating==='bad'?'error':'warning'));
  }

  return (
    <>
      <AppHeader title={`Review ${k.code}`} onBack={store.back} breadcrumb={`Pending → ${name}`}/>
      <Scroll>
        {/* author */}
        <Card style={{ marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:42, height:42, borderRadius:'50%', background:sec.accent, color:'#fff',
              display:'flex', alignItems:'center', justifyContent:'center', fontFamily:RF.display, fontWeight:700, fontSize:15 }}>
              {name.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
            <div>
              <div style={{ fontFamily:RF.display, fontWeight:600, fontSize:15, color:R.ink }}>{name}</div>
              <div style={{ fontFamily:RF.body, fontSize:12, color:R.ink2 }}>{dept}</div>
            </div>
          </div>
        </Card>

        {/* entry */}
        <div style={{ fontFamily:RF.display, fontWeight:600, fontSize:13, color:R.ink2, textTransform:'uppercase',
          letterSpacing:.5, marginBottom:8 }}>Submitted Entry</div>
        <Card style={{ marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <CodeBadge code={k.code} color={sec.accent}/>
            <span style={{ fontFamily:RF.display, fontWeight:600, fontSize:14, color:R.ink }}>{k.name}</span>
          </div>
          <div style={{ fontFamily:RF.body, fontSize:12.5, color:R.ink2, lineHeight:'18px', marginBottom:4 }}>{k.desc}</div>
          <div style={{ background:R.yellowSoft, borderRadius:9, padding:'8px 11px', margin:'10px 0', fontFamily:RF.body,
            fontSize:11.5, color:R.brown }}><b>Scoring guide:</b> {k.guide}</div>
          <ReadRow label={k.unit.charAt(0).toUpperCase()+k.unit.slice(1)}>{k.value}{k.denom?` / ${k.denom} ${k.denomLabel}`:''}</ReadRow>
          <ReadRow label="Self-Assessment Score">{k.score.toFixed(1)} / {k.max.toFixed(1)}</ReadRow>
          <ReadRow label="Remarks">{k.remarks || '—'}</ReadRow>
        </Card>

        {/* evidence */}
        <div style={{ fontFamily:RF.display, fontWeight:600, fontSize:13, color:R.ink2, textTransform:'uppercase',
          letterSpacing:.5, marginBottom:8 }}>Evidence ({k.docs.length})</div>
        {k.docs.length>0
          ? <div style={{ display:'flex', flexDirection:'column', gap:9, marginBottom:16 }}>
              {k.docs.map((f,n)=>(
                <div key={n} onClick={()=>store.toast('Opening '+f.name,'info')} className="dsu-card-tap" style={{ cursor:'pointer' }}>
                  <FileItem file={f} status="view"/>
                </div>))}
            </div>
          : <div style={{ background:R.surface, borderRadius:10, padding:'14px', textAlign:'center', marginBottom:16,
              fontFamily:RF.body, fontSize:12.5, color:R.ink2 }}>No evidence attached</div>}

        {/* decision panel */}
        <div style={{ fontFamily:RF.display, fontWeight:600, fontSize:13, color:R.ink2, textTransform:'uppercase',
          letterSpacing:.5, marginBottom:8 }}>Your Assessment</div>
        <Card style={{ marginBottom:20 }}>
          {/* hec score */}
          <div style={{ fontFamily:RF.display, fontWeight:500, fontSize:13, color:R.maroon, marginBottom:8 }}>HEC-Assigned Score</div>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
            <input type="range" min="0" max={k.max} step="0.5" value={hecScore}
              onChange={e=>setHecScore(+e.target.value)} className="dsu-range" style={{ flex:1 }}/>
            <span style={{ fontFamily:RF.mono, fontWeight:700, fontSize:20, color:R.maroon, minWidth:64, textAlign:'right' }}>{hecScore.toFixed(1)}/{k.max.toFixed(1)}</span>
          </div>

          {/* rating dropdown */}
          <div style={{ fontFamily:RF.display, fontWeight:500, fontSize:13, color:R.maroon, marginBottom:8 }}>Overall Rating</div>
          <button onClick={()=>setDropOpen(!dropOpen)} style={{ ...btnReset, width:'100%', justifyContent:'space-between',
            height:50, padding:'0 14px', borderRadius:10, border:`1.5px solid ${rating?RR[rating].color:R.border}`,
            background:rating?RR[rating].color+'10':R.surface }}>
            <span style={{ display:'flex', alignItems:'center', gap:9 }}>
              {rating && <span style={{ width:22, height:22, borderRadius:'50%', background:RR[rating].color, display:'flex',
                alignItems:'center', justifyContent:'center' }}><Icon name={RR[rating].icon==='return'?'ret':RR[rating].icon} size={13} color="#fff" sw={2.6}/></span>}
              <span style={{ fontFamily:RF.body, fontSize:14, fontWeight:rating?600:400, color:rating?RR[rating].color:R.ink3 }}>
                {rating?RR[rating].label:'Select a rating…'}</span>
            </span>
            <Icon name="chevD" size={18} color={R.ink2}/>
          </button>
          {dropOpen && (
            <div style={{ border:`1px solid ${R.border}`, borderRadius:10, marginTop:6, overflow:'hidden', boxShadow:RS.card }}>
              {Object.entries(RR).map(([key,rr],n)=>(
                <button key={key} onClick={()=>{ setRating(key); setDropOpen(false); }} className="dsu-card-tap"
                  style={{ ...btnReset, width:'100%', gap:10, padding:'12px 14px', borderTop:n?`1px solid ${R.border}`:'none' }}>
                  <span style={{ width:24, height:24, borderRadius:'50%', background:rr.color, display:'flex',
                    alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Icon name={rr.icon==='return'?'ret':rr.icon} size={14} color="#fff" sw={2.6}/></span>
                  <span style={{ textAlign:'left', flex:1 }}>
                    <span style={{ display:'block', fontFamily:RF.display, fontWeight:600, fontSize:13.5, color:R.ink }}>{rr.label}</span>
                    <span style={{ display:'block', fontFamily:RF.body, fontSize:11, color:R.ink2 }}>{rr.blurb}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* comment */}
          <div style={{ marginTop:16 }}>
            <InputField label={`Comment to Faculty${needComment?' (required)':' (optional)'}`} value={comment} onChange={setComment}
              placeholder={rating==='bad'?'Explain what is wrong and what to fix…':'Add helpful feedback so they can improve…'} multiline
              helper="This message is shown directly to the faculty member."/>
          </div>
        </Card>
      </Scroll>

      <StickyBar>
        <PrimaryBtn disabled={!canSubmit} onClick={()=>setConfirm(true)}
          icon={canSubmit?'check':undefined}
          style={canSubmit?{ background:RR[rating].color, boxShadow:'none' }:{}}>
          {rating?`Send "${RR[rating].label}" Feedback`:'Select a rating to continue'}</PrimaryBtn>
      </StickyBar>

      <BottomSheet open={confirm} onClose={()=>setConfirm(false)}>
        {rating && <>
          <div style={{ textAlign:'center', marginBottom:8 }}>
            <span style={{ width:48, height:48, borderRadius:'50%', background:RR[rating].color+'18', display:'inline-flex',
              alignItems:'center', justifyContent:'center' }}>
              <Icon name={RR[rating].icon==='return'?'ret':RR[rating].icon} size={24} color={RR[rating].color} sw={2.4}/></span>
          </div>
          <div style={{ fontFamily:RF.display, fontWeight:700, fontSize:17, color:R.ink, textAlign:'center', marginBottom:6 }}>
            Send "{RR[rating].label}" to {name}?</div>
          <div style={{ fontFamily:RF.body, fontSize:13, color:R.ink2, textAlign:'center', marginBottom:18, lineHeight:'19px' }}>
            {k.code} will be marked <b style={{ color:RR[rating].color }}>{RST[RR[rating].status].label}</b> and your comment will appear on the faculty member's entry.</div>
          <div style={{ display:'flex', gap:10 }}>
            <SecondaryBtn onClick={()=>setConfirm(false)}>Cancel</SecondaryBtn>
            <PrimaryBtn onClick={doSubmit} style={{ background:RR[rating].color, boxShadow:'none' }}>Confirm</PrimaryBtn>
          </div>
        </>}
      </BottomSheet>
    </>
  );
}

Object.assign(window, { ReviewerHome, ReviewDetailScreen, authorOf });
