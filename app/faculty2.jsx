// faculty2.jsx — Score Card hub, Section Detail, Entry Wizard
const { useState:uS2, useRef:rS2 } = React;
const { C:K, F:KF, SHADOW:KS, STATUS:KST } = window.DSU;

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
          ? <SubmitAllBtn store={store} indicators={indicators}/>
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
          : <SubmitSectionBtn store={store} sec={sec} ks={ks}/>}
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

/* ── Submit-all button (ScoreCard hub) ── */
function SubmitAllBtn({ store, indicators }) {
  const [busy, setBusy] = uS2(false);
  const [confirm, setConfirm] = uS2(false);

  async function doSubmit() {
    setBusy(true);
    const pending = indicators.filter(k=>['DRAFT','RETURNED'].includes(k.status));
    for (const ind of pending) {
      await store.update(ind.code, { status:'SUBMITTED' });
    }
    setBusy(false);
    setConfirm(false);
    store.toast('Annual report submitted to your HOD for review!','success');
  }

  return (
    <>
      <PrimaryBtn icon="check" loading={busy} onClick={()=>setConfirm(true)}>Submit Annual Report</PrimaryBtn>
      <BottomSheet open={confirm} onClose={()=>setConfirm(false)}>
        <div style={{ textAlign:'center', marginBottom:8 }}>
          <span style={{ width:48, height:48, borderRadius:'50%', background:K.maroon+'15',
            display:'inline-flex', alignItems:'center', justifyContent:'center' }}>
            <Icon name="check" size={24} color={K.maroon} sw={2.4}/>
          </span>
        </div>
        <div style={{ fontFamily:KF.display, fontWeight:700, fontSize:17, color:K.ink, textAlign:'center', marginBottom:6 }}>Submit Annual Report?</div>
        <div style={{ fontFamily:KF.body, fontSize:13, color:K.ink2, textAlign:'center', marginBottom:18 }}>
          All remaining draft entries will be submitted to your HOD for review. You cannot edit them after submission.
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <SecondaryBtn onClick={()=>setConfirm(false)}>Cancel</SecondaryBtn>
          <PrimaryBtn onClick={doSubmit} loading={busy}>Confirm Submit</PrimaryBtn>
        </div>
      </BottomSheet>
    </>
  );
}

/* ── Submit-section button ── */
function SubmitSectionBtn({ store, sec, ks }) {
  const [busy, setBusy] = uS2(false);

  async function doSubmit() {
    setBusy(true);
    const pending = ks.filter(k=>['DRAFT','RETURNED'].includes(k.status));
    for (const ind of pending) {
      await store.update(ind.code, { status:'SUBMITTED' });
    }
    setBusy(false);
    store.toast(`Section ${sec.id} submitted for review`, 'success');
    store.back();
  }

  return <PrimaryBtn icon="check" loading={busy} onClick={doSubmit}>Submit Section {sec.id} for Review</PrimaryBtn>;
}

