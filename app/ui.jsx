// ui.jsx — DSU ORIC PMS shared component library
// Exports a large set of components to window.
const { useState, useRef, useEffect } = React;
const { C, F, SHADOW, STATUS, RATING } = window.DSU;

/* ───────────────────────── Icons ───────────────────────── */
const ICONS = {
  back:'M15 19l-7-7 7-7',
  bell:'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9 M13.7 21a2 2 0 0 1-3.4 0',
  home:'M3 10.5 12 3l9 7.5 M5 9.5V21h14V9.5',
  clipboard:'M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1z M8 6H6a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-2',
  upload:'M12 16V4 M7 9l5-5 5 5 M4 20h16',
  chart:'M4 20V10 M10 20V4 M16 20v-7 M22 20H2',
  user:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4 4-6 8-6s8 2 8 6',
  reviewCheck:'M8 6H6a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-2 M9 4h6v2H9z M9 14l2 2 4-4',
  edit:'M15 5l4 4 M4 20l1-4 11-11 4 4-11 11-4 1z',
  paperclip:'M21 11l-8.5 8.5a4 4 0 0 1-6-6L14 5a2.5 2.5 0 0 1 3.5 3.5L9 16.5',
  clock:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2',
  check:'M5 12l4.5 4.5L19 7',
  plus:'M12 5v14 M5 12h14',
  minus:'M5 12h14',
  x:'M6 6l12 12 M18 6L6 18',
  chevR:'M9 6l6 6-6 6',
  chevD:'M6 9l6 6 6-6',
  bulb:'M9 18h6 M10 21h4 M12 3a6 6 0 0 1 4 10.5c-.7.7-1 1.5-1 2.5H9c0-1-.3-1.8-1-2.5A6 6 0 0 1 12 3z',
  cloud:'M16 16l-4-4-4 4 M12 12v9 M20 16.7A5 5 0 0 0 18 7h-1.3A8 8 0 1 0 4 15',
  file:'M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8z M14 3v5h5',
  camera:'M3 8a1 1 0 0 1 1-1h2l1.5-2h7L16 7h2a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z M12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
  settings:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 13a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.2A1.6 1.6 0 0 0 7 19.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 13H3a2 2 0 1 1 0-4h.2A1.6 1.6 0 0 0 4.6 6.4l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 3.7V3a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4z',
  logout:'M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4 M16 17l5-5-5-5 M21 12H9',
  search:'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M20 20l-4-4',
  download:'M12 4v12 M7 11l5 5 5-5 M4 20h16',
  share:'M16 6l-4-4-4 4 M12 2v14 M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7',
  print:'M7 9V3h10v6 M7 18H5a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-2 M7 14h10v7H7z',
  eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  star:'M12 3l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8L6.6 19.6l1-6L3.3 9.4l6-.9z',
  alert:'M12 3l9 16H3z M12 10v4 M12 17h.01',
  ret:'M9 14l-4-4 4-4 M5 10h9a5 5 0 0 1 5 5v3',
  sparkle:'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
  cal:'M7 3v3 M17 3v3 M4 8h16 M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z',
  folder:'M3 7a1 1 0 0 1 1-1h5l2 2h8a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z',
  shield:'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  refresh:'M21 12a9 9 0 1 1-3-6.7 M21 4v4h-4',
};
function Icon({ name, size=22, color='currentColor', sw=2, fill, style }) {
  const d = ICONS[name] || '';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill||'none'}
      stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink:0, display:'block', ...style }}>
      {d.split(' M').map((seg,i)=>(<path key={i} d={(i?'M':'')+seg} />))}
    </svg>
  );
}

