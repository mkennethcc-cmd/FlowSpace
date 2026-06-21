// FlowSpace — Production App with Supabase Auth + Real-time Sync
// ================================================================
// Replace src/App.jsx with this file.
// Requires: npm install @supabase/supabase-js
// Env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
// See DEPLOY.md for full setup instructions.

import { createClient } from '@supabase/supabase-js'
import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Supabase client ──────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// ─── Styles ───────────────────────────────────────────────────────────────────
const FontLink = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#fff2;border-radius:2px;}
    [draggable]{-webkit-user-drag:element;touch-action:none;user-select:none;}
    @keyframes slideIn{from{opacity:0;transform:translateY(-6px) scale(.97);}to{opacity:1;transform:none;}}
    @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
    @keyframes checkB{0%{transform:scale(0) rotate(-20deg);}60%{transform:scale(1.2);}100%{transform:scale(1);}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
    @keyframes glow{0%,100%{box-shadow:0 0 10px #c084fc28;}50%{box-shadow:0 0 22px #c084fc66;}}
    @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    .te{animation:slideIn .3s cubic-bezier(.34,1.56,.64,1);}
    .dp{animation:pulse 1s infinite;} .dp:nth-child(2){animation-delay:.15s;} .dp:nth-child(3){animation-delay:.3s;}
    .spin{animation:spin 1s linear infinite;}
  `}</style>
)

// ─── Icons ────────────────────────────────────────────────────────────────────
const Ico = ({ n, s=16, c="currentColor", st={} }) => {
  const p = {
    sun:<><circle cx="12" cy="12" r="4.5"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>,
    moon:<><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></>,
    check:<><polyline points="20 6 9 17 4 12"/></>,
    plus:<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    star:<><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
    cal:<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    grid:<><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
    bar:<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    cog:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    trash:<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/><path d="M9 6V4h6v2"/></>,
    zap:<><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>,
    clock:<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    layers:<><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
    x:<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    menu:<><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>,
    search:<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    note:<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
    done:<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
    sparkles:<><path d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5L12 3Z"/><path d="M5 3L5.5 5L7 5.5L5.5 6L5 8L4.5 6L3 5.5L4.5 5L5 3Z"/><path d="M19 13L19.5 15L21 15.5L19.5 16L19 18L18.5 16L17 15.5L18.5 15L19 13Z"/></>,
    fire:<><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></>,
    arr:<><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    repeat:<><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></>,
    grip:<><circle cx="9" cy="6" r="1" fill="currentColor"/><circle cx="15" cy="6" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="18" r="1" fill="currentColor"/><circle cx="15" cy="18" r="1" fill="currentColor"/></>,
    target:<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
    logout:<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    user:<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    wifi:<><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></>,
  }
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={st}>
      {p[n]}
    </svg>
  )
}

// ─── Constants ────────────────────────────────────────────────────────────────
const NOTE_COLS = ["#ef4444","#f97316","#f59e0b","#22c55e","#3b82f6","#a855f7","#ec4899","#14b8a6"]
const CAT_COLORS = ["#0ea5e9","#6366f1","#10b981","#f59e0b","#a855f7","#ef4444","#ec4899","#14b8a6","#f97316","#84cc16"]
const PRIORITY_COLOR = { high:"#ef4444", medium:"#f59e0b", low:"#22c55e" }
const MONTHS = {jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11}
const DEFAULT_CATS = { work:"#0ea5e9", school:"#6366f1", health:"#10b981", personal:"#f59e0b", finance:"#a855f7" }

const tod = () => new Date().toISOString().split("T")[0]
const addDays = n => { const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString().split("T")[0] }
const fmtDate = s => {
  if (!s) return null
  const d=new Date(s+"T12:00:00"), t=new Date(); t.setHours(0,0,0,0)
  const diff=Math.round((d-t)/86400000)
  if (diff<0) return `${Math.abs(diff)}d overdue`
  if (diff===0) return "Today"; if (diff===1) return "Tomorrow"
  return d.toLocaleDateString("en-US",{month:"short",day:"numeric"})
}
const parseNL = raw => {
  let title=raw.trim(), due=null
  const strip = s => s.replace(/\s+at\s+\d{1,2}(:\d{2})?\s*(am|pm)?/gi,"").trim()
  if (/\btomorrow\b/i.test(title)) { due=addDays(1); title=title.replace(/\s*\btomorrow(\s+at\s+[\w:]+(\s*(am|pm))?)?\b/gi,"") }
  else if (/\btoday\b/i.test(title)) { due=tod(); title=title.replace(/\s*\btoday(\s+at\s+[\w:]+(\s*(am|pm))?)?\b/gi,"") }
  else if (/\bnext week\b/i.test(title)) { due=addDays(7); title=title.replace(/\bnext week\b/gi,"") }
  else {
    const m=title.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})\b/i)
    if (m) {
      const mon=MONTHS[m[1].toLowerCase().substring(0,3)], day=parseInt(m[2])
      let yr=new Date().getFullYear()
      if (new Date(yr,mon,day)<new Date()) yr++
      due=new Date(yr,mon,day).toISOString().split("T")[0]
      title=title.replace(new RegExp("\\s*"+m[0].replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"(\\s+at\\s+[\\w:]+(\\s*(am|pm))?)?","gi"),"")
    }
  }
  title=strip(title).replace(/^[\s,\-–]+|[\s,\-–]+$/g,"").trim()
  if (!title) title=raw.trim()
  return {title,due}
}

const mkT = d => ({
  bg:d?"#0c0e16":"#f3f3f8", surface:d?"#141828":"#ffffff", surface2:d?"#1c2238":"#f0f0f6",
  surface3:d?"#242c44":"#e4e4f0", border:d?"rgba(255,255,255,.07)":"rgba(0,0,0,.07)",
  text:d?"#eef0fa":"#18192e", textMuted:d?"#7a85a3":"#7878a0",
  accent:"#c084fc", accentGlow:d?"rgba(192,132,252,.12)":"rgba(129,140,248,.1)",
  sidebar:d?"#0e1120":"#f7f7fc", canvas:d?"#07080f":"#e8e8f4",
  danger:"#ef4444", success:"#22c55e", warning:"#f59e0b", info:"#3b82f6",
})

// ─── Toast notification ───────────────────────────────────────────────────────
function Toast({msg,type="info",T}) {
  const colors={error:T.danger,success:T.success,info:T.accent}
  return (
    <div style={{position:"fixed",bottom:80,left:"50%",transform:"translateX(-50%)",background:T.surface,border:`1px solid ${colors[type]}44`,borderRadius:10,padding:"10px 18px",fontSize:13,color:T.text,boxShadow:"0 8px 24px rgba(0,0,0,.3)",animation:"slideIn .3s ease",zIndex:9999,display:"flex",alignItems:"center",gap:8}}>
      <div style={{width:8,height:8,borderRadius:"50%",background:colors[type],flexShrink:0}}/>
      {msg}
    </div>
  )
}

// ─── Auth Screen ──────────────────────────────────────────────────────────────
function AuthScreen() {
  const [mode,setMode] = useState("signin")  // "signin" | "signup"
  const [email,setEmail] = useState("")
  const [pass,setPass] = useState("")
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState("")
  const [success,setSuccess] = useState("")

  const submit = async e => {
    e.preventDefault()
    setLoading(true); setError(""); setSuccess("")
    if (mode==="signup") {
      const {error:err} = await supabase.auth.signUp({email,password:pass})
      if (err) setError(err.message)
      else setSuccess("Check your email to confirm your account, then sign in.")
    } else {
      const {error:err} = await supabase.auth.signInWithPassword({email,password:pass})
      if (err) setError(err.message)
    }
    setLoading(false)
  }

  const signInGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider:"google",
      options:{redirectTo: window.location.origin}
    })
  }

  return (
    <div style={{minHeight:"100vh",background:"#0c0e16",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif"}}>
      <FontLink/>
      <div style={{width:380,padding:"40px 36px",background:"#141828",borderRadius:20,border:"1px solid rgba(255,255,255,.07)",boxShadow:"0 24px 60px rgba(0,0,0,.5)"}}>
        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:32,justifyContent:"center"}}>
          <div style={{width:36,height:36,borderRadius:11,background:"linear-gradient(135deg,#c084fc,#818cf8)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 14px rgba(192,132,252,.5)"}}>
            <Ico n="zap" s={18} c="#fff"/>
          </div>
          <span style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:20,letterSpacing:"-.5px",background:"linear-gradient(90deg,#c084fc,#818cf8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>FlowSpace</span>
        </div>

        <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:18,fontWeight:700,color:"#eef0fa",textAlign:"center",marginBottom:6}}>
          {mode==="signin"?"Welcome back":"Create your account"}
        </h2>
        <p style={{fontSize:13,color:"#7a85a3",textAlign:"center",marginBottom:24}}>
          {mode==="signin"?"Your tasks sync across all devices":"Free forever · no credit card needed"}
        </p>

        {/* Google */}
        <button onClick={signInGoogle} style={{width:"100%",padding:"11px",borderRadius:10,border:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.05)",color:"#eef0fa",fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:20,transition:"background .15s"}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.09)"}
          onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.05)"}>
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>

        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
          <div style={{flex:1,height:1,background:"rgba(255,255,255,.08)"}}/>
          <span style={{fontSize:11,color:"#7a85a3"}}>or continue with email</span>
          <div style={{flex:1,height:1,background:"rgba(255,255,255,.08)"}}/>
        </div>

        <form onSubmit={submit}>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" required
            style={{width:"100%",padding:"11px 13px",borderRadius:9,border:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.05)",color:"#eef0fa",fontFamily:"'DM Sans',sans-serif",fontSize:13,outline:"none",marginBottom:10,transition:"border-color .15s"}}
            onFocus={e=>e.target.style.borderColor="rgba(192,132,252,.5)"}
            onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.1)"}
          />
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" required minLength={6}
            style={{width:"100%",padding:"11px 13px",borderRadius:9,border:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.05)",color:"#eef0fa",fontFamily:"'DM Sans',sans-serif",fontSize:13,outline:"none",marginBottom:16,transition:"border-color .15s"}}
            onFocus={e=>e.target.style.borderColor="rgba(192,132,252,.5)"}
            onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.1)"}
          />
          {error && <div style={{fontSize:12,color:"#ef4444",marginBottom:12,padding:"8px 10px",background:"rgba(239,68,68,.1)",borderRadius:7}}>{error}</div>}
          {success && <div style={{fontSize:12,color:"#22c55e",marginBottom:12,padding:"8px 10px",background:"rgba(34,197,94,.1)",borderRadius:7}}>{success}</div>}
          <button type="submit" disabled={loading} style={{width:"100%",padding:"12px",borderRadius:10,border:"none",cursor:loading?"not-allowed":"pointer",background:"linear-gradient(135deg,#c084fc,#818cf8)",color:"#fff",fontSize:14,fontWeight:700,fontFamily:"'DM Sans',sans-serif",boxShadow:"0 4px 14px rgba(192,132,252,.4)",opacity:loading?.7:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            {loading && <div className="spin" style={{width:14,height:14,borderRadius:"50%",border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff"}}/>}
            {mode==="signin"?"Sign In":"Create Account"}
          </button>
        </form>

        <p style={{textAlign:"center",fontSize:13,color:"#7a85a3",marginTop:20}}>
          {mode==="signin"?"Don't have an account? ":"Already have an account? "}
          <button onClick={()=>{setMode(m=>m==="signin"?"signup":"signin");setError("");setSuccess("");}} style={{background:"none",border:"none",cursor:"pointer",color:"#c084fc",fontWeight:600,fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>
            {mode==="signin"?"Sign up free":"Sign in"}
          </button>
        </p>
      </div>
    </div>
  )
}

// ─── Root App (auth gate) ─────────────────────────────────────────────────────
export default function App() {
  const [user,setUser] = useState(null)
  const [checking,setChecking] = useState(true)

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      setUser(session?.user??null); setChecking(false)
    })
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_,session)=>{
      setUser(session?.user??null)
    })
    return ()=>subscription.unsubscribe()
  },[])

  if (checking) return (
    <div style={{minHeight:"100vh",background:"#0c0e16",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif"}}>
      <FontLink/>
      <div style={{textAlign:"center"}}>
        <div style={{width:36,height:36,borderRadius:11,background:"linear-gradient(135deg,#c084fc,#818cf8)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:"0 4px 14px rgba(192,132,252,.5)"}}>
          <Ico n="zap" s={18} c="#fff"/>
        </div>
        <div className="spin" style={{width:24,height:24,borderRadius:"50%",border:"2px solid rgba(192,132,252,.2)",borderTopColor:"#c084fc",margin:"0 auto"}}/>
      </div>
    </div>
  )

  if (!user) return <AuthScreen/>
  return <FlowSpace user={user}/>
}

// ─── Main App ─────────────────────────────────────────────────────────────────
function FlowSpace({user}) {
  const [dark,setDark] = useState(true)
  const T = mkT(dark)
  const [view,setView] = useState("myday")
  const [tasks,setTasks] = useState([])
  const [matrix,setMatrix] = useState([])
  const [canvasNotes,setCanvasNotes] = useState([])
  const [notes,setNotes] = useState([])
  const [cats,setCats] = useState(DEFAULT_CATS)
  const [loading,setLoading] = useState(true)
  const [toast,setToast] = useState(null)
  const [sideOpen,setSideOpen] = useState(true)
  const [selTask,setSelTask] = useState(null)
  const [input,setInput] = useState("")
  const [xp,setXp] = useState(0)
  const [streak] = useState(7)
  const [newAnim,setNewAnim] = useState(null)
  const [showSearch,setShowSearch] = useState(false)
  const [search,setSearch] = useState("")
  const [cmdOpen,setCmdOpen] = useState(false)
  const [pomSecs,setPomSecs] = useState(25*60)
  const [pomRun,setPomRun] = useState(false)
  const [syncIndicator,setSyncIndicator] = useState(false)
  const pomRef = useRef(null)
  const inputRef = useRef(null)

  const showToast = useCallback((msg,type="info")=>{
    setToast({msg,type}); setTimeout(()=>setToast(null),3000)
  },[])

  // ── Load all data on mount ─────────────────────────────────
  useEffect(()=>{
    async function load() {
      setLoading(true)
      const uid = user.id
      const [tRes,mRes,cRes,nRes,catRes] = await Promise.all([
        supabase.from("tasks").select("*").eq("user_id",uid).order("position").order("created_at"),
        supabase.from("matrix_notes").select("*").eq("user_id",uid).order("created_at"),
        supabase.from("canvas_notes").select("*").eq("user_id",uid).order("created_at"),
        supabase.from("notes").select("*").eq("user_id",uid).order("pinned",{ascending:false}).order("updated_at",{ascending:false}),
        supabase.from("categories").select("*").eq("user_id",uid).order("created_at"),
      ])
      if (tRes.data) setTasks(tRes.data.map(normalizeTask))
      if (mRes.data) setMatrix(mRes.data.map(r=>({...r,q:r.quadrant})))
      if (cRes.data) setCanvasNotes(cRes.data)
      if (nRes.data) setNotes(nRes.data)
      if (catRes.data?.length>0) {
        const obj={}; catRes.data.forEach(c=>{ obj[c.name]=c.color }); setCats(obj)
      }
      setLoading(false)
    }
    load()
  },[user.id])

  // ── Real-time cross-device sync ────────────────────────────
  useEffect(()=>{
    const channel = supabase.channel(`user-${user.id}`)
      .on("postgres_changes",{event:"*",schema:"public",table:"tasks",filter:`user_id=eq.${user.id}`},(payload)=>{
        setSyncIndicator(true); setTimeout(()=>setSyncIndicator(false),1500)
        if (payload.eventType==="INSERT") setTasks(ts=>{ if(ts.find(t=>t.id===payload.new.id)) return ts; return [normalizeTask(payload.new),...ts] })
        if (payload.eventType==="UPDATE") setTasks(ts=>ts.map(t=>t.id===payload.new.id?normalizeTask(payload.new):t))
        if (payload.eventType==="DELETE") setTasks(ts=>ts.filter(t=>t.id!==payload.old.id))
      })
      .on("postgres_changes",{event:"*",schema:"public",table:"matrix_notes",filter:`user_id=eq.${user.id}`},(payload)=>{
        if (payload.eventType==="INSERT") setMatrix(ms=>{ if(ms.find(m=>m.id===payload.new.id)) return ms; return [...ms,{...payload.new,q:payload.new.quadrant}] })
        if (payload.eventType==="UPDATE") setMatrix(ms=>ms.map(m=>m.id===payload.new.id?{...payload.new,q:payload.new.quadrant}:m))
        if (payload.eventType==="DELETE") setMatrix(ms=>ms.filter(m=>m.id!==payload.old.id))
      })
      .on("postgres_changes",{event:"*",schema:"public",table:"canvas_notes",filter:`user_id=eq.${user.id}`},(payload)=>{
        if (payload.eventType==="INSERT") setCanvasNotes(ns=>{ if(ns.find(n=>n.id===payload.new.id)) return ns; return [...ns,payload.new] })
        if (payload.eventType==="UPDATE") setCanvasNotes(ns=>ns.map(n=>n.id===payload.new.id?payload.new:n))
        if (payload.eventType==="DELETE") setCanvasNotes(ns=>ns.filter(n=>n.id!==payload.old.id))
      })
      .on("postgres_changes",{event:"*",schema:"public",table:"notes",filter:`user_id=eq.${user.id}`},(payload)=>{
        if (payload.eventType==="INSERT") setNotes(ns=>{ if(ns.find(n=>n.id===payload.new.id)) return ns; return [payload.new,...ns] })
        if (payload.eventType==="UPDATE") setNotes(ns=>ns.map(n=>n.id===payload.new.id?payload.new:n))
        if (payload.eventType==="DELETE") setNotes(ns=>ns.filter(n=>n.id!==payload.old.id))
      })
      .subscribe()
    return ()=>supabase.removeChannel(channel)
  },[user.id])

  // ── Pomodoro ───────────────────────────────────────────────
  useEffect(()=>{
    if (pomRun) pomRef.current=setInterval(()=>setPomSecs(t=>{if(t<=1){clearInterval(pomRef.current);setPomRun(false);return 25*60;}return t-1;}),1000)
    else clearInterval(pomRef.current)
    return ()=>clearInterval(pomRef.current)
  },[pomRun])

  // ── Keyboard shortcuts ─────────────────────────────────────
  useEffect(()=>{
    const fn=e=>{
      if((e.metaKey||e.ctrlKey)&&e.key==="k"){e.preventDefault();setCmdOpen(c=>!c)}
      if(e.key==="Escape"){setCmdOpen(false);setShowSearch(false)}
    }
    window.addEventListener("keydown",fn); return ()=>window.removeEventListener("keydown",fn)
  },[])

  // ── CRUD operations (optimistic + Supabase persist) ────────
  const addTask = useCallback(async ()=>{
    if (!input.trim()) return
    const {title,due:parsed}=parseNL(input)
    const due=parsed||(view==="myday"?tod():null)
    const id=crypto.randomUUID()
    const t={id,title,done:false,priority:"medium",tag:"work",due,starred:view==="myday",notes:"",color:null,subtasks:[],recurring:null,position:0}
    setTasks(ts=>[t,...ts]); setInput(""); setXp(x=>x+10); setNewAnim(id); setTimeout(()=>setNewAnim(null),600)
    const {error}=await supabase.from("tasks").insert({...t,user_id:user.id,subtasks:JSON.stringify(t.subtasks)})
    if (error) { setTasks(ts=>ts.filter(x=>x.id!==id)); showToast("Failed to save task","error") }
  },[input,view,user.id,showToast])

  const toggleTask = async id=>{
    const task=tasks.find(t=>t.id===id); if(!task) return
    const done=!task.done
    setTasks(ts=>ts.map(t=>t.id===id?{...t,done}:t))
    if (done) setXp(x=>x+20)
    const {error}=await supabase.from("tasks").update({done,updated_at:new Date().toISOString()}).eq("id",id).eq("user_id",user.id)
    if (error) { setTasks(ts=>ts.map(t=>t.id===id?{...t,done:!done}:t)); showToast("Sync error","error") }
  }

  const deleteTask = async id=>{
    setTasks(ts=>ts.filter(t=>t.id!==id))
    if (selTask?.id===id) setSelTask(null)
    await supabase.from("tasks").delete().eq("id",id).eq("user_id",user.id)
  }

  const updateTask = useCallback(async (id,patch)=>{
    setTasks(ts=>ts.map(t=>t.id===id?{...t,...patch}:t))
    if (selTask?.id===id) setSelTask(s=>({...s,...patch}))
    const dbPatch={...patch,updated_at:new Date().toISOString()}
    if (patch.subtasks) dbPatch.subtasks=JSON.stringify(patch.subtasks)
    await supabase.from("tasks").update(dbPatch).eq("id",id).eq("user_id",user.id)
  },[selTask?.id])

  const reorderTasks = async (fromId,toId)=>{
    setTasks(prev=>{
      const arr=[...prev]
      const fi=arr.findIndex(t=>t.id===fromId), ti=arr.findIndex(t=>t.id===toId)
      if(fi<0||ti<0) return prev
      const [item]=arr.splice(fi,1); arr.splice(ti,0,item)
      arr.forEach((t,i)=>{
        if (t.position!==i) supabase.from("tasks").update({position:i}).eq("id",t.id).eq("user_id",user.id)
      })
      return arr.map((t,i)=>({...t,position:i}))
    })
  }

  const signOut = ()=>supabase.auth.signOut()

  const todStr=tod()
  const myDay=tasks.filter(t=>t.due===todStr||t.starred)
  const upcoming=tasks.filter(t=>t.due&&t.due>todStr)
  const completed=tasks.filter(t=>t.done)
  const level=Math.floor(xp/100)+1, xpLvl=xp%100
  const pmm=String(Math.floor(pomSecs/60)).padStart(2,"0"), pms=String(pomSecs%60).padStart(2,"0")

  const sortByDate=arr=>[...arr].sort((a,b)=>{
    if(a.done!==b.done) return a.done?1:-1
    if(!a.due&&!b.due) return 0; if(!a.due) return 1; if(!b.due) return -1
    return a.due.localeCompare(b.due)
  })

  const getViewTasks=()=>{
    let base=view==="myday"?myDay:view==="upcoming"?upcoming:view==="completed"?completed:tasks
    if(search) base=base.filter(t=>t.title.toLowerCase().includes(search.toLowerCase()))
    return sortByDate(base)
  }

  const navItems=[
    {id:"myday",label:"My Day",icon:"sun",badge:myDay.filter(t=>!t.done).length},
    {id:"upcoming",label:"Upcoming",icon:"cal",badge:upcoming.filter(t=>!t.done).length},
    {id:"all",label:"All Tasks",icon:"layers",badge:null},
    {id:"completed",label:"Completed",icon:"done",badge:completed.length},
    {id:"matrix",label:"Priority Matrix",icon:"grid",badge:null},
    {id:"notes",label:"Notes",icon:"note",badge:null},
    {id:"analytics",label:"Analytics",icon:"bar",badge:null},
    {id:"settings",label:"Settings",icon:"cog",badge:null},
  ]

  if (loading) return (
    <div style={{minHeight:"100vh",background:"#0c0e16",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",gap:16}}>
      <FontLink/>
      <div style={{width:36,height:36,borderRadius:11,background:"linear-gradient(135deg,#c084fc,#818cf8)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 14px rgba(192,132,252,.5)"}}>
        <Ico n="zap" s={18} c="#fff"/>
      </div>
      <div className="spin" style={{width:28,height:28,borderRadius:"50%",border:"3px solid rgba(192,132,252,.2)",borderTopColor:"#c084fc"}}/>
      <div style={{color:"#7a85a3",fontSize:13}}>Loading your workspace…</div>
    </div>
  )

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:T.bg,color:T.text,height:"100vh",display:"flex",overflow:"hidden",transition:"background .3s,color .3s"}}>
      <FontLink/>
      {toast && <Toast msg={toast.msg} type={toast.type} T={T}/>}
      {cmdOpen && <CmdPalette T={T} tasks={tasks} onClose={()=>setCmdOpen(false)} onGo={v=>{setView(v);setCmdOpen(false)}} onAdd={t=>{setInput(t);setCmdOpen(false);setTimeout(()=>inputRef.current?.focus(),80)}}/>}

      {/* Sidebar */}
      <aside style={{width:sideOpen?224:60,transition:"width .3s cubic-bezier(.4,0,.2,1)",background:T.sidebar,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",overflow:"hidden",flexShrink:0,zIndex:30}}>
        <div style={{padding:"16px 14px",display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:30,height:30,borderRadius:9,background:"linear-gradient(135deg,#c084fc,#818cf8)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 3px 12px rgba(192,132,252,.45)"}}>
            <Ico n="zap" s={14} c="#fff"/>
          </div>
          {sideOpen&&<span style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,letterSpacing:"-.4px",background:"linear-gradient(90deg,#c084fc,#818cf8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",whiteSpace:"nowrap",flex:1}}>FlowSpace</span>}
          {sideOpen&&syncIndicator&&<div title="Syncing…" style={{width:7,height:7,borderRadius:"50%",background:T.success,flexShrink:0,animation:"pulse 1s infinite"}}/>}
        </div>

        {sideOpen&&(
          <div style={{padding:"0 12px 12px"}}>
            <div style={{background:T.surface2,borderRadius:9,padding:"8px 10px",border:`1px solid ${T.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:11,color:T.textMuted,fontWeight:600}}>LVL {level}</span>
                <span style={{fontSize:11,color:T.accent,fontWeight:700}}>{xp} XP</span>
              </div>
              <div style={{height:4,background:T.border,borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${xpLvl}%`,background:"linear-gradient(90deg,#c084fc,#818cf8)",borderRadius:2,transition:"width .5s ease"}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                <span style={{fontSize:10,color:T.textMuted}}>🔥 {streak}-day streak</span>
                <span style={{fontSize:10,color:T.textMuted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:100}}>{user.email?.split("@")[0]}</span>
              </div>
            </div>
          </div>
        )}

        <nav style={{flex:1,padding:"0 6px",overflowY:"auto",overflowX:"hidden"}}>
          {navItems.map(item=>(
            <button key={item.id} onClick={()=>setView(item.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:sideOpen?"8px 10px":"8px 0",justifyContent:sideOpen?"flex-start":"center",borderRadius:9,border:"none",cursor:"pointer",marginBottom:1,transition:"all .15s",background:view===item.id?T.accentGlow:"transparent",color:view===item.id?T.accent:T.textMuted,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:view===item.id?600:400}}>
              <Ico n={item.icon} s={16} c={view===item.id?T.accent:T.textMuted}/>
              {sideOpen&&<span style={{flex:1,textAlign:"left",whiteSpace:"nowrap"}}>{item.label}</span>}
              {sideOpen&&item.badge>0&&<span style={{background:view===item.id?T.accent:T.surface3,color:view===item.id?"#fff":T.textMuted,fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:10}}>{item.badge}</span>}
            </button>
          ))}
        </nav>

        {sideOpen&&(
          <div style={{padding:"10px 12px"}}>
            <div style={{background:T.surface2,borderRadius:11,padding:12,border:`1px solid ${T.border}`,...(pomRun?{animation:"glow 2s infinite"}:{})}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:10,color:T.textMuted,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase"}}>Pomodoro</span>
                <Ico n="clock" s={12} c={pomRun?T.accent:T.textMuted}/>
              </div>
              <div style={{fontSize:26,fontFamily:"'Sora',sans-serif",fontWeight:700,color:pomRun?T.accent:T.text,letterSpacing:"-1px",textAlign:"center",marginBottom:8}}>{pmm}:{pms}</div>
              <button onClick={()=>setPomRun(r=>!r)} style={{width:"100%",padding:"6px",borderRadius:8,border:"none",cursor:"pointer",background:pomRun?T.danger:"linear-gradient(135deg,#c084fc,#818cf8)",color:"#fff",fontSize:11,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>
                {pomRun?"⏸ Pause":"▶ Focus"}
              </button>
            </div>
          </div>
        )}

        <div style={{padding:"10px 6px",borderTop:`1px solid ${T.border}`,display:"flex",gap:4,justifyContent:"center"}}>
          <SB T={T} onClick={()=>setShowSearch(s=>!s)}><Ico n="search" s={14}/></SB>
          <SB T={T} onClick={()=>setDark(d=>!d)}><Ico n={dark?"sun":"moon"} s={14}/></SB>
          <SB T={T} onClick={signOut} title="Sign out"><Ico n="logout" s={14}/></SB>
          <SB T={T} onClick={()=>setSideOpen(s=>!s)}><Ico n="menu" s={14}/></SB>
        </div>
      </aside>

      {/* Main */}
      <main style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{background:T.surface2,borderBottom:`1px solid ${T.border}`,padding:"5px 20px",display:"flex",alignItems:"center",gap:16,flexShrink:0}}>
          <button onClick={()=>setCmdOpen(true)} style={{display:"flex",alignItems:"center",gap:5,background:"none",border:"none",cursor:"pointer",color:T.textMuted,fontSize:11,fontFamily:"'DM Sans',sans-serif"}}>
            <span style={{background:T.surface3,border:`1px solid ${T.border}`,padding:"1px 6px",borderRadius:4,fontSize:10,fontWeight:600}}>⌘K</span>
            <span>Command Palette</span>
          </button>
          {syncIndicator&&<div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:T.success}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:T.success}}/>Syncing…
          </div>}
          <span style={{marginLeft:"auto",fontSize:11,color:T.textMuted}}>{tasks.filter(t=>!t.done).length} tasks remaining</span>
        </div>

        {showSearch&&(
          <div style={{padding:"8px 18px",borderBottom:`1px solid ${T.border}`,background:T.surface,flexShrink:0,animation:"slideIn .2s ease"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,background:T.surface2,borderRadius:10,padding:"0 12px",border:`1px solid ${T.border}`}}>
              <Ico n="search" s={15} c={T.textMuted}/>
              <input autoFocus value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Escape"&&setShowSearch(false)} placeholder="Search tasks…" style={{flex:1,background:"none",border:"none",outline:"none",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:13,padding:"9px 0"}}/>
              {search&&<button onClick={()=>setSearch("")} style={{background:"none",border:"none",cursor:"pointer",color:T.textMuted}}><Ico n="x" s={13}/></button>}
            </div>
          </div>
        )}

        <div style={{flex:1,overflow:"hidden",display:"flex"}}>
          {view==="matrix"&&<MatrixView T={T} matrix={matrix} setMatrix={setMatrix} canvasNotes={canvasNotes} setCanvasNotes={setCanvasNotes} setTasks={setTasks} cats={cats} userId={user.id}/>}
          {view==="notes"&&<NotesView T={T} notes={notes} setNotes={setNotes} userId={user.id}/>}
          {view==="analytics"&&<AnalyticsView T={T} tasks={tasks} xp={xp} level={level} streak={streak}/>}
          {view==="settings"&&<SettingsView T={T} dark={dark} setDark={setDark} cats={cats} setCats={setCats} userId={user.id} userEmail={user.email} onSignOut={signOut}/>}
          {["myday","upcoming","all","completed"].includes(view)&&(
            <TaskPanel T={T} tasks={getViewTasks()} view={view} input={input} setInput={setInput} inputRef={inputRef} addTask={addTask} toggleTask={toggleTask} deleteTask={deleteTask} updateTask={updateTask} reorderTasks={reorderTasks} selTask={selTask} setSelTask={setSelTask} newAnim={newAnim} cats={cats}/>
          )}
        </div>
      </main>

      {["myday","upcoming","all"].includes(view)&&(
        <button onClick={()=>inputRef.current?.focus()} style={{position:"fixed",bottom:26,right:26,width:50,height:50,borderRadius:"50%",border:"none",cursor:"pointer",background:"linear-gradient(135deg,#c084fc,#818cf8)",color:"#fff",boxShadow:"0 6px 20px rgba(192,132,252,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50,transition:"transform .15s"}}
          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"}
          onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
          <Ico n="plus" s={22} c="#fff"/>
        </button>
      )}
    </div>
  )
}

// ─── Helper: normalize DB row → app format ────────────────────────────────────
function normalizeTask(row) {
  return {
    ...row,
    subtasks: typeof row.subtasks==="string" ? JSON.parse(row.subtasks||"[]") : (row.subtasks||[])
  }
}

const SB = ({onClick,T,children,title})=>(
  <button onClick={onClick} title={title} style={{width:30,height:30,borderRadius:7,border:"none",cursor:"pointer",background:"transparent",color:T.textMuted,display:"flex",alignItems:"center",justifyContent:"center",transition:"background .15s"}}
    onMouseEnter={e=>e.currentTarget.style.background=T.surface3}
    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
    {children}
  </button>
)

// ─── Command Palette ──────────────────────────────────────────────────────────
function CmdPalette({T,tasks,onClose,onGo,onAdd}) {
  const [q,setQ]=useState("")
  const pages=["myday","upcoming","all","completed","matrix","notes","analytics","settings"]
  const ft=tasks.filter(t=>!t.done&&q&&t.title.toLowerCase().includes(q.toLowerCase())).slice(0,4)
  const fp=pages.filter(p=>p.includes(q.toLowerCase()))
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:1000,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:110}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{width:500,background:T.surface,border:`1px solid ${T.accent}44`,borderRadius:16,overflow:"hidden",boxShadow:"0 24px 60px rgba(0,0,0,.5)",animation:"slideIn .2s ease"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"13px 16px",borderBottom:`1px solid ${T.border}`}}>
          <Ico n="search" s={16} c={T.textMuted}/>
          <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search tasks, navigate…" style={{flex:1,background:"none",border:"none",outline:"none",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:15}} onKeyDown={e=>e.key==="Escape"&&onClose()}/>
          <kbd style={{fontSize:10,color:T.textMuted,background:T.surface2,padding:"2px 6px",borderRadius:4,border:`1px solid ${T.border}`}}>ESC</kbd>
        </div>
        <div style={{maxHeight:300,overflowY:"auto"}}>
          {fp.length>0&&<CS label="Navigate">{fp.slice(0,4).map(p=><CR key={p} icon="arr" label={`Go to ${p}`} T={T} onClick={()=>onGo(p)}/>)}</CS>}
          {ft.length>0&&<CS label="Tasks">{ft.map(t=><CR key={t.id} icon="check" label={t.title} sub={t.due?fmtDate(t.due):""} T={T} onClick={onClose}/>)}</CS>}
          {q&&<CS label="Create"><CR icon="plus" label={`Add task: "${q}"`} T={T} onClick={()=>onAdd(q)}/></CS>}
          {!q&&<CS label="Quick Nav">{["myday","matrix","analytics","notes"].map(p=><CR key={p} icon="arr" label={`Go to ${p}`} T={T} onClick={()=>onGo(p)}/>)}</CS>}
        </div>
      </div>
    </div>
  )
}
const CS=({label,children})=><div><div style={{padding:"7px 16px 3px",fontSize:10,fontWeight:700,letterSpacing:".6px",textTransform:"uppercase",opacity:.5}}>{label}</div>{children}</div>
const CR=({icon,label,sub,T,onClick})=>(
  <div onClick={onClick} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 16px",cursor:"pointer",transition:"background .1s"}}
    onMouseEnter={e=>e.currentTarget.style.background=T.accentGlow}
    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
    <Ico n={icon} s={14} c={T.accent}/><span style={{flex:1,fontSize:13}}>{label}</span>
    {sub&&<span style={{fontSize:11,opacity:.5}}>{sub}</span>}
  </div>
)

// ─── Task Panel ───────────────────────────────────────────────────────────────
function TaskPanel({T,tasks,view,input,setInput,inputRef,addTask,toggleTask,deleteTask,updateTask,reorderTasks,selTask,setSelTask,newAnim,cats}) {
  const [filter,setFilter]=useState("all")
  const [dragId,setDragId]=useState(null)
  const [dropId,setDropId]=useState(null)
  const labels={myday:"My Day",upcoming:"Upcoming",all:"All Tasks",completed:"Completed"}
  const show=filter==="active"?tasks.filter(t=>!t.done):filter==="done"?tasks.filter(t=>t.done):tasks
  const handleDrop=(fromId,toId)=>{ if(fromId!==toId) reorderTasks(fromId,toId); setDragId(null);setDropId(null) }
  return (
    <div style={{flex:1,display:"flex",overflow:"hidden"}}>
      <div style={{flex:1,overflowY:"auto",padding:"22px 26px"}}>
        <div style={{marginBottom:18}}>
          {view==="myday"&&<div style={{fontSize:12,color:T.textMuted,fontWeight:500,marginBottom:3}}>{new Date().getHours()<12?"Good morning 🌤":new Date().getHours()<17?"Keep it up 💪":"Good evening 🌙"}</div>}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
            <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:700,letterSpacing:"-.5px"}}>{labels[view]}</h1>
            <span style={{fontSize:11,color:T.textMuted}}>Sorted by date · ⠿ drag to reorder</span>
          </div>
          <div style={{fontSize:12,color:T.textMuted,marginTop:2}}>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}{view==="myday"&&` · ${tasks.filter(t=>!t.done).length} remaining`}</div>
        </div>
        {view!=="completed"&&(
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            <div style={{flex:1,display:"flex",alignItems:"center",gap:9,background:T.surface,border:`1px solid ${T.border}`,borderRadius:11,padding:"0 12px"}}>
              <Ico n="plus" s={15} c={T.textMuted}/>
              <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTask()} placeholder={view==="myday"?'Add to My Day… "Meet client May 26 at 4pm"':'Add task… "Call dentist tomorrow"'} style={{flex:1,background:"none",border:"none",outline:"none",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:13,padding:"12px 0"}}/>
            </div>
            <button onClick={addTask} style={{padding:"0 18px",borderRadius:11,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#c084fc,#818cf8)",color:"#fff",fontWeight:700,fontSize:13,fontFamily:"'DM Sans',sans-serif",boxShadow:"0 3px 12px rgba(192,132,252,.35)"}}>Add</button>
          </div>
        )}
        <div style={{display:"flex",gap:5,marginBottom:12}}>
          {["all","active","done"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:"4px 13px",borderRadius:20,border:`1px solid ${filter===f?T.accent:T.border}`,background:filter===f?T.accent+"22":"transparent",color:filter===f?T.accent:T.textMuted,cursor:"pointer",fontSize:11,fontWeight:filter===f?700:400,fontFamily:"'DM Sans',sans-serif",transition:"all .15s"}}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:4}}>
          {show.filter(t=>!t.done).map(task=>(
            <TCard key={task.id} task={task} T={T} cats={cats} onToggle={toggleTask} onDelete={deleteTask} onSel={setSelTask} sel={selTask?.id===task.id} entering={newAnim===task.id} dragging={dragId===task.id} dropTarget={dropId===task.id}
              onDragStart={()=>setDragId(task.id)} onDragOver={()=>setDropId(task.id)} onDrop={()=>handleDrop(dragId,task.id)} onDragEnd={()=>{setDragId(null);setDropId(null)}}/>
          ))}
          {show.filter(t=>t.done).length>0&&<>
            <div style={{fontSize:10,color:T.textMuted,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",padding:"10px 2px 4px",display:"flex",alignItems:"center",gap:5}}>
              <Ico n="check" s={11} c={T.textMuted}/> Completed · {show.filter(t=>t.done).length}
            </div>
            {show.filter(t=>t.done).map(task=>(
              <TCard key={task.id} task={task} T={T} cats={cats} onToggle={toggleTask} onDelete={deleteTask} onSel={setSelTask} sel={selTask?.id===task.id}/>
            ))}
          </>}
          {show.length===0&&(
            <div style={{textAlign:"center",padding:"50px 20px",color:T.textMuted}}>
              <div style={{fontSize:36,marginBottom:10}}>{view==="completed"?"🏆":"✨"}</div>
              <div style={{fontWeight:600}}>{view==="completed"?"Nothing completed yet":"All clear!"}</div>
              <div style={{fontSize:12,marginTop:4}}>Add a task to get started</div>
            </div>
          )}
        </div>
      </div>
      {selTask&&<TDetail task={selTask} T={T} cats={cats} onUpdate={updateTask} onDelete={deleteTask} onClose={()=>setSelTask(null)}/>}
    </div>
  )
}

function TCard({task,T,cats,onToggle,onDelete,onSel,sel,entering,dragging,dropTarget,onDragStart,onDragOver,onDrop,onDragEnd}) {
  const [hov,setHov]=useState(false)
  const ov=task.due&&task.due<tod()&&!task.done
  const catColor=cats[task.tag]||"#6b7280"
  return (
    <div className={entering?"te":""} draggable onDragStart={e=>{e.dataTransfer.setData("tid",task.id);onDragStart?.()}} onDragOver={e=>{e.preventDefault();onDragOver?.()}} onDrop={e=>{e.preventDefault();onDrop?.()}} onDragEnd={onDragEnd}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={()=>onSel(task)}
      style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",borderRadius:11,background:sel?T.accentGlow:hov?"rgba(255,255,255,0.04)":"transparent",border:`1px solid ${dropTarget?T.accent:sel?T.accent+"44":T.border}`,cursor:"pointer",transition:"all .12s",position:"relative",opacity:task.done?.5:dragging?.4:1,transform:dragging?"scale(.98)":"scale(1)"}}>
      {task.color&&<div style={{position:"absolute",left:0,top:8,bottom:8,width:3,borderRadius:2,background:task.color}}/>}
      <div style={{color:T.textMuted,opacity:hov?.6:0,transition:"opacity .15s",flexShrink:0,marginTop:1,cursor:"grab"}}><Ico n="grip" s={14} c={T.textMuted}/></div>
      <button onClick={e=>{e.stopPropagation();onToggle(task.id)}} style={{width:19,height:19,borderRadius:5,border:`2px solid ${task.done?T.success:PRIORITY_COLOR[task.priority]||T.border}`,background:task.done?T.success:"transparent",cursor:"pointer",flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
        {task.done&&<Ico n="check" s={10} c="#fff" st={{animation:"checkB .25s ease"}}/>}
      </button>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          <span style={{fontSize:13,fontWeight:500,color:task.done?T.textMuted:T.text,textDecoration:task.done?"line-through":"none"}}>{task.title}</span>
          {task.starred&&<Ico n="star" s={11} c="#f59e0b" st={{fill:"#f59e0b",flexShrink:0}}/>}
          {task.recurring&&<Ico n="repeat" s={11} c={T.textMuted} st={{flexShrink:0}}/>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5,marginTop:3,flexWrap:"wrap"}}>
          {task.due&&<span style={{fontSize:11,color:ov?T.danger:T.textMuted,fontWeight:ov?700:400}}>{fmtDate(task.due)}</span>}
          {task.tag&&<span style={{fontSize:10,padding:"1px 7px",borderRadius:20,background:catColor+"22",color:catColor,fontWeight:600}}>{task.tag}</span>}
          {task.subtasks?.length>0&&<span style={{fontSize:10,color:T.textMuted}}>{task.subtasks.filter(s=>s.done).length}/{task.subtasks.length}</span>}
        </div>
      </div>
      <div style={{width:6,height:6,borderRadius:"50%",background:PRIORITY_COLOR[task.priority]||T.border,flexShrink:0,marginTop:6}}/>
      {hov&&<button onClick={e=>{e.stopPropagation();onDelete(task.id)}} style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",width:24,height:24,borderRadius:6,border:"none",cursor:"pointer",background:T.surface2,color:T.textMuted,display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn .1s"}}><Ico n="trash" s={11}/></button>}
    </div>
  )
}

function TDetail({task,T,cats,onUpdate,onDelete,onClose}) {
  const [nts,setNts]=useState(task.notes||"")
  const [ns,setNs]=useState("")
  useEffect(()=>setNts(task.notes||""),[task.id])
  const addSub=()=>{ if(!ns.trim()) return; onUpdate(task.id,{subtasks:[...(task.subtasks||[]),{id:crypto.randomUUID(),title:ns.trim(),done:false}]}); setNs("") }
  const COLS=[null,"#ef4444","#f97316","#f59e0b","#22c55e","#3b82f6","#a855f7"]
  return (
    <div style={{width:280,borderLeft:`1px solid ${T.border}`,background:T.surface,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:14,animation:"slideIn .2s ease",flexShrink:0}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <h3 style={{fontFamily:"'Sora',sans-serif",fontSize:13,fontWeight:600,flex:1,lineHeight:1.4}}>{task.title}</h3>
        <button onClick={onClose} style={{width:24,height:24,borderRadius:6,border:"none",cursor:"pointer",background:T.surface2,color:T.textMuted,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginLeft:6}}><Ico n="x" s={13}/></button>
      </div>
      <DL label="Color" T={T}><div style={{display:"flex",gap:5,marginTop:5,flexWrap:"wrap"}}>{COLS.map(c=><div key={c||"none"} onClick={()=>onUpdate(task.id,{color:c})} style={{width:18,height:18,borderRadius:4,background:c||T.surface3,border:`2px solid ${task.color===c?T.text:"transparent"}`,cursor:"pointer"}}/>)}</div></DL>
      <DL label="Priority" T={T}><div style={{display:"flex",gap:4,marginTop:5}}>{["low","medium","high"].map(p=><button key={p} onClick={()=>onUpdate(task.id,{priority:p})} style={{flex:1,padding:"5px 0",borderRadius:6,border:`1px solid ${task.priority===p?PRIORITY_COLOR[p]:T.border}`,background:task.priority===p?PRIORITY_COLOR[p]+"22":"transparent",color:task.priority===p?PRIORITY_COLOR[p]:T.textMuted,cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"'DM Sans',sans-serif",textTransform:"capitalize"}}>{p}</button>)}</div></DL>
      <DL label="Due Date" T={T}><input type="date" value={task.due||""} onChange={e=>onUpdate(task.id,{due:e.target.value})} style={{marginTop:5,width:"100%",padding:"7px 9px",borderRadius:7,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none"}}/></DL>
      <DL label="Recurring" T={T}><select value={task.recurring||""} onChange={e=>onUpdate(task.id,{recurring:e.target.value||null})} style={{marginTop:5,width:"100%",padding:"7px 9px",borderRadius:7,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none",cursor:"pointer"}}><option value="">No repeat</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></DL>
      <DL label="Category" T={T}><div style={{display:"flex",gap:4,marginTop:5,flexWrap:"wrap"}}>{Object.entries(cats).map(([tag,clr])=><button key={tag} onClick={()=>onUpdate(task.id,{tag})} style={{padding:"3px 9px",borderRadius:20,border:`1px solid ${task.tag===tag?clr:T.border}`,background:task.tag===tag?clr+"22":"transparent",color:task.tag===tag?clr:T.textMuted,cursor:"pointer",fontSize:10,fontWeight:task.tag===tag?700:400,fontFamily:"'DM Sans',sans-serif"}}>{tag}</button>)}</div></DL>
      <DL label="Subtasks" T={T}>
        <div style={{display:"flex",flexDirection:"column",gap:4,marginTop:5}}>
          {(task.subtasks||[]).map(sub=>(
            <div key={sub.id} style={{display:"flex",alignItems:"center",gap:7}}>
              <button onClick={()=>onUpdate(task.id,{subtasks:task.subtasks.map(s=>s.id===sub.id?{...s,done:!s.done}:s)})} style={{width:15,height:15,borderRadius:4,border:`1.5px solid ${sub.done?T.success:T.border}`,background:sub.done?T.success:"transparent",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>{sub.done&&<Ico n="check" s={8} c="#fff"/>}</button>
              <span style={{fontSize:12,color:sub.done?T.textMuted:T.text,textDecoration:sub.done?"line-through":"none"}}>{sub.title}</span>
            </div>
          ))}
          <div style={{display:"flex",gap:5,marginTop:3}}>
            <input value={ns} onChange={e=>setNs(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addSub()} placeholder="Add step…" style={{flex:1,padding:"5px 7px",borderRadius:6,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:11,outline:"none"}}/>
            <button onClick={addSub} style={{padding:"5px 9px",borderRadius:6,border:"none",cursor:"pointer",background:T.accentGlow,color:T.accent,fontSize:12,fontWeight:700}}>+</button>
          </div>
        </div>
      </DL>
      <DL label="Notes" T={T}><textarea value={nts} onChange={e=>{setNts(e.target.value);onUpdate(task.id,{notes:e.target.value})}} placeholder="Notes, links, markdown…" style={{marginTop:5,width:"100%",minHeight:80,padding:"7px 9px",borderRadius:7,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none",resize:"vertical",lineHeight:1.6}}/></DL>
      <div style={{display:"flex",gap:6}}>
        <button onClick={()=>onUpdate(task.id,{starred:!task.starred})} style={{flex:1,padding:"7px",borderRadius:8,border:`1px solid ${task.starred?"#f59e0b":T.border}`,background:task.starred?"#f59e0b22":"transparent",color:task.starred?"#f59e0b":T.textMuted,cursor:"pointer",fontSize:11,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
          <Ico n="star" s={12} c={task.starred?"#f59e0b":undefined} st={task.starred?{fill:"#f59e0b"}:{}}/>Star
        </button>
        <button onClick={()=>onDelete(task.id)} style={{flex:1,padding:"7px",borderRadius:8,border:`1px solid ${T.danger}22`,background:T.danger+"11",color:T.danger,cursor:"pointer",fontSize:11,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
          <Ico n="trash" s={12} c={T.danger}/>Delete
        </button>
      </div>
    </div>
  )
}
const DL=({label,T,children})=><div><span style={{fontSize:10,fontWeight:700,letterSpacing:".6px",textTransform:"uppercase",color:T.textMuted}}>{label}</span>{children}</div>

// ─── Matrix View ──────────────────────────────────────────────────────────────
function MatrixView({T,matrix,setMatrix,canvasNotes,setCanvasNotes,setTasks,userId}) {
  const [tab,setTab]=useState("matrix")
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"14px 22px 0",borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
          <div>
            <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:19,fontWeight:700,letterSpacing:"-.4px"}}>{tab==="matrix"?"Priority Matrix":"Freeform Canvas"}</h1>
            <p style={{fontSize:11,color:T.textMuted,marginTop:1}}>{tab==="matrix"?"Eisenhower Matrix · drag between quadrants":"Double-click to create · drag freely · hover for options"}</p>
          </div>
          <div style={{display:"flex",gap:4,paddingBottom:2}}>
            {["matrix","canvas"].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{padding:"5px 14px",borderRadius:"8px 8px 0 0",border:`1px solid ${T.border}`,borderBottom:"none",cursor:"pointer",background:tab===t?T.surface:T.sidebar,color:tab===t?T.accent:T.textMuted,fontSize:12,fontWeight:tab===t?700:400,fontFamily:"'DM Sans',sans-serif"}}>
                {t==="matrix"?"⊞ Eisenhower":"✦ Freeform"}
              </button>
            ))}
          </div>
        </div>
      </div>
      {tab==="matrix"
        ?<EisenhowerMatrix T={T} notes={matrix} setNotes={setMatrix} setTasks={setTasks} userId={userId}/>
        :<FreeformCanvas T={T} notes={canvasNotes} setNotes={setCanvasNotes} setTasks={setTasks} userId={userId}/>}
    </div>
  )
}

function EisenhowerMatrix({T,notes,setNotes,setTasks,userId}) {
  const [addingIn,setAddingIn]=useState(null)
  const [newText,setNewText]=useState("")
  const [dragOver,setDragOver]=useState(null)
  const [editId,setEditId]=useState(null)
  const QUADS=[{id:"q1",label:"Urgent + Important",sub:"Do First",color:"#ef4444",icon:"🔥"},{id:"q2",label:"Not Urgent + Important",sub:"Schedule",color:"#3b82f6",icon:"📌"},{id:"q3",label:"Urgent + Not Important",sub:"Delegate",color:"#f59e0b",icon:"📋"},{id:"q4",label:"Not Urgent + Not Important",sub:"Eliminate",color:"#6b7280",icon:"🗑️"}]

  const addNote=async qid=>{
    if (!newText.trim()) return
    const id=crypto.randomUUID()
    const note={id,q:qid,quadrant:qid,text:newText.trim(),color:NOTE_COLS[Math.floor(Math.random()*NOTE_COLS.length)]}
    setNotes(n=>[...n,note]); setNewText(""); setAddingIn(null)
    await supabase.from("matrix_notes").insert({id,user_id:userId,quadrant:qid,text:note.text,color:note.color})
  }

  const moveNote=async (id,newQ)=>{
    setNotes(n=>n.map(x=>x.id===id?{...x,q:newQ,quadrant:newQ}:x))
    await supabase.from("matrix_notes").update({quadrant:newQ}).eq("id",id)
  }

  const deleteNote=async id=>{
    setNotes(n=>n.filter(x=>x.id!==id))
    await supabase.from("matrix_notes").delete().eq("id",id)
  }

  const convertToTask=async note=>{
    const id=crypto.randomUUID()
    const t={id,title:note.text,done:false,priority:note.q==="q1"?"high":note.q==="q2"?"medium":"low",tag:"work",due:tod(),starred:note.q==="q1",notes:"From Matrix",color:note.color,subtasks:[],recurring:null,position:0}
    setTasks(ts=>[t,...ts]); deleteNote(note.id)
    await supabase.from("tasks").insert({...t,user_id:userId,subtasks:"[]"})
  }

  return (
    <div style={{flex:1,display:"grid",gridTemplateColumns:"1fr 1fr",gridTemplateRows:"1fr 1fr",gap:1,background:T.border,overflow:"hidden"}}>
      {QUADS.map(q=>(
        <div key={q.id} onDragOver={e=>{e.preventDefault();setDragOver(q.id)}} onDragLeave={e=>{if(!e.currentTarget.contains(e.relatedTarget))setDragOver(null)}}
          onDrop={e=>{e.preventDefault();const id=e.dataTransfer.getData("nid");if(id)moveNote(id,q.id);setDragOver(null)}}
          style={{background:dragOver===q.id?q.color+"12":T.bg,transition:"background .15s",display:"flex",flexDirection:"column",overflow:"hidden",outline:dragOver===q.id?`2px dashed ${q.color}44`:"none",outlineOffset:"-2px"}}>
          <div style={{padding:"9px 14px 7px",borderBottom:`1px solid ${T.border}`,background:q.color+"09",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:11,fontWeight:700,color:q.color}}>{q.icon} {q.label}</span>
              <span style={{fontSize:9,color:T.textMuted,background:T.surface2,padding:"1px 6px",borderRadius:20,border:`1px solid ${T.border}`}}>{q.sub}</span>
            </div>
            <button onClick={()=>{setAddingIn(q.id);setNewText("")}} style={{width:22,height:22,borderRadius:5,border:"none",cursor:"pointer",background:q.color+"22",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="plus" s={12} c={q.color}/></button>
          </div>
          <div style={{flex:1,padding:10,overflowY:"auto",display:"flex",flexWrap:"wrap",gap:7,alignContent:"flex-start"}}>
            {notes.filter(n=>n.q===q.id).map(note=>(
              <MNote key={note.id} note={note} T={T} onDelete={deleteNote} onConvert={()=>convertToTask(note)} editing={editId===note.id} onEdit={()=>setEditId(note.id)}
                onSave={async txt=>{setNotes(n=>n.map(x=>x.id===note.id?{...x,text:txt}:x));setEditId(null);await supabase.from("matrix_notes").update({text:txt}).eq("id",note.id)}}/>
            ))}
            {addingIn===q.id&&(
              <div style={{width:"100%",animation:"slideIn .2s ease"}}>
                <textarea autoFocus value={newText} onChange={e=>setNewText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();addNote(q.id)}if(e.key==="Escape")setAddingIn(null)}} placeholder="Note… Enter to save" style={{width:"100%",minHeight:58,padding:"7px",borderRadius:7,border:`1px solid ${q.color}88`,background:q.color+"11",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none",resize:"none"}}/>
                <div style={{display:"flex",gap:5,marginTop:4}}>
                  <button onClick={()=>addNote(q.id)} style={{flex:1,padding:"5px",borderRadius:6,border:"none",cursor:"pointer",background:q.color,color:"#fff",fontSize:11,fontWeight:700}}>Save</button>
                  <button onClick={()=>setAddingIn(null)} style={{flex:1,padding:"5px",borderRadius:6,border:`1px solid ${T.border}`,cursor:"pointer",background:"transparent",color:T.textMuted,fontSize:11}}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function MNote({note,T,onDelete,onConvert,editing,onEdit,onSave}) {
  const [hov,setHov]=useState(false)
  const [et,setEt]=useState(note.text)
  if (editing) return <div style={{width:"100%"}}><textarea autoFocus value={et} onChange={e=>setEt(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();onSave(et)}if(e.key==="Escape")onSave(note.text)}} style={{width:"100%",minHeight:58,padding:"7px",borderRadius:7,border:`1px solid ${note.color}88`,background:note.color+"11",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none",resize:"none"}}/></div>
  return (
    <div draggable onDragStart={e=>{e.dataTransfer.setData("nid",note.id);e.dataTransfer.effectAllowed="move"}} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{padding:"7px 9px",borderRadius:8,background:note.color+"1a",border:`1px solid ${note.color}44`,fontSize:12,color:T.text,lineHeight:1.5,position:"relative",minWidth:88,maxWidth:150,cursor:"grab",transition:"transform .15s,box-shadow .15s",transform:hov?"translateY(-2px) rotate(.4deg)":"none",boxShadow:hov?`0 6px 14px ${note.color}33`:"none",userSelect:"none"}}>
      <div style={{borderLeft:`3px solid ${note.color}`,paddingLeft:6}}>{note.text}</div>
      {hov&&<div style={{position:"absolute",top:-10,right:-4,display:"flex",gap:2,zIndex:10}}>
        <button onClick={onEdit} style={{width:18,height:18,borderRadius:4,border:"none",cursor:"pointer",background:T.surface,color:T.textMuted,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 6px rgba(0,0,0,.3)"}}><Ico n="zap" s={9}/></button>
        <button onClick={onConvert} style={{width:18,height:18,borderRadius:4,border:"none",cursor:"pointer",background:"#818cf8",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 6px rgba(0,0,0,.3)"}}><Ico n="plus" s={9} c="#fff"/></button>
        <button onClick={()=>onDelete(note.id)} style={{width:18,height:18,borderRadius:4,border:"none",cursor:"pointer",background:T.surface,color:T.danger,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 6px rgba(0,0,0,.3)"}}><Ico n="x" s={9}/></button>
      </div>}
    </div>
  )
}

// ─── Freeform Canvas ──────────────────────────────────────────────────────────
function FreeformCanvas({T,notes,setNotes,setTasks,userId}) {
  const canvasRef=useRef(null)
  const dragRef=useRef(null)
  const [editingId,setEditingId]=useState(null)

  const onPointerDown=useCallback((e,note)=>{
    if(["TEXTAREA","INPUT","BUTTON"].includes(e.target.tagName)) return
    e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId)
    const rect=canvasRef.current.getBoundingClientRect()
    dragRef.current={id:note.id,ox:e.clientX-rect.left-note.x,oy:e.clientY-rect.top-note.y}
  },[])

  const onPointerMove=useCallback(e=>{
    if(!dragRef.current||!canvasRef.current) return
    const rect=canvasRef.current.getBoundingClientRect()
    const x=Math.max(0,Math.min(e.clientX-rect.left-dragRef.current.ox,rect.width-150))
    const y=Math.max(0,Math.min(e.clientY-rect.top-dragRef.current.oy,rect.height-90))
    setNotes(ns=>ns.map(n=>n.id===dragRef.current.id?{...n,x,y}:n))
  },[setNotes])

  const onPointerUp=useCallback(async e=>{
    if(!dragRef.current) return
    const id=dragRef.current.id; dragRef.current=null
    const note=notes.find(n=>n.id===id); if(!note) return
    await supabase.from("canvas_notes").update({x:note.x,y:note.y}).eq("id",id)
  },[notes])

  const onDblClick=useCallback(async e=>{
    if(e.target!==canvasRef.current&&e.target.dataset.canvas!=="bg") return
    const rect=canvasRef.current.getBoundingClientRect()
    const x=Math.max(0,e.clientX-rect.left-70), y=Math.max(0,e.clientY-rect.top-40)
    const id=crypto.randomUUID()
    const note={id,text:"New idea…",x,y,color:NOTE_COLS[notes.length%NOTE_COLS.length]}
    setNotes(ns=>[...ns,note]); setTimeout(()=>setEditingId(id),50)
    await supabase.from("canvas_notes").insert({id,user_id:userId,text:note.text,x,y,color:note.color})
  },[notes.length,setNotes,userId])

  const deleteNote=async id=>{
    setNotes(ns=>ns.filter(n=>n.id!==id))
    await supabase.from("canvas_notes").delete().eq("id",id)
  }
  const convertToTask=async note=>{
    const id=crypto.randomUUID()
    const t={id,title:note.text,done:false,priority:"medium",tag:"work",due:tod(),starred:false,notes:"From Canvas",color:note.color,subtasks:[],recurring:null,position:0}
    setTasks(ts=>[t,...ts]); deleteNote(note.id)
    await supabase.from("tasks").insert({...t,user_id:userId,subtasks:"[]"})
  }

  return (
    <div ref={canvasRef} data-canvas="bg" style={{flex:1,position:"relative",background:T.canvas,overflow:"hidden",cursor:"crosshair"}} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onDoubleClick={onDblClick}>
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",opacity:.12}}><defs><pattern id="g" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M 28 0 L 0 0 0 28" fill="none" stroke={T.textMuted} strokeWidth=".5"/></pattern></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>
      {notes.length===0&&<div data-canvas="bg" style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",color:T.textMuted,textAlign:"center",pointerEvents:"none",userSelect:"none"}}><div style={{fontSize:32,marginBottom:8}}>✦</div><div style={{fontWeight:600,fontSize:14}}>Double-click anywhere to create a note</div><div style={{fontSize:12,marginTop:4,opacity:.6}}>Drag freely · hover for options · purple arrow → convert to task</div></div>}
      {notes.map(note=>(
        <FreeNote key={note.id} note={note} T={T} editing={editingId===note.id} onPointerDown={e=>onPointerDown(e,note)}
          onEdit={()=>setEditingId(note.id)}
          onSave={async txt=>{setNotes(ns=>ns.map(n=>n.id===note.id?{...n,text:txt}:n));setEditingId(null);await supabase.from("canvas_notes").update({text:txt}).eq("id",note.id)}}
          onDelete={()=>deleteNote(note.id)} onConvert={()=>convertToTask(note)}
          onColorChange={async c=>{setNotes(ns=>ns.map(n=>n.id===note.id?{...n,color:c}:n));await supabase.from("canvas_notes").update({color:c}).eq("id",note.id)}}/>
      ))}
      <div style={{position:"absolute",bottom:12,right:16,fontSize:10,color:T.textMuted,userSelect:"none",pointerEvents:"none"}}>Double-click · drag · hover for actions</div>
    </div>
  )
}

function FreeNote({note,T,editing,onPointerDown,onEdit,onSave,onDelete,onConvert,onColorChange}) {
  const [hov,setHov]=useState(false)
  const [txt,setTxt]=useState(note.text)
  useEffect(()=>setTxt(note.text),[note.text])
  return (
    <div style={{position:"absolute",left:note.x,top:note.y,zIndex:hov||editing?20:10}} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      {editing?(
        <textarea autoFocus value={txt} onChange={e=>setTxt(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();onSave(txt)}if(e.key==="Escape")onSave(note.text)}} onBlur={()=>onSave(txt)}
          style={{minWidth:130,minHeight:70,padding:"8px",borderRadius:10,border:`2px solid ${note.color}`,background:note.color+"18",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none",resize:"both",lineHeight:1.5}}/>
      ):(
        <div onPointerDown={onPointerDown} onDoubleClick={onEdit}
          style={{minWidth:120,maxWidth:200,padding:"9px 11px",borderRadius:10,background:note.color+"20",border:`1px solid ${note.color}55`,fontSize:12,color:T.text,lineHeight:1.5,cursor:"grab",boxShadow:hov?`0 8px 20px ${note.color}44`:"0 2px 8px rgba(0,0,0,.2)",transform:hov?"scale(1.03) rotate(.5deg)":"scale(1)",transition:"transform .15s,box-shadow .15s",userSelect:"none",whiteSpace:"pre-wrap",wordBreak:"break-word"}}>
          <div style={{borderLeft:`3px solid ${note.color}`,paddingLeft:7}}>{note.text}</div>
        </div>
      )}
      {hov&&!editing&&(
        <div style={{position:"absolute",top:-28,left:0,display:"flex",gap:3,zIndex:30,background:T.surface2,borderRadius:8,padding:"3px 5px",border:`1px solid ${T.border}`,boxShadow:"0 4px 12px rgba(0,0,0,.3)"}}>
          <button onClick={onEdit} style={{width:20,height:20,borderRadius:4,border:"none",cursor:"pointer",background:"transparent",color:T.textMuted,display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="zap" s={10}/></button>
          {NOTE_COLS.slice(0,5).map(c=><div key={c} onClick={()=>onColorChange(c)} style={{width:10,height:10,borderRadius:"50%",background:c,cursor:"pointer",border:`1px solid ${note.color===c?"#fff":"transparent"}`,marginTop:5}}/>)}
          <button onClick={onConvert} style={{width:20,height:20,borderRadius:4,border:"none",cursor:"pointer",background:"#818cf8",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="arr" s={9} c="#fff"/></button>
          <button onClick={onDelete} style={{width:20,height:20,borderRadius:4,border:"none",cursor:"pointer",background:"transparent",color:T.danger,display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" s={10}/></button>
        </div>
      )}
    </div>
  )
}

// ─── Notes View ───────────────────────────────────────────────────────────────
function NotesView({T,notes,setNotes,userId}) {
  const [sel,setSel]=useState(null)
  const [nt,setNt]=useState("")
  const ACC=["#3b82f6","#22c55e","#f59e0b","#ef4444","#a855f7","#ec4899","#14b8a6"]
  const addNote=async ()=>{
    if(!nt.trim()) return
    const id=crypto.randomUUID()
    const n={id,title:nt.trim(),body:"",pinned:false,color:ACC[notes.length%ACC.length],created_at:new Date().toISOString(),updated_at:new Date().toISOString()}
    setNotes(ns=>[n,...ns]); setSel(n); setNt("")
    await supabase.from("notes").insert({id,user_id:userId,title:n.title,body:"",pinned:false,color:n.color})
  }
  const upNote=async (id,patch)=>{
    setNotes(ns=>ns.map(n=>n.id===id?{...n,...patch}:n)); if(sel?.id===id)setSel(s=>({...s,...patch}))
    await supabase.from("notes").update({...patch,updated_at:new Date().toISOString()}).eq("id",id)
  }
  const delNote=async id=>{
    setNotes(ns=>ns.filter(n=>n.id!==id)); if(sel?.id===id)setSel(null)
    await supabase.from("notes").delete().eq("id",id)
  }
  return (
    <div style={{flex:1,display:"flex",overflow:"hidden"}}>
      <div style={{width:248,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",overflowY:"auto",background:T.sidebar}}>
        <div style={{padding:"16px 12px 10px"}}>
          <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:16,fontWeight:700,marginBottom:10}}>Notes</h2>
          <div style={{display:"flex",gap:6}}>
            <input value={nt} onChange={e=>setNt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addNote()} placeholder="New note title…" style={{flex:1,padding:"7px 9px",borderRadius:8,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none"}}/>
            <button onClick={addNote} style={{width:30,height:30,borderRadius:8,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#c084fc,#818cf8)",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="plus" s={14} c="#fff"/></button>
          </div>
        </div>
        {notes.filter(n=>n.pinned).length>0&&<><div style={{padding:"0 12px 2px",fontSize:9,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",color:T.textMuted}}>📌 Pinned</div><div style={{padding:"0 8px"}}>{notes.filter(n=>n.pinned).map(n=><NRow key={n.id} note={n} T={T} sel={sel} onSel={setSel} onUp={upNote} onDel={delNote}/>)}</div></>}
        <div style={{padding:"0 8px 10px"}}>{notes.filter(n=>!n.pinned).map(n=><NRow key={n.id} note={n} T={T} sel={sel} onSel={setSel} onUp={upNote} onDel={delNote}/>)}</div>
      </div>
      {sel?(
        <div style={{flex:1,display:"flex",flexDirection:"column",padding:"22px 26px",overflowY:"auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
            <input value={sel.title} onChange={e=>upNote(sel.id,{title:e.target.value})} style={{flex:1,fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:700,background:"transparent",border:"none",outline:"none",color:T.text,letterSpacing:"-.3px"}}/>
            <div style={{display:"flex",gap:5}}>{ACC.slice(0,5).map(c=><div key={c} onClick={()=>upNote(sel.id,{color:c})} style={{width:14,height:14,borderRadius:"50%",background:c,cursor:"pointer",border:`2px solid ${sel.color===c?T.text:"transparent"}`,transition:"border-color .15s"}}/>)}</div>
          </div>
          <div style={{height:3,width:36,borderRadius:2,background:sel.color,marginBottom:16}}/>
          <textarea value={sel.body} onChange={e=>upNote(sel.id,{body:e.target.value})} placeholder={"Start writing…\n\nFor meeting notes, ideas, journals, research — anything that's not a task."} style={{flex:1,minHeight:300,background:"transparent",border:"none",outline:"none",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:14,lineHeight:1.8,resize:"none"}}/>
          <div style={{fontSize:10,color:T.textMuted,marginTop:10}}>{sel.body.split(/\s+/).filter(Boolean).length} words</div>
        </div>
      ):(
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:T.textMuted,flexDirection:"column",gap:8}}>
          <div style={{fontSize:40}}>📝</div>
          <div style={{fontWeight:600}}>Select a note</div>
          <div style={{fontSize:12,opacity:.7}}>Freeform writing, separate from tasks</div>
        </div>
      )}
    </div>
  )
}
function NRow({note,T,sel,onSel,onUp,onDel}) {
  const [hov,setHov]=useState(false)
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={()=>onSel(note)} style={{padding:"8px",borderRadius:8,background:sel?.id===note.id?T.accentGlow:hov?T.surface2:"transparent",border:`1px solid ${sel?.id===note.id?T.accent+"44":"transparent"}`,cursor:"pointer",marginBottom:2,position:"relative",transition:"all .12s"}}>
      <div style={{display:"flex",alignItems:"center",gap:5}}>
        <div style={{width:7,height:7,borderRadius:"50%",background:note.color,flexShrink:0}}/>
        <span style={{fontSize:12,fontWeight:600,color:T.text,flex:1,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{note.title||"Untitled"}</span>
      </div>
      <div style={{fontSize:11,color:T.textMuted,marginTop:2,marginLeft:12,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{note.body?note.body.slice(0,38)+"…":"Empty"}</div>
      {hov&&<div style={{position:"absolute",right:5,top:"50%",transform:"translateY(-50%)",display:"flex",gap:2}}>
        <button onClick={e=>{e.stopPropagation();onUp(note.id,{pinned:!note.pinned})}} style={{width:20,height:20,borderRadius:4,border:"none",cursor:"pointer",background:T.surface3,color:note.pinned?"#f59e0b":T.textMuted,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center"}}>📌</button>
        <button onClick={e=>{e.stopPropagation();onDel(note.id)}} style={{width:20,height:20,borderRadius:4,border:"none",cursor:"pointer",background:T.surface3,color:T.danger,display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" s={10}/></button>
      </div>}
    </div>
  )
}

// ─── Analytics ────────────────────────────────────────────────────────────────
function AnalyticsView({T,tasks,xp,level,streak}) {
  const [aiLoad,setAiLoad]=useState(false)
  const [aiMsg,setAiMsg]=useState("")
  const wk=[3,6,4,8,5,2,tasks.filter(t=>t.done).length]
  const maxW=Math.max(...wk,1)
  const total=tasks.length, done=tasks.filter(t=>t.done).length
  const rate=total>0?Math.round((done/total)*100):0
  const ov=tasks.filter(t=>t.due&&t.due<tod()&&!t.done).length
  const byTag={}; tasks.forEach(t=>{byTag[t.tag]=(byTag[t.tag]||0)+1})
  const heat=Array.from({length:35},(_,i)=>({v:Math.floor(Math.random()*6)}))
  const runAI=()=>{setAiLoad(true);setAiMsg("");setTimeout(()=>{setAiLoad(false);setAiMsg(`🧠 Peak productivity: Tue–Thu. Work tasks: 94% done. ${ov>0?`${ov} overdue — schedule catch-up.`:"No overdue tasks!"} Deep-work window: 9–11am. Keep the ${streak}-day streak 🔥`)},1600)}
  return (
    <div style={{flex:1,overflowY:"auto",padding:"22px 26px"}}>
      <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:21,fontWeight:700,letterSpacing:"-.5px",marginBottom:18}}>Analytics</h1>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        {[{l:"Total",v:total,i:"layers",c:T.accent},{l:"Done",v:done,i:"check",c:T.success},{l:"Rate",v:`${rate}%`,i:"target",c:T.info},{l:"Overdue",v:ov,i:"clock",c:T.danger}].map(s=>(
          <div key={s.l} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"13px 15px"}}>
            <div style={{width:27,height:27,borderRadius:7,background:s.c+"22",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:8}}><Ico n={s.i} s={13} c={s.c}/></div>
            <div style={{fontFamily:"'Sora',sans-serif",fontSize:24,fontWeight:700,letterSpacing:"-1px"}}>{s.v}</div>
            <div style={{fontSize:11,color:T.textMuted,marginTop:1}}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:12,marginBottom:12}}>
        <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:16}}>
          <div style={{fontSize:12,fontWeight:600,marginBottom:12,display:"flex",alignItems:"center",gap:5}}><Ico n="bar" s={13} c={T.accent}/>Weekly</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:6,height:80}}>
            {["M","T","W","T","F","S","S"].map((d,i)=>(
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <div style={{width:"100%",borderRadius:"3px 3px 0 0",background:i===6?"linear-gradient(180deg,#c084fc,#818cf8)":T.surface3,height:`${(wk[i]/maxW)*68}px`,transition:"height .6s"}}/>
                <span style={{fontSize:9,color:T.textMuted}}>{d}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:16}}>
          <div style={{fontSize:12,fontWeight:600,marginBottom:12}}>🔥 Streak</div>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{textAlign:"center"}}><div style={{fontSize:32,fontFamily:"'Sora',sans-serif",fontWeight:700,color:"#f59e0b"}}>{streak}</div><div style={{fontSize:10,color:T.textMuted}}>days 🔥</div></div>
            <div style={{borderLeft:`1px solid ${T.border}`,paddingLeft:14}}>
              <div style={{fontSize:20,fontFamily:"'Sora',sans-serif",fontWeight:700}}>LVL {level}</div>
              <div style={{fontSize:11,color:T.textMuted}}>{xp} XP</div>
              <div style={{display:"flex",gap:3,marginTop:7}}>{["🔥","⚡","🎯","💎","🏆"].map((e,i)=><div key={i} style={{width:24,height:24,borderRadius:6,background:i<level-1?"#f59e0b22":T.surface2,border:`1px solid ${i<level-1?"#f59e0b":T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>{e}</div>)}</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1.3fr",gap:12,marginBottom:12}}>
        <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:16}}>
          <div style={{fontSize:12,fontWeight:600,marginBottom:10}}>By Category</div>
          {Object.entries(byTag).map(([tag,cnt])=>(
            <div key={tag} style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:11,fontWeight:500,textTransform:"capitalize"}}>{tag}</span><span style={{fontSize:11,color:T.textMuted}}>{cnt}</span></div>
              <div style={{height:5,background:T.border,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${(cnt/total)*100}%`,background:T.accent,borderRadius:3,transition:"width .6s"}}/></div>
            </div>
          ))}
        </div>
        <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:16}}>
          <div style={{fontSize:12,fontWeight:600,marginBottom:10}}>Activity Heatmap</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
            {heat.map((c,i)=><div key={i} style={{aspectRatio:"1",borderRadius:2,background:c.v===0?T.surface2:`rgba(192,132,252,${c.v/5*.9+.1})`,transition:"transform .1s"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.3)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}/>)}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4,marginTop:8}}>
            <span style={{fontSize:9,color:T.textMuted}}>Less</span>
            {[.1,.3,.5,.7,1].map(o=><div key={o} style={{width:9,height:9,borderRadius:2,background:`rgba(192,132,252,${o})`}}/>)}
            <span style={{fontSize:9,color:T.textMuted}}>More</span>
          </div>
        </div>
      </div>
      <div style={{background:T.accentGlow,border:`1px solid ${T.accent}33`,borderRadius:12,padding:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:5}}><Ico n="sparkles" s={13} c={T.accent}/>AI Productivity Coach</div>
          <button onClick={runAI} disabled={aiLoad} style={{padding:"5px 13px",borderRadius:7,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#c084fc,#818cf8)",color:"#fff",fontSize:11,fontWeight:700,opacity:aiLoad?.7:1}}>{aiLoad?"Analyzing…":"Get Insights"}</button>
        </div>
        {aiLoad&&<div style={{display:"flex",gap:4}}>{[0,1,2].map(i=><div key={i} className="dp" style={{width:6,height:6,borderRadius:"50%",background:T.accent}}/>)}</div>}
        {aiMsg&&<p style={{fontSize:12,lineHeight:1.7}}>{aiMsg}</p>}
        {!aiMsg&&!aiLoad&&<p style={{fontSize:12,color:T.textMuted}}>Get personalized productivity analysis based on your tasks.</p>}
      </div>
    </div>
  )
}

// ─── Settings ─────────────────────────────────────────────────────────────────
function SettingsView({T,dark,setDark,cats,setCats,userId,userEmail,onSignOut}) {
  const [notifs,setNotifs]=useState(true)
  const [focus,setFocus]=useState(false)
  const [pomLen,setPomLen]=useState(25)
  const [newCat,setNewCat]=useState("")
  const [newCatColor,setNewCatColor]=useState(CAT_COLORS[5])

  const addCat=async ()=>{
    const name=newCat.trim().toLowerCase()
    if(!name||cats[name]) return
    setCats(c=>({...c,[name]:newCatColor})); setNewCat("")
    await supabase.from("categories").upsert({id:crypto.randomUUID(),user_id:userId,name,color:newCatColor})
  }
  const delCat=async name=>{
    if(["work","health"].includes(name)) return
    const c={...cats}; delete c[name]; setCats(c)
    await supabase.from("categories").delete().eq("user_id",userId).eq("name",name)
  }

  const Toggle=({val,onChange})=>(
    <div onClick={()=>onChange(!val)} style={{width:36,height:20,borderRadius:10,background:val?T.accent:T.surface3,cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}>
      <div style={{width:16,height:16,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:val?18:2,transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.3)"}}/>
    </div>
  )
  const Row=({label,desc,children})=>(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${T.border}`}}>
      <div><div style={{fontSize:13,fontWeight:500}}>{label}</div>{desc&&<div style={{fontSize:11,color:T.textMuted,marginTop:1}}>{desc}</div>}</div>
      {children}
    </div>
  )

  return (
    <div style={{flex:1,overflowY:"auto",padding:"22px 26px",maxWidth:580}}>
      <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:21,fontWeight:700,letterSpacing:"-.5px",marginBottom:18}}>Settings</h1>

      {/* Account */}
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"14px 16px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#c084fc,#818cf8)",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="user" s={16} c="#fff"/></div>
          <div><div style={{fontSize:13,fontWeight:600}}>{userEmail}</div><div style={{fontSize:11,color:T.textMuted}}>Synced across all devices ✓</div></div>
        </div>
        <button onClick={onSignOut} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>
          <Ico n="logout" s={13}/>Sign out
        </button>
      </div>

      {/* Categories */}
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"0 16px",marginBottom:14}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".6px",textTransform:"uppercase",color:T.textMuted,padding:"12px 0 6px"}}>Categories</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:7,paddingBottom:10}}>
          {Object.entries(cats).map(([name,color])=>(
            <div key={name} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:20,background:color+"22",border:`1px solid ${color}55`}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:color}}/>
              <span style={{fontSize:12,color:color,fontWeight:600}}>{name}</span>
              {!["work","health"].includes(name)&&<button onClick={()=>delCat(name)} style={{width:14,height:14,borderRadius:"50%",border:"none",cursor:"pointer",background:T.surface3,color:T.textMuted,display:"flex",alignItems:"center",justifyContent:"center",marginLeft:1}}><Ico n="x" s={8}/></button>}
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:6,paddingBottom:12}}>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginRight:4}}>{CAT_COLORS.map(c=><div key={c} onClick={()=>setNewCatColor(c)} style={{width:16,height:16,borderRadius:"50%",background:c,cursor:"pointer",border:`2px solid ${newCatColor===c?T.text:"transparent"}`,flexShrink:0}}/>)}</div>
          <input value={newCat} onChange={e=>setNewCat(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCat()} placeholder="New category name…" style={{flex:1,padding:"6px 9px",borderRadius:8,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none"}}/>
          <button onClick={addCat} style={{padding:"6px 14px",borderRadius:8,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#c084fc,#818cf8)",color:"#fff",fontSize:12,fontWeight:700}}>Add</button>
        </div>
      </div>

      {[
        {title:"Appearance",rows:[{label:"Dark Mode",desc:"Light or dark theme",el:<Toggle val={dark} onChange={setDark}/>}]},
        {title:"Notifications",rows:[{label:"Push Notifications",desc:"Reminders for upcoming tasks",el:<Toggle val={notifs} onChange={setNotifs}/>},{label:"Focus Mode",desc:"Suppress during Pomodoro",el:<Toggle val={focus} onChange={setFocus}/>}]},
        {title:"Pomodoro",rows:[{label:"Session Length (min)",desc:"Focus block duration",el:(
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={()=>setPomLen(p=>Math.max(5,p-5))} style={{width:24,height:24,borderRadius:5,border:`1px solid ${T.border}`,background:"transparent",color:T.text,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
            <span style={{fontWeight:700,fontSize:14,minWidth:24,textAlign:"center"}}>{pomLen}</span>
            <button onClick={()=>setPomLen(p=>Math.min(60,p+5))} style={{width:24,height:24,borderRadius:5,border:`1px solid ${T.border}`,background:"transparent",color:T.text,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
          </div>
        )}]},
      ].map(s=>(
        <div key={s.title} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"0 16px",marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".6px",textTransform:"uppercase",color:T.textMuted,padding:"12px 0 2px"}}>{s.title}</div>
          {s.rows.map(r=><Row key={r.label} label={r.label} desc={r.desc}>{r.el}</Row>)}
        </div>
      ))}
    </div>
  )
}
