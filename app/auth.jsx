// auth.jsx — Real Supabase Auth: Login + Signup screens
// Loaded after faculty1.jsx so InputField is available
const { useState:uAuth } = React;
const { C:AU, F:AUF } = window.DSU;

/* ─── Role options ─── */
const ROLE_OPTIONS = [
  { value:'FACULTY',          label:'Faculty Member',     icon:'user'   },
  { value:'HOD',              label:'Head of Department', icon:'users'  },
  { value:'DEAN',             label:'Dean',               icon:'shield' },
  { value:'ORIC_HEAD',        label:'ORIC Head',          icon:'star'   },
  { value:'UNIVERSITY_ADMIN', label:'University Admin',   icon:'settings'},
];

/* ─── Main AuthScreen router ─── */
function AuthScreen({ onAuth }) {
  const [mode, setMode] = uAuth('login'); // 'login' | 'signup'
  if (mode === 'signup') return <SignupScreen onAuth={onAuth} onLogin={()=>setMode('login')}/>;
  return <RealLoginScreen onAuth={onAuth} onSignup={()=>setMode('signup')}/>;
}

/* ─── Shared validators ─── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validateEmail(e) { return EMAIL_RE.test(e.trim()); }
function validatePassword(p) {
  if (p.length < 8)                         return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(p))                     return 'Password must contain at least one uppercase letter.';
  if (!/[0-9]/.test(p))                     return 'Password must contain at least one number.';
  return '';
}

/* ─── Login Screen ─── */
function RealLoginScreen({ onAuth, onSignup }) {
  const [email, setEmail]     = uAuth('');
  const [pw, setPw]           = uAuth('');
  const [showPw, setShowPw]   = uAuth(false);
  const [loading, setLoading] = uAuth(false);
  const [error, setError]     = uAuth('');
  const [attempts, setAttempts] = uAuth(0);

  async function handleLogin() {
    if (!email.trim() || !pw) { setError('Please fill in all fields.'); return; }
    if (!validateEmail(email))   { setError('Please enter a valid email address.'); return; }
    // Soft rate-limit: warn after 5 failed attempts in the same session
    if (attempts >= 5) { setError('Too many failed attempts. Please wait a few minutes.'); return; }
    setLoading(true); setError('');
    const result = await window.DSUdb.signIn(email.trim().toLowerCase(), pw);
    if (result.error) {
      setAttempts(a=>a+1);
      setError(result.error);
      setLoading(false);
    } else {
      setAttempts(0);
      onAuth(result.user, result.profile);
    }
  }

  function handleKey(e){ if (e.key==='Enter') handleLogin(); }

  return (
    <div className="dsu-scroll" style={{ flex:1, overflowY:'auto', background:'#fff' }}>
      <div style={{ padding:'30px 26px 40px', display:'flex', flexDirection:'column', minHeight:'100%' }}>

        {/* Header */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', marginBottom:28 }}>
          <img src="app/assets/dsu-logo.png" alt="DSU" style={{ width:72, height:72, objectFit:'contain', mixBlendMode:'multiply' }}/>
          <div style={{ fontFamily:AUF.display, fontWeight:700, fontSize:18, color:AU.ink, marginTop:12 }}>DHA Suffa University</div>
          <div style={{ fontFamily:AUF.body, fontSize:13, color:AU.ink2, marginTop:2 }}>ORIC Performance Management System</div>
        </div>

        <div style={{ fontFamily:AUF.display, fontWeight:700, fontSize:22, color:AU.ink, marginBottom:20 }}>Welcome Back</div>

        {/* Error banner */}
        {error && (
          <div style={{ background:'#FFEBEE', border:'1px solid #EF9A9A', borderRadius:10,
            padding:'10px 13px', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
            <Icon name="alert" size={16} color={AU.error}/>
            <span style={{ fontFamily:AUF.body, fontSize:13, color:AU.error }}>{error}</span>
          </div>
        )}

        <InputField label="Email Address" value={email} onChange={v=>{setEmail(v);setError('');}}
          placeholder="your@dsu.edu.pk" icon="user" autoCaps="none" type="email"/>
        <InputField label="Password" value={pw} onChange={v=>{setPw(v);setError('');}}
          placeholder="Enter your password" type={showPw?'text':'password'} icon="shield"
          onKeyDown={handleKey}
          rightSlot={
            <button style={btnReset} onClick={()=>setShowPw(!showPw)}>
              <Icon name="eye" size={18} color={showPw?AU.maroon:AU.ink3}/>
            </button>}/>

        <div style={{ marginBottom:18 }}>
          <PrimaryBtn onClick={handleLogin} loading={loading} icon={loading?undefined:'logout'}>
            {loading ? 'Signing in…' : 'Sign In'}
          </PrimaryBtn>
        </div>

        {/* Divider */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
          <div style={{ flex:1, height:1, background:AU.border }}/>
          <span style={{ fontFamily:AUF.body, fontSize:12, color:AU.ink3 }}>New here?</span>
          <div style={{ flex:1, height:1, background:AU.border }}/>
        </div>

        <SecondaryBtn icon="plus" onClick={onSignup}>Create an Account</SecondaryBtn>

        <div style={{ flex:1 }}/>
        <div style={{ textAlign:'center', marginTop:28, fontFamily:AUF.body, fontSize:12, color:AU.ink3 }}>
          Need help? <span style={{ color:AU.maroon, fontWeight:500 }}>it.support@dsu.edu.pk</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Signup Screen ─── */
function SignupScreen({ onAuth, onLogin }) {
  const [name, setName]       = uAuth('');
  const [email, setEmail]     = uAuth('');
  const [pw, setPw]           = uAuth('');
  const [pw2, setPw2]         = uAuth('');
  const [role, setRole]       = uAuth('FACULTY');
  const [dept, setDept]       = uAuth('');
  const [showPw, setShowPw]   = uAuth(false);
  const [loading, setLoading] = uAuth(false);
  const [error, setError]     = uAuth('');
  const [step, setStep]       = uAuth(0); // 0 = account info, 1 = role & dept

  function validateStep0() {
    if (!name.trim())           return 'Please enter your full name.';
    if (!validateEmail(email))  return 'Please enter a valid email address.';
    const pwErr = validatePassword(pw);
    if (pwErr)                  return pwErr;
    if (pw !== pw2)             return 'Passwords do not match.';
    return '';
  }

  function goNext() {
    const err = validateStep0();
    if (err) { setError(err); return; }
    setError('');
    setStep(1);
  }

  async function handleSignup() {
    if (!dept.trim() && role === 'FACULTY') { setError('Please enter your department.'); return; }
    setLoading(true); setError('');
    const result = await window.DSUdb.signUp(
      email.trim().toLowerCase(), pw, name.trim(), role, dept.trim()
    );
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      onAuth(result.user, result.profile);
    }
  }

  return (
    <div className="dsu-scroll" style={{ flex:1, overflowY:'auto', background:'#fff' }}>
      <div style={{ padding:'26px 26px 40px' }}>

        {/* Back + header */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
          <button style={btnReset} onClick={step===0?onLogin:()=>setStep(0)}>
            <Icon name="back" size={22} color={AU.ink}/>
          </button>
          <div>
            <div style={{ fontFamily:AUF.display, fontWeight:700, fontSize:20, color:AU.ink }}>
              {step===0 ? 'Create Account' : 'Your Role'}
            </div>
            <div style={{ fontFamily:AUF.body, fontSize:12, color:AU.ink2 }}>
              Step {step+1} of 2
            </div>
          </div>
        </div>

        {/* Step progress */}
        <div style={{ display:'flex', gap:6, marginBottom:24 }}>
          {[0,1].map(n=>(
            <div key={n} style={{ flex:1, height:4, borderRadius:2,
              background: n<=step ? AU.maroon : AU.border,
              transition:'background .3s' }}/>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div style={{ background:'#FFEBEE', border:'1px solid #EF9A9A', borderRadius:10,
            padding:'10px 13px', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
            <Icon name="alert" size={16} color={AU.error}/>
            <span style={{ fontFamily:AUF.body, fontSize:13, color:AU.error }}>{error}</span>
          </div>
        )}

        {step === 0 && (
          <div className="dsu-fade">
            <InputField label="Full Name" value={name} onChange={v=>{setName(v);setError('');}}
              placeholder="Dr. Ahmed Raza" icon="user"/>
            <InputField label="Email Address" value={email} onChange={v=>{setEmail(v);setError('');}}
              placeholder="your@dsu.edu.pk" icon="user" type="email" autoCaps="none"/>
            <InputField label="Password" value={pw} onChange={v=>{setPw(v);setError('');}}
              placeholder="Min. 8 chars, 1 uppercase, 1 number"
              type={showPw?'text':'password'} icon="shield"
              helper="At least 8 characters, one uppercase letter, one number"
              rightSlot={<button style={btnReset} onClick={()=>setShowPw(!showPw)}>
                <Icon name="eye" size={18} color={showPw?AU.maroon:AU.ink3}/></button>}/>
            <InputField label="Confirm Password" value={pw2} onChange={v=>{setPw2(v);setError('');}}
              placeholder="Re-enter password" type={showPw?'text':'password'} icon="shield"/>
            <PrimaryBtn onClick={goNext} icon="chevR">Continue</PrimaryBtn>
          </div>
        )}

        {step === 1 && (
          <div className="dsu-fade">
            <div style={{ fontFamily:AUF.display, fontWeight:500, fontSize:13, color:AU.maroon, marginBottom:10 }}>
              I am a…
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:9, marginBottom:20 }}>
              {ROLE_OPTIONS.map(opt=>(
                <button key={opt.value} onClick={()=>setRole(opt.value)}
                  style={{ ...btnReset, width:'100%', padding:'12px 14px', borderRadius:12,
                    border:`${role===opt.value?2:1.5}px solid ${role===opt.value?AU.maroon:AU.border}`,
                    background: role===opt.value ? AU.maroonTint : '#fff',
                    display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ width:36, height:36, borderRadius:10,
                    background: role===opt.value ? AU.maroon : AU.surface,
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Icon name={opt.icon} size={18} color={role===opt.value?'#fff':AU.ink2}/>
                  </span>
                  <span style={{ fontFamily:AUF.display, fontWeight:600, fontSize:14,
                    color: role===opt.value ? AU.maroon : AU.ink }}>{opt.label}</span>
                  {role===opt.value && (
                    <span style={{ marginLeft:'auto' }}>
                      <Icon name="check" size={17} color={AU.maroon} sw={2.6}/>
                    </span>
                  )}
                </button>
              ))}
            </div>

            <InputField label="Department / Unit" value={dept} onChange={v=>{setDept(v);setError('');}}
              placeholder="e.g. Computer Science"
              helper="Leave blank if not applicable"
              icon="folder"/>

            <PrimaryBtn onClick={handleSignup} loading={loading} icon={loading?undefined:'check'}>
              {loading ? 'Creating account…' : 'Create Account'}
            </PrimaryBtn>
          </div>
        )}

        <div style={{ textAlign:'center', marginTop:20, fontFamily:AUF.body, fontSize:12.5, color:AU.ink2 }}>
          Already have an account?{' '}
          <span onClick={onLogin} style={{ color:AU.maroon, fontWeight:600, cursor:'pointer',
            textDecoration:'underline' }}>Sign In</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AuthScreen, RealLoginScreen, SignupScreen });