/* ───────────────────────── Phone frame ───────────────────────── */
function StatusBar({ bg=C.maroon, fg='#fff' }) {
  return (
    <div style={{ height:32, background:bg, color:fg, display:'flex', alignItems:'center',
      justifyContent:'space-between', padding:'0 18px 0 20px', flexShrink:0,
      fontFamily:F.body, position:'relative', zIndex:5 }}>
      <span style={{ fontSize:13, fontWeight:600, letterSpacing:.3 }}>9:41</span>
      <div style={{ position:'absolute', left:'50%', top:7, transform:'translateX(-50%)',
        width:46, height:16, borderRadius:10, background:'rgba(0,0,0,0.35)' }} />
      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
        <svg width="16" height="12" viewBox="0 0 16 12"><path d="M1 8h2v3H1zM5 5h2v6H5zM9 3h2v8H9zM13 1h2v10h-2z" fill={fg}/></svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M2 7a6 6 0 0 1 12 0M4.5 9a3 3 0 0 1 7 0M8 11h.01" stroke={fg} strokeWidth="1.4" strokeLinecap="round"/></svg>
        <svg width="22" height="12" viewBox="0 0 22 12"><rect x="1" y="1.5" width="17" height="9" rx="2.5" fill="none" stroke={fg} strokeOpacity=".6"/><rect x="2.5" y="3" width="13" height="6" rx="1.2" fill={fg}/><rect x="19" y="4" width="2" height="4" rx="1" fill={fg}/></svg>
      </div>
    </div>
  );
}
function PhoneFrame({ children, statusBg, statusFg }) {
  return (
    <div style={{ width:'100%', minHeight:'100%', display:'flex', alignItems:'center',
      justifyContent:'center', padding:'24px 16px', boxSizing:'border-box' }}>
      <div style={{ width:390, height:'min(844px, calc(100vh - 48px))', borderRadius:42,
        background:'#0d0d0d', padding:9, boxShadow:'0 40px 90px -20px rgba(0,0,0,.5), 0 0 0 2px #2a2a2a',
        boxSizing:'border-box', flexShrink:0 }}>
        <div style={{ width:'100%', height:'100%', borderRadius:34, overflow:'hidden',
          background:C.white, display:'flex', flexDirection:'column', position:'relative' }}>
          <StatusBar bg={statusBg} fg={statusFg} />
          {children}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── App chrome ───────────────────────── */
function AppHeader({ title, subtitle, onBack, right, breadcrumb }) {
  return (
    <div style={{ background:C.maroon, color:'#fff', padding:'10px 14px 14px',
      boxShadow:SHADOW.header, flexShrink:0, position:'relative', zIndex:4 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, minHeight:36 }}>
        {onBack && (
          <button onClick={onBack} style={btnReset} aria-label="Back">
            <Icon name="back" size={24} color="#fff" />
          </button>
        )}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:F.display, fontWeight:700, fontSize:18, lineHeight:'22px',
            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{title}</div>
        </div>
        {right}
      </div>
      {breadcrumb && (
        <div style={{ fontFamily:F.body, fontSize:12, color:'rgba(255,255,255,.7)', marginTop:6,
          marginLeft:onBack?32:0 }}>{breadcrumb}</div>
      )}
      {subtitle && (
        <div style={{ fontFamily:F.body, fontSize:12.5, color:'rgba(255,255,255,.82)', marginTop:4,
          marginLeft:onBack?32:0 }}>{subtitle}</div>
      )}
    </div>
  );
}
const btnReset = { background:'none', border:'none', padding:0, margin:0, cursor:'pointer',
  display:'flex', alignItems:'center', WebkitTapHighlightColor:'transparent' };

function Scroll({ children, pad=16, style }) {
  return (
    <div className="dsu-scroll" style={{ flex:1, overflowY:'auto', overflowX:'hidden',
      background:C.white, ...style }}>
      <div style={{ padding:pad, paddingBottom:96 }}>{children}</div>
    </div>
  );
}

/* ───────────────────────── Buttons ───────────────────────── */
function PrimaryBtn({ children, onClick, disabled, icon, loading, style }) {
  return (
    <button onClick={disabled||loading?undefined:onClick} disabled={disabled}
      className="dsu-press"
      style={{ ...btnReset, width:'100%', height:50, borderRadius:12, justifyContent:'center', gap:8,
        background:disabled?'#D0C4C4':C.maroon, color:disabled?'#9E8E8E':'#fff',
        fontFamily:F.display, fontWeight:600, fontSize:15,
        boxShadow:disabled?'none':SHADOW.fab, ...style }}>
      {loading ? <span className="dsu-spin" /> : <>{icon && <Icon name={icon} size={19} color="#fff"/>}{children}</>}
    </button>
  );
}
function SecondaryBtn({ children, onClick, icon, style }) {
  return (
    <button onClick={onClick} className="dsu-press"
      style={{ ...btnReset, width:'100%', height:50, borderRadius:12, justifyContent:'center', gap:8,
        background:'#fff', color:C.maroon, border:`1.5px solid ${C.maroon}`,
        fontFamily:F.display, fontWeight:600, fontSize:15, ...style }}>
      {icon && <Icon name={icon} size={19} color={C.maroon}/>}{children}
    </button>
  );
}

/* ───────────────────────── Cards & chips ───────────────────────── */
function Card({ children, stripe, onClick, style, pad=16 }) {
  return (
    <div onClick={onClick} className={onClick?'dsu-card-tap':''}
      style={{ background:'#fff', border:`1px solid ${C.border}`, borderRadius:14,
        boxShadow:SHADOW.card, overflow:'hidden', position:'relative',
        borderLeft:stripe?`4px solid ${stripe}`:`1px solid ${C.border}`,
        cursor:onClick?'pointer':'default', ...style }}>
      <div style={{ padding:pad }}>{children}</div>
    </div>
  );
}
function StatusChip({ status, size='md' }) {
  const s = STATUS[status]||STATUS.DRAFT;
  const sm = size==='sm';
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, height:sm?22:25,
      padding:sm?'0 8px':'0 10px', borderRadius:13, background:s.bg, color:s.fg,
      fontFamily:F.body, fontWeight:600, fontSize:sm?10:11, textTransform:'uppercase', letterSpacing:.4,
      whiteSpace:'nowrap' }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:s.dot }} />{s.label}
    </span>
  );
}
function CodeBadge({ code, color=C.maroon }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', height:22,
      padding:'0 8px', borderRadius:6, background:color, color:'#fff',
      fontFamily:F.mono, fontWeight:700, fontSize:12, letterSpacing:.5 }}>{code}</span>
  );
}

