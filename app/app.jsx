// app.jsx — root: real Supabase auth, state store, splash, router, tweaks
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

// Map Supabase profile role → app view mode
const ADMIN_ROLES = ['HOD','DEAN','ORIC_HEAD','UNIVERSITY_ADMIN','SUPER_ADMIN','AUDITOR'];
function getAppRole(profileRole) {
  return ADMIN_ROLES.includes(profileRole) ? 'review' : 'faculty';
}

function App(){
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  A.C.maroon = t.primary;
  A.C.maroonDark = darken(t.primary, 0.32);
  A.C.maroonTint = t.primary.replace('#','')==='6B1A1A' ? '#FDF8F8' : (t.primary+'0A');
  A.C.yellow = t.accent;
  A.C.secA = t.primary;
  A.tipsOff = !t.tips;

  // mode: 'loading' | 'auth' | 'onboarding' | 'app'
  const [mode, setMode]             = uA('loading');
  const [currentUser, setCurrentUser] = uA(null);   // { id, full_name, email, role, department }
  const [role, setRole]             = uA('faculty'); // 'faculty' | 'review'
  const [tab, setTab]               = uA('home');
  const [stack, setStack]           = uA([]);
  const [toast, setToast]           = uA(null);
  const [seenOnboard, setSeenOnboard] = uA(false);
  const [dbOnline, setDbOnline]     = uA(false);
  const [inds, setInds]             = uA(()=>JSON.parse(JSON.stringify(window.DSUData.INDICATORS)));
  const [secs, setSecs]             = uA(()=>window.DSUData.SECTIONS);
  const toastTimer = rA(null);

  // ── Bootstrap ────────────────────────────────────────────────
  eA(()=>{
    if (!window.DSUdb) { setMode('auth'); return; }

    let settled = false;
    const timers = [];

    function settle(profile) {
      if (settled) return;
      settled = true;
      timers.forEach(clearTimeout);
      if (profile) _applyProfile(profile);
      else setMode('auth');
    }

    // Load live DB data in background (non-blocking, runs regardless of auth)
    window.DSUdb.ping().then(online => {
      setDbOnline(online);
      if (online) window.DSUdb.loadAllData().then(r => {
        if (r) { setInds(r.indicators); setSecs(r.sections); }
      });
    });

    // PRIMARY: onAuthStateChange fires INITIAL_SESSION immediately on load
    const unsub = window.DSUdb.onAuthChange(async (_event, session) => {
      if (settled) return;
      if (session?.user) {
        const profile = await window.DSUdb.getProfile(session.user.id);
        settle(profile || null);
      } else {
        settle(null);
      }
    });

    // FALLBACK A: direct getSession() after 500 ms — catches slow CDN / edge cases
    timers.push(setTimeout(async () => {
      if (settled) return;
      const session = await window.DSUdb.getSession();
      if (session?.user) {
        const profile = await window.DSUdb.getProfile(session.user.id);
        settle(profile || null);
      } else {
        settle(null);
      }
    }, 500));

    // FALLBACK B: hard timeout — never stay on loading > 2.5 s
    timers.push(setTimeout(() => settle(null), 2500));

    return () => { unsub?.(); timers.forEach(clearTimeout); };
  },[]);

  function _applyProfile(profile) {
    setCurrentUser(profile);
    const appRole = getAppRole(profile.role);
    setRole(appRole);
    if (appRole === 'faculty' && !seenOnboard) setMode('onboarding');
    else setMode('app');
  }

  function handleAuth(user, profile) {
    _applyProfile(profile);
  }

  function fireToast(msg, type='success'){
    setToast({ msg, type, key:Date.now() });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(()=>setToast(null), 2800);
  }

  async function updateIndicator(code, patch) {
    setInds(list=>list.map(k=>k.code===code?{...k,...patch}:k));
    if (window.DSUdb && dbOnline) {
      await window.DSUdb.saveScore(code, patch, window.DSUdb.ACTIVE_PERIOD_ID, currentUser);
    }
  }

  async function handleLogout() {
    if (window.DSUdb) await window.DSUdb.signOut();
    setCurrentUser(null);
    setStack([]);
    setTab('home');
    setMode('auth');
  }

  // Build user object for store from real profile
  const storeUser = currentUser ? {
    name:      currentUser.full_name,
    email:     currentUser.email,
    role:      role,
    roleLabel: currentUser.role.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),
    dept:      currentUser.department || 'DHA Suffa University',
    initials:  currentUser.full_name.trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase(),
    id:        currentUser.id,
    dbRole:    currentUser.role,
  } : { name:'Guest', role, roleLabel:'Guest', dept:'DSU', initials:'GU' };

  const store = {
    user: storeUser, role, indicators:inds, sections:secs, activeTab:tab,
    dbOnline, currentUser,
    nav(screen, params){ setStack(s=>[...s,{screen,params}]); },
    back(){ setStack(s=>s.slice(0,-1)); },
    setTab(id){ setStack([]); setTab(id); },
    toast: fireToast,
    update: updateIndicator,
    logout: handleLogout,
  };

  let sbBg=A.C.maroon, sbFg='#fff';
  if (mode==='loading'||mode==='auth'){ sbBg='#fff'; sbFg='#1A1A1A'; }

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
    const unread = inds.filter(k=>k.review&&['APPROVED','REJECTED','RETURNED'].includes(k.status)).length;
    return (
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        {dbOnline && (
          <span style={{ display:'inline-flex', alignItems:'center', gap:4, height:18, padding:'0 7px',
            borderRadius:9, background:'rgba(255,255,255,.18)', fontFamily:A.F.body, fontSize:10, color:'#fff' }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#4CAF50' }}/>Live
          </span>
        )}
        <button style={btnReset} onClick={()=>fireToast(`${unread} indicator(s) have reviewer feedback`,'info')}>
          <div style={{ position:'relative' }}>
            <Icon name="bell" size={22} color="#fff"/>
            {unread>0 && <span style={{ position:'absolute', top:-3, right:-4, minWidth:15, height:15, padding:'0 3px',
              borderRadius:8, background:A.C.yellow, color:A.C.maroonDark, fontFamily:A.F.mono, fontWeight:700, fontSize:9,
              display:'flex', alignItems:'center', justifyContent:'center', border:'1.5px solid '+A.C.maroon }}>{unread}</span>}
          </div>
        </button>
      </div>
    );
  }

  function renderApp(){
    if (stack.length){
      const top = stack[stack.length-1];
      if (top.screen==='section') return <SectionScreen store={store} params={top.params}/>;
      if (top.screen==='entry')   return <EntryScreen   store={store} params={top.params}/>;
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
        {mode==='loading'   && <LoadingScreen/>}
        {mode==='auth'      && <AuthScreen onAuth={handleAuth}/>}
        {mode==='onboarding'&& <OnboardingScreen store={{ ...store, finishOnboarding(){ setSeenOnboard(true); setMode('app'); } }}/>}
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
        <TweakColor label="Accent"  value={t.accent}
          options={['#F5C518','#E0A100','#F2A93B','#FFCE3A']} onChange={v=>setTweak('accent',v)}/>
        <TweakSection label="Guidance"/>
        <TweakToggle label="Show inline tips" value={t.tips} onChange={v=>setTweak('tips',v)}/>
      </TweaksPanel>
    </>
  );
}

function LoadingScreen(){
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', background:'#fff' }}>
      <img src="app/assets/dsu-logo.png" className="dsu-pop" style={{ width:80, height:80, objectFit:'contain' }}/>
      <div style={{ fontFamily:A.F.display, fontWeight:700, fontSize:20, color:A.C.maroon, marginTop:16 }}>DSU ORIC PMS</div>
      <div style={{ marginTop:20, width:120, height:4, borderRadius:2, background:A.C.border, overflow:'hidden' }}>
        <div className="dsu-indef" style={{ height:'100%', width:'40%', background:A.C.maroon, borderRadius:2 }}/>
      </div>
      <div style={{ fontFamily:A.F.body, fontSize:12, color:A.C.ink3, marginTop:10 }}>Connecting…</div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