/* ───────── Entry Wizard (3 steps) ───────── */
function EntryScreen({ store, params }) {
  const k = store.indicators.find(x=>x.code===params.code);
  const [step, setStep]       = uS2(0);
  const [value, setValue]     = uS2(k.value);
  const [score, setScore]     = uS2(k.score);
  const [remarks, setRemarks] = uS2(k.remarks);
  const [docs, setDocs]       = uS2(k.docs);
  const [sheet, setSheet]     = uS2(false);
  const [uploading, setUploading] = uS2(false);
  const [submitting, setSubmitting] = uS2(false);
  const fileInputRef = rS2(null);
  const captureRef   = rS2(null);

  const editable = ['DRAFT','RETURNED'].includes(k.status);
  const ratio    = k.denom ? (value/k.denom) : null;
  const scoreErr = score > k.max ? `Cannot exceed maximum score of ${k.max.toFixed(1)}` : '';

  async function handleFile(file) {
    if (!file) return;
    setSheet(false);
    if (file.size > 52428800) { store.toast('File too large — max 50 MB','error'); return; }
    setUploading(true);

    let storageUrl = '';
    let entryId = k._entryId;
    const kind = window.DSUdb?.getFileKind(file.type) || 'file';
    const size = window.DSUdb?.formatSize(file.size) || '—';

    if (window.DSUdb?.isConnected()) {
      if (!entryId) {
        await store.update(k.code, { score, value, remarks });
        entryId = store.indicators.find(x=>x.code===k.code)?._entryId;
      }
      const up = await window.DSUdb.uploadFile(file, k.code, store.currentUser?.id);
      if (up) {
        storageUrl = up.url;
        if (entryId) {
          await window.DSUdb.addEvidence(entryId, file.name, size, kind, file.type,
            storageUrl, store.currentUser?.id, store.currentUser?.full_name);
        }
      }
    }
    setDocs(prev=>[...prev, { name:file.name, size, kind, url:storageUrl }]);
    store.toast(`${file.name} added`,'success');
    setUploading(false);
  }

  async function submit(){
    if (scoreErr) { store.toast(scoreErr,'error'); return; }
    setSubmitting(true);
    await store.update(k.code, { value, score, remarks, docs, status:'SUBMITTED', review:null });
    setSubmitting(false);
    store.back();
    store.toast(`${k.code} submitted for HOD review!`, 'success');
  }
  async function saveDraft(){
    await store.update(k.code, { value, score, remarks, docs });
    store.toast('Saved as draft', 'info');
  }

  return (
    <>
      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="*" style={{ display:'none' }}
        onChange={e=>handleFile(e.target.files?.[0])}/>
      <input ref={captureRef} type="file" accept="image/*" capture="environment"
        style={{ display:'none' }} onChange={e=>handleFile(e.target.files?.[0])}/>

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
            <span style={{ fontFamily:KF.body, fontSize:12, color:K.brown, flex:1 }}>
              This entry is <b>{KST[k.status]?.label?.toLowerCase()||k.status}</b> and currently read-only.</span>
          </div>
        )}

        {step===0 && <StepScore k={k} value={value} setValue={setValue} score={score} setScore={setScore}
          remarks={remarks} setRemarks={setRemarks} ratio={ratio} scoreErr={scoreErr} editable={editable}/>}
        {step===1 && <StepEvidence k={k} docs={docs} uploading={uploading}
          addDoc={()=>setSheet(true)}
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
            <PrimaryBtn onClick={()=>setStep(2)} icon="chevR">Review & Submit</PrimaryBtn>
          </>}
          {step===2 && <>
            <SecondaryBtn onClick={()=>setStep(0)}>Edit</SecondaryBtn>
            {editable
              ? <PrimaryBtn onClick={submit} loading={submitting} icon="check">Submit to HOD</PrimaryBtn>
              : <PrimaryBtn disabled>Read-only</PrimaryBtn>}
          </>}
        </div>
      </StickyBar>

      <BottomSheet open={sheet} onClose={()=>setSheet(false)}>
        <div style={{ fontFamily:KF.display, fontWeight:600, fontSize:16, color:K.ink, marginBottom:4 }}>Add a Document</div>
        <div style={{ fontFamily:KF.body, fontSize:12.5, color:K.ink2, marginBottom:16 }}>Any file format accepted — PDF, Word, Excel, images and more.</div>
        {[
          ['file',   'Choose File',    'Any format from your device — PDF, Word, Excel, images',  ()=>{ if(fileInputRef.current){ fileInputRef.current.value=''; fileInputRef.current.click(); } }],
          ['camera', 'Take a Photo',   'Capture a physical document with your camera',             ()=>{ if(captureRef.current){ captureRef.current.value=''; captureRef.current.click(); } }],
          ['folder', 'From Drive',     'Google Drive, OneDrive or Dropbox',                        ()=>{ setSheet(false); store.toast('Open your cloud app and share the file here','info'); }],
        ].map(([ic,t,d,fn],n)=>(
          <button key={n} onClick={fn}
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

function StepEvidence({ k, docs, addDoc, removeDoc, editable, uploading }) {
  const uploaded = docs.length, need = k.reqDocs.length;
  const kindColor = { pdf:'#C62828', xls:'#2E7D32', img:'#1565C0', doc:'#1A237E', ppt:'#E65100', file:'#757575' };
  return (
    <div>
      {/* Required docs checklist */}
      <div style={{ background:K.yellowSoft, borderRadius:12, padding:14, marginBottom:16 }}>
        <div style={{ fontFamily:KF.display, fontWeight:600, fontSize:14, color:K.brown, marginBottom:10 }}>Required Documents — {k.code}</div>
        {k.reqDocs.map((d,n)=>{
          const have = n<uploaded;
          return (
            <div key={n} style={{ display:'flex', alignItems:'center', gap:9, padding:'6px 0' }}>
              <span style={{ width:18, height:18, borderRadius:5, border:`1.5px solid ${have?K.success:'#C9B27A'}`,
                background:have?K.success:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {have && <Icon name="check" size={11} color="#fff" sw={3}/>}
              </span>
              <span style={{ fontFamily:KF.body, fontSize:12.5, color:K.brown, flex:1 }}>{d}</span>
            </div>
          );
        })}
        <div style={{ marginTop:10 }}><ProgressBar value={uploaded} max={Math.max(need,1)} color={K.yellow} track="#EBD9A8"/></div>
        <div style={{ fontFamily:KF.body, fontSize:11.5, color:K.brown, marginTop:6 }}>
          {Math.min(uploaded,need)} of {need} required documents uploaded</div>
      </div>

      {/* Uploaded file list */}
      {docs.length>0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:9, marginBottom:14 }}>
          {docs.map((f,n)=>{
            const kind  = f.kind || 'file';
            const color = kindColor[kind] || '#757575';
            return (
              <div key={n} style={{ display:'flex', alignItems:'center', gap:10, background:K.surface,
                border:`1px solid ${K.border}`, borderRadius:10, padding:'9px 11px' }}>
                <div style={{ width:36, height:36, borderRadius:8, background:color+'15',
                  display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon name="file" size={18} color={color}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:KF.display, fontWeight:500, fontSize:12.5, color:K.ink,
                    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{f.name}</div>
                  <div style={{ fontFamily:KF.body, fontSize:11, color:K.ink2 }}>{f.size} · <span style={{ color, fontWeight:600, fontSize:10 }}>{kind.toUpperCase()}</span></div>
                </div>
                {f.url && <a href={f.url} target="_blank" rel="noreferrer" style={{ ...btnReset }}>
                  <Icon name="download" size={16} color={K.maroon}/></a>}
                {editable && <button onClick={()=>removeDoc(n)} style={btnReset} title="Remove">
                  <Icon name="x" size={16} color={K.error}/></button>}
              </div>
            );
          })}
        </div>
      )}

      {/* Upload zone */}
      {editable && (
        uploading ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10,
            border:`2px dashed ${K.maroon}`, borderRadius:14, padding:'20px', background:K.maroonTint }}>
            <span className="dsu-spin" style={{ borderTopColor:K.maroon, borderColor:K.border+'80' }}/>
            <span style={{ fontFamily:KF.display, fontWeight:600, fontSize:14, color:K.maroon }}>Uploading…</span>
          </div>
        ) : (
          <FileUploadZone onAdd={addDoc} label={docs.length?'Add Another Document':'Tap to Add Document'}/>
        )
      )}
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
