// faculty2.jsx — Score Card hub, Section Detail, Entry Wizard
const { useState:uS2 } = React;
const { C:K, F:KF, SHADOW:KS, STATUS:KST, RATING:KR } = window.DSU;

const sectionScore = (inds,id) => inds.filter(k=>k.section===id)
  .reduce((s,k)=>s+(k.status!=='DRAFT'?k.score:0),0);
const sectionDone = (inds,id) => {
  const ks=inds.filter(k=>k.section===id);
  return { done:ks.filter(k=>k.status!=='DRAFT').length, total:ks.length };
};

/* ───────── Score Card hub ───────── */
function ScoreCardScreen({ store }) {
  const { indicators, sections } = store;
  const total = indicators.reduce((s,k)=>s+(k.status!=='DRAFT'?k.score:0),0);
  const done = indicators.filter(k=>k.status!=='DRAFT').length;
  const allReady = indicators.every(k=>k.status!=='DRAFT');
  return (
    <>
      <Scroll>
        <InstructionBanner id="scorecard">This is your ORIC score card. Tap any section to enter data.
          Complete all sections to submit your annual report.</InstructionBanner>

        <Card style={{ marginBottom:18, borderTop:`3px solid ${K.maroon}` }}>
          <div style={{ fontFamily:KF.display, fontWeight:600, fontSize:16, color:K.ink }}>2024–2025 Score Card</div>
          <div style={{ fontFamily:KF.body, fontSize:12, color:K.ink2, marginTop:2, marginBottom:13 }}>Assessment period: Jan 2024 – Dec 2024</div>
          <ProgressBar value={total} max={100} h={10}/>
          <div style={{ fontFamily:KF.body, fontSize:12.5, color:K.ink2, marginTop:9 }}>
            <b style={{ color:K.ink, fontFamily:KF.mono }}>{total} of 100</b> points entered · {done} of {indicators.length} indicators complete</div>
        </Card>

        {sections.map(sec=>{
          const sc = sectionScore(indicators,sec.id);
          const dd = sectionDone(indicators,sec.id);
          const statuses = indicators.filter(k=>k.section===sec.id).map(k=>k.status);
          const st = statuses.includes('REJECTED')?'REJECTED'
            : statuses.includes('RETURNED')?'RETURNED'
            : statuses.every(s=>s==='APPROVED')?'APPROVED'
            : statuses.some(s=>['SUBMITTED','UNDER_REVIEW'].includes(s))?'UNDER_REVIEW'
            : statuses.every(s=>s==='DRAFT')?'DRAFT':'SUBMITTED';
          return (
            <Card key={sec.id} stripe={sec.accent} onClick={()=>store.nav('section',{sectionId:sec.id})}
              style={{ marginBottom:13 }}>
              <div style={{ display:'flex', gap:13 }}>
                <div style={{ width:38, height:38, borderRadius:'50%', background:sec.accent, color:'#fff',
                  display:'flex', alignItems:'center', justifyContent:'center', fontFamily:KF.display, fontWeight:700,
                  fontSize:17, flexShrink:0 }}>{sec.id}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
                    <div style={{ fontFamily:KF.display, fontWeight:600, fontSize:15, color:K.ink, lineHeight:'19px' }}>{sec.name}</div>
                    <Icon name="chevR" size={18} color={K.ink3} style={{ marginTop:2 }}/>
                  </div>
                  <div style={{ fontFamily:KF.body, fontSize:12, color:K.ink2, marginTop:2, marginBottom:10 }}>Section {sec.id} · Max {sec.max} points</div>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:9 }}>
                    <div style={{ flex:1 }}><ProgressBar value={sc} max={sec.max} color={sec.accent}/></div>
                    <span style={{ fontFamily:KF.mono, fontWeight:700, fontSize:14, color:sec.accent }}>{sc}/{sec.max}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontFamily:KF.body, fontSize:11.5, color:K.ink2 }}>{dd.done} of {dd.total} indicators complete</span>
                    <StatusChip status={st} size="sm"/>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </Scroll>
      <StickyBar>
        {allReady
          ? <PrimaryBtn icon="check" onClick={()=>store.toast('Annual report submitted to your HOD!','success')}>Submit for Review</PrimaryBtn>
          : <>
              <PrimaryBtn disabled>Complete all sections to submit</PrimaryBtn>
              <div style={{ textAlign:'center', fontFamily:KF.body, fontSize:11, color:K.ink2, marginTop:7 }}>Submission goes to your HOD, then to HEC review</div>
            </>}
      </StickyBar>
    </>
  );
}
function StickyBar({ children }) {
  return (
    <div style={{ flexShrink:0, background:'#fff', borderTop:`1px solid ${K.border}`, padding:'12px 16px 14px',
      boxShadow:'0 -4px 16px rgba(0,0,0,0.04)' }}>{children}</div>
  );
}

