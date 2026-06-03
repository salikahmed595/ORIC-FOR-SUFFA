// admin2.jsx — Admin screens: Users, University Setup, Periods, Audit Logs
const { useState:uA2 } = React;
const { C:AD, F:AF, SHADOW:AS } = window.DSU;

/* ─── Mock data ─── */
const MOCK_USERS = [
  { id:1, name:'Dr. Ahmed Raza',    email:'a.ahmed@dsu.edu.pk',      role:'FACULTY',          dept:'Computer Science',    active:true  },
  { id:2, name:'Dr. Sara Malik',    email:'s.malik@dsu.edu.pk',      role:'FACULTY',          dept:'Electrical Engineering',active:true },
  { id:3, name:'Dr. Usman Tariq',   email:'u.tariq@dsu.edu.pk',      role:'HOD',              dept:'Business Administration',active:true },
  { id:4, name:'Dr. Hina Raza',     email:'h.raza@dsu.edu.pk',       role:'HOD',              dept:'Computer Science',    active:true  },
  { id:5, name:'Prof. Khalid Shah', email:'k.shah@dsu.edu.pk',       role:'DEAN',             dept:'Faculty of Engineering',active:true },
  { id:6, name:'Dr. Amna Siddiqui', email:'a.siddiqui@dsu.edu.pk',   role:'ORIC_HEAD',        dept:'ORIC',                active:true  },
  { id:7, name:'Admin User',        email:'admin@dsu.edu.pk',        role:'UNIVERSITY_ADMIN', dept:'Administration',      active:true  },
  { id:8, name:'HEC Reviewer',      email:'reviewer@hec.gov.pk',     role:'SUPER_ADMIN',      dept:'Higher Education Commission',active:true },
  { id:9, name:'Dr. Fatima Khan',   email:'f.khan@dsu.edu.pk',       role:'FACULTY',          dept:'Computer Science',    active:false },
];

const ROLE_COLORS = {
  FACULTY:          '#1565C0',
  HOD:              '#2E7D32',
  DEAN:             '#6A1E78',
  ORIC_HEAD:        '#6B1A1A',
  UNIVERSITY_ADMIN: '#E65100',
  SUPER_ADMIN:      '#37474F',
  AUDITOR:          '#795548',
};
const ROLE_LABELS = {
  FACULTY:'Faculty',  HOD:'HOD',  DEAN:'Dean',
  ORIC_HEAD:'ORIC Head',  UNIVERSITY_ADMIN:'Univ. Admin',
  SUPER_ADMIN:'Super Admin',  AUDITOR:'Auditor',
};

const MOCK_PERIODS = [
  { id:'p1', label:'AY 2024–2025', from:'Jan 2024', to:'Dec 2024', status:'ACTIVE',  submitted:14, total:31, deadline:'31 Mar 2025' },
  { id:'p2', label:'AY 2023–2024', from:'Jan 2023', to:'Dec 2023', status:'CLOSED',  submitted:31, total:31, deadline:'31 Mar 2024' },
  { id:'p3', label:'AY 2022–2023', from:'Jan 2022', to:'Dec 2022', status:'CLOSED',  submitted:31, total:31, deadline:'31 Mar 2023' },
];

