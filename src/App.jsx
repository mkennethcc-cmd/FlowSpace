import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase";
import { db, fromDbTask } from "./db";
import AuthScreen, { SignupSuccess, ResetPassword } from "./AuthScreen";

const FontLink = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#fff2;border-radius:2px;}
    [draggable]{-webkit-user-drag:element;touch-action:none;user-select:none;}
    @keyframes slideIn{from{opacity:0;transform:translateY(-6px) scale(.97);}to{opacity:1;transform:none;}}
    @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
    @keyframes checkB{0%{transform:scale(0)rotate(-20deg);}60%{transform:scale(1.2);}100%{transform:scale(1);}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
    @keyframes glow{0%,100%{box-shadow:0 0 10px #c084fc28;}50%{box-shadow:0 0 22px #c084fc66;}}
    @keyframes ripple{0%{transform:scale(0);opacity:.6;}100%{transform:scale(2.5);opacity:0;}}
    .te{animation:slideIn .3s cubic-bezier(.34,1.56,.64,1);}
    .dp{animation:pulse 1s infinite;} .dp:nth-child(2){animation-delay:.15s;} .dp:nth-child(3){animation-delay:.3s;}
  `}</style>
);

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
    tag:<><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></>,
    target:<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
    edit:<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    brain:<><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2z"/></>,
    paint:<><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></>,
  };
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={st}>
      {p[n]}
    </svg>
  );
};

const NOTE_COLS = ["#ef4444","#f97316","#f59e0b","#22c55e","#3b82f6","#a855f7","#ec4899","#14b8a6"];
const CAT_COLORS = ["#0ea5e9","#6366f1","#10b981","#f59e0b","#a855f7","#ef4444","#ec4899","#14b8a6","#f97316","#84cc16"];
const PRIORITY_COLOR = { high:"#ef4444", medium:"#f59e0b", low:"#22c55e" };
// Unified priority = Eisenhower quadrant, ranked urgent+important → neither. (#24)
const QUAD = {
  q1:{label:"Urgent & Important", short:"Do First",  color:"#ef4444", icon:"🔥"},
  q3:{label:"Urgent · Not Important", short:"Delegate", color:"#f97316", icon:"📋"},
  q2:{label:"Important · Not Urgent", short:"Schedule", color:"#facc15", icon:"📅"},
  q4:{label:"Not Urgent · Not Important", short:"Whenever", color:"#2dd4bf", icon:"🌿"},
};
const QUAD_ORDER = ["q1","q3","q2","q4"];
const MONTHS = {jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11};
const WEEKDAYS = {sun:0,mon:1,tue:2,wed:3,thu:4,fri:5,sat:6};

const CAT_KEYWORDS = {
  health:["gym","run","running","workout","exercise","yoga","doctor","dentist","medic","meditate","jog","therapy","health","hydrate","sleep"],
  personal:["friend","friends","family","birthday","party","dinner","lunch","movie","date","shopping","grocery","groceries","hangout","mom","dad","vacation","trip","brunch","wedding"],
  finance:["budget","invoice","tax","taxes","pay","bill","bills","bank","rent","salary","expense","refund","insurance","mortgage"],
  school:["homework","study","studying","exam","class","assignment","lecture","quiz","essay","thesis","school","course","revision"],
  work:["meeting","client","report","email","project","deadline","standup","presentation","interview","proposal","slides","sprint","ticket","work","launch"],
};
const guessCat = (title, cats) => {
  const t = (title || "").toLowerCase();
  for (const cat of ["health","personal","finance","school","work"]) {
    if (cats[cat] && CAT_KEYWORDS[cat].some(k => t.includes(k))) return cat;
  }
  return cats["personal"] ? "personal" : (cats["work"] ? "work" : Object.keys(cats)[0] || "work");
};

// Robust press-to-drag: mouse drags after a tiny move; touch drags after a 120ms hold.
// Calls onActivate() once when a real drag should begin (not a tap/click/scroll).
function startPressDrag(e, onActivate) {
  const sx = e.clientX, sy = e.clientY, type = e.pointerType;
  let done = false, timer = null;
  const finish = () => { clearTimeout(timer); window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up); };
  const activate = () => { if (done) return; done = true; finish(); onActivate(); };
  const mv = ev => {
    const dx = Math.abs(ev.clientX - sx), dy = Math.abs(ev.clientY - sy);
    if (type === "mouse") { if (dx > 4 || dy > 4) activate(); }
    else if (dx > 8 || dy > 8) { finish(); } // moved before the hold fired → it's a scroll, cancel
  };
  const up = () => finish();
  if (type !== "mouse") timer = setTimeout(activate, 120);
  window.addEventListener("pointermove", mv);
  window.addEventListener("pointerup", up);
  window.addEventListener("pointercancel", up);
}

// Runs an active drag via window listeners (reliable across re-renders). Blocks text-select/scroll while dragging.
function runDrag(onMove, onDrop) {
  document.body.style.userSelect = "none";
  document.body.style.touchAction = "none";
  const mv = e => onMove(e);
  const up = e => {
    window.removeEventListener("pointermove", mv);
    window.removeEventListener("pointerup", up);
    window.removeEventListener("pointercancel", up);
    document.body.style.userSelect = "";
    document.body.style.touchAction = "";
    onDrop(e);
  };
  window.addEventListener("pointermove", mv);
  window.addEventListener("pointerup", up);
  window.addEventListener("pointercancel", up);
}

const tod = () => new Date().toISOString().split("T")[0];
const addDays = n => { const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString().split("T")[0]; };
const fmtDate = s => {
  if (!s) return null;
  const d = new Date(s+"T12:00:00"), t = new Date(); t.setHours(0,0,0,0);
  const diff = Math.round((d-t)/86400000);
  if (diff<0) return `${Math.abs(diff)}d overdue`;
  if (diff===0) return "Today"; if (diff===1) return "Tomorrow";
  return d.toLocaleDateString("en-US",{month:"short",day:"numeric"});
};

const parseNL = raw => {
  let title = raw.trim(), due = null;
  const strip = s => s.replace(/\s+at\s+\d{1,2}(:\d{2})?\s*(am|pm)?/gi,"").trim();
  if (/\btomorrow\b/i.test(title)) { due=addDays(1); title=title.replace(/\s*\btomorrow(\s+at\s+[\w:]+(\s*(am|pm))?)?\b/gi,""); }
  else if (/\btoday\b/i.test(title)) { due=tod(); title=title.replace(/\s*\btoday(\s+at\s+[\w:]+(\s*(am|pm))?)?\b/gi,""); }
  else if (/\bnext week\b/i.test(title)) { due=addDays(7); title=title.replace(/\bnext week\b/gi,""); }
  else if (title.match(/\b(?:this\s+)?(next\s+)?(?:on\s+)?(sun(?:day)?|mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:r|rs|rsday)?|fri(?:day)?|sat(?:urday)?)\b/i)) {
    const wd = title.match(/\b(?:this\s+)?(next\s+)?(?:on\s+)?(sun(?:day)?|mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:r|rs|rsday)?|fri(?:day)?|sat(?:urday)?)\b/i);
    const key = wd[2].toLowerCase().substring(0,3), target = WEEKDAYS[key], cur = new Date().getDay();
    let delta = (target - cur + 7) % 7;
    if (delta === 0) delta = 7;
    if (wd[1]) delta += 7;
    const d = new Date(); d.setDate(d.getDate() + delta);
    due = d.toISOString().split("T")[0];
    title = title.replace(wd[0], "");
  }
  else {
    const m = title.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})\b/i);
    if (m) {
      const mon=MONTHS[m[1].toLowerCase().substring(0,3)], day=parseInt(m[2]);
      let yr=new Date().getFullYear();
      if (new Date(yr,mon,day)<new Date()) yr++;
      due=new Date(yr,mon,day).toISOString().split("T")[0];
      title=title.replace(new RegExp("\\s*"+m[0].replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"(\\s+at\\s+[\\w:]+(\\s*(am|pm))?)?","gi"),"");
    }
  }
  title=strip(title).replace(/^[\s,\-–]+|[\s,\-–]+$/g,"").trim();
  if (!title) title=raw.trim();
  return {title, due};
};

const mkSeed = () => [
  {id:1,title:"Finish Q2 investor report",done:false,priority:"high",tag:"work",due:tod(),starred:true,notes:"Focus on MRR and churn",color:"#ef4444",subtasks:[{id:11,title:"Pull revenue data",done:true},{id:12,title:"Write summary",done:false}],recurring:null},
  {id:2,title:"Team standup — sprint review",done:false,priority:"medium",tag:"work",due:tod(),starred:false,notes:"",color:null,subtasks:[],recurring:"daily"},
  {id:3,title:"Morning run — 5km",done:true,priority:"low",tag:"health",due:tod(),starred:false,notes:"",color:null,subtasks:[],recurring:"daily"},
  {id:4,title:"Meet business partner — Joe's Coffee",done:false,priority:"high",tag:"work",due:addDays(14),starred:false,notes:"Discuss Q3 roadmap",color:"#3b82f6",subtasks:[],recurring:null},
  {id:5,title:"Review PR #247 — auth module",done:false,priority:"high",tag:"work",due:addDays(1),starred:false,notes:"Check token refresh",color:null,subtasks:[],recurring:null},
  {id:6,title:"Read Atomic Habits ch.5",done:false,priority:"low",tag:"personal",due:addDays(2),starred:false,notes:"",color:null,subtasks:[],recurring:null},
  {id:7,title:"Quarterly budget review",done:false,priority:"medium",tag:"finance",due:addDays(3),starred:true,notes:"",color:"#a855f7",subtasks:[],recurring:"monthly"},
];

const SEED_MATRIX = [
  {id:1,q:"q1",text:"Fix production auth bug",color:"#ef4444"},
  {id:2,q:"q1",text:"Submit client proposal",color:"#f97316"},
  {id:3,q:"q2",text:"Learn TypeScript generics",color:"#3b82f6"},
  {id:4,q:"q2",text:"Weekly exercise habit",color:"#22c55e"},
  {id:5,q:"q3",text:"Reply to newsletters",color:"#a855f7"},
  {id:6,q:"q4",text:"Reorganize downloads",color:"#6b7280"},
];

const SEED_CANVAS = [
  {id:1,text:"💡 Mobile app v2",x:60,y:60,color:"#3b82f6"},
  {id:2,text:"🎯 10k MRR by Q3",x:240,y:130,color:"#22c55e"},
  {id:3,text:"🔍 Competitor pricing",x:80,y:240,color:"#f59e0b"},
  {id:4,text:"📢 Launch blog",x:310,y:60,color:"#a855f7"},
];

const SEED_NOTES = [
  {id:1,title:"Q2 Planning Notes",body:"Key priorities:\n- Launch mobile app by August\n- Hire 2 engineers\n- Improve retention to 85%",pinned:true,color:"#3b82f6",created:addDays(-2)},
  {id:2,title:"Book list",body:"- Thinking Fast and Slow\n- The Mom Test\n- Zero to One\n- Inspired",pinned:false,color:"#22c55e",created:addDays(-4)},
  {id:3,title:"Weekly intentions",body:"Stay in deep work mode.\nLimit meetings to 3/day.\nShip dashboard feature by Friday.",pinned:false,color:"#f59e0b",created:tod()},
];

const DEFAULT_CATS = {
  work:     {color:"#0ea5e9", icon:"💼"},
  school:   {color:"#6366f1", icon:"📚"},
  health:   {color:"#10b981", icon:"🏃"},
  personal: {color:"#f59e0b", icon:"🌟"},
  finance:  {color:"#a855f7", icon:"💰"},
};
const CAT_ICONS = ["💼","📚","🏃","💰","🏠","❤️","🎯","✈️","🛒","🎨","🎮","🍔","☕","🌱","🐶","📞","🎵","⚽","💪","🧘","📝","💻","📅","🔥","⭐","🎓","🏥","🍳","🚗","🎁","📖","🧹","💡","🎬","🎉","🌍","🏋️","🧠","📷","🎸","🍕","🛏️","🐱","✏️","🔧","📌","🏆","🌸"];

// Accent palettes (#25). "lavender" = the original look; the rest are pastel.
const PALETTES = {
  lavender: {name:"Lavender", accent:"#c084fc", accentAlt:"#818cf8"},
  rose:     {name:"Rose",     accent:"#fda4af", accentAlt:"#f9a8d4"},
  mint:     {name:"Mint",     accent:"#6ee7b7", accentAlt:"#5eead4"},
  sky:      {name:"Sky",      accent:"#93c5fd", accentAlt:"#a5b4fc"},
  peach:    {name:"Peach",    accent:"#fdba74", accentAlt:"#fca5a5"},
  butter:   {name:"Butter",   accent:"#fcd34d", accentAlt:"#fbbf24"},
};

const mkT = (d, p=PALETTES.lavender) => ({
  bg:d?"#0c0e16":"#f3f3f8", surface:d?"#141828":"#ffffff", surface2:d?"#1c2238":"#f0f0f6",
  surface3:d?"#242c44":"#e4e4f0", border:d?"rgba(255,255,255,.07)":"rgba(0,0,0,.07)",
  text:d?"#eef0fa":"#18192e", textMuted:d?"#7a85a3":"#7878a0",
  accent:p.accent, accentAlt:p.accentAlt, accentGlow:p.accent+(d?"22":"1a"),
  grad:`linear-gradient(135deg,${p.accent},${p.accentAlt})`,
  sidebar:d?"#0e1120":"#f7f7fc", canvas:d?"#07080f":"#e8e8f4",
  danger:"#ef4444", success:"#22c55e", warning:"#f59e0b", info:"#3b82f6",
});

// Joyful little major-arpeggio chime via Web Audio (no asset). (#29)
let _actx=null;
function playComplete(){
  try{
    _actx=_actx||new (window.AudioContext||window.webkitAudioContext)();
    const ctx=_actx, now=ctx.currentTime, notes=[523.25,659.25,783.99];
    notes.forEach((f,i)=>{
      const o=ctx.createOscillator(), g=ctx.createGain(), t=now+i*0.08;
      o.type="triangle"; o.frequency.value=f;
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.18,t+0.02); g.gain.exponentialRampToValueAtTime(0.0008,t+0.35);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t+0.4);
    });
  }catch{}
}

export default function FlowSpace() {
  const [dark, setDark] = useState(true);
  const [scheme, setScheme] = useState(()=>localStorage.getItem("fs_scheme")||"lavender");
  useEffect(()=>{ try{localStorage.setItem("fs_scheme",scheme);}catch{} },[scheme]);
  const T = mkT(dark, PALETTES[scheme]||PALETTES.lavender);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [view, setView] = useState("myday");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const isLoadingData = useRef(false);
  const syncTimers = useRef({});
  const [tasks, setTasks] = useState([]);
  const [matrix, setMatrix] = useState([]);
  const [canvasNotes, setCanvasNotes] = useState([]);
  const [notes, setNotes] = useState([]);
  const [cats, setCats] = useState(DEFAULT_CATS);
  const [sideOpen, setSideOpen] = useState(true);
  const [selTask, setSelTask] = useState(null);
  const [input, setInput] = useState("");
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const awardedRef = useRef(new Set());
  const lastActiveRef = useRef(null);
  const [confirmFlow, setConfirmFlow] = useState(()=>{
    const h = window.location.hash || "";
    if (h.includes("type=signup")) return "signup";
    if (h.includes("type=recovery")) return "recovery";
    return null;
  });
  const [newAnim, setNewAnim] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [cmdOpen, setCmdOpen] = useState(false);
  const [pomSecs, setPomSecs] = useState(25*60);
  const [pomRun, setPomRun] = useState(false);
  const pomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (pomRun) pomRef.current = setInterval(()=>setPomSecs(t=>{if(t<=1){clearInterval(pomRef.current);setPomRun(false);return 25*60;}return t-1;}),1000);
    else clearInterval(pomRef.current);
    return ()=>clearInterval(pomRef.current);
  },[pomRun]);

  useEffect(()=>{
    const fn=e=>{
      if((e.metaKey||e.ctrlKey)&&e.key==="k"){e.preventDefault();setCmdOpen(c=>!c);}
      if(e.key==="Escape"){setCmdOpen(false);setShowSearch(false);}
    };
    window.addEventListener("keydown",fn);
    return ()=>window.removeEventListener("keydown",fn);
  },[]);

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{setUser(session?.user??null);setAuthLoading(false);});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>setUser(session?.user??null));
    return ()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(!user){setTasks([]);setMatrix([]);setCanvasNotes([]);setNotes([]);setCats(DEFAULT_CATS);return;}
    isLoadingData.current=true; setSyncing(true);
    Promise.all([db.loadTasks(user.id),db.loadMatrix(user.id),db.loadCanvas(user.id),db.loadNotes(user.id),db.loadCats(user.id)])
      .then(([t,m,c,n,cats])=>{
        setTasks(t); setMatrix(m); setCanvasNotes(c); setNotes(n);
        if(cats) setCats(cats);
        setSyncing(false);
        setTimeout(()=>{isLoadingData.current=false;},200);
      }).catch(()=>setSyncing(false));
  },[user]);

  useEffect(()=>{if(!user||isLoadingData.current)return;clearTimeout(syncTimers.current.m);syncTimers.current.m=setTimeout(()=>db.syncMatrix(matrix,user.id).catch(console.error),1500);},[matrix]);
  useEffect(()=>{if(!user||isLoadingData.current)return;clearTimeout(syncTimers.current.c);syncTimers.current.c=setTimeout(()=>db.syncCanvas(canvasNotes,user.id).catch(console.error),1500);},[canvasNotes]);
  useEffect(()=>{if(!user||isLoadingData.current)return;clearTimeout(syncTimers.current.n);syncTimers.current.n=setTimeout(()=>db.syncNotes(notes,user.id).catch(console.error),1500);},[notes]);
  useEffect(()=>{if(!user||isLoadingData.current)return;clearTimeout(syncTimers.current.k);syncTimers.current.k=setTimeout(()=>db.syncCats(cats,user.id).catch(console.error),1500);},[cats]);

  useEffect(()=>{
    if(!user) return;
    const ch=supabase.channel("fs-tasks")
      .on("postgres_changes",{event:"*",schema:"public",table:"tasks",filter:`user_id=eq.${user.id}`},({eventType,new:n,old:o})=>{
        if(eventType==="INSERT") setTasks(ts=>ts.some(t=>t.id===n.id)?ts:[fromDbTask(n),...ts]);
        if(eventType==="UPDATE") setTasks(ts=>ts.map(t=>t.id===n.id?fromDbTask(n):t));
        if(eventType==="DELETE") setTasks(ts=>ts.filter(t=>t.id!==o.id));
      }).subscribe();
    const onVisible=()=>{
      if(!document.hidden){
        isLoadingData.current=true;
        Promise.all([db.loadMatrix(user.id),db.loadCanvas(user.id),db.loadNotes(user.id)])
          .then(([m,c,n])=>{setMatrix(m);setCanvasNotes(c);setNotes(n);setTimeout(()=>{isLoadingData.current=false;},200);});
      }
    };
    document.addEventListener("visibilitychange",onVisible);
    return ()=>{supabase.removeChannel(ch);document.removeEventListener("visibilitychange",onVisible);};
  },[user]);

  useEffect(()=>{
    if(!user){ setXp(0); setStreak(0); awardedRef.current=new Set(); lastActiveRef.current=null; return; }
    let g={xp:0,streak:0,awarded:[],lastActive:null};
    try{ const raw=localStorage.getItem(`fs_gami_${user.id}`); if(raw) g=JSON.parse(raw); }catch{}
    awardedRef.current=new Set(g.awarded||[]);
    lastActiveRef.current=g.lastActive||null;
    const yest=addDays(-1);
    let st=g.streak||0;
    if(g.lastActive && g.lastActive!==tod() && g.lastActive!==yest) st=0;
    setStreak(st); setXp(g.xp||0);
  },[user]);

  useEffect(()=>{
    if(!user) return;
    try{ localStorage.setItem(`fs_gami_${user.id}`, JSON.stringify({xp,streak,awarded:[...awardedRef.current],lastActive:lastActiveRef.current})); }catch{}
  },[xp,streak,user]);

  const markActiveDay = useCallback(()=>{
    const today=tod();
    if(lastActiveRef.current===today) return;
    const yest=addDays(-1);
    setStreak(s=> lastActiveRef.current===yest ? s+1 : 1);
    lastActiveRef.current=today;
  },[]);

  const awardXp = useCallback((key,amount)=>{
    if(key && awardedRef.current.has(key)) return;
    if(key) awardedRef.current.add(key);
    setXp(x=>x+amount);
  },[]);

  const addTask = useCallback(()=>{
    if (!input.trim()) return;
    const {title,due:parsed}=parseNL(input);
    const due=parsed||(view==="myday"?tod():null);
    const inCat=view.startsWith("cat:")?view.slice(4):null;
    const t={id:crypto.randomUUID(),title,done:false,priority:"medium",tag:inCat||guessCat(title,cats),due,starred:view==="myday",notes:"",color:null,subtasks:[],recurring:null,quadrant:null};
    setTasks(ts=>[t,...ts]);
    setInput(""); awardXp("add-"+t.id,10); setNewAnim(t.id);
    if(view==="myday"||t.starred) markActiveDay();
    setTimeout(()=>setNewAnim(null),600);
    if(user) db.insertTask(t,user.id).catch(console.error);
  },[input,view,user,cats,awardXp,markActiveDay]);

  const toggleTask = id=>{
    const task=tasks.find(t=>t.id===id);
    if(!task) return;
    const newDone=!task.done;
    setTasks(ts=>ts.map(t=>t.id===id?{...t,done:newDone}:t));
    if(newDone){ awardXp("done-"+id,20); markActiveDay(); navigator.vibrate?.(30); playComplete(); }
    if(user) db.updateTask(id,{done:newDone}).catch(console.error);
  };
  const deleteTask = id=>{setTasks(ts=>ts.filter(t=>t.id!==id));if(selTask?.id===id)setSelTask(null);if(user)db.deleteTask(id).catch(console.error);};
  const updateTask = (id,patch)=>{setTasks(ts=>ts.map(t=>t.id===id?{...t,...patch}:t));if(selTask?.id===id)setSelTask(s=>({...s,...patch}));if(user)db.updateTask(id,patch).catch(console.error);};
  const reorderTasks = (fromId,toId)=>{
    setTasks(prev=>{
      const arr=[...prev];
      const fi=arr.findIndex(t=>t.id===fromId), ti=arr.findIndex(t=>t.id===toId);
      if(fi<0||ti<0) return prev;
      const [item]=arr.splice(fi,1); arr.splice(ti,0,item); return arr;
    });
  };

  const todStr=tod();
  const myDay=tasks.filter(t=>t.due===todStr||t.starred);
  const upcoming=tasks.filter(t=>t.due&&t.due>todStr);
  const completed=tasks.filter(t=>t.done);
  const overdueTasks=tasks.filter(t=>!t.done&&t.due&&t.due<todStr);
  const carryOver=()=>{
    if(!overdueTasks.length) return;
    navigator.vibrate?.(15);
    overdueTasks.forEach(t=>updateTask(t.id,{due:todStr}));
  };
  const addMatrixTask=(quadrant,text)=>{
    const title=(text||"").trim(); if(!title) return;
    const t={id:crypto.randomUUID(),title,done:false,priority:"medium",tag:guessCat(title,cats),due:null,starred:false,notes:"",color:null,subtasks:[],recurring:null,quadrant};
    setTasks(ts=>[t,...ts]); awardXp("add-"+t.id,10);
    if(user) db.insertTask(t,user.id).catch(console.error);
  };
  const sendToMyDay=id=>{ navigator.vibrate?.(15); updateTask(id,{starred:true,due:todStr}); markActiveDay(); };
  const level=Math.floor(xp/100)+1, xpLvl=xp%100;
  const pmm=String(Math.floor(pomSecs/60)).padStart(2,"0"), pms=String(pomSecs%60).padStart(2,"0");

  const sortByDate=arr=>[...arr].sort((a,b)=>{
    if(a.done!==b.done) return a.done?1:-1;
    if(!a.due&&!b.due) return 0; if(!a.due) return 1; if(!b.due) return -1;
    return a.due.localeCompare(b.due);
  });

  const getViewTasks=()=>{
    let base;
    if(view.startsWith("cat:")){ const c=view.slice(4); base=tasks.filter(t=>t.tag===c); }
    else base=view==="myday"?myDay:view==="upcoming"?upcoming:view==="completed"?completed:tasks;
    if(search) base=base.filter(t=>t.title.toLowerCase().includes(search.toLowerCase()));
    return sortByDate(base);
  };

  const navItems=[
    {id:"myday",label:"My Day",icon:"sun",badge:myDay.filter(t=>!t.done).length},
    {id:"upcoming",label:"Upcoming",icon:"cal",badge:upcoming.filter(t=>!t.done).length},
    {id:"all",label:"All Tasks",icon:"layers",badge:null},
    {id:"completed",label:"Completed",icon:"done",badge:completed.length},
    {id:"matrix",label:"Priority Matrix",icon:"grid",badge:null},
    {id:"notes",label:"Notes",icon:"note",badge:null},
    {id:"analytics",label:"Analytics",icon:"bar",badge:null},
    {id:"settings",label:"Settings",icon:"cog",badge:null},
  ];

  if(confirmFlow==="signup") return <SignupSuccess onContinue={()=>{ try{window.history.replaceState(null,"",window.location.pathname);}catch{} setConfirmFlow(null); }}/>;
  if(confirmFlow==="recovery") return <ResetPassword onDone={()=>{ try{window.history.replaceState(null,"",window.location.pathname);}catch{} setConfirmFlow(null); }}/>;
  if(authLoading) return <div style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#0c0e16",color:"#7a85a3",fontFamily:"'DM Sans',sans-serif"}}>Loading…</div>;
  if(!user) return <AuthScreen/>;

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:T.bg,color:T.text,height:"100%",display:"flex",overflow:"hidden",transition:"background .3s,color .3s"}}>
      <FontLink/>
      {aboutOpen&&<AboutModal T={T} onClose={()=>setAboutOpen(false)}/>}
      {cmdOpen&&<CmdPalette T={T} tasks={tasks} onClose={()=>setCmdOpen(false)} onGo={v=>{setView(v);setCmdOpen(false);}} onAdd={t=>{setInput(t);setCmdOpen(false);setTimeout(()=>inputRef.current?.focus(),80);}}/>}
      <aside style={{width:sideOpen?224:60,transition:"width .3s cubic-bezier(.4,0,.2,1)",background:T.sidebar,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",overflow:"hidden",flexShrink:0,zIndex:30}}>
        <button onClick={()=>setAboutOpen(true)} title="About FlowSpace" style={{padding:"18px 14px",display:"flex",alignItems:"center",gap:9,background:"none",border:"none",cursor:"pointer",width:"100%"}}>
          <div style={{width:30,height:30,borderRadius:9,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 3px 12px ${T.accent}55`}}>
            <Ico n="zap" s={14} c="#fff"/>
          </div>
          {sideOpen&&<span style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,letterSpacing:"-.4px",background:`linear-gradient(90deg,${T.accent},${T.accentAlt})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",whiteSpace:"nowrap"}}>FlowSpace</span>}
        </button>
        {sideOpen&&(
          <div style={{padding:"0 12px 14px"}}>
            <div style={{background:T.surface2,borderRadius:9,padding:"8px 10px",border:`1px solid ${T.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:11,color:T.textMuted,fontWeight:600}}>LVL {level}</span>
                <span style={{fontSize:11,color:T.accent,fontWeight:700}}>{xp} XP</span>
              </div>
              <div style={{height:4,background:T.border,borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${xpLvl}%`,background:`linear-gradient(90deg,${T.accent},${T.accentAlt})`,borderRadius:2,transition:"width .5s ease"}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                <span style={{fontSize:10,color:T.textMuted}}>🔥 {streak}-day streak</span>
                <span style={{fontSize:10,color:T.textMuted}}>{100-xpLvl} to next</span>
              </div>
            </div>
          </div>
        )}
        <nav style={{flex:1,minHeight:0,padding:"0 6px",overflowY:"auto",overflowX:"hidden"}}>
          {navItems.map(item=>(
            <button key={item.id} onClick={()=>setView(item.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:sideOpen?"8px 10px":"8px 0",justifyContent:sideOpen?"flex-start":"center",borderRadius:9,border:"none",cursor:"pointer",marginBottom:1,transition:"all .15s",background:view===item.id?T.accentGlow:"transparent",color:view===item.id?T.accent:T.textMuted,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:view===item.id?600:400}}>
              <Ico n={item.icon} s={16} c={view===item.id?T.accent:T.textMuted}/>
              {sideOpen&&<span style={{flex:1,textAlign:"left",whiteSpace:"nowrap"}}>{item.label}</span>}
              {sideOpen&&item.badge>0&&<span style={{background:view===item.id?T.accent:T.surface3,color:view===item.id?"#fff":T.textMuted,fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:10}}>{item.badge}</span>}
            </button>
          ))}
          {sideOpen&&Object.keys(cats).length>0&&(
            <div style={{padding:"12px 10px 4px",fontSize:9,fontWeight:700,letterSpacing:".6px",textTransform:"uppercase",color:T.textMuted}}>Folders</div>
          )}
          {Object.entries(cats).map(([name,meta])=>{
            const v=`cat:${name}`, active=view===v, count=tasks.filter(t=>t.tag===name&&!t.done).length;
            return (
              <button key={name} onClick={()=>setView(v)} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:sideOpen?"8px 10px":"8px 0",justifyContent:sideOpen?"flex-start":"center",borderRadius:9,border:"none",cursor:"pointer",marginBottom:1,transition:"all .15s",background:active?T.accentGlow:"transparent",color:active?T.accent:T.textMuted,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:active?600:400}}>
                <span style={{fontSize:15,width:16,textAlign:"center",flexShrink:0}}>{meta.icon}</span>
                {sideOpen&&<span style={{flex:1,textAlign:"left",whiteSpace:"nowrap",textTransform:"capitalize"}}>{name}</span>}
                {sideOpen&&count>0&&<span style={{background:active?T.accent:T.surface3,color:active?"#fff":T.textMuted,fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:10}}>{count}</span>}
              </button>
            );
          })}
        </nav>
        {sideOpen&&(
          <div style={{padding:"10px 12px"}}>
            <div style={{background:T.surface2,borderRadius:11,padding:12,border:`1px solid ${T.border}`,...(pomRun?{animation:"glow 2s infinite"}:{})}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:10,color:T.textMuted,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase"}}>Pomodoro</span>
                <Ico n="clock" s={12} c={pomRun?T.accent:T.textMuted}/>
              </div>
              <div style={{fontSize:26,fontFamily:"'Sora',sans-serif",fontWeight:700,color:pomRun?T.accent:T.text,letterSpacing:"-1px",textAlign:"center",marginBottom:8}}>{pmm}:{pms}</div>
              <button onClick={()=>setPomRun(r=>!r)} style={{width:"100%",padding:"6px",borderRadius:8,border:"none",cursor:"pointer",background:pomRun?T.danger:T.grad,color:"#fff",fontSize:11,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>
                {pomRun?"⏸ Pause":"▶ Focus"}
              </button>
            </div>
          </div>
        )}
        <div style={{padding:"10px 6px",borderTop:`1px solid ${T.border}`,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
          {sideOpen&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",padding:"0 4px",marginBottom:2}}>
            <span style={{fontSize:9,color:T.textMuted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:130}}>{user?.email}</span>
            <button onClick={()=>supabase.auth.signOut()} style={{fontSize:9,color:T.danger,background:"none",border:"none",cursor:"pointer",padding:"1px 4px",borderRadius:3,whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif"}}>Sign out</button>
          </div>}
          <div style={{display:"flex",gap:4}}>
            {syncing&&<div style={{width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:6,height:6,borderRadius:"50%",background:T.accent,animation:"pulse 1s infinite"}}/></div>}
            <SB T={T} onClick={()=>setShowSearch(s=>!s)}><Ico n="search" s={14}/></SB>
            <SB T={T} onClick={()=>setDark(d=>!d)}><Ico n={dark?"sun":"moon"} s={14}/></SB>
            <SB T={T} onClick={()=>setSideOpen(s=>!s)}><Ico n="menu" s={14}/></SB>
          </div>
        </div>
      </aside>
      <main style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{background:T.surface2,borderBottom:`1px solid ${T.border}`,padding:"5px 20px",display:"flex",alignItems:"center",gap:16,flexShrink:0}}>
          <button onClick={()=>setCmdOpen(true)} style={{display:"flex",alignItems:"center",gap:5,background:"none",border:"none",cursor:"pointer",color:T.textMuted,fontSize:11,fontFamily:"'DM Sans',sans-serif"}}>
            <span style={{background:T.surface3,border:`1px solid ${T.border}`,padding:"1px 6px",borderRadius:4,fontSize:10,fontWeight:600}}>⌘K</span>
            <span>Command Palette</span>
          </button>
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
          {view==="matrix"&&<MatrixView T={T} tasks={tasks} cats={cats} updateTask={updateTask} deleteTask={deleteTask} addMatrixTask={addMatrixTask} sendToMyDay={sendToMyDay} canvasNotes={canvasNotes} setCanvasNotes={setCanvasNotes} setTasks={setTasks}/>}
          {view==="notes"&&<NotesView T={T} notes={notes} setNotes={setNotes}/>}
          {view==="analytics"&&<AnalyticsView T={T} tasks={tasks} xp={xp} level={level} streak={streak}/>}
          {view==="settings"&&<SettingsView T={T} dark={dark} setDark={setDark} cats={cats} setCats={setCats} scheme={scheme} setScheme={setScheme}/>}
          {(["myday","upcoming","all","completed"].includes(view)||view.startsWith("cat:"))&&(
            <TaskPanel T={T} tasks={getViewTasks()} view={view} input={input} setInput={setInput} inputRef={inputRef} addTask={addTask} toggleTask={toggleTask} deleteTask={deleteTask} updateTask={updateTask} reorderTasks={reorderTasks} selTask={selTask} setSelTask={setSelTask} newAnim={newAnim} cats={cats} onCarryOver={carryOver} overdueCount={overdueTasks.length}/>
          )}
        </div>
      </main>
      {(["myday","upcoming","all"].includes(view)||view.startsWith("cat:"))&&(
        <button onClick={()=>inputRef.current?.focus()} style={{position:"fixed",bottom:26,right:26,width:50,height:50,borderRadius:"50%",border:"none",cursor:"pointer",background:T.grad,color:"#fff",boxShadow:"0 6px 20px rgba(192,132,252,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50,transition:"transform .15s"}}
          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"}
          onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
          <Ico n="plus" s={22} c="#fff"/>
        </button>
      )}
    </div>
  );
}

const SB = ({onClick,T,children})=>(
  <button onClick={onClick} style={{width:30,height:30,borderRadius:7,border:"none",cursor:"pointer",background:"transparent",color:T.textMuted,display:"flex",alignItems:"center",justifyContent:"center",transition:"background .15s"}}
    onMouseEnter={e=>e.currentTarget.style.background=T.surface3}
    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
    {children}
  </button>
);

function AboutModal({T,onClose}) {
  // Placeholder links — replace the href/handles with your real accounts later.
  const socials=[
    {label:"Instagram", handle:"@flowspace", href:"#", emoji:"📷"},
    {label:"X", handle:"@flowspace", href:"#", emoji:"✖️"},
    {label:"TikTok", handle:"@flowspace", href:"#", emoji:"🎵"},
    {label:"Email", handle:"hello@flowspace.app", href:"mailto:hello@flowspace.app", emoji:"✉️"},
  ];
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:1200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{width:360,maxWidth:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:18,padding:26,boxShadow:"0 24px 60px rgba(0,0,0,.5)",animation:"slideIn .2s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:40,height:40,borderRadius:11,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 16px ${T.accent}55`}}><Ico n="zap" s={20} c="#fff"/></div>
            <div>
              <div style={{fontFamily:"'Sora',sans-serif",fontSize:18,fontWeight:700,color:T.text}}>FlowSpace</div>
              <div style={{fontSize:11,color:T.textMuted}}>Focus. Flow. Finish.</div>
            </div>
          </div>
          <button onClick={onClose} style={{width:26,height:26,borderRadius:7,border:"none",cursor:"pointer",background:T.surface2,color:T.textMuted,display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" s={13}/></button>
        </div>
        <p style={{fontSize:12,color:T.textMuted,lineHeight:1.6,marginBottom:16}}>Your all-in-one space for tasks, priorities, notes and focus. Thanks for being here 💜</p>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {socials.map(s=>(
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,border:`1px solid ${T.border}`,background:T.surface2,textDecoration:"none",color:T.text}}>
              <span style={{fontSize:16}}>{s.emoji}</span>
              <span style={{fontSize:13,fontWeight:600,flex:1}}>{s.label}</span>
              <span style={{fontSize:12,color:T.textMuted}}>{s.handle}</span>
            </a>
          ))}
        </div>
        <div style={{fontSize:10,color:T.textMuted,textAlign:"center",marginTop:16,opacity:.6}}>v1.0 · made with FlowSpace</div>
      </div>
    </div>
  );
}