/* ───────── Section Detail ───────── */
function SectionScreen({ store, params }) {
  const { indicators, sections } = store;
  const sec = sections.find(s=>s.id===params.sectionId);
  const [filter, setFilter] = uS2('All');
  const ks = indicators.filter(k=>k.section===sec.id);
  const sc = sectionScore(indicators,sec.id);
  const dd = sectionDone(indicators,sec.id);
  const filters = ['All','Incomplete','Needs Evidence','Done'];
  const shown = ks.filter(k=>{
    if (filter==='Incomplete') return k.status==='DRAFT';
    if (filter==='Needs Evidence') return k.docs.length<k.reqDocs.length;
    if (filter==='Done') return k.status==='APPROVED';
    return true;
  }).sort((a,b)=> (a.status==='DRAFT'?0:1)-(b.status==='DRAFT'?0:1));
  const incomplete = ks.filter(k=>k.status==='DRAFT').length;

  return (
    <>
      <AppHeader title={`Section ${sec.id} — ${sec.name.split(' ')[0]}`} onBack={store.back}
        breadcrumb={`Score Card → Section ${sec.id}`}/>
      <Scroll>
        <InstructionBanner id={'sec'+sec.id}>Each card is one KPI indicator. Tap a card to enter your
          score and upload the required supporting document.</InstructionBanner>

        <div style={{ display:'flex', alignItems:'center', gap:14, background:K.maroonTint, border:`1px solid ${sec.accent}22`,
          borderRadius:12, padding:14, marginBottom:16 }}>
          <ScoreGauge value={sc} max={sec.max} size={58} color={sec.accent}/>
          <div>
            <div style={{ fontFamily:KF.display, fontWeight:600, fontSize:15, color:K.ink }}>{sec.name}</div>
            <div style={{ fontFamily:KF.body, fontSize:12, color:K.ink2, marginTop:2 }}>Max {sec.max} points · {ks.length} indicators</div>
            <div style={{ fontFamily:KF.body, fontSize:12, color:sec.accent, fontWeight:600, marginTop:4 }}>{dd.done} of {dd.total} complete</div>
          </div>
        </div>

        <div className="dsu-scroll" style={{ display:'flex', gap:8, overflowX:'auto', margin:'0 -16px 16px', padding:'0 16px' }}>
          {filters.map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{ ...btnReset, flexShrink:0, height:32, padding:'0 14px',
              borderRadius:16, fontFamily:KF.body, fontWeight:600, fontSize:12.5,
              background:filter===f?K.maroon:'#fff', color:filter===f?'#fff':K.ink2,
              border:`1px solid ${filter===f?K.maroon:K.border}` }}>{f}</button>
          ))}
        </div>

        {shown.length===0
          ? <EmptyState icon="search" title="Nothing here" message="No indicators match this filter."/>
          : shown.map(k=> <KPICard key={k.code} k={k} accent={sec.accent} onClick={()=>store.nav('entry',{code:k.code})}/>)}
      </Scroll>
      <StickyBar>
        {incomplete>0
          ? <PrimaryBtn disabled>Complete {incomplete} more indicator{incomplete>1?'s':''}</PrimaryBtn>
          : <PrimaryBtn icon="check" onClick={()=>store.toast(`Section ${sec.id} submitted for review`,'success')}>Submit Section {sec.id} for Review</PrimaryBtn>}
      </StickyBar>
    </>
  );
}