const MOCK_AUDIT = [
  { id:1,  ts:'2025-06-04 09:42',  user:'Dr. Ahmed Raza',    action:'SUBMIT',   table:'score_entries',    record:'B1', ip:'192.168.1.45'  },
  { id:2,  ts:'2025-06-04 09:38',  user:'HEC Reviewer',      action:'APPROVE',  table:'score_entries',    record:'B10',ip:'203.0.113.10'  },
  { id:3,  ts:'2025-06-04 08:55',  user:'HEC Reviewer',      action:'REJECT',   table:'score_entries',    record:'B4', ip:'203.0.113.10'  },
  { id:4,  ts:'2025-06-03 16:22',  user:'Dr. Ahmed Raza',    action:'UPLOAD',   table:'evidence_documents',record:'A2',ip:'192.168.1.45'  },
  { id:5,  ts:'2025-06-03 14:10',  user:'HEC Reviewer',      action:'APPROVE',  table:'score_entries',    record:'C6', ip:'203.0.113.10'  },
  { id:6,  ts:'2025-06-03 11:45',  user:'Dr. Ahmed Raza',    action:'EDIT',     table:'score_entries',    record:'A3', ip:'192.168.1.45'  },
  { id:7,  ts:'2025-06-02 15:30',  user:'HEC Reviewer',      action:'RETURN',   table:'score_entries',    record:'A2', ip:'203.0.113.10'  },
  { id:8,  ts:'2025-06-02 14:00',  user:'Admin User',        action:'LOGIN',    table:'users',            record:'—',  ip:'10.0.0.5'      },
  { id:9,  ts:'2025-06-01 10:20',  user:'Dr. Ahmed Raza',    action:'SUBMIT',   table:'score_entries',    record:'C3', ip:'192.168.1.45'  },
  { id:10, ts:'2025-05-31 17:00',  user:'Admin User',        action:'CREATE',   table:'assessment_periods',record:'p1',ip:'10.0.0.5'      },
];

const ACTION_STYLE = {
  SUBMIT:   { bg:'#E3F2FD', fg:'#1565C0' },
  APPROVE:  { bg:'#E8F5E9', fg:'#2E7D32' },
  REJECT:   { bg:'#FFEBEE', fg:'#D32F2F' },
  RETURN:   { bg:'#FFF8E1', fg:'#F57F17' },
  UPLOAD:   { bg:'#F3E5F5', fg:'#6A1E78' },
  EDIT:     { bg:'#FFF3E0', fg:'#E65100' },
  LOGIN:    { bg:'#F5F5F5', fg:'#757575' },
  CREATE:   { bg:'#E8F5E9', fg:'#2E7D32' },
  DELETE:   { bg:'#FFEBEE', fg:'#D32F2F' },
};

