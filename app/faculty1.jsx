// faculty1.jsx — Login, Onboarding, Dashboard
const { useState:uS1 } = React;
const { C:CC, F:FF, SHADOW:SH } = window.DSU;

/* shared input field */
function InputField({ label, value, onChange, placeholder, type='text', icon, rightSlot,
  error, helper, multiline, big, autoCaps='none', mono }) {
  const [focus, setFocus] = uS1(false);
  const filled = value && value.length>0;
  const borderC = error?CC.error:(focus?CC.maroon:CC.border);
  const Tag = multiline?'textarea':'input';
  return (
    <div style={{ marginBottom:14 }}>
      {label && <div style={{ fontFamily:FF.display, fontWeight:500, fontSize:13,
        color:error?CC.error:(focus?CC.maroon:CC.maroon), marginBottom:6 }}>{label}</div>}
      <div style={{ display:'flex', alignItems:multiline?'flex-start':'center', gap:8,
        background:focus||filled?'#fff':CC.surface, border:`${focus||error?2:1.5}px solid ${borderC}`,
        borderRadius:10, padding:multiline?'10px 12px':'0 12px',
        minHeight:multiline?100:52, transition:'border-color .15s, background .15s' }}>
        {icon && <Icon name={icon} size={18} color={focus?CC.maroon:CC.ink3}/>}
        <Tag value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} type={type}
          onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
          style={{ flex:1, border:'none', outline:'none', background:'transparent', resize:'none',
            fontFamily:mono?FF.mono:FF.body, fontSize:big?17:14, color:CC.ink, width:'100%',
            textAlign:big?'center':'left', fontWeight:big?700:400,
            minHeight:multiline?78:'auto', textTransform:autoCaps,
            paddingTop:multiline?2:0 }}/>
        {rightSlot}
      </div>
      {(error||helper) && <div style={{ fontFamily:FF.body, fontSize:11, marginTop:5,
        color:error?CC.error:CC.ink2 }}>{error||helper}</div>}
    </div>
  );
}