function KPICard({ k, accent, onClick }) {
  const missing = k.status!=='DRAFT' && k.docs.length<k.reqDocs.length;
  const stripe = k.status==='APPROVED'?K.success : k.status==='REJECTED'?K.error
    : k.status==='RETURNED'?'#F57F17' : missing?K.yellow : accent;
  return (
    <Card stripe={stripe} onClick={onClick} style={{ marginBottom:12 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, marginBottom:7 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
          <CodeBadge code={k.code} color={accent}/>
          <span style={{ fontFamily:KF.display, fontWeight:500, fontSize:14, color:K.ink,
            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{k.name}</span>
        </div>
      </div>
      <div style={{ fontFamily:KF.body, fontSize:12.5, color:K.ink2, lineHeight:'17px', marginBottom:10 }}>{k.desc}</div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
        <span style={{ fontFamily:KF.mono, fontWeight:700, fontSize:14, color:k.status==='DRAFT'?K.ink3:accent }}>
          {k.status==='DRAFT'?'—':k.score.toFixed(1)} / {k.max.toFixed(1)} pts</span>
        <StatusChip status={k.status} size="sm"/>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:10, paddingTop:10, borderTop:`1px solid ${K.border}` }}>
        <Icon name="paperclip" size={14} color={missing?K.warning:K.ink2}/>
        <span style={{ fontFamily:KF.body, fontSize:11.5, color:missing?K.warning:K.ink2, fontWeight:missing?600:400 }}>
          {k.docs.length} of {k.reqDocs.length} document{k.reqDocs.length>1?'s':''}{missing?' — needs evidence':''}</span>
        <Icon name="chevR" size={16} color={K.ink3} style={{ marginLeft:'auto' }}/>
      </div>
      {k.review && (k.status==='RETURNED'||k.status==='REJECTED') && (
        <div style={{ marginTop:11 }}><ReviewBlock review={k.review} compact/></div>
      )}
    </Card>
  );
}

/* ───────── Entry Wizard (3 steps) ───────── */
function EntryScreen({ store, params }) {
  const k = store.indicators.find(x=>x.code===params.code);
  const sec = store.sections.find(s=>s.id===k.section);
  const [step, setStep] = uS2(0);
  const [value, setValue] = uS2(k.value);
  const [score, setScore] = uS2(k.score);
  const [remarks, setRemarks] = uS2(k.remarks);
  const [docs, setDocs] = uS2(k.docs);
  const [sheet, setSheet] = uS2(false);
  const editable = ['DRAFT','RETURNED'].includes(k.status);
  const ratio = k.denom ? (value/k.denom) : null;
  const scoreErr = score>k.max ? `Cannot exceed maximum score of ${k.max.toFixed(1)}` : '';

  function addDoc(name){ setDocs([...docs, { name, size:(Math.random()*2+0.3).toFixed(1)+' MB', kind:'pdf' }]); setSheet(false); }
  function submit(){
    store.update(k.code, { value, score, remarks, docs, status:'SUBMITTED', review:null });
    store.back();
    store.toast(`${k.code} submitted for review!`,'success');
  }
  function saveDraft(){ store.update(k.code,{ value, score, remarks, docs }); store.toast('Saved as draft','info'); }

  return (
    <>
      <AppHeader title={`${k.code} — ${k.name.split(' ').slice(0,2).join(' ')}`} onBack={store.back}
        breadcrumb={`Score Card → Section ${k.section} → ${k.code}`}/>
      <div style={{ padding:'14px 16px 4px', background:'#fff', borderBottom:`1px solid ${K.border}` }}>
        <ProgressStepper steps={['Enter Score','Add Evidence','Review']} current={step}/>
      </div>
      <Scroll>
        {!editable && k.review && (
          <div style={{ marginBottom:16 }}>
            <div style={{ fontFamily:KF.display, fontWeight:600, fontSize:13, color:K.ink, marginBottom:7 }}>Reviewer Feedback</div>
            <ReviewBlock review={k.review}/>
          </div>
        )}
        {!editable && (
          <div style={{ display:'flex', gap:8, background:K.maroonTint, borderRadius:10, padding:'10px 12px',
            marginBottom:16, alignItems:'center' }}>
            <Icon name="clock" size={17} color={K.maroon}/>
            <span style={{ fontFamily:KF.body, fontSize:12, color:K.brown, flex:1 }}>This entry is <b>{KST[k.status].label.toLowerCase()}</b> and currently read-only.</span>
          </div>
        )}

        {step===0 && <StepScore k={k} value={value} setValue={setValue} score={score} setScore={setScore}
          remarks={remarks} setRemarks={setRemarks} ratio={ratio} scoreErr={scoreErr} editable={editable}/>}
        {step===1 && <StepEvidence k={k} docs={docs} addDoc={()=>setSheet(true)}
          removeDoc={i=>setDocs(docs.filter((_,n)=>n!==i))} editable={editable}/>}
        {step===2 && <StepReview k={k} value={value} score={score} remarks={remarks} docs={docs}/>}
      </Scroll>

      <StickyBar>
        <div style={{ display:'flex', gap:10 }}>
          {step===0 && <>
            {editable && <SecondaryBtn onClick={saveDraft}>Save Draft</SecondaryBtn>}
            <PrimaryBtn onClick={()=>setStep(1)} icon="chevR">Add Evidence</PrimaryBtn>
          </>}
          {step===1 && <>
            <SecondaryBtn onClick={()=>setStep(0)}>Back</SecondaryBtn>
            <PrimaryBtn onClick={()=>setStep(2)} icon="chevR">Review</PrimaryBtn>
          </>}
          {step===2 && <>
            <SecondaryBtn onClick={()=>setStep(0)}>Edit</SecondaryBtn>
            {editable
              ? <PrimaryBtn onClick={submit} icon="check">Submit to HOD</PrimaryBtn>
              : <PrimaryBtn disabled>Read-only</PrimaryBtn>}
          </>}
        </div>
      </StickyBar>

      <BottomSheet open={sheet} onClose={()=>setSheet(false)}>
        <div style={{ fontFamily:KF.display, fontWeight:600, fontSize:16, color:K.ink, marginBottom:4 }}>Add a Document</div>
        <div style={{ fontFamily:KF.body, fontSize:12.5, color:K.ink2, marginBottom:16 }}>Choose how to attach your evidence file.</div>
        {[['camera','Take a Photo','Capture a physical document'],
          ['file','Choose File','PDF, JPG or PNG from your device'],
          ['folder','From Cloud Drive','Google Drive or OneDrive']].map(([ic,t,d],n)=>(
          <button key={n} onClick={()=>addDoc(['Scanned_Document.pdf','HEC_Evidence_'+k.code+'.pdf','Cloud_Attachment.pdf'][n])}
            style={{ ...btnReset, width:'100%', gap:13, padding:'13px 4px', borderTop:n?`1px solid ${K.border}`:'none' }}>
            <span style={{ width:40, height:40, borderRadius:10, background:K.maroonTint, display:'flex',
              alignItems:'center', justifyContent:'center' }}><Icon name={ic} size={20} color={K.maroon}/></span>
            <span style={{ textAlign:'left' }}>
              <span style={{ display:'block', fontFamily:KF.display, fontWeight:600, fontSize:14, color:K.ink }}>{t}</span>
              <span style={{ display:'block', fontFamily:KF.body, fontSize:11.5, color:K.ink2 }}>{d}</span>
            </span>
            <Icon name="chevR" size={18} color={K.ink3} style={{ marginLeft:'auto' }}/>
          </button>
        ))}
      </BottomSheet>
    </>
  );
}

function ReadRow({ label, children }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', gap:12, padding:'11px 0', borderTop:`1px solid ${K.border}` }}>
      <span style={{ fontFamily:KF.body, fontSize:12.5, color:K.ink2, flexShrink:0 }}>{label}</span>
      <span style={{ fontFamily:KF.body, fontSize:13, color:K.ink, fontWeight:500, textAlign:'right' }}>{children}</span>
    </div>
  );
}

function StepScore({ k, value, setValue, score, setScore, remarks, setRemarks, ratio, scoreErr, editable }) {
  return (
    <div>
      <Card style={{ marginBottom:16 }}>
        <div style={{ fontFamily:KF.display, fontWeight:600, fontSize:15, color:K.ink, marginBottom:4 }}>{k.name}</div>
        <div style={{ fontFamily:KF.body, fontSize:13, color:K.ink2, lineHeight:'19px', marginBottom:12 }}>{k.desc}</div>
        <span style={pill(K.maroon,'#fff')}>{k.max.toFixed(1)} points maximum</span>
        <div style={{ background:K.yellowSoft, borderRadius:10, padding:'10px 12px', marginTop:12, display:'flex', gap:8 }}>
          <Icon name="bulb" size={16} color="#C79A00" style={{ marginTop:1 }}/>
          <span style={{ fontFamily:KF.body, fontSize:12, color:K.brown, lineHeight:'17px' }}><b>Scoring guide:</b> {k.guide}</span>
        </div>
      </Card>

      <div style={{ fontFamily:KF.display, fontWeight:500, fontSize:13, color:K.maroon, marginBottom:8 }}>Number of {k.unit}</div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:18, marginBottom:6 }}>
        <StepperBtn icon="minus" onClick={()=>editable&&setValue(Math.max(0,+(value-1)))}/>
        <span style={{ fontFamily:KF.mono, fontWeight:700, fontSize:44, color:K.ink, minWidth:90, textAlign:'center' }}>{value}</span>
        <StepperBtn icon="plus" onClick={()=>editable&&setValue(+(value+1))}/>
      </div>
      {k.denom && <div style={{ textAlign:'center', marginBottom:18 }}>
        <div style={{ fontFamily:KF.body, fontSize:12, color:K.ink2 }}>Your department has {k.denom} {k.denomLabel}</div>
        <div style={{ fontFamily:KF.body, fontSize:12.5, color:K.maroon, fontWeight:600, marginTop:3 }}>Ratio: {ratio.toFixed(2)} {k.unit} per {k.denomLabel.replace(' members','').replace(' members','')}</div>
      </div>}

      <div style={{ fontFamily:KF.display, fontWeight:500, fontSize:13, color:K.maroon, marginTop:10, marginBottom:4 }}>Your Self-Assessment Score</div>
      <div style={{ fontFamily:KF.body, fontSize:11.5, color:K.ink2, marginBottom:12 }}>out of {k.max.toFixed(1)} points</div>
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:6 }}>
        <input type="range" min="0" max={k.max} step="0.5" value={score} disabled={!editable}
          onChange={e=>setScore(+e.target.value)} className="dsu-range" style={{ flex:1 }}/>
        <span style={{ fontFamily:KF.mono, fontWeight:700, fontSize:20, color:scoreErr?K.error:K.maroon, minWidth:46, textAlign:'right' }}>{score.toFixed(1)}</span>
      </div>
      {scoreErr && <div style={{ fontFamily:KF.body, fontSize:11, color:K.error, marginBottom:6 }}>{scoreErr}</div>}

      <div style={{ marginTop:18 }}>
        <InputField label="Additional Remarks (Optional)" value={remarks} onChange={editable?setRemarks:()=>{}}
          placeholder="Add notes or justification for reviewers…" multiline/>
      </div>
    </div>
  );
}
function StepperBtn({ icon, onClick }) {
  return (
    <button onClick={onClick} className="dsu-press" style={{ ...btnReset, width:50, height:50, borderRadius:'50%',
      border:`1.5px solid ${K.maroon}`, justifyContent:'center', background:'#fff' }}>
      <Icon name={icon} size={22} color={K.maroon} sw={2.4}/>
    </button>
  );
}