/* ─── Admin Home router ─── */
function AdminScreen({ store }) {
  const [sub, setSub] = uA2(null); // null | 'users' | 'setup' | 'periods' | 'audit'
  if (sub==='users')   return <UsersScreen onBack={()=>setSub(null)} store={store}/>;
  if (sub==='setup')   return <UniversitySetupScreen onBack={()=>setSub(null)} store={store}/>;
  if (sub==='periods') return <PeriodsScreen onBack={()=>setSub(null)} store={store}/>;
  if (sub==='audit')   return <AuditLogsScreen onBack={()=>setSub(null)} store={store}/>;

  const cards = [
    { id:'users',   icon:'user',      title:'User Management',         sub:'Manage faculty, HODs, and admin roles',      count:MOCK_USERS.filter(u=>u.active).length+' active users',  color:AD.info },
    { id:'setup',   icon:'settings',  title:'University Setup',        sub:'Institution profile and ORIC configuration',  count:'DSU · Karachi',                                       color:AD.maroon },
    { id:'periods', icon:'cal',       title:'Assessment Periods',      sub:'Create and manage assessment cycles',         count:MOCK_PERIODS.filter(p=>p.status==='ACTIVE').length+' active period', color:AD.success },
    { id:'audit',   icon:'shield',    title:'Audit Logs',              sub:'Immutable log of all system actions',         count:MOCK_AUDIT.length+' recent entries',                   color:'#6A1E78' },
  ];

  return (
    <>
      <AppHeader title="Administration"/>
      <Scroll>
        <div style={{ background:`linear-gradient(135deg, ${AD.maroon}, ${AD.maroonDark})`, borderRadius:16,
          padding:'16px 18px', color:'#fff', marginBottom:20, boxShadow:AS.fab }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Icon name="settings" size={18} color={AD.yellow}/>
            <span style={{ fontFamily:AF.display, fontWeight:700, fontSize:17 }}>System Administration</span>
          </div>
          <div style={{ fontFamily:AF.body, fontSize:12.5, color:'rgba(255,255,255,.8)', marginTop:5 }}>
            DHA Suffa University · ORIC PMS v1.0</div>
          <div style={{ display:'flex', gap:10, marginTop:14 }}>
            {[['Users',MOCK_USERS.length],['Periods',MOCK_PERIODS.length],['Logs',MOCK_AUDIT.length]].map(([l,n])=>(
              <div key={l} style={{ flex:1, background:'rgba(255,255,255,.12)', borderRadius:10, padding:'8px 0', textAlign:'center' }}>
                <div style={{ fontFamily:AF.mono, fontWeight:700, fontSize:20, color:AD.yellow }}>{n}</div>
                <div style={{ fontFamily:AF.body, fontSize:10, color:'rgba(255,255,255,.75)', marginTop:1 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {cards.map(c=>(
          <div key={c.id} onClick={()=>setSub(c.id)} className="dsu-card-tap"
            style={{ background:'#fff', border:`1px solid ${AD.border}`, borderLeft:`4px solid ${c.color}`,
              borderRadius:14, padding:'16px', boxShadow:AS.card, cursor:'pointer', marginBottom:13 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ width:44, height:44, borderRadius:12, background:c.color+'15',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Icon name={c.icon} size={22} color={c.color}/>
              </span>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:AF.display, fontWeight:600, fontSize:15, color:AD.ink }}>{c.title}</div>
                <div style={{ fontFamily:AF.body, fontSize:12, color:AD.ink2, marginTop:2 }}>{c.sub}</div>
                <div style={{ fontFamily:AF.mono, fontSize:11.5, color:c.color, marginTop:4 }}>{c.count}</div>
              </div>
              <Icon name="chevR" size={18} color={AD.ink3}/>
            </div>
          </div>
        ))}
      </Scroll>
    </>
  );
}

/* ─── Users Management ─── */
function UsersScreen({ onBack, store }) {
  const [filter, setFilter] = uA2('All');
  const [search, setSearch] = uA2('');
  const roles = ['All','FACULTY','HOD','DEAN','ORIC_HEAD','UNIVERSITY_ADMIN'];
  const shown = MOCK_USERS.filter(u=> {
    const matchRole = filter==='All' || u.role===filter;
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase())
      || u.dept.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <>
      <AppHeader title="User Management" onBack={onBack} breadcrumb="Administration → Users"/>
      <Scroll>
        <InstructionBanner id="admin-users">
          Manage all system users and their roles. Role changes take effect on next login.
          The RBAC system scopes every user to their own university and department data.
        </InstructionBanner>

        {/* search */}
        <div style={{ display:'flex', alignItems:'center', gap:8, background:AD.surface,
          border:`1.5px solid ${AD.border}`, borderRadius:10, padding:'0 12px', marginBottom:12, height:44 }}>
          <Icon name="search" size={17} color={AD.ink3}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or department…"
            style={{ flex:1, border:'none', outline:'none', background:'transparent',
              fontFamily:AF.body, fontSize:14, color:AD.ink }}/>
          {search && <button onClick={()=>setSearch('')} style={btnReset}><Icon name="x" size={15} color={AD.ink3}/></button>}
        </div>

        {/* role filter chips */}
        <div className="dsu-scroll" style={{ display:'flex', gap:8, overflowX:'auto', margin:'0 -16px 16px', padding:'0 16px' }}>
          {roles.map(r=>(
            <button key={r} onClick={()=>setFilter(r)} style={{ ...btnReset, flexShrink:0, height:30, padding:'0 12px',
              borderRadius:15, fontFamily:AF.body, fontWeight:600, fontSize:12,
              background:filter===r?AD.maroon:'#fff', color:filter===r?'#fff':AD.ink2,
              border:`1px solid ${filter===r?AD.maroon:AD.border}` }}>
              {r==='All'?'All Roles':ROLE_LABELS[r]||r}
            </button>
          ))}
        </div>

        <div style={{ fontFamily:AF.body, fontSize:12.5, color:AD.ink2, marginBottom:10 }}>{shown.length} user{shown.length!==1?'s':''} shown</div>

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
                <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                  <span style={{ fontFamily:AF.display, fontWeight:600, fontSize:14, color:AD.ink }}>{u.name}</span>
                  {!u.active && <span style={{ fontFamily:AF.body, fontSize:10, fontWeight:600, color:'#D32F2F',
                    background:'#FFEBEE', padding:'1px 7px', borderRadius:5 }}>INACTIVE</span>}
                </div>
                <div style={{ fontFamily:AF.body, fontSize:11.5, color:AD.ink2, marginTop:1 }}>{u.dept}</div>
                <div style={{ fontFamily:AF.body, fontSize:11, color:AD.ink3, marginTop:1 }}>{u.email}</div>
              </div>
              <div>
                <span style={{ display:'inline-flex', alignItems:'center', height:22, padding:'0 9px', borderRadius:11,
                  background:(ROLE_COLORS[u.role]||AD.maroon)+'18', color:ROLE_COLORS[u.role]||AD.maroon,
                  fontFamily:AF.display, fontWeight:600, fontSize:10.5 }}>
                  {ROLE_LABELS[u.role]||u.role}
                </span>
              </div>
            </div>
          </div>
        ))}

        <div style={{ marginTop:6 }}>
          <SecondaryBtn icon="plus" onClick={()=>store.toast('User invite flow — opens form','info')}>Invite New User</SecondaryBtn>
        </div>
      </Scroll>
    </>
  );
}

/* ─── University Setup ─── */
function UniversitySetupScreen({ onBack, store }) {
  const [edit, setEdit] = uA2(false);
  const fields = [
    ['University Name',  'DHA Suffa University'],
    ['HEC Code',         'DSU-KHI-001'],
    ['City / Province',  'Karachi, Sindh'],
    ['Type',             'Private'],
    ['Website',          'www.dsu.edu.pk'],
    ['Vice Chancellor',  'Prof. Dr. Zahoor Ahmad'],
    ['ORIC Director',    'Dr. Amna Siddiqui'],
    ['ORIC Email',       'oric@dsu.edu.pk'],
    ['Total Faculty',    '312 members'],
    ['PhD Faculty',      '48 members (15.4%)'],
    ['Established',      '2012'],
    ['Accreditation',    'HEC W4 Category'],
  ];
  return (
    <>
      <AppHeader title="University Setup" onBack={onBack} breadcrumb="Administration → University"/>
      <Scroll>
        <InstructionBanner id="admin-setup">
          These details are used in all generated reports and on the HEC submission. Update only through official channels.
        </InstructionBanner>

        <div style={{ background:`linear-gradient(135deg, ${AD.maroon}, ${AD.maroonDark})`, borderRadius:14,
          padding:'16px 18px', color:'#fff', marginBottom:18, display:'flex', alignItems:'center', gap:14 }}>
          <img src="app/assets/dsu-logo.png" style={{ width:48, height:48, objectFit:'contain' }}/>
          <div>
            <div style={{ fontFamily:AF.display, fontWeight:700, fontSize:17 }}>DHA Suffa University</div>
            <div style={{ fontFamily:AF.body, fontSize:12, color:'rgba(255,255,255,.8)', marginTop:3 }}>
              Karachi · HEC Code: DSU-KHI-001</div>
            <span style={{ display:'inline-flex', height:20, padding:'0 9px', borderRadius:10, marginTop:6,
              background:AD.yellow, color:AD.maroonDark, fontFamily:AF.display, fontWeight:700, fontSize:10 }}>
              W4 CATEGORY</span>
          </div>
        </div>

        <Card pad={0} style={{ marginBottom:18 }}>
          {fields.map(([k,v],n)=>(
            <div key={k} style={{ display:'flex', justifyContent:'space-between', gap:16, padding:'11px 14px',
              borderTop:n?`1px solid ${AD.border}`:'none', alignItems:'center' }}>
              <span style={{ fontFamily:AF.body, fontSize:12.5, color:AD.ink2, flexShrink:0 }}>{k}</span>
              <span style={{ fontFamily:AF.display, fontWeight:500, fontSize:13, color:AD.ink, textAlign:'right' }}>{v}</span>
            </div>
          ))}
        </Card>

        <SecondaryBtn icon="edit" onClick={()=>{ setEdit(true); store.toast('Edit mode — changes require VP Academic approval','warning'); }}>
          Edit University Profile
        </SecondaryBtn>
      </Scroll>
    </>
  );
}

/* ─── Assessment Periods ─── */
function PeriodsScreen({ onBack, store }) {
  const [periods, setPeriods] = uA2(MOCK_PERIODS);
  const [sheet, setSheet] = uA2(false);
  const [newYear, setNewYear] = uA2('2025–2026');

  function addPeriod(){
    const p = { id:'p'+Date.now(), label:'AY '+newYear, from:'Jan '+newYear.split('–')[0],
      to:'Dec '+newYear.split('–')[0], status:'DRAFT', submitted:0, total:31, deadline:'31 Mar '+(+newYear.split('–')[1]) };
    setPeriods(prev=>[p,...prev]);
    setSheet(false);
    store.toast('Assessment period '+newYear+' created','success');
  }

  const STATUS_C = { ACTIVE:{ bg:'#E8F5E9',fg:'#2E7D32' }, CLOSED:{ bg:'#F5F5F5',fg:'#757575' }, DRAFT:{ bg:'#E3F2FD',fg:'#1565C0' } };

  return (
    <>
      <AppHeader title="Assessment Periods" onBack={onBack} breadcrumb="Administration → Periods"/>
      <Scroll>
        <InstructionBanner id="admin-periods">
          Each period maps to one academic year. Only one period can be ACTIVE at a time.
          Submissions are only accepted when a period is ACTIVE.
        </InstructionBanner>

        {periods.map((p,n)=>{
          const sc = STATUS_C[p.status]||STATUS_C.DRAFT;
          const pct = Math.round((p.submitted/p.total)*100);
          return (
            <Card key={p.id} style={{ marginBottom:13 }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
                <div>
                  <div style={{ fontFamily:AF.display, fontWeight:700, fontSize:16, color:AD.ink }}>{p.label}</div>
                  <div style={{ fontFamily:AF.body, fontSize:12, color:AD.ink2, marginTop:2 }}>{p.from} – {p.to}</div>
                </div>
                <span style={{ display:'inline-flex', alignItems:'center', height:24, padding:'0 11px',
                  borderRadius:12, background:sc.bg, color:sc.fg, fontFamily:AF.display, fontWeight:600, fontSize:11 }}>
                  {p.status}
                </span>
              </div>
              <ProgressBar value={p.submitted} max={p.total}/>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:7 }}>
                <span style={{ fontFamily:AF.body, fontSize:12, color:AD.ink2 }}>
                  <b style={{ color:AD.ink, fontFamily:AF.mono }}>{p.submitted}/{p.total}</b> indicators submitted ({pct}%)
                </span>
                <span style={{ fontFamily:AF.body, fontSize:11.5, color:AD.ink3 }}>Deadline: {p.deadline}</span>
              </div>
              {p.status==='ACTIVE' && (
                <div style={{ marginTop:12 }}>
                  <SecondaryBtn icon="x" onClick={()=>store.toast('Close period — requires ORIC Head sign-off','warning')}
                    style={{ height:38, fontSize:13 }}>Close Period</SecondaryBtn>
                </div>
              )}
            </Card>
          );
        })}

        <PrimaryBtn icon="plus" onClick={()=>setSheet(true)}>Create New Period</PrimaryBtn>
      </Scroll>

      <BottomSheet open={sheet} onClose={()=>setSheet(false)}>
        <div style={{ fontFamily:AF.display, fontWeight:600, fontSize:16, color:AD.ink, marginBottom:4 }}>New Assessment Period</div>
        <div style={{ fontFamily:AF.body, fontSize:13, color:AD.ink2, marginBottom:16 }}>
          The new period will start in DRAFT status. Activate it when ready to accept submissions.</div>
        <InputField label="Academic Year" value={newYear} onChange={setNewYear} placeholder="e.g. 2025–2026" icon="cal"/>
        <div style={{ display:'flex', gap:10, marginTop:4 }}>
          <SecondaryBtn onClick={()=>setSheet(false)}>Cancel</SecondaryBtn>
          <PrimaryBtn onClick={addPeriod} icon="check">Create Period</PrimaryBtn>
        </div>
      </BottomSheet>
    </>
  );
}

/* ─── Audit Logs ─── */
function AuditLogsScreen({ onBack, store }) {
  const [filter, setFilter] = uA2('All');
  const actions = ['All','SUBMIT','APPROVE','REJECT','RETURN','UPLOAD','EDIT','LOGIN','CREATE'];
  const shown = filter==='All' ? MOCK_AUDIT : MOCK_AUDIT.filter(l=>l.action===filter);

  return (
    <>
      <AppHeader title="Audit Logs" onBack={onBack} breadcrumb="Administration → Audit Logs"/>
      <Scroll>
        <InstructionBanner id="admin-audit">
          Audit logs are append-only and immutable. Every state-changing action is recorded
          with user, timestamp, IP address, and affected record.
        </InstructionBanner>

        <div className="dsu-scroll" style={{ display:'flex', gap:8, overflowX:'auto', margin:'0 -16px 16px', padding:'0 16px' }}>
          {actions.map(a=>(
            <button key={a} onClick={()=>setFilter(a)} style={{ ...btnReset, flexShrink:0, height:30, padding:'0 12px',
              borderRadius:15, fontFamily:AF.body, fontWeight:600, fontSize:12,
              background:filter===a?AD.maroon:'#fff', color:filter===a?'#fff':AD.ink2,
              border:`1px solid ${filter===a?AD.maroon:AD.border}` }}>{a}</button>
          ))}
        </div>

        <Card pad={0} style={{ marginBottom:16 }}>
          {shown.map((l,n)=>{
            const ac = ACTION_STYLE[l.action]||ACTION_STYLE.EDIT;
            return (
              <div key={l.id} style={{ display:'flex', gap:11, padding:'11px 14px',
                borderTop:n?`1px solid ${AD.border}`:'none', alignItems:'flex-start' }}>
                <span style={{ display:'inline-flex', height:22, padding:'0 8px', borderRadius:6, flexShrink:0,
                  background:ac.bg, color:ac.fg, fontFamily:AF.mono, fontWeight:700, fontSize:10, marginTop:1,
                  alignItems:'center' }}>{l.action}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:AF.body, fontSize:12.5, color:AD.ink }}>
                    <b>{l.user}</b> — {l.table}<span style={{ color:AD.maroon }}> #{l.record}</span>
                  </div>
                  <div style={{ fontFamily:AF.body, fontSize:11, color:AD.ink3, marginTop:2, display:'flex', gap:8 }}>
                    <span>{l.ts}</span>
                    <span>·</span>
                    <span style={{ fontFamily:AF.mono }}>IP {l.ip}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </Card>

        <div style={{ textAlign:'center', fontFamily:AF.body, fontSize:12, color:AD.ink2 }}>
          Showing {shown.length} of {MOCK_AUDIT.length} entries · Logs are never deleted
        </div>
      </Scroll>
    </>
  );
}

Object.assign(window, { AdminScreen, UsersScreen, UniversitySetupScreen, PeriodsScreen, AuditLogsScreen });