/* ───────────────────────── Progress + gauge ───────────────────────── */
function ProgressBar({ value, max, color=C.maroon, h=8, track=C.border }) {
  const pct = Math.max(0, Math.min(100, (value/max)*100));
  return (
    <div style={{ width:'100%', height:h, borderRadius:h, background:track, overflow:'hidden' }}>
      <div className="dsu-bar" style={{ width:pct+'%', height:'100%', borderRadius:h,
        background:color, transition:'width .6s cubic-bezier(.2,.7,.2,1)' }} />
    </div>
  );
}
function ScoreGauge({ value, max, size=56, color=C.maroon, label, big }) {
  const r = (size-8)/2, circ = 2*Math.PI*r;
  const pct = max? Math.max(0, Math.min(1, value/max)) : 0;
  const [dash, setDash] = useState(0);
  useEffect(()=>{ const t=setTimeout(()=>setDash(circ*pct), 80); return ()=>clearTimeout(t); },[pct,circ]);
  return (
    <div style={{ width:size, height:size, position:'relative', flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth="6"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
          style={{ transition:'stroke-dasharray 1s cubic-bezier(.2,.7,.2,1)' }}/>
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', lineHeight:1 }}>
        <span style={{ fontFamily:F.mono, fontWeight:700, fontSize:big?22:size*0.26, color:C.ink }}>{value}</span>
        {label!==false && <span style={{ fontFamily:F.mono, fontSize:big?12:9, color:C.ink3, marginTop:2 }}>/{max}</span>}
      </div>
    </div>
  );
}

/* ───────────────────────── Instruction banner ───────────────────────── */
function InstructionBanner({ id, children }) {
  const key = 'dsu-banner-'+id;
  const [show, setShow] = useState(()=>{ try { return localStorage.getItem(key)!=='1'; } catch(e){ return true; } });
  if (!show || window.DSU.tipsOff) return null;
  return (
    <div style={{ display:'flex', gap:10, background:C.yellowSoft, borderLeft:`3px solid ${C.yellow}`,
      borderRadius:10, padding:'11px 12px', marginBottom:16 }}>
      <Icon name="bulb" size={18} color="#C79A00" style={{ marginTop:1 }}/>
      <div style={{ flex:1, fontFamily:F.body, fontSize:12.5, lineHeight:'18px', color:C.brown }}>{children}</div>
      <button style={btnReset} onClick={()=>{ try{localStorage.setItem(key,'1');}catch(e){} setShow(false); }} aria-label="Dismiss">
        <Icon name="x" size={15} color="#B59B5E"/>
      </button>
    </div>
  );
}

/* ───────────────────────── Bottom nav ───────────────────────── */
function BottomNav({ tabs, active, onChange }) {
  return (
    <div style={{ display:'flex', background:'#fff', borderTop:`1px solid ${C.border}`,
      paddingBottom:6, flexShrink:0, position:'relative', zIndex:4 }}>
      {tabs.map(t=>{
        const on = t.id===active;
        return (
          <button key={t.id} onClick={()=>onChange(t.id)} style={{ ...btnReset, flex:1,
            flexDirection:'column', alignItems:'center', gap:3, padding:'8px 0 4px' }}>
            <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center',
              width:52, height:28, borderRadius:14, background:on?'#F3E3E3':'transparent',
              transition:'background .2s' }}>
              <Icon name={t.icon} size={21} color={on?C.maroon:'#9E9E9E'} sw={on?2.2:2}/>
              {t.badge>0 && (
                <span style={{ position:'absolute', top:-2, right:6, minWidth:15, height:15, padding:'0 3px',
                  borderRadius:8, background:C.yellow, color:C.maroonDark, fontFamily:F.mono, fontWeight:700,
                  fontSize:9, display:'flex', alignItems:'center', justifyContent:'center', border:'1.5px solid #fff' }}>{t.badge}</span>
              )}
            </div>
            <span style={{ fontFamily:F.body, fontWeight:600, fontSize:10, color:on?C.maroon:'#9E9E9E' }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ───────────────────────── Toast ───────────────────────── */
function Toast({ toast }) {
  if (!toast) return null;
  const map = { success:{i:'check',c:C.success}, error:{i:'x',c:C.error}, info:{i:'bulb',c:C.info}, warning:{i:'alert',c:C.warning} };
  const m = map[toast.type]||map.success;
  return (
    <div key={toast.key} className="dsu-toast" style={{ position:'absolute', top:42, left:16, right:16, zIndex:50,
      background:'#1A1A1A', color:'#fff', borderRadius:12, padding:'12px 14px', display:'flex',
      alignItems:'center', gap:10, boxShadow:'0 8px 24px rgba(0,0,0,.3)' }}>
      <span style={{ width:22, height:22, borderRadius:'50%', background:m.c, display:'flex',
        alignItems:'center', justifyContent:'center', flexShrink:0 }}><Icon name={m.i} size={14} color="#fff" sw={2.6}/></span>
      <span style={{ fontFamily:F.body, fontWeight:500, fontSize:13, lineHeight:'17px' }}>{toast.msg}</span>
    </div>
  );
}

/* ───────────────────────── Bottom sheet ───────────────────────── */
function BottomSheet({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div style={{ position:'absolute', inset:0, zIndex:60, display:'flex', flexDirection:'column',
      justifyContent:'flex-end' }}>
      <div className="dsu-fade" onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.4)' }} />
      <div className="dsu-sheet" style={{ position:'relative', background:'#fff', borderRadius:'20px 20px 0 0',
        padding:'10px 20px 24px', boxShadow:'0 -8px 24px rgba(0,0,0,.12)' }}>
        <div style={{ width:36, height:4, borderRadius:2, background:'#E0E0E0', margin:'0 auto 14px' }} />
        {children}
      </div>
    </div>
  );
}

/* ───────────────────────── Stepper (wizard) ───────────────────────── */
function ProgressStepper({ steps, current }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', padding:'4px 4px 0' }}>
      {steps.map((s,i)=>{
        const done = i<current, cur = i===current;
        return (
          <React.Fragment key={i}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, width:64 }}>
              <div style={{ width:30, height:30, borderRadius:'50%', display:'flex', alignItems:'center',
                justifyContent:'center', background:done?C.maroon:(cur?C.yellow:'#fff'),
                border:`2px solid ${done||cur?C.maroon:'#D8D8D8'}`,
                fontFamily:F.mono, fontWeight:700, fontSize:13, color:done?'#fff':(cur?C.maroon:'#BDBDBD') }}>
                {done? <Icon name="check" size={15} color="#fff" sw={2.6}/> : i+1}
              </div>
              <span style={{ fontFamily:F.body, fontWeight:cur?600:500, fontSize:10.5, textAlign:'center',
                color:cur?C.maroon:(done?C.ink:'#9E9E9E'), lineHeight:'13px' }}>{s}</span>
            </div>
            {i<steps.length-1 && (
              <div style={{ flex:1, height:2, background:'#E0E0E0', marginTop:14, borderRadius:2, overflow:'hidden' }}>
                <div style={{ height:'100%', width:done?'100%':'0%', background:C.maroon, transition:'width .4s' }} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ───────────────────────── File upload ───────────────────────── */
function fileColor(kind){ return kind==='xls'?C.success:(kind==='img'?C.info:C.maroon); }
function FileItem({ file, onRemove, status='done' }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, background:C.surface,
      border:`1px solid ${C.border}`, borderRadius:10, padding:'9px 11px' }}>
      <div style={{ width:38, height:38, borderRadius:8, background:'#fff', border:`1px solid ${C.border}`,
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon name="file" size={20} color={fileColor(file.kind)}/>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:F.display, fontWeight:500, fontSize:12.5, color:C.ink,
          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{file.name}</div>
        <div style={{ fontFamily:F.body, fontSize:11, color:C.ink2 }}>{file.size}</div>
      </div>
      {status==='done' && <span style={{ width:20, height:20, borderRadius:'50%', background:C.success,
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Icon name="check" size={12} color="#fff" sw={3}/></span>}
      {onRemove && <button style={btnReset} onClick={onRemove} aria-label="Remove"><Icon name="x" size={16} color={C.ink3}/></button>}
    </div>
  );
}
function FileUploadZone({ onAdd, label='Tap to Add Document' }) {
  return (
    <button onClick={onAdd} className="dsu-press" style={{ ...btnReset, width:'100%', flexDirection:'column',
      gap:6, border:`2px dashed ${C.maroon}`, borderRadius:14, background:C.maroonTint, padding:'22px 16px',
      justifyContent:'center' }}>
      <Icon name="cloud" size={30} color={C.maroon}/>
      <span style={{ fontFamily:F.display, fontWeight:600, fontSize:14, color:C.maroon }}>{label}</span>
      <span style={{ fontFamily:F.body, fontSize:11.5, color:C.ink2 }}>PDF, JPG or PNG · Max 25 MB</span>
    </button>
  );
}

/* ───────────────────────── Empty state ───────────────────────── */
function EmptyState({ icon='folder', title, message, cta, onCta }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center',
      padding:'40px 24px', gap:8 }}>
      <div style={{ width:78, height:78, borderRadius:'50%', background:C.surface, display:'flex',
        alignItems:'center', justifyContent:'center', marginBottom:6 }}>
        <Icon name={icon} size={34} color={C.maroon} sw={1.6}/>
      </div>
      <div style={{ fontFamily:F.display, fontWeight:600, fontSize:17, color:C.ink }}>{title}</div>
      <div style={{ fontFamily:F.body, fontSize:13.5, color:C.ink2, maxWidth:240, lineHeight:'19px' }}>{message}</div>
      {cta && <div style={{ marginTop:12, width:'100%', maxWidth:240 }}><PrimaryBtn onClick={onCta}>{cta}</PrimaryBtn></div>}
    </div>
  );
}

/* ───────────────────────── Reviewer feedback block ───────────────────────── */
function ReviewBlock({ review, compact }) {
  if (!review) return null;
  const r = RATING[review.rating];
  return (
    <div style={{ background:r.color+'12', border:`1px solid ${r.color}40`, borderRadius:12,
      padding:compact?'10px 12px':'13px 14px', display:'flex', flexDirection:'column', gap:7 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ width:22, height:22, borderRadius:'50%', background:r.color, display:'flex',
          alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Icon name={r.icon==='return'?'ret':r.icon} size={13} color="#fff" sw={2.6}/>
        </span>
        <span style={{ fontFamily:F.display, fontWeight:600, fontSize:13.5, color:r.color }}>Rating: {r.label}</span>
        <span style={{ marginLeft:'auto', fontFamily:F.body, fontSize:11, color:C.ink3 }}>{review.date}</span>
      </div>
      <div style={{ fontFamily:F.body, fontSize:12.5, lineHeight:'18px', color:C.ink, fontStyle:'italic' }}>
        “{review.comment}”
      </div>
      <div style={{ fontFamily:F.body, fontSize:11, color:C.ink2, display:'flex', alignItems:'center', gap:5 }}>
        <Icon name="shield" size={12} color={C.ink3}/> {review.reviewer}
      </div>
    </div>
  );
}

Object.assign(window, {
  Icon, PhoneFrame, StatusBar, AppHeader, Scroll, btnReset,
  PrimaryBtn, SecondaryBtn, Card, StatusChip, CodeBadge,
  ProgressBar, ScoreGauge, InstructionBanner, BottomNav, Toast,
  BottomSheet, ProgressStepper, FileItem, FileUploadZone, EmptyState, ReviewBlock,
});
