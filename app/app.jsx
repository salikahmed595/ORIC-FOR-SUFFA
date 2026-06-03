// app.jsx — root: state store, splash, router, tweaks
const { useState:uA, useEffect:eA, useRef:rA } = React;
const A = window.DSU;

function darken(hex, amt=0.4){
  const n=parseInt(hex.slice(1),16); let r=(n>>16)&255,g=(n>>8)&255,b=n&255;
  r=Math.round(r*(1-amt)); g=Math.round(g*(1-amt)); b=Math.round(b*(1-amt));
  return '#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primary": "#6B1A1A",
  "accent": "#F5C518",
  "tips": true
}/*EDITMODE-END*/;

const USERS = {
  faculty: { name:'Dr. Ahmed Raza', role:'faculty', roleLabel:'Faculty Member', dept:'Dept. of Computer Science · DSU', initials:'AR' },
  review:  { name:'HEC Reviewer',   role:'review',  roleLabel:'HEC / ORIC Admin', dept:'Higher Education Commission', initials:'HR' },
};

function App(){
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  A.C.maroon = t.primary;
  A.C.maroonDark = darken(t.primary, 0.32);
  A.C.maroonTint = t.primary.replace('#','')==='6B1A1A' ? '#FDF8F8' : (t.primary+'0A');
  A.C.yellow = t.accent;
  A.C.secA = t.primary;
  A.tipsOff = !t.tips;

  const [mode, setMode] = uA('splash');
  const [role, setRole] = uA('faculty');
  const [tab, setTab] = uA('home');
  const [stack, setStack] = uA([]);
  const [toast, setToast] = uA(null);
  const [seenOnboard, setSeenOnboard] = uA(false);
  const [inds, setInds] = uA(()=>JSON.parse(JSON.stringify(window.DSUData.INDICATORS)));
  const toastTimer = rA(null);

  eA(()=>{ const x=setTimeout(()=>setMode('login'), 2100); return ()=>clearTimeout(x); },[]);

  function fireToast(msg, type='success'){
    setToast({ msg, type, key:Date.now() });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(()=>setToast(null), 2800);
  }

  const store = {
    user: USERS[role], role, indicators:inds, sections:window.DSUData.SECTIONS, activeTab:tab,
    login(r){ setRole(r); setStack([]); setTab(r==='review'?'home':'home');
      if (r==='faculty' && !seenOnboard) setMode('onboarding'); else setMode('app'); },
    finishOnboarding(){ setSeenOnboard(true); setMode('app'); },
    logout(){ setMode('login'); setStack([]); setTab('home'); },
    nav(screen, params){ setStack(s=>[...s, {screen, params}]); },
    back(){ setStack(s=>s.slice(0,-1)); },
    setTab(id){ setStack([]); setTab(id); },
    toast: fireToast,
    update(code, patch){ setInds(list=>list.map(k=>k.code===code?{...k,...patch}:k)); },
  };

  let sbBg=A.C.maroon, sbFg='#fff';
  if (mode==='splash'||mode==='login'){ sbBg='#fff'; sbFg='#1A1A1A'; }

  const facultyTabs=[
    {id:'home',    label:'Home',    icon:'home'},
    {id:'kpi',     label:'My KPIs', icon:'clipboard'},
    {id:'upload',  label:'Upload',  icon:'upload', badge:inds.filter(k=>k.status!=='DRAFT'&&k.docs.length<k.reqDocs.length).length},
    {id:'reports', label:'Reports', icon:'chart'},
    {id:'profile', label:'Profile', icon:'user'},
  ];
  const reviewTabs=[
    {id:'home',    label:'Review', icon:'reviewCheck', badge:inds.filter(k=>['SUBMITTED','UNDER_REVIEW'].includes(k.status)).length},
    {id:'reports', label:'Reports',icon:'chart'},
    {id:'admin',   label:'Admin',  icon:'settings'},
    {id:'profile', label:'Profile',icon:'user'},
  ];
  const tabs = role==='review'?reviewTabs:facultyTabs;

  function bell(){
    const unread = inds.filter(k=>k.review && ['APPROVED','REJECTED','RETURNED'].includes(k.status)).length;
    return (
      <button style={btnReset} onClick={()=>fireToast(unread+' indicator(s) have reviewer feedback','info')} aria-label="Notifications">
        <div style={{ position:'relative' }}>
          <Icon name="bell" size={22} color="#fff"/>
          {unread>0 && <span style={{ position:'absolute', top:-3, right:-4, minWidth:15, height:15, padding:'0 3px', borderRadius:8,
            background:A.C.yellow, color:A.C.maroonDark, fontFamily:A.F.mono, fontWeight:700, fontSize:9,
            display:'flex', alignItems:'center', justifyContent:'center', border:'1.5px solid '+A.C.maroon }}>{unread}</span>}
        </div>
      </button>
    );
  }

  function renderApp(){
    // stacked screens
    if (stack.length){
      const top = stack[stack.length-1];
      if (top.screen==='section') return <SectionScreen store={store} params={top.params}/>;
      if (top.screen==='entry')   return <EntryScreen store={store} params={top.params}/>;
      if (top.screen==='review')  return <ReviewDetailScreen store={store} params={top.params}/>;
    }
    if (role==='review'){
      if (tab==='home')    return <ReviewerHome store={store}/>;
      if (tab==='reports') return <><AppHeader title="Reports"/><ReportsScreen store={store}/></>;
      if (tab==='admin')   return <AdminScreen store={store}/>;
      if (tab==='profile') return <ProfileScreen store={store}/>;
    }
    if (tab==='home')    return <><AppHeader title="Dashboard" right={bell()}/><DashboardScreen store={store}/></>;
    if (tab==='kpi')     return <><AppHeader title="ORIC Score Card"/><ScoreCardScreen store={store}/></>;
    if (tab==='upload')  return <><AppHeader title="My Documents"/><EvidenceScreen store={store}/></>;
    if (tab==='reports') return <><AppHeader title="Reports"/><ReportsScreen store={store}/></>;
    if (tab==='profile') return <ProfileScreen store={store}/>;
    return null;
  }

  return (
    <>
      <PhoneFrame statusBg={sbBg} statusFg={sbFg}>
        <Toast toast={toast}/>
        {mode==='splash' && <Splash/>}
        {mode==='login' && <LoginScreen store={store}/>}
        {mode==='onboarding' && <OnboardingScreen store={store}/>}
        {mode==='app' && <>
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', position:'relative' }}>
            {renderApp()}
          </div>
          {stack.length===0 && <BottomNav tabs={tabs} active={tab} onChange={store.setTab}/>}
        </>}
      </PhoneFrame>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Brand"/>
        <TweakColor label="Primary" value={t.primary}
          options={['#6B1A1A','#7B1E2B','#581717','#3E2723']} onChange={v=>setTweak('primary',v)}/>
        <TweakColor label="Accent" value={t.accent}
          options={['#F5C518','#E0A100','#F2A93B','#FFCE3A']} onChange={v=>setTweak('accent',v)}/>
        <TweakSection label="Guidance"/>
        <TweakToggle label="Show inline tips" value={t.tips} onChange={v=>setTweak('tips',v)}/>
      </TweaksPanel>
    </>
  );
}

function Splash(){
  return (
    <div className="dsu-fade" style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', background:'#fff', position:'relative' }}>
      <img src="app/assets/dsu-logo.png" className="dsu-pop" style={{ width:88, height:88, objectFit:'contain' }}/>
      <div style={{ fontFamily:A.F.display, fontWeight:700, fontSize:22, color:A.C.maroon, marginTop:18 }}>DSU ORIC PMS</div>
      <div style={{ fontFamily:A.F.body, fontSize:13, color:A.C.ink2, marginTop:4 }}>Research. Tracked. Simplified.</div>
      <div style={{ position:'absolute', bottom:60, width:140, height:4, borderRadius:2, background:A.C.border, overflow:'hidden' }}>
        <div className="dsu-load" style={{ height:'100%', background:A.C.maroon, borderRadius:2 }}/>
      </div>
      <div style={{ position:'absolute', bottom:34, fontFamily:A.F.body, fontSize:11, color:A.C.ink3 }}>DHA Suffa University</div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