/* ───────── Login ───────── */
function LoginScreen({ store }) {
  const [role, setRole] = uS1('faculty');
  const [email, setEmail] = uS1('');
  const [pw, setPw] = uS1('');
  const [show, setShow] = uS1(false);
  const [loading, setLoading] = uS1(false);
  const [err, setErr] = uS1(false);

  const presets = {
    faculty: { email:'a.ahmed@dsu.edu.pk', name:'Dr. Ahmed Raza' },
    review:  { email:'reviewer@hec.gov.pk', name:'HEC Reviewer' },
  };
  function fill(r){ setRole(r); setEmail(presets[r].email); setPw('research2025'); setErr(false); }
  React.useEffect(()=>{ fill('faculty'); },[]);

  function login(){
    if (!email || !pw){ setErr(true); return; }
    setLoading(true);
    setTimeout(()=>{ setLoading(false); store.login(role); }, 850);
  }

  return (
    <div className="dsu-scroll" style={{ flex:1, overflowY:'auto', background:'#fff' }}>
      <div style={{ padding:'30px 26px 40px', display:'flex', flexDirection:'column', minHeight:'100%' }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', marginBottom:24 }}>
          <img src="app/assets/dsu-logo.png" alt="DSU" style={{ width:74, height:74, objectFit:'contain', mixBlendMode:'multiply' }}/>
          <div style={{ fontFamily:FF.display, fontWeight:700, fontSize:18, color:CC.ink, marginTop:12 }}>DHA Suffa University</div>
          <div style={{ fontFamily:FF.body, fontSize:13, color:CC.ink2, marginTop:2 }}>ORIC Performance Management System</div>
        </div>

        <div className={err?'dsu-shake':''}>
          <div style={{ fontFamily:FF.display, fontWeight:700, fontSize:22, color:CC.ink, marginBottom:14 }}>Welcome Back</div>

          {/* role segmented */}
          <div style={{ display:'flex', gap:6, background:CC.surface, borderRadius:12, padding:4, marginBottom:16 }}>
            {[['faculty','Faculty','user'],['review','HEC / Admin','shield']].map(([id,lab,ic])=>(
              <button key={id} onClick={()=>fill(id)} style={{ ...btnReset, flex:1, justifyContent:'center', gap:6,
                height:38, borderRadius:9, background:role===id?'#fff':'transparent',
                boxShadow:role===id?SH.card:'none', fontFamily:FF.display, fontWeight:600, fontSize:13,
                color:role===id?CC.maroon:CC.ink2 }}>
                <Icon name={ic} size={16} color={role===id?CC.maroon:CC.ink3}/>{lab}
              </button>
            ))}
          </div>

          <InstructionBanner id="login">
            {role==='faculty'
              ? 'Use the credentials provided by your university IT department. Demo values are pre-filled — just tap Login.'
              : 'Reviewer access for HEC / ORIC Admin. Review faculty submissions and send back ratings & feedback.'}
          </InstructionBanner>

          <InputField label="Your Email Address" value={email} onChange={v=>{setEmail(v.toLowerCase());setErr(false);}}
            placeholder="name@dsu.edu.pk" icon="user" autoCaps="none"
            error={err&&!email?'Please enter your email':''}/>
          <InputField label="Password" value={pw} onChange={v=>{setPw(v);setErr(false);}}
            placeholder="Enter your password" type={show?'text':'password'} icon="shield"
            error={err&&!pw?'Please enter your password':''}
            rightSlot={<button style={btnReset} onClick={()=>setShow(!show)}><Icon name="eye" size={18} color={show?CC.maroon:CC.ink3}/></button>}/>

          <div style={{ textAlign:'right', marginBottom:16 }}>
            <span style={{ fontFamily:FF.body, fontWeight:500, fontSize:13, color:CC.maroon, textDecoration:'underline', cursor:'pointer' }}>Forgot Password?</span>
          </div>

          <PrimaryBtn onClick={login} loading={loading} icon={loading?undefined:'logout'}>
            {loading?'Signing you in…':(role==='faculty'?'Login to My Account':'Login as Reviewer')}
          </PrimaryBtn>

          <div style={{ display:'flex', alignItems:'center', gap:10, margin:'18px 0' }}>
            <div style={{ flex:1, height:1, background:CC.border }}/>
            <span style={{ fontFamily:FF.body, fontSize:12, color:CC.ink3 }}>or</span>
            <div style={{ flex:1, height:1, background:CC.border }}/>
          </div>
          <SecondaryBtn icon="eye" onClick={()=>store.toast('Biometric demo — tap Login instead','info')}>Use Fingerprint / Face ID</SecondaryBtn>
        </div>

        <div style={{ flex:1 }}/>
        <div style={{ textAlign:'center', marginTop:28, fontFamily:FF.body, fontSize:12, color:CC.ink3 }}>
          Need help? Contact <span style={{ color:CC.maroon, fontWeight:500 }}>it.support@dsu.edu.pk</span>
        </div>
      </div>
    </div>
  );
}

/* ───────── Onboarding ───────── */
function OnboardingScreen({ store }) {
  const [i, setI] = uS1(0);
  const slides = [
    { bg:CC.maroon, render:()=>(
      <div style={{ textAlign:'center', color:'#fff' }}>
        <div style={{ width:96, height:96, borderRadius:'50%', background:'rgba(255,255,255,.12)', display:'flex',
          alignItems:'center', justifyContent:'center', margin:'0 auto 22px' }}>
          <img src="app/assets/dsu-logo.png" style={{ width:60, height:60, objectFit:'contain' }}/>
        </div>
        <div style={{ fontFamily:FF.display, fontWeight:700, fontSize:26, lineHeight:'32px' }}>Welcome to<br/>DSU ORIC PMS</div>
        <div style={{ fontFamily:FF.body, fontSize:15, color:'rgba(255,255,255,.8)', marginTop:12 }}>Your research performance tracker</div>
      </div>)},
    { bg:'#fff', render:()=>(
      <div style={{ textAlign:'center' }}>
        <ImgPlaceholder label="scorecard illustration" h={150} />
        <div style={{ fontFamily:FF.display, fontWeight:700, fontSize:22, color:CC.ink, marginTop:24 }}>Track Your Research Performance</div>
        <div style={{ fontFamily:FF.body, fontSize:14, color:CC.ink2, marginTop:10, lineHeight:'21px' }}>
          Enter your research activities, upload documents, and submit your annual ORIC score card — all from your phone.</div>
      </div>)},
    { bg:'#fff', render:()=>(
      <div>
        <div style={{ fontFamily:FF.display, fontWeight:700, fontSize:22, color:CC.ink, marginBottom:20, textAlign:'center' }}>How It Works</div>
        {[['edit','Enter your KPI scores','Fill in scores for each section A–D'],
          ['paperclip','Upload supporting evidence','Attach proof documents per indicator'],
          ['check','Submit for review','Your HEC reviewer rates & sends feedback']].map(([ic,t,d],n)=>(
          <div key={n} style={{ display:'flex', gap:14, alignItems:'center', marginBottom:18 }}>
            <div style={{ width:46, height:46, borderRadius:12, background:CC.maroonTint, border:`1px solid ${CC.maroon}22`,
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Icon name={ic} size={22} color={CC.maroon}/></div>
            <div>
              <div style={{ fontFamily:FF.display, fontWeight:600, fontSize:15, color:CC.ink }}>{t}</div>
              <div style={{ fontFamily:FF.body, fontSize:12.5, color:CC.ink2, marginTop:2 }}>{d}</div>
            </div>
          </div>
        ))}
      </div>)},
    { bg:CC.maroon, render:()=>(
      <div style={{ textAlign:'center', color:'#fff' }}>
        <div className="dsu-pop" style={{ width:96, height:96, borderRadius:'50%', background:CC.yellow, display:'flex',
          alignItems:'center', justifyContent:'center', margin:'0 auto 22px' }}>
          <Icon name="check" size={48} color={CC.maroon} sw={3}/>
        </div>
        <div style={{ fontFamily:FF.display, fontWeight:700, fontSize:24 }}>You're All Set!</div>
        <div style={{ fontFamily:FF.body, fontSize:15, color:'rgba(255,255,255,.85)', marginTop:10 }}>Let's start with your dashboard.</div>
      </div>)},
  ];
  const last = i===slides.length-1;
  const dark = slides[i].bg===CC.maroon;
  return (
    <div style={{ flex:1, background:slides[i].bg, display:'flex', flexDirection:'column', position:'relative' }}>
      <div style={{ position:'absolute', top:14, right:18, zIndex:2 }}>
        <button style={btnReset} onClick={()=>store.finishOnboarding()}>
          <span style={{ fontFamily:FF.body, fontWeight:600, fontSize:13, color:dark?'rgba(255,255,255,.8)':CC.ink2 }}>Skip</span>
        </button>
      </div>
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 30px' }}>
        <div key={i} className="dsu-fade" style={{ width:'100%' }}>{slides[i].render()}</div>
      </div>
      <div style={{ padding:'0 26px 30px' }}>
        <div style={{ display:'flex', justifyContent:'center', gap:7, marginBottom:22 }}>
          {slides.map((_,n)=>(<div key={n} style={{ width:n===i?20:7, height:7, borderRadius:4,
            background:n===i?(dark?CC.yellow:CC.maroon):(dark?'rgba(255,255,255,.3)':CC.border), transition:'width .3s' }}/>))}
        </div>
        {last
          ? <PrimaryBtn onClick={()=>store.finishOnboarding()} style={{ background:CC.yellow, color:CC.maroonDark, boxShadow:'none' }} icon="chevR">Go to Dashboard</PrimaryBtn>
          : <PrimaryBtn onClick={()=>setI(i+1)} style={dark?{ background:'#fff', color:CC.maroon, boxShadow:'none' }:{}}>Continue</PrimaryBtn>}
      </div>
    </div>
  );
}

function ImgPlaceholder({ label, h=120 }) {
  return (
    <div style={{ width:'100%', height:h, borderRadius:14, border:`1px solid ${CC.border}`,
      background:'repeating-linear-gradient(135deg, #FBFBFB 0 10px, #F3F3F3 10px 20px)',
      display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{ fontFamily:FF.mono, fontSize:11, color:CC.ink3, letterSpacing:.5 }}>[ {label} ]</span>
    </div>
  );
}

/* ───────── Dashboard ───────── */
function DashboardScreen({ store }) {
  const { indicators, sections } = store;
  const totalScore = indicators.reduce((s,k)=>s+ (['APPROVED','SUBMITTED','UNDER_REVIEW','RETURNED'].includes(k.status)?k.score:0), 0);
  const totalMax = 100;
  const complete = indicators.filter(k=>k.status!=='DRAFT').length;
  const missingEvidence = indicators.filter(k=>k.status!=='DRAFT' && k.docs.length<k.reqDocs.length).length;
  const draftCount = indicators.filter(k=>k.status==='DRAFT').length;

  const secScore = id => {
    const ks = indicators.filter(k=>k.section===id);
    const sc = ks.reduce((s,k)=>s+(k.status!=='DRAFT'?k.score:0),0);
    return { sc, max:sections.find(s=>s.id===id).max };
  };
  const A=secScore('A'),B=secScore('B'),Cs=secScore('C'),D=secScore('D');

  return (
    <Scroll>
      {/* greeting */}
      <div style={{ background:`linear-gradient(135deg, ${CC.maroon}, ${CC.maroonDark})`, borderRadius:16,
        padding:'18px 18px 20px', color:'#fff', marginBottom:18, boxShadow:SH.fab }}>
        <div style={{ fontFamily:FF.display, fontWeight:700, fontSize:20 }}>Good morning, Ahmed 👋</div>
        <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
          <span style={pill('#fff', CC.maroon)}>Faculty Member</span>
          <span style={pill(CC.yellow, CC.maroonDark)}>AY 2024–2025 · ACTIVE</span>
        </div>
      </div>

      {/* next steps */}
      <SectionTitle>Your Next Steps</SectionTitle>
      <div className="dsu-scroll" style={{ display:'flex', gap:12, overflowX:'auto', margin:'0 -16px 22px', padding:'2px 16px 6px' }}>
        <ActionCard stripe={CC.yellow} icon="edit" title="Enter KPI Data" sub={`${complete} of ${indicators.length} indicators done`}
          value={complete} max={indicators.length} cta="Continue" onClick={()=>store.setTab('kpi')}/>
        <ActionCard stripe={CC.warning} icon="paperclip" title="Upload Evidence" sub={`${missingEvidence} indicators missing docs`}
          cta="Upload Now" onClick={()=>store.setTab('upload')}/>
        <ActionCard stripe={CC.info} icon="clock" title="Finish Drafts" sub={`${draftCount} indicators still in draft`}
          cta="Resume" onClick={()=>store.setTab('kpi')}/>
      </div>

      {/* score overview */}
      <SectionTitle right={<span style={{ fontFamily:FF.body, fontSize:12, color:CC.maroon, fontWeight:600 }}>2024–2025 ▾</span>}>My ORIC Score</SectionTitle>
      <Card style={{ marginBottom:22 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:16 }}>
          {[['A',A,CC.secA],['B',B,CC.secB],['C',Cs,CC.secC],['D',D,CC.secD]].map(([id,v,col])=>(
            <div key={id} style={{ display:'flex', alignItems:'center', gap:11 }}>
              <ScoreGauge value={v.sc} max={v.max} size={50} color={col}/>
              <div>
                <div style={{ fontFamily:FF.display, fontWeight:600, fontSize:13, color:CC.ink }}>Section {id}</div>
                <div style={{ fontFamily:FF.body, fontSize:11, color:CC.ink2 }}>{secName(sections,id)}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:16, borderTop:`1px solid ${CC.border}`, paddingTop:16 }}>
          <ScoreGauge value={totalScore} max={totalMax} size={84} big/>
          <div>
            <span style={pill(CC.maroon,'#fff')}>Category X</span>
            <div style={{ fontFamily:FF.body, fontSize:12.5, color:CC.ink2, marginTop:8, lineHeight:'17px' }}>
              <b style={{ color:CC.ink }}>{totalScore} of 100</b> points · {complete}/{indicators.length} indicators submitted</div>
            <div style={{ fontFamily:FF.body, fontSize:11.5, color:CC.maroon, marginTop:4 }}>{Math.max(0,80-totalScore)} more points to reach Category W</div>
          </div>
        </div>
      </Card>

      {/* recent activity */}
      <SectionTitle right={<span style={{ fontFamily:FF.body, fontSize:12, color:CC.maroon, fontWeight:600 }}>See All</span>}>Recent Activity</SectionTitle>
      <Card pad={0} style={{ marginBottom:22 }}>
        {window.DSUData.ACTIVITY.map((a,n)=>{
          const s = window.DSU.STATUS[a.kind];
          return (
            <div key={n} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
              borderTop:n?`1px solid ${CC.border}`:'none' }}>
              <span style={{ width:32, height:32, borderRadius:'50%', background:s.bg, display:'flex',
                alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ width:9, height:9, borderRadius:'50%', background:s.dot }}/>
              </span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:FF.body, fontSize:12.5, color:CC.ink, lineHeight:'16px' }}>{a.text}</div>
                <div style={{ fontFamily:FF.body, fontSize:11, color:CC.ink3, marginTop:2 }}>{a.code} · {a.time}</div>
              </div>
              <StatusChip status={a.kind} size="sm"/>
            </div>
          );
        })}
      </Card>

      {/* quick actions */}
      <SectionTitle>Quick Actions</SectionTitle>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {[['clipboard','Enter KPI Data',()=>store.setTab('kpi'),0],
          ['paperclip','Upload Documents',()=>store.setTab('upload'),missingEvidence],
          ['chart','View Reports',()=>store.setTab('reports'),0],
          ['reviewCheck','Switch to Reviewer',()=>store.login('review'),0]].map(([ic,lab,fn,badge],n)=>(
          <div key={n} onClick={fn} className="dsu-card-tap" style={{ background:'#fff', border:`1px solid ${CC.border}`,
            borderRadius:14, padding:'16px 14px', boxShadow:SH.card, cursor:'pointer', position:'relative' }}>
            <Icon name={ic} size={26} color={CC.maroon}/>
            <div style={{ fontFamily:FF.display, fontWeight:500, fontSize:13.5, color:CC.ink, marginTop:10 }}>{lab}</div>
            {badge>0 && <span style={{ position:'absolute', top:12, right:12, minWidth:18, height:18, padding:'0 4px',
              borderRadius:9, background:CC.yellow, color:CC.maroonDark, fontFamily:FF.mono, fontWeight:700, fontSize:10,
              display:'flex', alignItems:'center', justifyContent:'center' }}>{badge}</span>}
          </div>
        ))}
      </div>
    </Scroll>
  );
}
function secName(sections,id){ return (sections.find(s=>s.id===id)||{}).name; }
function pill(bg,fg){ return { display:'inline-flex', alignItems:'center', height:24, padding:'0 11px',
  borderRadius:12, background:bg, color:fg, fontFamily:FF.display, fontWeight:600, fontSize:11.5 }; }
function SectionTitle({ children, right }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:11 }}>
      <span style={{ fontFamily:FF.display, fontWeight:600, fontSize:16, color:CC.ink }}>{children}</span>
      {right}
    </div>
  );
}
function ActionCard({ stripe, icon, title, sub, value, max, cta, onClick }) {
  return (
    <div onClick={onClick} className="dsu-card-tap" style={{ width:208, flexShrink:0, background:'#fff',
      border:`1px solid ${CC.border}`, borderLeft:`4px solid ${stripe}`, borderRadius:14, padding:'15px 15px 14px',
      boxShadow:SH.card, cursor:'pointer' }}>
      <Icon name={icon} size={24} color={CC.maroon}/>
      <div style={{ fontFamily:FF.display, fontWeight:600, fontSize:15, color:CC.ink, marginTop:10 }}>{title}</div>
      <div style={{ fontFamily:FF.body, fontSize:12, color:CC.ink2, marginTop:3, marginBottom:value!=null?10:14, minHeight:16 }}>{sub}</div>
      {value!=null && <div style={{ marginBottom:12 }}><ProgressBar value={value} max={max}/></div>}
      <div style={{ display:'flex', alignItems:'center', gap:5, fontFamily:FF.display, fontWeight:600, fontSize:13, color:CC.maroon }}>
        {cta} <Icon name="chevR" size={15} color={CC.maroon}/>
      </div>
    </div>
  );
}

Object.assign(window, { InputField, LoginScreen, OnboardingScreen, DashboardScreen, ImgPlaceholder, SectionTitle, pill });