function CmdPalette({T,tasks,onClose,onGo,onAdd}) {
  const [q,setQ]=useState("");
  const pages=["myday","upcoming","all","completed","matrix","notes","analytics","settings"];
  const ft=tasks.filter(t=>!t.done&&q&&t.title.toLowerCase().includes(q.toLowerCase())).slice(0,4);
  const fp=pages.filter(p=>p.includes(q.toLowerCase()));
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
  );
}
const CS=({label,children})=><div><div style={{padding:"7px 16px 3px",fontSize:10,fontWeight:700,letterSpacing:".6px",textTransform:"uppercase",opacity:.5}}>{label}</div>{children}</div>;
const CR=({icon,label,sub,T,onClick})=>(
  <div onClick={onClick} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 16px",cursor:"pointer",transition:"background .1s"}}
    onMouseEnter={e=>e.currentTarget.style.background=T.accentGlow}
    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
    <Ico n={icon} s={14} c={T.accent}/><span style={{flex:1,fontSize:13}}>{label}</span>
    {sub&&<span style={{fontSize:11,opacity:.5}}>{sub}</span>}
  </div>
);

function TaskPanel({T,tasks,view,input,setInput,inputRef,addTask,toggleTask,deleteTask,updateTask,reorderTasks,selTask,setSelTask,newAnim,cats,onCarryOver,overdueCount}) {
  const [filter,setFilter]=useState("all");
  const [catFilter,setCatFilter]=useState(null);
  const [dragId,setDragId]=useState(null);
  const [dropId,setDropId]=useState(null);
  const dragIdRef=useRef(null);
  const dropIdRef=useRef(null);
  const didDragRef=useRef(false);
  const labels={myday:"My Day",upcoming:"Upcoming",all:"All Tasks",completed:"Completed"};
  const catKey=view.startsWith("cat:")?view.slice(4):null;
  const titleLabel=catKey?`${cats[catKey]?.icon||"📁"} ${catKey.charAt(0).toUpperCase()+catKey.slice(1)}`:labels[view];
  let show=filter==="active"?tasks.filter(t=>!t.done):filter==="done"?tasks.filter(t=>t.done):tasks;
  if(view==="all"&&catFilter) show=show.filter(t=>t.tag===catFilter);

  const onCardDown=(e,id)=>{
    if(e.target.closest("button")) return;
    didDragRef.current=false;
    startPressDrag(e,()=>{
      didDragRef.current=true;
      dragIdRef.current=id; setDragId(id); navigator.vibrate?.(20);
      runDrag(
        ev=>{ const el=document.elementFromPoint(ev.clientX,ev.clientY); const card=el&&el.closest("[data-task-id]"); dropIdRef.current=card?card.getAttribute("data-task-id"):null; setDropId(dropIdRef.current); },
        ()=>{ const from=dragIdRef.current,to=dropIdRef.current; if(from!=null&&to!=null&&String(from)!==String(to)) reorderTasks(from,to); dragIdRef.current=null; dropIdRef.current=null; setDragId(null); setDropId(null); }
      );
    });
  };
  const selectCard=task=>{ if(didDragRef.current){ didDragRef.current=false; return; } setSelTask(task); };
  return (
    <div style={{flex:1,display:"flex",overflow:"hidden"}}>
      <div style={{flex:1,overflowY:"auto",padding:"22px 26px"}}>
        <div style={{marginBottom:18}}>
          {view==="myday"&&<div style={{fontSize:12,color:T.textMuted,fontWeight:500,marginBottom:3}}>{new Date().getHours()<12?"Good morning 🌤":new Date().getHours()<17?"Keep it up 💪":"Good evening 🌙"}</div>}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
            <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:700,letterSpacing:"-.5px"}}>{titleLabel}</h1>
            <span style={{fontSize:11,color:T.textMuted}}>Sorted by date · drag ⠿ to reorder</span>
          </div>
          <div style={{fontSize:12,color:T.textMuted,marginTop:2}}>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}{view==="myday"&&` · ${tasks.filter(t=>!t.done).length} remaining`}</div>
        </div>
        {view==="myday"&&overdueCount>0&&(
          <button onClick={onCarryOver} style={{display:"flex",alignItems:"center",gap:7,width:"100%",marginBottom:12,padding:"9px 12px",borderRadius:11,border:`1px solid ${T.warning}55`,background:T.warning+"15",color:T.warning,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>
            <Ico n="repeat" s={14} c={T.warning}/> Carry over {overdueCount} overdue {overdueCount===1?"task":"tasks"} to today
          </button>
        )}
        {view!=="completed"&&(
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            <div style={{flex:1,display:"flex",alignItems:"center",gap:9,background:T.surface,border:`1px solid ${T.border}`,borderRadius:11,padding:"0 12px"}}>
              <Ico n="plus" s={15} c={T.textMuted}/>
              <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTask()} placeholder={view==="myday"?'Add to My Day… "Meet client May 26 at 4pm"':'Add task… "Call dentist tomorrow"'} style={{flex:1,background:"none",border:"none",outline:"none",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:13,padding:"12px 0"}}/>
            </div>
            <button onClick={addTask} style={{padding:"0 18px",borderRadius:11,border:"none",cursor:"pointer",background:T.grad,color:"#fff",fontWeight:700,fontSize:13,fontFamily:"'DM Sans',sans-serif",boxShadow:"0 3px 12px rgba(192,132,252,.35)"}}>Add</button>
          </div>
        )}
        {view!=="completed"&&(
          <div style={{display:"flex",gap:5,marginBottom:12}}>
            {["all","active","done"].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{padding:"4px 13px",borderRadius:20,border:`1px solid ${filter===f?T.accent:T.border}`,background:filter===f?T.accent+"22":"transparent",color:filter===f?T.accent:T.textMuted,cursor:"pointer",fontSize:11,fontWeight:filter===f?700:400,fontFamily:"'DM Sans',sans-serif",transition:"all .15s"}}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
            ))}
          </div>
        )}
        {view==="all"&&(
          <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
            <button onClick={()=>setCatFilter(null)} style={{padding:"4px 11px",borderRadius:20,border:`1px solid ${!catFilter?T.accent:T.border}`,background:!catFilter?T.accent+"22":"transparent",color:!catFilter?T.accent:T.textMuted,cursor:"pointer",fontSize:11,fontWeight:!catFilter?700:400,fontFamily:"'DM Sans',sans-serif"}}>All</button>
            {Object.entries(cats).map(([name,meta])=>(
              <button key={name} onClick={()=>setCatFilter(catFilter===name?null:name)} style={{padding:"4px 11px",borderRadius:20,border:`1px solid ${catFilter===name?meta.color:T.border}`,background:catFilter===name?meta.color+"22":"transparent",color:catFilter===name?meta.color:T.textMuted,cursor:"pointer",fontSize:11,fontWeight:catFilter===name?700:400,fontFamily:"'DM Sans',sans-serif",textTransform:"capitalize"}}>{meta.icon} {name}</button>
            ))}
          </div>
        )}
        <div style={{display:"flex",flexDirection:"column",gap:4}}>
          {show.filter(t=>!t.done).map(task=>(
            <TCard key={task.id} task={task} T={T} cats={cats} onToggle={toggleTask} onDelete={deleteTask} onSel={selectCard} sel={selTask?.id===task.id} entering={newAnim===task.id} dragging={dragId===task.id} dropTarget={dropId===task.id}
              onDown={onCardDown}/>
          ))}
          {show.filter(t=>t.done).length>0&&<>
            <div style={{fontSize:10,color:T.textMuted,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",padding:"10px 2px 4px",display:"flex",alignItems:"center",gap:5}}>
              <Ico n="check" s={11} c={T.textMuted}/> Completed · {show.filter(t=>t.done).length}
            </div>
            {show.filter(t=>t.done).map(task=>(
              <TCard key={task.id} task={task} T={T} cats={cats} onToggle={toggleTask} onDelete={deleteTask} onSel={selectCard} sel={selTask?.id===task.id}/>
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
  );
}

function TCard({task,T,cats,onToggle,onDelete,onSel,sel,entering,dragging,dropTarget,onDown}) {
  const [hov,setHov]=useState(false);
  const ov=task.due&&task.due<tod()&&!task.done;
  const catMeta=cats[task.tag];
  const catColor=catMeta?.color||"#6b7280";
  const qColor=QUAD[task.quadrant]?.color;
  return (
    <div className={entering?"te":""} data-task-id={task.id}
      onPointerDown={onDown?e=>onDown(e,task.id):undefined}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={()=>onSel(task)}
      style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",borderRadius:11,background:sel?T.accentGlow:dragging?"rgba(192,132,252,.06)":hov?"rgba(255,255,255,0.04)":"transparent",border:`1px solid ${dropTarget?T.accent:sel?T.accent+"44":T.border}`,cursor:"pointer",transition:"all .12s",position:"relative",opacity:task.done?.5:dragging?.4:1,transform:dragging?"scale(.98)":"scale(1)",userSelect:"none",WebkitUserSelect:"none",touchAction:"pan-y"}}>
      {task.color&&<div style={{position:"absolute",left:0,top:8,bottom:8,width:3,borderRadius:2,background:task.color}}/>}
      <div style={{color:T.textMuted,opacity:hov?.6:0,transition:"opacity .15s",flexShrink:0,marginTop:1,cursor:"grab",paddingLeft:task.color?4:0}}><Ico n="grip" s={14} c={T.textMuted}/></div>
      <button onClick={e=>{e.stopPropagation();onToggle(task.id);}} style={{width:19,height:19,borderRadius:5,border:`2px solid ${task.done?T.success:qColor||T.border}`,background:task.done?T.success:"transparent",cursor:"pointer",flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
        {task.done&&<Ico n="check" s={10} c="#fff" st={{animation:"checkB .25s ease"}}/>}
      </button>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          <span style={{fontSize:13,fontWeight:500,color:task.done?T.textMuted:T.text,textDecoration:task.done?"line-through":"none"}}>{task.title}</span>
          {task.starred&&<Ico n="star" s={11} c="#f59e0b" st={{fill:"#f59e0b",flexShrink:0}}/>}
          {task.recurring&&<Ico n="repeat" s={11} c={T.textMuted} st={{flexShrink:0}}/>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5,marginTop:3,flexWrap:"wrap"}}>
          {task.tag&&<span style={{fontSize:10,padding:"1px 7px",borderRadius:20,background:catColor+"22",color:catColor,fontWeight:600}}>{catMeta?.icon?catMeta.icon+" ":""}{task.tag}</span>}
          {task.due&&<span style={{fontSize:11,color:ov?T.danger:T.textMuted,fontWeight:ov?700:400}}>{fmtDate(task.due)}</span>}
          {task.subtasks?.length>0&&<span style={{fontSize:10,color:T.textMuted}}>{task.subtasks.filter(s=>s.done).length}/{task.subtasks.length}</span>}
        </div>
      </div>
      {qColor&&<div title={QUAD[task.quadrant]?.label} style={{width:6,height:6,borderRadius:"50%",background:qColor,flexShrink:0,marginTop:6}}/>}
      {hov&&<button onClick={e=>{e.stopPropagation();onDelete(task.id);}} style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",width:24,height:24,borderRadius:6,border:"none",cursor:"pointer",background:T.surface2,color:T.textMuted,display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn .1s"}}><Ico n="trash" s={11}/></button>}
    </div>
  );
}

function TDetail({task,T,cats,onUpdate,onDelete,onClose}) {
  const [nts,setNts]=useState(task.notes||"");
  const [ns,setNs]=useState("");
  useEffect(()=>setNts(task.notes||""),[task.id]);
  const addSub=()=>{if(!ns.trim())return;onUpdate(task.id,{subtasks:[...(task.subtasks||[]),{id:Date.now(),title:ns.trim(),done:false}]});setNs("");};
  const COLS=[null,"#ef4444","#f97316","#f59e0b","#22c55e","#3b82f6","#a855f7"];
  return (
    <div style={{width:280,borderLeft:`1px solid ${T.border}`,background:T.surface,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:14,animation:"slideIn .2s ease",flexShrink:0}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <h3 style={{fontFamily:"'Sora',sans-serif",fontSize:13,fontWeight:600,flex:1,lineHeight:1.4}}>{task.title}</h3>
        <button onClick={onClose} style={{width:24,height:24,borderRadius:6,border:"none",cursor:"pointer",background:T.surface2,color:T.textMuted,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginLeft:6}}><Ico n="x" s={13}/></button>
      </div>
      <DL label="Color Label" T={T}>
        <div style={{display:"flex",gap:5,marginTop:5,flexWrap:"wrap"}}>
          {COLS.map(c=><div key={c||"none"} onClick={()=>onUpdate(task.id,{color:c})} style={{width:18,height:18,borderRadius:4,background:c||T.surface3,border:`2px solid ${task.color===c?T.text:"transparent"}`,cursor:"pointer"}}/>)}
        </div>
      </DL>
      <DL label="Priority (Eisenhower)" T={T}>
        <div style={{display:"flex",flexDirection:"column",gap:4,marginTop:5}}>
          {QUAD_ORDER.map(q=>{const m=QUAD[q],on=task.quadrant===q;return(
            <button key={q} onClick={()=>onUpdate(task.id,{quadrant:on?null:q})} style={{display:"flex",alignItems:"center",gap:7,padding:"6px 9px",borderRadius:7,border:`1px solid ${on?m.color:T.border}`,background:on?m.color+"22":"transparent",color:on?m.color:T.textMuted,cursor:"pointer",fontSize:11,fontWeight:on?700:500,fontFamily:"'DM Sans',sans-serif",textAlign:"left"}}>
              <span style={{width:8,height:8,borderRadius:"50%",background:m.color,flexShrink:0}}/>
              <span style={{flex:1}}>{m.label}</span>
              <span style={{fontSize:9,opacity:.7}}>{m.short}</span>
            </button>
          );})}
        </div>
      </DL>
      <DL label="Due Date" T={T}>
        <input type="date" value={task.due||""} onChange={e=>onUpdate(task.id,{due:e.target.value})} style={{marginTop:5,width:"100%",padding:"7px 9px",borderRadius:7,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none"}}/>
      </DL>
      <DL label="Recurring" T={T}>
        <select value={task.recurring||""} onChange={e=>onUpdate(task.id,{recurring:e.target.value||null})} style={{marginTop:5,width:"100%",padding:"7px 9px",borderRadius:7,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none",cursor:"pointer"}}>
          <option value="">No repeat</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </DL>
      <DL label="Category" T={T}>
        <div style={{display:"flex",gap:4,marginTop:5,flexWrap:"wrap"}}>
          {Object.entries(cats).map(([tag,meta])=>(
            <button key={tag} onClick={()=>onUpdate(task.id,{tag})} style={{padding:"3px 9px",borderRadius:20,border:`1px solid ${task.tag===tag?meta.color:T.border}`,background:task.tag===tag?meta.color+"22":"transparent",color:task.tag===tag?meta.color:T.textMuted,cursor:"pointer",fontSize:10,fontWeight:task.tag===tag?700:400,fontFamily:"'DM Sans',sans-serif"}}>{meta.icon} {tag}</button>
          ))}
        </div>
      </DL>
      <DL label="Subtasks" T={T}>
        <div style={{display:"flex",flexDirection:"column",gap:4,marginTop:5}}>
          {(task.subtasks||[]).map(sub=>(
            <div key={sub.id} style={{display:"flex",alignItems:"center",gap:7}}>
              <button onClick={()=>onUpdate(task.id,{subtasks:task.subtasks.map(s=>s.id===sub.id?{...s,done:!s.done}:s)})} style={{width:15,height:15,borderRadius:4,border:`1.5px solid ${sub.done?T.success:T.border}`,background:sub.done?T.success:"transparent",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {sub.done&&<Ico n="check" s={8} c="#fff"/>}
              </button>
              <span style={{fontSize:12,color:sub.done?T.textMuted:T.text,textDecoration:sub.done?"line-through":"none"}}>{sub.title}</span>
            </div>
          ))}
          <div style={{display:"flex",gap:5,marginTop:3}}>
            <input value={ns} onChange={e=>setNs(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addSub()} placeholder="Add step…" style={{flex:1,padding:"5px 7px",borderRadius:6,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:11,outline:"none"}}/>
            <button onClick={addSub} style={{padding:"5px 9px",borderRadius:6,border:"none",cursor:"pointer",background:T.accentGlow,color:T.accent,fontSize:12,fontWeight:700}}>+</button>
          </div>
        </div>
      </DL>
      <DL label="Notes" T={T}>
        <textarea value={nts} onChange={e=>{setNts(e.target.value);onUpdate(task.id,{notes:e.target.value});}} placeholder="Notes, links, markdown…" style={{marginTop:5,width:"100%",minHeight:80,padding:"7px 9px",borderRadius:7,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none",resize:"vertical",lineHeight:1.6}}/>
      </DL>
      <div style={{display:"flex",gap:6}}>
        <button onClick={()=>onUpdate(task.id,{starred:!task.starred})} style={{flex:1,padding:"7px",borderRadius:8,border:`1px solid ${task.starred?"#f59e0b":T.border}`,background:task.starred?"#f59e0b22":"transparent",color:task.starred?"#f59e0b":T.textMuted,cursor:"pointer",fontSize:11,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
          <Ico n="star" s={12} c={task.starred?"#f59e0b":undefined} st={task.starred?{fill:"#f59e0b"}:{}}/>Star
        </button>
        <button onClick={()=>onDelete(task.id)} style={{flex:1,padding:"7px",borderRadius:8,border:`1px solid ${T.danger}22`,background:T.danger+"11",color:T.danger,cursor:"pointer",fontSize:11,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
          <Ico n="trash" s={12} c={T.danger}/>Delete
        </button>
      </div>
    </div>
  );
}
const DL=({label,T,children})=><div><span style={{fontSize:10,fontWeight:700,letterSpacing:".6px",textTransform:"uppercase",color:T.textMuted}}>{label}</span>{children}</div>;

function MatrixView({T,tasks,cats,updateTask,deleteTask,addMatrixTask,sendToMyDay,canvasNotes,setCanvasNotes,setTasks}) {
  const [tab,setTab]=useState("matrix");
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"14px 22px 0",borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
          <div>
            <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:19,fontWeight:700,letterSpacing:"-.4px"}}>{tab==="matrix"?"Priority Matrix":"Freeform Canvas"}</h1>
            <p style={{fontSize:11,color:T.textMuted,marginTop:1}}>{tab==="matrix"?"Real tasks · drag between quadrants to set priority · also shown in All Tasks":"Double-click to create note · drag freely · purple → converts to task"}</p>
          </div>
          <div style={{display:"flex",gap:4,paddingBottom:2}}>
            {["matrix","canvas"].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{padding:"5px 14px",borderRadius:"8px 8px 0 0",border:`1px solid ${T.border}`,borderBottom:"none",cursor:"pointer",background:tab===t?T.surface:T.sidebar,color:tab===t?T.accent:T.textMuted,fontSize:12,fontWeight:tab===t?700:400,fontFamily:"'DM Sans',sans-serif",transition:"all .15s"}}>
                {t==="matrix"?"⊞ Eisenhower":"✦ Freeform"}
              </button>
            ))}
          </div>
        </div>
      </div>
      {tab==="matrix"
        ?<EisenhowerMatrix T={T} tasks={tasks} cats={cats} updateTask={updateTask} deleteTask={deleteTask} addMatrixTask={addMatrixTask} sendToMyDay={sendToMyDay}/>
        :<FreeformCanvas T={T} notes={canvasNotes} setNotes={setCanvasNotes} setTasks={setTasks}/>}
    </div>
  );
}

function EisenhowerMatrix({T,tasks,cats,updateTask,deleteTask,addMatrixTask,sendToMyDay}) {
  const [addingIn,setAddingIn]=useState(null);
  const [newText,setNewText]=useState("");
  const [dragOver,setDragOver]=useState(null);
  const [dragId,setDragId]=useState(null);
  const [editId,setEditId]=useState(null);
  const dragOverRef=useRef(null);
  useEffect(()=>{
    const fn=e=>{if(e.key==="n"&&!e.metaKey&&!e.ctrlKey&&document.activeElement.tagName!=="INPUT"&&document.activeElement.tagName!=="TEXTAREA")setAddingIn("q1");};
    window.addEventListener("keydown",fn); return ()=>window.removeEventListener("keydown",fn);
  },[]);
  const addNote=qid=>{const txt=newText.trim();if(!txt)return;addMatrixTask(qid,txt);setNewText("");setAddingIn(null);};
  const onNoteDown=(e,task)=>{
    if(e.target.closest("button")||e.target.tagName==="TEXTAREA") return;
    startPressDrag(e,()=>{
      setDragId(task.id); navigator.vibrate?.(20);
      runDrag(
        ev=>{ const el=document.elementFromPoint(ev.clientX,ev.clientY); const qd=el&&el.closest("[data-quadrant]"); dragOverRef.current=qd?qd.getAttribute("data-quadrant"):null; setDragOver(dragOverRef.current); },
        ()=>{ const q=dragOverRef.current; if(q&&q!==task.quadrant) updateTask(task.id,{quadrant:q}); dragOverRef.current=null; setDragId(null); setDragOver(null); }
      );
    });
  };
  return (
    <div style={{flex:1,display:"grid",gridTemplateColumns:"1fr 1fr",gridTemplateRows:"1fr 1fr",gap:1,background:T.border,overflow:"hidden"}}>
      {QUAD_ORDER.map(qid=>{const q=QUAD[qid];return(
        <div key={qid} data-quadrant={qid}
          style={{background:dragOver===qid?q.color+"12":T.bg,transition:"background .15s",display:"flex",flexDirection:"column",overflow:"hidden",outline:dragOver===qid?`2px dashed ${q.color}66`:"none",outlineOffset:"-2px"}}>
          <div style={{padding:"9px 14px 7px",borderBottom:`1px solid ${T.border}`,background:q.color+"12",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:11,fontWeight:700,color:q.color}}>{q.icon} {q.label}</span>
              <span style={{fontSize:9,color:T.textMuted,background:T.surface2,padding:"1px 6px",borderRadius:20,border:`1px solid ${T.border}`}}>{q.short}</span>
            </div>
            <button onClick={()=>{setAddingIn(qid);setNewText("");}} style={{width:22,height:22,borderRadius:5,border:"none",cursor:"pointer",background:q.color+"22",color:q.color,display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="plus" s={12} c={q.color}/></button>
          </div>
          <div style={{flex:1,padding:10,overflowY:"auto",display:"flex",flexWrap:"wrap",gap:7,alignContent:"flex-start"}}>
            {tasks.filter(t=>t.quadrant===qid&&!t.done).map(task=>(
              <MNote key={task.id} task={task} qColor={q.color} catMeta={cats[task.tag]} T={T} onDown={onNoteDown} dragging={dragId===task.id} onRemove={()=>updateTask(task.id,{quadrant:null})} onDelete={()=>deleteTask(task.id)} onToMyDay={()=>sendToMyDay(task.id)} editing={editId===task.id} onEdit={()=>setEditId(task.id)} onSave={txt=>{const t=txt.trim();if(t)updateTask(task.id,{title:t});setEditId(null);}}/>
            ))}
            {addingIn===qid&&(
              <div style={{width:"100%",animation:"slideIn .2s ease"}}>
                <textarea autoFocus value={newText} onChange={e=>setNewText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();addNote(qid);}if(e.key==="Escape")setAddingIn(null);}} placeholder="New task… Enter to save" style={{width:"100%",minHeight:58,padding:"7px",borderRadius:7,border:`1px solid ${q.color}88`,background:q.color+"11",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none",resize:"none"}}/>
                <div style={{display:"flex",gap:5,marginTop:4}}>
                  <button onClick={()=>addNote(qid)} style={{flex:1,padding:"5px",borderRadius:6,border:"none",cursor:"pointer",background:q.color,color:"#fff",fontSize:11,fontWeight:700}}>Save</button>
                  <button onClick={()=>setAddingIn(null)} style={{flex:1,padding:"5px",borderRadius:6,border:`1px solid ${T.border}`,cursor:"pointer",background:"transparent",color:T.textMuted,fontSize:11}}>Cancel</button>
                </div>
              </div>
            )}
            {tasks.filter(t=>t.quadrant===qid&&!t.done).length===0&&addingIn!==qid&&(
              <div style={{width:"100%",textAlign:"center",color:T.textMuted,fontSize:11,padding:"14px 0",opacity:.6}}>Drag tasks here or tap +</div>
            )}
          </div>
        </div>
      );})}
    </div>
  );
}

function MNote({task,qColor,catMeta,T,onDelete,onRemove,onToMyDay,editing,onEdit,onSave,onDown,dragging}) {
  const [hov,setHov]=useState(false);
  const [et,setEt]=useState(task.title);
  if (editing) return (
    <div style={{width:"100%"}}>
      <textarea autoFocus value={et} onChange={e=>setEt(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();onSave(et);}if(e.key==="Escape")onSave(task.title);}} onBlur={()=>onSave(et)} style={{width:"100%",minHeight:58,padding:"7px",borderRadius:7,border:`1px solid ${qColor}88`,background:qColor+"11",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none",resize:"none"}}/>
    </div>
  );
  return (
    <div onPointerDown={e=>onDown?.(e,task)}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{padding:"7px 9px",borderRadius:8,background:qColor+"1a",border:`1px solid ${qColor}44`,fontSize:12,color:T.text,lineHeight:1.5,position:"relative",minWidth:88,maxWidth:160,cursor:"grab",transition:"transform .15s,box-shadow .15s",transform:dragging?"scale(1.05) rotate(1deg)":hov?"translateY(-2px) rotate(.4deg)":"none",boxShadow:dragging?`0 10px 22px ${qColor}55`:hov?`0 6px 14px ${qColor}33`:"none",opacity:dragging?.85:1,animation:"slideIn .2s ease",userSelect:"none",WebkitUserSelect:"none",touchAction:"none"}}>
      <div style={{borderLeft:`3px solid ${qColor}`,paddingLeft:6}}>{task.title}</div>
      {catMeta&&<div style={{marginTop:4,fontSize:9,color:catMeta.color,fontWeight:600}}>{catMeta.icon} {task.tag}</div>}
      {hov&&(
        <div style={{position:"absolute",top:-10,right:-4,display:"flex",gap:2,zIndex:10,animation:"fadeIn .1s"}}>
          <button title="Edit" onClick={onEdit} style={{width:18,height:18,borderRadius:4,border:"none",cursor:"pointer",background:T.surface,color:T.textMuted,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 6px rgba(0,0,0,.3)"}}><Ico n="edit" s={9}/></button>
          <button title="Add to My Day" onClick={onToMyDay} style={{width:18,height:18,borderRadius:4,border:"none",cursor:"pointer",background:"#f59e0b",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 6px rgba(0,0,0,.3)"}}><Ico n="sun" s={9} c="#fff"/></button>
          <button title="Remove from board" onClick={onRemove} style={{width:18,height:18,borderRadius:4,border:"none",cursor:"pointer",background:T.surface,color:T.textMuted,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 6px rgba(0,0,0,.3)"}}><Ico n="x" s={9}/></button>
        </div>
      )}
    </div>
  );
}

function FreeformCanvas({T,notes,setNotes,setTasks}) {
  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const onPointerDown = useCallback((e, note) => {
    if (["TEXTAREA","INPUT","BUTTON"].includes(e.target.tagName)) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = canvasRef.current.getBoundingClientRect();
    dragRef.current = { id: note.id, ox: e.clientX - rect.left - note.x, oy: e.clientY - rect.top - note.y };
  }, []);
  const onPointerMove = useCallback((e) => {
    if (!dragRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left - dragRef.current.ox, rect.width - 150));
    const y = Math.max(0, Math.min(e.clientY - rect.top - dragRef.current.oy, rect.height - 90));
    setNotes(ns => ns.map(n => n.id === dragRef.current.id ? {...n, x, y} : n));
  }, [setNotes]);
  const onPointerUp = useCallback(() => { dragRef.current = null; }, []);
  const onCanvasDblClick = useCallback((e) => {
    if (!canvasRef.current) return;
    if (["TEXTAREA","INPUT","BUTTON","DIV"].includes(e.target.tagName) && e.target !== canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left - 70);
    const y = Math.max(0, e.clientY - rect.top - 40);
    const newNote = { id: Date.now(), text: "New idea…", x, y, color: NOTE_COLS[notes.length % NOTE_COLS.length] };
    setNotes(ns => [...ns, newNote]);
    setTimeout(() => setEditingId(newNote.id), 50);
  }, [notes.length, setNotes]);
  const convertToTask = (note) => {
    setTasks(ts => [{id:Date.now(),title:note.text,done:false,priority:"medium",tag:"work",due:tod(),starred:false,notes:"From Canvas",color:note.color,subtasks:[],recurring:null},...ts]);
    setNotes(ns => ns.filter(n => n.id !== note.id));
  };
  return (
    <div ref={canvasRef} style={{flex:1,position:"relative",background:T.canvas,overflow:"hidden",cursor:"crosshair"}}
      onPointerMove={onPointerMove} onPointerUp={onPointerUp} onDoubleClick={onCanvasDblClick}>
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",opacity:.15}}>
        <defs><pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M 28 0 L 0 0 0 28" fill="none" stroke={T.textMuted} strokeWidth=".5"/></pattern></defs>
        <rect width="100%" height="100%" fill="url(#grid)"/>
      </svg>
      {notes.length === 0 && (
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",color:T.textMuted,textAlign:"center",pointerEvents:"none",userSelect:"none"}}>
          <div style={{fontSize:32,marginBottom:8}}>✦</div>
          <div style={{fontWeight:600,fontSize:14}}>Double-click anywhere to create a note</div>
          <div style={{fontSize:12,marginTop:4,opacity:.6}}>Drag notes freely · hover for options</div>
        </div>
      )}
      {notes.map(note => (
        <FreeNote key={note.id} note={note} T={T} editing={editingId===note.id}
          onPointerDown={e=>onPointerDown(e,note)} onEdit={()=>setEditingId(note.id)}
          onSave={txt=>{setNotes(ns=>ns.map(n=>n.id===note.id?{...n,text:txt}:n));setEditingId(null);}}
          onDelete={()=>setNotes(ns=>ns.filter(n=>n.id!==note.id))}
          onConvert={()=>convertToTask(note)}
          onColorChange={c=>setNotes(ns=>ns.map(n=>n.id===note.id?{...n,color:c}:n))}
        />
      ))}
      <div style={{position:"absolute",bottom:12,right:16,fontSize:10,color:T.textMuted,userSelect:"none",pointerEvents:"none"}}>Double-click canvas · drag notes · hover for actions</div>
    </div>
  );
}

function FreeNote({note,T,editing,onPointerDown,onEdit,onSave,onDelete,onConvert,onColorChange}) {
  const [hov,setHov]=useState(false);
  const [txt,setTxt]=useState(note.text);
  useEffect(()=>setTxt(note.text),[note.text]);
  return (
    <div style={{position:"absolute",left:note.x,top:note.y,zIndex:hov||editing?20:10,transition:"box-shadow .15s,z-index 0s"}}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      {editing ? (
        <div style={{minWidth:130,padding:2}}>
          <textarea autoFocus value={txt} onChange={e=>setTxt(e.target.value)}
            onFocus={e=>e.target.select()}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();onSave(txt);}if(e.key==="Escape")onSave(note.text);}}
            onBlur={()=>onSave(txt)}
            style={{minWidth:130,minHeight:70,padding:"8px",borderRadius:10,border:`2px solid ${note.color}`,background:note.color+"18",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none",resize:"both",lineHeight:1.5}}/>
        </div>
      ) : (
        <div onPointerDown={onPointerDown} onDoubleClick={onEdit}
          style={{minWidth:120,maxWidth:200,padding:"9px 11px",borderRadius:10,background:note.color+"20",border:`1px solid ${note.color}55`,fontSize:12,color:T.text,lineHeight:1.5,cursor:"grab",boxShadow:hov?`0 8px 20px ${note.color}44`:"0 2px 8px rgba(0,0,0,.2)",transform:hov?"scale(1.03) rotate(.5deg)":"scale(1)",transition:"transform .15s,box-shadow .15s",userSelect:"none",whiteSpace:"pre-wrap",wordBreak:"break-word"}}>
          <div style={{borderLeft:`3px solid ${note.color}`,paddingLeft:7}}>{note.text}</div>
        </div>
      )}
      {hov&&!editing&&(
        <div style={{position:"absolute",top:-28,left:0,display:"flex",gap:3,animation:"fadeIn .1s",zIndex:30,background:T.surface2,borderRadius:8,padding:"3px 5px",border:`1px solid ${T.border}`,boxShadow:"0 4px 12px rgba(0,0,0,.3)"}}>
          <button title="Edit (dbl-click)" onClick={onEdit} style={{width:20,height:20,borderRadius:4,border:"none",cursor:"pointer",background:"transparent",color:T.textMuted,display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="zap" s={10}/></button>
          {NOTE_COLS.slice(0,5).map(c=><div key={c} onClick={()=>onColorChange(c)} style={{width:10,height:10,borderRadius:"50%",background:c,cursor:"pointer",border:`1px solid ${note.color===c?"#fff":"transparent"}`,marginTop:5}}/>)}
          <button title="→ Task" onClick={onConvert} style={{width:20,height:20,borderRadius:4,border:"none",cursor:"pointer",background:"#818cf8",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="arr" s={9} c="#fff"/></button>
          <button title="Delete" onClick={onDelete} style={{width:20,height:20,borderRadius:4,border:"none",cursor:"pointer",background:"transparent",color:T.danger,display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" s={10}/></button>
        </div>
      )}
    </div>
  );
}

function NotesView({T,notes,setNotes}) {
  const [sel,setSel]=useState(null);
  const [nt,setNt]=useState("");
  const ACC=["#3b82f6","#22c55e","#f59e0b","#ef4444","#a855f7","#ec4899","#14b8a6"];
  const addNote=()=>{if(!nt.trim())return;const n={id:Date.now(),title:nt.trim(),body:"",pinned:false,color:ACC[notes.length%ACC.length],created:tod()};setNotes(ns=>[n,...ns]);setSel(n);setNt("");};
  const upNote=(id,patch)=>{setNotes(ns=>ns.map(n=>n.id===id?{...n,...patch}:n));if(sel?.id===id)setSel(s=>({...s,...patch}));};
  const delNote=id=>{setNotes(ns=>ns.filter(n=>n.id!==id));if(sel?.id===id)setSel(null);};
  return (
    <div style={{flex:1,display:"flex",overflow:"hidden"}}>
      <div style={{width:248,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",overflowY:"auto",background:T.sidebar}}>
        <div style={{padding:"16px 12px 10px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:16,fontWeight:700}}>Notes</h2>
            <span style={{fontSize:11,color:T.textMuted}}>Standalone editor</span>
          </div>
          <div style={{fontSize:11,color:T.textMuted,marginBottom:10,lineHeight:1.5,padding:"7px 9px",background:T.surface2,borderRadius:8,border:`1px solid ${T.border}`}}>
            💡 Notes are for <strong>freeform writing</strong> — meeting notes, ideas, journals, references.
          </div>
          <div style={{display:"flex",gap:6}}>
            <input value={nt} onChange={e=>setNt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addNote()} placeholder="New note title…" style={{flex:1,padding:"7px 9px",borderRadius:8,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none"}}/>
            <button onClick={addNote} style={{width:30,height:30,borderRadius:8,border:"none",cursor:"pointer",background:T.grad,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="plus" s={14} c="#fff"/></button>
          </div>
        </div>
        {notes.filter(n=>n.pinned).length>0&&<>
          <div style={{padding:"0 12px 2px",fontSize:9,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",color:T.textMuted}}>📌 Pinned</div>
          <div style={{padding:"0 8px"}}>{notes.filter(n=>n.pinned).map(n=><NRow key={n.id} note={n} T={T} sel={sel} onSel={setSel} onUp={upNote} onDel={delNote}/>)}</div>
        </>}
        <div style={{padding:"0 8px 10px"}}>
          {notes.filter(n=>n.pinned).length>0&&<div style={{padding:"6px 4px 2px",fontSize:9,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",color:T.textMuted}}>All Notes</div>}
          {notes.filter(n=>!n.pinned).map(n=><NRow key={n.id} note={n} T={T} sel={sel} onSel={setSel} onUp={upNote} onDel={delNote}/>)}
        </div>
      </div>
      {sel?(
        <div style={{flex:1,display:"flex",flexDirection:"column",padding:"22px 26px",overflowY:"auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
            <input value={sel.title} onChange={e=>upNote(sel.id,{title:e.target.value})} style={{flex:1,fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:700,background:"transparent",border:"none",outline:"none",color:T.text,letterSpacing:"-.3px"}}/>
            <div style={{display:"flex",gap:5}}>
              {ACC.slice(0,5).map(c=><div key={c} onClick={()=>upNote(sel.id,{color:c})} style={{width:14,height:14,borderRadius:"50%",background:c,cursor:"pointer",border:`2px solid ${sel.color===c?T.text:"transparent"}`,transition:"border-color .15s"}}/>)}
            </div>
          </div>
          <div style={{height:3,width:36,borderRadius:2,background:sel.color,marginBottom:16}}/>
          <textarea value={sel.body} onChange={e=>upNote(sel.id,{body:e.target.value})} placeholder={"Start writing…\n\nUse for meeting notes, ideas, journaling, research."} style={{flex:1,minHeight:300,background:"transparent",border:"none",outline:"none",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:14,lineHeight:1.8,resize:"none"}}/>
          <div style={{fontSize:10,color:T.textMuted,marginTop:10}}>{fmtDate(sel.created)||sel.created} · {sel.body.split(/\s+/).filter(Boolean).length} words</div>
        </div>
      ):(
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:T.textMuted,flexDirection:"column",gap:8}}>
          <div style={{fontSize:40}}>📝</div>
          <div style={{fontWeight:600}}>Select a note to edit</div>
        </div>
      )}
    </div>
  );
}
function NRow({note,T,sel,onSel,onUp,onDel}) {
  const [hov,setHov]=useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={()=>onSel(note)} style={{padding:"8px",borderRadius:8,background:sel?.id===note.id?T.accentGlow:hov?T.surface2:"transparent",border:`1px solid ${sel?.id===note.id?T.accent+"44":"transparent"}`,cursor:"pointer",marginBottom:2,position:"relative",transition:"all .12s"}}>
      <div style={{display:"flex",alignItems:"center",gap:5}}>
        <div style={{width:7,height:7,borderRadius:"50%",background:note.color,flexShrink:0}}/>
        <span style={{fontSize:12,fontWeight:600,color:T.text,flex:1,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{note.title||"Untitled"}</span>
      </div>
      <div style={{fontSize:11,color:T.textMuted,marginTop:2,marginLeft:12,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{note.body?note.body.slice(0,38)+"…":"Empty"}</div>
      {hov&&<div style={{position:"absolute",right:5,top:"50%",transform:"translateY(-50%)",display:"flex",gap:2}}>
        <button onClick={e=>{e.stopPropagation();onUp(note.id,{pinned:!note.pinned});}} style={{width:20,height:20,borderRadius:4,border:"none",cursor:"pointer",background:T.surface3,color:note.pinned?"#f59e0b":T.textMuted,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center"}}>📌</button>
        <button onClick={e=>{e.stopPropagation();onDel(note.id);}} style={{width:20,height:20,borderRadius:4,border:"none",cursor:"pointer",background:T.surface3,color:T.danger,display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" s={10}/></button>
      </div>}
    </div>
  );
}

const ACHIEVEMENTS=[
  {emoji:"🔥",name:"On Fire",desc:"Keep a daily streak going by checking off a task each day."},
  {emoji:"⚡",name:"Quick Start",desc:"Reach Level 2 — earn 100 XP from adding and finishing tasks."},
  {emoji:"🎯",name:"Focused",desc:"Reach Level 3. You're building a real habit now."},
  {emoji:"💎",name:"Consistent",desc:"Reach Level 4. Rare focus and follow-through."},
  {emoji:"🏆",name:"Champion",desc:"Reach Level 5 — the top tier. Productivity master!"},
];
function AnalyticsView({T,tasks,xp,level,streak}) {
  const [aiLoad,setAiLoad]=useState(false);
  const [aiMsg,setAiMsg]=useState("");
  const [achSel,setAchSel]=useState(null);
  const wk=[3,6,4,8,5,2,tasks.filter(t=>t.done).length];
  const maxW=Math.max(...wk,1);
  const total=tasks.length, done=tasks.filter(t=>t.done).length;
  const rate=total>0?Math.round((done/total)*100):0;
  const ov=tasks.filter(t=>t.due&&t.due<tod()&&!t.done).length;
  const byTag={};tasks.forEach(t=>{byTag[t.tag]=(byTag[t.tag]||0)+1;});
  const heat=Array.from({length:35},()=>({v:0}));
  const runAI=()=>{setAiLoad(true);setAiMsg("");setTimeout(()=>{setAiLoad(false);setAiMsg(`🧠 Peak productivity: Tue–Thu. Work tasks: 94% done. ${ov>0?`${ov} overdue — schedule catch-up.`:"No overdue tasks! "} Recommended deep-work window: 9–11am. Keep your ${streak}-day streak 🔥`);},1600);};
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
          <div style={{fontSize:12,fontWeight:600,marginBottom:12,display:"flex",alignItems:"center",gap:5}}><Ico n="bar" s={13} c={T.accent}/>Weekly Completions</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:6,height:80}}>
            {["M","T","W","T","F","S","S"].map((d,i)=>(
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <div style={{width:"100%",borderRadius:"3px 3px 0 0",background:i===6?`linear-gradient(180deg,${T.accent},${T.accentAlt})`:T.surface3,height:`${(wk[i]/maxW)*68}px`,transition:"height .6s ease"}}/>
                <span style={{fontSize:9,color:T.textMuted}}>{d}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:16}}>
          <div style={{fontSize:12,fontWeight:600,marginBottom:12,display:"flex",alignItems:"center",gap:5}}><Ico n="fire" s={13} c="#f59e0b"/>Streak</div>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{textAlign:"center"}}><div style={{fontSize:32,fontFamily:"'Sora',sans-serif",fontWeight:700,color:"#f59e0b"}}>{streak}</div><div style={{fontSize:10,color:T.textMuted}}>day streak 🔥</div></div>
            <div style={{borderLeft:`1px solid ${T.border}`,paddingLeft:14}}>
              <div style={{fontSize:20,fontFamily:"'Sora',sans-serif",fontWeight:700}}>LVL {level}</div>
              <div style={{fontSize:11,color:T.textMuted}}>{xp} XP</div>
              <div style={{display:"flex",gap:3,marginTop:7}}>{ACHIEVEMENTS.map((a,i)=>{const earned=i<level-1;return(
                <button key={i} title={a.name} onClick={()=>setAchSel(achSel===i?null:i)} style={{width:24,height:24,borderRadius:6,background:achSel===i?"#f59e0b44":earned?"#f59e0b22":T.surface2,border:`1px solid ${achSel===i||earned?"#f59e0b":T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,cursor:"pointer",filter:earned?"none":"grayscale(1) opacity(.6)"}}>{a.emoji}</button>
              );})}</div>
            </div>
          </div>
          {achSel!=null&&(
            <div style={{marginTop:10,padding:"8px 10px",background:T.surface2,borderRadius:8,border:`1px solid ${T.border}`,animation:"fadeIn .2s"}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text}}>{ACHIEVEMENTS[achSel].emoji} {ACHIEVEMENTS[achSel].name} {level-1>achSel&&<span style={{color:"#22c55e",fontSize:10}}>· Earned ✓</span>}</div>
              <div style={{fontSize:11,color:T.textMuted,marginTop:2,lineHeight:1.5}}>{ACHIEVEMENTS[achSel].desc}</div>
            </div>
          )}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1.3fr",gap:12,marginBottom:12}}>
        <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:16}}>
          <div style={{fontSize:12,fontWeight:600,marginBottom:10}}>By Category</div>
          {Object.entries(byTag).map(([tag,cnt])=>(
            <div key={tag} style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:11,fontWeight:500,textTransform:"capitalize"}}>{tag}</span><span style={{fontSize:11,color:T.textMuted}}>{cnt}</span></div>
              <div style={{height:5,background:T.border,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${(cnt/total)*100}%`,background:T.accent,borderRadius:3,transition:"width .6s ease"}}/></div>
            </div>
          ))}
        </div>
        <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:16}}>
          <div style={{fontSize:12,fontWeight:600,marginBottom:10}}>Activity Heatmap</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
            {heat.map((c,i)=><div key={i} style={{aspectRatio:"1",borderRadius:2,background:c.v===0?T.surface2:`rgba(192,132,252,${c.v/5*.9+.1})`,cursor:"default",transition:"transform .1s"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.3)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}/>)}
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
          <button onClick={runAI} disabled={aiLoad} style={{padding:"5px 13px",borderRadius:7,border:"none",cursor:"pointer",background:T.grad,color:"#fff",fontSize:11,fontWeight:700,opacity:aiLoad?.7:1}}>{aiLoad?"Analyzing…":"Get Insights"}</button>
        </div>
        {aiLoad&&<div style={{display:"flex",gap:4}}>{[0,1,2].map(i=><div key={i} className="dp" style={{width:6,height:6,borderRadius:"50%",background:T.accent}}/>)}</div>}
        {aiMsg&&<p style={{fontSize:12,lineHeight:1.7,animation:"fadeIn .5s"}}>{aiMsg}</p>}
        {!aiMsg&&!aiLoad&&<p style={{fontSize:12,color:T.textMuted}}>Click "Get Insights" for personalized productivity analysis.</p>}
      </div>
    </div>
  );
}

function SettingsView({T,dark,setDark,cats,setCats,scheme,setScheme}) {
  const [notifs,setNotifs]=useState(true);
  const [focus,setFocus]=useState(false);
  const [weekly,setWeekly]=useState(true);
  const [pomLen,setPomLen]=useState(25);
  const [newCat,setNewCat]=useState("");
  const [newCatColor,setNewCatColor]=useState(CAT_COLORS[5]);
  const [newCatIcon,setNewCatIcon]=useState(CAT_ICONS[0]);
  const [iconMenuFor,setIconMenuFor]=useState(null);
  const addCat=()=>{const name=newCat.trim().toLowerCase();if(!name||cats[name])return;setCats(c=>({...c,[name]:{color:newCatColor,icon:newCatIcon}}));setNewCat("");setNewCatIcon(CAT_ICONS[0]);};
  const delCat=name=>{if(["work","health"].includes(name))return;const c={...cats};delete c[name];setCats(c);};
  const pickIcon=em=>{if(iconMenuFor==="__new__")setNewCatIcon(em);else setCats(c=>({...c,[iconMenuFor]:{...c[iconMenuFor],icon:em}}));setIconMenuFor(null);};
  const Toggle=({val,onChange})=>(
    <div onClick={()=>onChange(!val)} style={{width:36,height:20,borderRadius:10,background:val?T.accent:T.surface3,cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}>
      <div style={{width:16,height:16,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:val?18:2,transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.3)"}}/>
    </div>
  );
  const Row=({label,desc,children})=>(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${T.border}`}}>
      <div><div style={{fontSize:13,fontWeight:500}}>{label}</div>{desc&&<div style={{fontSize:11,color:T.textMuted,marginTop:1}}>{desc}</div>}</div>
      {children}
    </div>
  );
  return (
    <div style={{flex:1,overflowY:"auto",padding:"22px 26px",maxWidth:580}}>
      <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:21,fontWeight:700,letterSpacing:"-.5px",marginBottom:18}}>Settings</h1>
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"0 16px",marginBottom:14}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".6px",textTransform:"uppercase",color:T.textMuted,padding:"12px 0 6px"}}>Categories</div>
        <div style={{fontSize:11,color:T.textMuted,marginBottom:8}}>These are your folders in the sidebar. Tap a category's icon to change it.</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:7,paddingBottom:10}}>
          {Object.entries(cats).map(([name,meta])=>(
            <div key={name} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 8px 4px 6px",borderRadius:20,background:meta.color+"22",border:`1px solid ${meta.color}55`}}>
              <button onClick={()=>setIconMenuFor(iconMenuFor===name?null:name)} title="Change icon" style={{border:"none",background:"transparent",cursor:"pointer",fontSize:14,lineHeight:1,padding:0}}>{meta.icon}</button>
              <span style={{fontSize:12,color:meta.color,fontWeight:600}}>{name}</span>
              {!["work","health"].includes(name)&&(
                <button onClick={()=>delCat(name)} style={{width:14,height:14,borderRadius:"50%",border:"none",cursor:"pointer",background:T.surface3,color:T.textMuted,display:"flex",alignItems:"center",justifyContent:"center",marginLeft:1}}><Ico n="x" s={8}/></button>
              )}
            </div>
          ))}
        </div>
        {iconMenuFor&&(
          <div style={{display:"flex",flexWrap:"wrap",gap:3,padding:"4px 0 10px",maxHeight:128,overflowY:"auto"}}>
            {CAT_ICONS.map(em=>(
              <button key={em} onClick={()=>pickIcon(em)} style={{width:30,height:30,borderRadius:7,border:`1px solid ${T.border}`,background:T.surface2,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>{em}</button>
            ))}
          </div>
        )}
        <div style={{display:"flex",gap:6,paddingBottom:12,alignItems:"center"}}>
          <button onClick={()=>setIconMenuFor(iconMenuFor==="__new__"?null:"__new__")} title="Pick icon" style={{width:32,height:32,borderRadius:8,border:`1px solid ${T.border}`,background:T.surface2,cursor:"pointer",fontSize:16,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>{newCatIcon}</button>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginRight:4}}>
            {CAT_COLORS.map(c=><div key={c} onClick={()=>setNewCatColor(c)} style={{width:16,height:16,borderRadius:"50%",background:c,cursor:"pointer",border:`2px solid ${newCatColor===c?T.text:"transparent"}`,flexShrink:0}}/>)}
          </div>
          <input value={newCat} onChange={e=>setNewCat(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCat()} placeholder="New category name…" style={{flex:1,padding:"6px 9px",borderRadius:8,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none"}}/>
          <button onClick={addCat} style={{padding:"6px 14px",borderRadius:8,border:"none",cursor:"pointer",background:T.grad,color:"#fff",fontSize:12,fontWeight:700}}>Add</button>
        </div>
      </div>
      {[
        {title:"Appearance",rows:[
          {label:"Dark Mode",desc:"Switch between light and dark themes",el:<Toggle val={dark} onChange={setDark}/>},
          {label:"Color Theme",desc:"Pick your accent palette",el:(
            <div style={{display:"flex",gap:6}}>
              {Object.entries(PALETTES).map(([key,p])=>(
                <button key={key} title={p.name} onClick={()=>setScheme(key)} style={{width:24,height:24,borderRadius:"50%",cursor:"pointer",background:`linear-gradient(135deg,${p.accent},${p.accentAlt})`,border:`2px solid ${scheme===key?T.text:"transparent"}`,boxShadow:scheme===key?`0 0 0 2px ${T.surface}`:"none"}}/>
              ))}
            </div>
          )},
        ]},
        {title:"Notifications",rows:[
          {label:"Push Notifications",desc:"Reminders for upcoming tasks",el:<Toggle val={notifs} onChange={setNotifs}/>},
          {label:"Weekly Summary",desc:"Email digest every Sunday",el:<Toggle val={weekly} onChange={setWeekly}/>},
          {label:"Focus Mode",desc:"Suppress notifications during Pomodoro",el:<Toggle val={focus} onChange={setFocus}/>},
        ]},
        {title:"Pomodoro",rows:[{label:"Session Length (min)",desc:"Focus block duration",el:(
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={()=>setPomLen(p=>Math.max(5,p-5))} style={{width:24,height:24,borderRadius:5,border:`1px solid ${T.border}`,background:"transparent",color:T.text,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
            <span style={{fontWeight:700,fontSize:14,minWidth:24,textAlign:"center"}}>{pomLen}</span>
            <button onClick={()=>setPomLen(p=>Math.min(60,p+5))} style={{width:24,height:24,borderRadius:5,border:`1px solid ${T.border}`,background:"transparent",color:T.text,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
          </div>
        )}]},
        {title:"Data",rows:[
          {label:"Export Data",desc:"Download tasks, notes & settings",el:<button style={{padding:"5px 11px",borderRadius:7,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,cursor:"pointer",fontSize:12}}>Export JSON</button>},
          {label:"Clear Completed",desc:"Remove all completed tasks",el:<button style={{padding:"5px 11px",borderRadius:7,border:`1px solid ${T.danger}33`,background:T.danger+"11",color:T.danger,cursor:"pointer",fontSize:12}}>Clear</button>},
        ]},
      ].map(s=>(
        <div key={s.title} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"0 16px",marginBottom:12}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".6px",textTransform:"uppercase",color:T.textMuted,padding:"12px 0 2px"}}>{s.title}</div>
          {s.rows.map(r=><Row key={r.label} label={r.label} desc={r.desc}>{r.el}</Row>)}
        </div>
      ))}
    </div>
  );
}