function StepEvidence({ k, docs, addDoc, removeDoc, editable }) {
  const uploaded = docs.length, need = k.reqDocs.length;
  return (
    <div>
      <div style={{ background:K.yellowSoft, borderRadius:12, padding:14, marginBottom:16 }}>
        <div style={{ fontFamily:KF.display, fontWeight:600, fontSize:14, color:K.brown, marginBottom:10 }}>Documents Required for {k.code}</div>
        {k.reqDocs.map((d,n)=>{
          const have = n<uploaded;
          return (
            <div key={n} style={{ display:'flex', alignItems:'center', gap:9, padding:'6px 0' }}>
              <span style={{ width:18, height:18, borderRadius:5, border:`1.5px solid ${have?K.success:'#C9B27A'}`,
                background:have?K.success:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {have && <Icon name="check" size={11} color="#fff" sw={3}/>}</span>
              <span style={{ fontFamily:KF.body, fontSize:12.5, color:K.brown, flex:1 }}>{d}</span>
            </div>
          );
        })}
        <div style={{ marginTop:10 }}><ProgressBar value={uploaded} max={need} color={K.yellow} track="#EBD9A8"/></div>
        <div style={{ fontFamily:KF.body, fontSize:11.5, color:K.brown, marginTop:6 }}>{Math.min(uploaded,need)} of {need} required documents uploaded</div>
      </div>

      {docs.length>0 && <div style={{ display:'flex', flexDirection:'column', gap:9, marginBottom:14 }}>
        {docs.map((f,n)=>(<FileItem key={n} file={f} onRemove={editable?()=>removeDoc(n):undefined}/>))}
      </div>}

      {editable && <FileUploadZone onAdd={addDoc} label={docs.length?'Add Another Document':'Tap to Add Document'}/>}
    </div>
  );
}

function StepReview({ k, value, score, remarks, docs }) {
  const ok = docs.length>=k.reqDocs.length;
  return (
    <div>
      <Card style={{ marginBottom:16 }}>
        <div style={{ fontFamily:KF.display, fontWeight:600, fontSize:15, color:K.ink, marginBottom:4 }}>Review Your Entry — {k.code}</div>
        <ReadRow label={k.unit.charAt(0).toUpperCase()+k.unit.slice(1)}>{value}</ReadRow>
        <ReadRow label="Self-Assessment Score">{score.toFixed(1)} / {k.max.toFixed(1)}</ReadRow>
        <ReadRow label="Remarks">{remarks || '—'}</ReadRow>
        <ReadRow label="Documents">
          <span style={{ color:ok?K.success:K.warning, fontWeight:600 }}>{docs.length} of {k.reqDocs.length} uploaded {ok?'✓':''}</span>
        </ReadRow>
      </Card>
      <div style={{ display:'flex', gap:10, background:K.yellowSoft, borderRadius:12, padding:14 }}>
        <Icon name="alert" size={18} color="#C79A00" style={{ marginTop:1 }}/>
        <span style={{ fontFamily:KF.body, fontSize:12.5, color:K.brown, lineHeight:'18px' }}>
          Once submitted, your HOD and HEC reviewer will assess this entry. You won't be able to edit it until it is returned to you.</span>
      </div>
    </div>
  );
}

Object.assign(window, { ScoreCardScreen, SectionScreen, EntryScreen, KPICard, StickyBar, ReadRow });
