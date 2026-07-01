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
    flag:<><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></>,
    chevron:<><polyline points="9 18 15 12 9 6"/></>,
    link:<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
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

const ymd = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const tod = () => ymd(new Date());
const addDays = n => { const d=new Date(); d.setDate(d.getDate()+n); return ymd(d); };
const fmtDate = s => {
  if (!s) return null;
  const d = new Date(s+"T12:00:00"), t = new Date(); t.setHours(0,0,0,0);
  const diff = Math.round((d-t)/86400000);
  if (diff<0) return `${Math.abs(diff)}d overdue`;
  if (diff===0) return "Today"; if (diff===1) return "Tomorrow";
  return d.toLocaleDateString("en-US",{month:"short",day:"numeric"});
};

const parseNL = raw => {
  let title = raw.trim(), due = null, time = null;
  // Time: "at 4pm", "4:30pm", "9am", "at 16:00"
  const tm = title.match(/\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i) || title.match(/\bat\s+(\d{1,2}):(\d{2})\b/);
  if (tm) {
    let h=parseInt(tm[1]); const min=tm[2]?parseInt(tm[2]):0; const ap=(tm[3]||"").toLowerCase();
    if(ap==="pm"&&h<12) h+=12; if(ap==="am"&&h===12) h=0;
    if(h<24&&min<60){ time=`${String(h).padStart(2,"0")}:${String(min).padStart(2,"0")}`; title=title.replace(tm[0],""); }
  }
  if (/\btomorrow\b/i.test(title)) { due=addDays(1); title=title.replace(/\btomorrow\b/gi,""); }
  else if (/\btonight\b/i.test(title)) { due=tod(); title=title.replace(/\btonight\b/gi,""); if(!time)time="20:00"; }
  else if (/\btoday\b/i.test(title)) { due=tod(); title=title.replace(/\btoday\b/gi,""); }
  else if (/\bnext week\b/i.test(title)) { due=addDays(7); title=title.replace(/\bnext week\b/gi,""); }
  else if (title.match(/\b(?:this\s+)?(next\s+)?(?:on\s+)?(sun(?:day)?|mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:r|rs|rsday)?|fri(?:day)?|sat(?:urday)?)\b/i)) {
    const wd = title.match(/\b(?:this\s+)?(next\s+)?(?:on\s+)?(sun(?:day)?|mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:r|rs|rsday)?|fri(?:day)?|sat(?:urday)?)\b/i);
    const key = wd[2].toLowerCase().substring(0,3), target = WEEKDAYS[key], cur = new Date().getDay();
    let delta = (target - cur + 7) % 7;
    if (delta === 0) delta = 7;
    if (wd[1]) delta += 7;
    const d = new Date(); d.setDate(d.getDate() + delta);
    due = ymd(d);
    title = title.replace(wd[0], "");
  }
  else {
    const m = title.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})\b/i);
    if (m) {
      const mon=MONTHS[m[1].toLowerCase().substring(0,3)], day=parseInt(m[2]);
      let yr=new Date().getFullYear();
      if (new Date(yr,mon,day)<new Date()) yr++;
      due=ymd(new Date(yr,mon,day));
      title=title.replace(m[0],"");
    }
  }
  title=title.replace(/\s{2,}/g," ").replace(/^[\s,\-–]+|[\s,\-–]+$/g,"").trim();
  if (!title) title=raw.trim();
  return {title, due, time};
};

const DEFAULT_CATS = {
  work:     {color:"#0ea5e9", icon:"💼"},
  school:   {color:"#6366f1", icon:"📚"},
  health:   {color:"#10b981", icon:"🏃"},
  personal: {color:"#f59e0b", icon:"🌟"},
  finance:  {color:"#a855f7", icon:"💰"},
};
const DEFAULT_CAT_NAMES = Object.keys(DEFAULT_CATS);
const isImgIcon = ic => typeof ic === "string" && (ic.startsWith("http") || ic.startsWith("data:"));
const CatIcon = ({icon, size=14}) => isImgIcon(icon)
  ? <img src={icon} alt="" style={{width:size,height:size,borderRadius:4,objectFit:"cover",verticalAlign:"middle",flexShrink:0}}/>
  : <span style={{fontSize:size+1,lineHeight:1}}>{icon}</span>;
// Auto-pick a folder icon from its name; falls back to a varied (name-seeded) emoji.
const ICON_KEYWORDS = [
  [["cat","cats","kitten","kitty"],"🐱"],[["dog","dogs","puppy","puppies","pup"],"🐶"],
  [["fish","aquarium"],"🐟"],[["bird","birds"],"🐦"],[["pet","pets","animal","animals","vet"],"🐾"],
  [["gym","workout","lift","weights","exercise","fitness"],"🏋️"],[["run","running","jog","jogging","marathon","cardio"],"🏃"],
  [["swim","swimming","pool"],"🏊"],[["bike","biking","cycle","cycling"],"🚴"],[["hike","hiking","trail"],"🥾"],
  [["yoga","stretch","pilates"],"🧘"],[["soccer","football"],"⚽"],[["basketball","hoops"],"🏀"],[["tennis"],"🎾"],
  [["doctor","appointment","clinic","hospital","checkup"],"🩺"],[["dentist","teeth","tooth"],"🦷"],
  [["meds","medicine","pills","prescription","pharmacy"],"💊"],[["mental","therapy","mindful","meditation"],"🧠"],
  [["health","wellness","selfcare","spa"],"💪"],[["sleep","rest","nap"],"🛏️"],
  [["work","job","office","career","business"],"💼"],[["meeting","meetings","standup","sync"],"📅"],
  [["client","clients","customer"],"🤝"],[["project","projects"],"📋"],[["email","emails","inbox","mail"],"✉️"],
  [["deadline","urgent"],"⏰"],
  [["school","class","classes","course","courses","study","studies","exam","exams","homework","assignment"],"📚"],
  [["college","university","uni","campus","grad"],"🎓"],[["lecture","lesson","notes"],"📝"],
  [["science","lab","chemistry","biology","physics"],"🔬"],[["math","maths","algebra","calculus"],"🔢"],
  [["money","finance","financial","budget","budgeting"],"💰"],[["bank","banking","savings","saving"],"🏦"],
  [["bill","bills","invoice","invoices","payment"],"🧾"],[["invest","investing","stocks","crypto","portfolio"],"📈"],
  [["tax","taxes"],"🧾"],[["shop","shopping","buy","store","mall"],"🛍️"],[["grocery","groceries","supermarket"],"🛒"],
  [["wishlist","wish"],"⭐"],[["home","house","apartment","household"],"🏠"],
  [["clean","cleaning","chore","chores","laundry","tidy"],"🧹"],[["repair","fix","maintenance","handyman"],"🔧"],
  [["garden","gardening","plant","plants","yard"],"🌱"],[["car","cars","vehicle","auto","drive","driving"],"🚗"],
  [["food","meal","meals","cook","cooking","recipe","recipes","kitchen"],"🍳"],
  [["restaurant","dining","dinner","lunch","brunch"],"🍽️"],[["coffee","cafe"],"☕"],
  [["travel","trip","trips","vacation","holiday","tour","journey"],"✈️"],[["flight","flights","airport"],"🛫"],
  [["hotel","booking"],"🏨"],[["beach","ocean","sea"],"🏖️"],[["camp","camping","outdoor"],"⛺"],
  [["movie","movies","film","cinema"],"🎬"],[["music","song","songs","playlist","band"],"🎵"],
  [["game","games","gaming"],"🎮"],[["book","books","read","reading","novel"],"📖"],
  [["art","drawing","draw","paint","painting","sketch","creative"],"🎨"],[["photo","photos","photography","camera","picture"],"📷"],
  [["write","writing","blog","journal","diary"],"✍️"],[["code","coding","program","programming","dev","developer","software"],"💻"],
  [["tech","gadget","device","app","apps"],"📱"],[["design","figma"],"🎨"],[["idea","ideas","brainstorm","inspiration"],"💡"],
  [["goal","goals","target","objective","resolution"],"🎯"],[["plan","planning","plans","schedule","agenda"],"🗓️"],
  [["love","relationship","date","dating","partner","crush"],"❤️"],[["family","kids","kid","child","children","parent"],"👪"],
  [["baby","newborn","pregnancy"],"👶"],[["friend","friends","social","hangout"],"👥"],[["wedding","marriage","engaged"],"💍"],
  [["birthday","bday"],"🎂"],[["party","celebrate","celebration","event","events"],"🎉"],
  [["holiday","christmas","xmas"],"🎄"],[["gift","gifts","present","presents"],"🎁"],
  [["beauty","makeup","skincare","hair","nails"],"💄"],[["fashion","clothes","clothing","outfit","wardrobe"],"👗"],
  [["dream","dreams","bucket","someday"],"✨"],
];
const guessIcon = name => {
  const n=(name||"").toLowerCase().trim();
  if(!n) return "📁";
  for(const [keys,icon] of ICON_KEYWORDS){ if(keys.some(k=>new RegExp("\\b"+k+"\\b").test(n))) return icon; }
  return "📁"; // predictable default when nothing matches (no random jitter)
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

// Confetti burst (no library) — used when My Day hits 100%.
function fireConfetti(){
  const colors=["#c084fc","#818cf8","#fda4af","#6ee7b7","#fcd34d","#93c5fd","#fb7185"];
  for(let i=0;i<40;i++){
    const d=document.createElement("div");
    const sz=6+Math.random()*8;
    d.style.cssText=`position:fixed;left:50%;top:16%;width:${sz}px;height:${sz}px;background:${colors[i%colors.length]};border-radius:${Math.random()<.5?"50%":"2px"};pointer-events:none;z-index:3000;`;
    document.body.appendChild(d);
    const x=(Math.random()-0.5)*640, y=280+Math.random()*340, rot=Math.random()*720;
    d.animate([{transform:"translate(-50%,0) rotate(0)",opacity:1},{transform:`translate(calc(-50% + ${x}px),${y}px) rotate(${rot}deg)`,opacity:0}],{duration:1100+Math.random()*800,easing:"cubic-bezier(.2,.6,.3,1)"}).onfinish=()=>d.remove();
  }
}

// Next due date for a recurring task.
function nextDue(due, rec){
  const base = due ? new Date(due+"T12:00:00") : new Date();
  if(rec==="daily") base.setDate(base.getDate()+1);
  else if(rec==="weekly") base.setDate(base.getDate()+7);
  else if(rec==="monthly") base.setMonth(base.getMonth()+1);
  else if(rec==="yearly") base.setFullYear(base.getFullYear()+1);
  else if(rec && rec.startsWith("custom:")){
    const [,nStr,unit]=rec.split(":"); const n=Math.max(1,parseInt(nStr)||1);
    if(unit==="days") base.setDate(base.getDate()+n);
    else if(unit==="weeks") base.setDate(base.getDate()+7*n);
    else if(unit==="months") base.setMonth(base.getMonth()+n);
    else if(unit==="years") base.setFullYear(base.getFullYear()+n);
    else return null;
  }
  else return null;
  return ymd(base);
}

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
  const [imgView, setImgView] = useState(null);
  const [linkPick, setLinkPick] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const showToast = (msg, undo) => { setToast({msg, undo}); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(()=>setToast(null), 5000); };
  const [view, setView] = useState("myday");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const isLoadingData = useRef(false);
  const syncTimers = useRef({});
  const [tasks, setTasks] = useState([]);
  const [ownedShares, setOwnedShares] = useState([]);
  const [sharedWithMe, setSharedWithMe] = useState([]);
  const [deletedCats, setDeletedCats] = useState([]);
  const [delCatModal, setDelCatModal] = useState(null);
  const [canvasNotes, setCanvasNotes] = useState([]);
  const [notes, setNotes] = useState([]);
  const [cats, setCats] = useState(DEFAULT_CATS);
  const [sideOpen, setSideOpen] = useState(true);
  const [defOpen, setDefOpen] = useState(true);
  const [customOpen, setCustomOpen] = useState(true);
  const [selTask, setSelTask] = useState(null);
  const keepSelRef = useRef(false);
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
  const [pomLen, setPomLen] = useState(25);
  const pomLenRef = useRef(25);
  useEffect(()=>{ pomLenRef.current=pomLen; },[pomLen]);
  const cyclePom = ()=>{ if(pomRun) return; const opts=[5,15,25,30,45,50]; let i=opts.indexOf(pomLen); if(i<0)i=2; const m=opts[(i+1)%opts.length]; setPomLen(m); setPomSecs(m*60); };
  const pomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (pomRun) pomRef.current = setInterval(()=>setPomSecs(t=>{if(t<=1){clearInterval(pomRef.current);setPomRun(false);return pomLenRef.current*60;}return t-1;}),1000);
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
    if(!user){setTasks([]);setCanvasNotes([]);setNotes([]);setCats(DEFAULT_CATS);setOwnedShares([]);setSharedWithMe([]);return;}
    isLoadingData.current=true; setSyncing(true);
    Promise.all([db.loadTasks(),db.loadCanvas(user.id),db.loadNotes(user.id),db.loadCats(user.id),db.loadOwnedShares(user.id),db.loadSharedWithMe(user.email)])
      .then(([t,c,n,cats,os,sm])=>{
        setTasks(t); setCanvasNotes(c); setNotes(n);
        if(cats) setCats(cats);
        setOwnedShares(os); setSharedWithMe(sm);
        setSyncing(false);
        setTimeout(()=>{isLoadingData.current=false;},200);
      }).catch(()=>setSyncing(false));
  },[user]);

  useEffect(()=>{ if(keepSelRef.current){ keepSelRef.current=false; return; } setSelTask(null); },[view]);
  const goView=v=>{ setView(v); setSideOpen(false); };

  const refreshShares=useCallback(()=>{
    if(!user) return;
    db.loadOwnedShares(user.id).then(setOwnedShares).catch(()=>{});
    db.loadSharedWithMe(user.email).then(setSharedWithMe).catch(()=>{});
  },[user]);

  useEffect(()=>{if(!user||isLoadingData.current)return;clearTimeout(syncTimers.current.c);syncTimers.current.c=setTimeout(()=>db.syncCanvas(canvasNotes,user.id).catch(console.error),1500);},[canvasNotes]);
  useEffect(()=>{if(!user||isLoadingData.current)return;clearTimeout(syncTimers.current.n);syncTimers.current.n=setTimeout(()=>db.syncNotes(notes,user.id).catch(console.error),1500);},[notes]);
  useEffect(()=>{if(!user||isLoadingData.current)return;clearTimeout(syncTimers.current.k);syncTimers.current.k=setTimeout(()=>db.syncCats(cats,user.id).catch(console.error),1500);},[cats]);

  useEffect(()=>{
    if(!user) return;
    // No user_id filter — RLS limits delivery to rows we can see (own + shared), so shared edits arrive live both ways.
    const ch=supabase.channel("fs-tasks")
      .on("postgres_changes",{event:"*",schema:"public",table:"tasks"},({eventType,new:n,old:o})=>{
        if(eventType==="INSERT") setTasks(ts=>ts.some(t=>t.id===n.id)?ts:[fromDbTask(n),...ts]);
        if(eventType==="UPDATE") setTasks(ts=>ts.map(t=>t.id===n.id?fromDbTask(n):t));
        if(eventType==="DELETE") setTasks(ts=>ts.filter(t=>t.id!==o.id));
      })
      .on("postgres_changes",{event:"*",schema:"public",table:"folder_shares"},()=>{ refreshShares(); })
      .subscribe();
    const onVisible=()=>{
      if(!document.hidden){
        isLoadingData.current=true;
        Promise.all([db.loadTasks(),db.loadCanvas(user.id),db.loadNotes(user.id)])
          .then(([t,c,n])=>{setTasks(t);setCanvasNotes(c);setNotes(n);setTimeout(()=>{isLoadingData.current=false;},200);});
      }
    };
    document.addEventListener("visibilitychange",onVisible);
    return ()=>{supabase.removeChannel(ch);document.removeEventListener("visibilitychange",onVisible);};
  },[user]);

  useEffect(()=>{
    if(!user){ setXp(0); setStreak(0); awardedRef.current=new Set(); lastActiveRef.current=null; return; }
    let cancelled=false;
    (async()=>{
      let g=null;
      try{ g=await db.loadGami(user.id); }catch{}
      if(!g){ // migrate any older device-local data, then it'll save to the DB
        try{ const raw=localStorage.getItem(`fs_gami_${user.id}`); if(raw){ const l=JSON.parse(raw); g={xp:l.xp,streak:l.streak,last_active:l.lastActive,awarded:l.awarded}; } }catch{}
      }
      g=g||{xp:0,streak:0,last_active:null,awarded:[]};
      if(cancelled) return;
      awardedRef.current=new Set(g.awarded||[]);
      lastActiveRef.current=g.last_active||null;
      const yest=addDays(-1);
      let st=g.streak||0;
      if(g.last_active && g.last_active!==tod() && g.last_active!==yest) st=0;
      setStreak(st); setXp(g.xp||0);
    })();
    return ()=>{cancelled=true;};
  },[user]);

  useEffect(()=>{
    if(!user) return;
    const t=setTimeout(()=>{ db.saveGami(user.id,{xp,streak,lastActive:lastActiveRef.current,awarded:[...awardedRef.current]}).catch(()=>{}); },1200);
    return ()=>clearTimeout(t);
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
    const {title,due:parsed,time}=parseNL(input);
    let due=parsed||null;
    if(time && !due) due=tod();
    const remindAt=(time && due)?`${due}T${time}`:null;
    const inCat=view.startsWith("cat:")?view.slice(4):null;
    let ownerId=user?.id, tagForTask=inCat||guessCat(title,cats);
    if(view.startsWith("shared:")){ const rest=view.slice(7),ci=rest.indexOf(":"); ownerId=rest.slice(0,ci); tagForTask=rest.slice(ci+1); }
    const t={id:crypto.randomUUID(),title,done:false,priority:"medium",tag:tagForTask,due,starred:view==="flagged",notes:"",color:null,subtasks:[],recurring:null,quadrant:null,remindAt,attachments:[],owner:ownerId,position:Date.now(),mydayDate:view==="myday"?todStr:null};
    setTasks(ts=>[t,...ts]);
    setInput(""); awardXp("add-"+t.id,10); setNewAnim(t.id);
    if(view==="myday") markActiveDay();
    setTimeout(()=>setNewAnim(null),600);
    if(user) db.insertTask(t,ownerId).catch(e=>{ setTasks(ts=>ts.filter(x=>x.id!==t.id)); showToast("Couldn't save task — database needs the latest SQL. ("+(e.message||e)+")"); });
  },[input,view,user,cats,awardXp,markActiveDay]);

  const toggleTask = id=>{
    const task=tasks.find(t=>t.id===id);
    if(!task) return;
    const newDone=!task.done;
    setTasks(ts=>ts.map(t=>t.id===id?{...t,done:newDone}:t));
    if(newDone){
      awardXp("done-"+id,20); markActiveDay(); navigator.vibrate?.(30); playComplete();
      if(task.recurring && !awardedRef.current.has("recur-"+id)){
        awardedRef.current.add("recur-"+id);
        const nd=nextDue(task.due,task.recurring);
        if(nd){ const clone={...task,id:crypto.randomUUID(),done:false,due:nd,quadrant:task.quadrant||null,remindAt:null,attachments:[],mydayDate:null,subtasks:(task.subtasks||[]).map(s=>({...s,done:false}))};
          setTasks(ts=>[clone,...ts]); if(user) db.insertTask(clone,user.id).catch(console.error);
          showToast(`↻ Next "${task.title}" scheduled for ${fmtDate(nd)}`);
        }
      }
    }
    if(user) db.updateTask(id,{done:newDone}).catch(console.error);
  };
  const canDeleteTask=task=>{
    if(!task) return true;
    if(task.owner===user?.id) return true;
    const sh=sharedWithMe.find(s=>s.owner_id===task.owner&&s.folder===task.tag);
    return !!(sh&&sh.can_delete);
  };
  const deleteTask = id=>{
    const t=tasks.find(x=>x.id===id);
    if(t&&!canDeleteTask(t)){ showToast("You don't have permission to delete this shared task"); return; }
    setTasks(ts=>ts.filter(x=>x.id!==id)); if(selTask?.id===id)setSelTask(null);
    if(user)db.deleteTask(id).catch(console.error);
    if(t) showToast("Task deleted", ()=>{ setTasks(ts=>[t,...ts]); if(user) db.insertTask(t,t.owner||user.id).catch(console.error); setToast(null); });
  };
  const duplicateTask = task=>{ const c={...task,id:crypto.randomUUID(),done:false,title:task.title+" (copy)",attachments:[]}; setTasks(ts=>[c,...ts]); if(user) db.insertTask(c,user.id).catch(console.error); showToast("Task duplicated"); };
  const attachFile = async (task,file)=>{ if(!user) return; const meta=await db.uploadAttachment(file,user.id,task.id); updateTask(task.id,{attachments:[...(task.attachments||[]),meta]}); };
  const removeAttach = async (task,att)=>{ await db.deleteAttachment(att.path).catch(()=>{}); updateTask(task.id,{attachments:(task.attachments||[]).filter(a=>a.path!==att.path)}); };
  const setReminder = (id,val)=>{ remindedRef.current?.delete(id); updateTask(id,{remindAt:val||null}); if(val&&"Notification"in window&&Notification.permission==="default") Notification.requestPermission(); };
  const uploadCatIcon = async file=>{ if(!user) return null; const m=await db.uploadAttachment(file,user.id,"icons"); return m.url; };
  useEffect(()=>{ if(!user){setDeletedCats([]);return;} try{ setDeletedCats(JSON.parse(localStorage.getItem(`fs_delcats_${user.id}`)||"[]")); }catch{ setDeletedCats([]); } },[user]);
  const persistDeleted=arr=>{ setDeletedCats(arr); if(user){ try{localStorage.setItem(`fs_delcats_${user.id}`,JSON.stringify(arr));}catch{} } };
  const deleteCat=name=>{ if(cats[name]) setDelCatModal(name); };
  const confirmDeleteCat=(name,alsoTasks)=>{
    const meta=cats[name]; setDelCatModal(null); if(!meta) return;
    setCats(c=>{ const n={...c}; delete n[name]; return n; });
    persistDeleted([{name,color:meta.color,icon:meta.icon},...deletedCats.filter(d=>d.name!==name)].slice(0,20));
    if(view===`cat:${name}`) setView("all");
    if(alsoTasks){ const ids=tasks.filter(t=>t.owner===user?.id&&t.tag===name).map(t=>t.id); if(ids.length){ setTasks(ts=>ts.filter(t=>!ids.includes(t.id))); if(user) ids.forEach(id=>db.deleteTask(id).catch(()=>{})); } showToast(`Deleted "${name}" and ${ids.length} task${ids.length===1?"":"s"}`); }
    else showToast(`Folder "${name}" deleted — tasks kept`);
  };
  const restoreCat=name=>{ const d=deletedCats.find(x=>x.name===name); if(!d) return; setCats(c=>({...c,[name]:{color:d.color,icon:d.icon}})); persistDeleted(deletedCats.filter(x=>x.name!==name)); showToast(`Folder "${name}" restored`); };
  const purgeCat=name=>{ persistDeleted(deletedCats.filter(x=>x.name!==name)); };
  const clearCompleted = ()=>{ const done=tasks.filter(t=>t.done); if(!done.length){showToast("No completed tasks");return;} setTasks(ts=>ts.filter(t=>!t.done)); if(user) done.forEach(t=>db.deleteTask(t.id).catch(()=>{})); showToast(`Cleared ${done.length} completed`); };
  const clearDone = ids=>{ if(!ids||!ids.length)return; setTasks(ts=>ts.filter(t=>!ids.includes(t.id))); if(user) ids.forEach(id=>db.deleteTask(id).catch(()=>{})); showToast(`Cleared ${ids.length} completed`); };
  const exportData = ()=>{
    const data={app:"FlowSpace",exportedAt:new Date().toISOString(),tasks,notes,cats,canvasNotes};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="flowspace-backup.json"; a.click(); URL.revokeObjectURL(url);
    showToast("Backup downloaded");
  };
  const importData = file=>{
    const reader=new FileReader();
    reader.onload=()=>{ try{
      const d=JSON.parse(reader.result);
      if(Array.isArray(d.tasks)){ const have=new Set(tasks.map(t=>t.id)); const inc=d.tasks.filter(t=>!have.has(t.id)); setTasks(ts=>[...inc,...ts]); if(user) inc.forEach(t=>db.insertTask(t,user.id).catch(()=>{})); }
      if(Array.isArray(d.notes)){ const have=new Set(notes.map(n=>n.id)); setNotes(ns=>[...d.notes.filter(n=>!have.has(n.id)),...ns]); }
      if(Array.isArray(d.canvasNotes)){ const have=new Set(canvasNotes.map(n=>n.id)); setCanvasNotes(ns=>[...d.canvasNotes.filter(n=>!have.has(n.id)),...ns]); }
      if(d.cats&&typeof d.cats==="object"){ setCats(c=>({...c,...d.cats})); }
      showToast("Data imported ✓");
    }catch{ showToast("Import failed — invalid file"); } };
    reader.readAsText(file);
  };
  const updateTask = (id,patch)=>{setTasks(ts=>ts.map(t=>t.id===id?{...t,...patch}:t));if(selTask?.id===id)setSelTask(s=>({...s,...patch}));if(user)db.updateTask(id,patch).catch(console.error);};
  const reorderTasks = (fromId,toId)=>{
    if(fromId===toId) return;
    const sorted=tasks.filter(t=>!t.done).sort((a,b)=>(b.position||0)-(a.position||0));
    const fromIdx=sorted.findIndex(t=>t.id===fromId), toIdx=sorted.findIndex(t=>t.id===toId);
    if(fromIdx<0||toIdx<0) return;
    const toT=sorted[toIdx];
    let newPos;
    if(fromIdx<toIdx){ const after=sorted[toIdx+1]; newPos=after?((toT.position||0)+(after.position||0))/2:(toT.position||0)-1; }
    else { const before=sorted[toIdx-1]; newPos=before?((toT.position||0)+(before.position||0))/2:(toT.position||0)+1; }
    setTasks(ts=>ts.map(t=>t.id===fromId?{...t,position:newPos}:t));
    if(user) db.updateTask(fromId,{position:newPos}).catch(console.error);
  };

  const todStr=tod();
  const myTasks=tasks.filter(t=>t.owner===user?.id);
  const myDay=myTasks.filter(t=>t.mydayDate===todStr);
  const upcoming=myTasks.filter(t=>t.due&&t.due>todStr);
  const completed=myTasks.filter(t=>t.done);
  const overdueTasks=myTasks.filter(t=>!t.done&&t.mydayDate&&t.mydayDate<todStr);
  const myDayAllDone=myDay.length>0&&myDay.every(t=>t.done);
  const prevMyDayDone=useRef(false);
  useEffect(()=>{ if(myDayAllDone&&!prevMyDayDone.current) fireConfetti(); prevMyDayDone.current=myDayAllDone; },[myDayAllDone]);
  // Shortlist that complements My Day: tasks worth pulling in today (overdue → due soon → the rest).
  const mydaySuggestions=myTasks
    .filter(t=>!t.done && t.mydayDate!==todStr)
    .sort((a,b)=>{
      const ao=a.due&&a.due<todStr, bo=b.due&&b.due<todStr;
      if(ao!==bo) return ao?-1:1;
      if(a.due&&b.due) return a.due.localeCompare(b.due);
      if(a.due) return -1; if(b.due) return 1; return 0;
    }).slice(0,6);
  const addToMyDay=id=>{ navigator.vibrate?.(10); updateTask(id,{mydayDate:todStr}); markActiveDay(); };
  const didAutoCarryRef=useRef(false);
  const [carriedIds,setCarriedIds]=useState([]);
  useEffect(()=>{ didAutoCarryRef.current=false; setCarriedIds([]); },[user]);
  useEffect(()=>{
    if(!user||didAutoCarryRef.current||!tasks.length) return;
    didAutoCarryRef.current=true;
    const leftovers=tasks.filter(t=>t.owner===user.id&&!t.done&&t.mydayDate&&t.mydayDate<todStr);
    if(leftovers.length){ setCarriedIds(leftovers.map(t=>t.id)); leftovers.forEach(t=>updateTask(t.id,{mydayDate:todStr})); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[tasks,user]);
  const undoCarry=()=>{ if(!carriedIds.length)return; navigator.vibrate?.(10); carriedIds.forEach(id=>updateTask(id,{mydayDate:null})); setCarriedIds([]); showToast("Carry-over undone"); };
  const shareFolder=async(folder,email,canDelete)=>{ if(!user||!email.trim())return; try{ await db.addShare(user.id,folder,email,canDelete); refreshShares(); showToast(`Shared "${folder}" with ${email.trim()}`); }catch(e){ showToast("Share failed: "+(e.message||e)); } };
  const unshareFolder=async id=>{ await db.removeShare(id).catch(()=>{}); refreshShares(); showToast("Collaborator removed"); };

  const remindedRef=useRef();
  if(!remindedRef.current){ try{ remindedRef.current=new Set(JSON.parse(localStorage.getItem("fs_reminded")||"[]")); }catch{ remindedRef.current=new Set(); } }
  useEffect(()=>{
    const check=()=>{
      const now=Date.now();
      tasks.forEach(t=>{
        if(t.remindAt && !t.done && !remindedRef.current.has(t.id) && new Date(t.remindAt).getTime()<=now){
          remindedRef.current.add(t.id);
          try{ localStorage.setItem("fs_reminded",JSON.stringify([...remindedRef.current])); }catch{}
          navigator.vibrate?.([30,40,30]); playComplete();
          try{ if("Notification"in window&&Notification.permission==="granted") new Notification("FlowSpace reminder ⏰",{body:t.title}); }catch{}
          showToast(`⏰ Reminder: ${t.title}`);
        }
      });
    };
    check(); const iv=setInterval(check,30000); return ()=>clearInterval(iv);
  },[tasks]);
  const carryOver=()=>{
    if(!overdueTasks.length) return;
    navigator.vibrate?.(15);
    overdueTasks.forEach(t=>updateTask(t.id,{mydayDate:todStr}));
  };
  const addMatrixTask=(quadrant,text)=>{
    const title=(text||"").trim(); if(!title) return;
    const t={id:crypto.randomUUID(),title,done:false,priority:"medium",tag:guessCat(title,cats),due:null,starred:false,notes:"",color:null,subtasks:[],recurring:null,quadrant,remindAt:null,attachments:[],owner:user?.id,position:Date.now(),mydayDate:null};
    setTasks(ts=>[t,...ts]); awardXp("add-"+t.id,10);
    if(user) db.insertTask(t,user.id).catch(e=>showToast("Couldn't save: "+(e.message||e)));
  };
  const toggleMyDay=id=>{ const t=tasks.find(x=>x.id===id); if(!t)return; const inDay=t.mydayDate===todStr; navigator.vibrate?.(15); updateTask(id,{mydayDate:inDay?null:todStr}); if(!inDay) markActiveDay(); };
  const requestLink=cb=>setLinkPick({onPick:cb});
  const linkIdeaToTask=(text,taskId)=>{
    const t=tasks.find(x=>x.id===taskId); if(!t)return;
    const merged=(t.notes&&t.notes.trim()?t.notes.trim()+"\n":"")+(text||"").trim();
    updateTask(taskId,{notes:merged});
    showToast(`Added to "${t.title}" — see it under Notes → Notes on tasks`);
  };
  const addCanvasTask=(text,myDay)=>{
    const title=(text||"").trim(); if(!title) return;
    const t={id:crypto.randomUUID(),title,done:false,priority:"medium",tag:guessCat(title,cats),due:null,starred:false,notes:"From Canvas",color:null,subtasks:[],recurring:null,quadrant:null,remindAt:null,attachments:[],owner:user?.id,position:Date.now(),mydayDate:myDay?todStr:null};
    setTasks(ts=>[t,...ts]); awardXp("add-"+t.id,10); if(myDay) markActiveDay();
    if(user) db.insertTask(t,user.id).catch(e=>showToast("Couldn't save: "+(e.message||e)));
    showToast(myDay?"Added to My Day ☀️":"Added as a task ✓");
  };
  const level=Math.floor(xp/100)+1, xpLvl=xp%100;
  const pmm=String(Math.floor(pomSecs/60)).padStart(2,"0"), pms=String(pomSecs%60).padStart(2,"0");

  const byPosition=arr=>[...arr].sort((a,b)=>{
    if(a.done!==b.done) return a.done?1:-1;
    return (b.position||0)-(a.position||0);
  });

  const getViewTasks=()=>{
    let base;
    if(view.startsWith("cat:")){ const c=view.slice(4); base=tasks.filter(t=>t.tag===c&&t.owner===user?.id); }
    else if(view.startsWith("shared:")){ const rest=view.slice(7),ci=rest.indexOf(":"),o=rest.slice(0,ci),f=rest.slice(ci+1); base=tasks.filter(t=>t.owner===o&&t.tag===f); }
    else if(view==="flagged") base=myTasks.filter(t=>t.starred);
    else base=view==="myday"?myDay:view==="upcoming"?upcoming:myTasks;
    if(search) base=base.filter(t=>t.title.toLowerCase().includes(search.toLowerCase()));
    return byPosition(base);
  };

  const navItems=[
    {id:"myday",label:"My Day",icon:"sun",badge:myDay.filter(t=>!t.done).length},
    {id:"upcoming",label:"Upcoming",icon:"cal",badge:upcoming.filter(t=>!t.done).length},
    {id:"matrix",label:"Priority Matrix",icon:"grid",badge:null},
    {id:"all",label:"All Tasks",icon:"layers",badge:null},
    {id:"flagged",label:"Flagged",icon:"flag",badge:myTasks.filter(t=>t.starred&&!t.done).length},
    {id:"notes",label:"Notes",icon:"note",badge:null},
  ];

  if(confirmFlow==="signup") return <SignupSuccess onContinue={()=>{ try{window.history.replaceState(null,"",window.location.pathname);}catch{} setConfirmFlow(null); }}/>;
  if(confirmFlow==="recovery") return <ResetPassword onDone={()=>{ try{window.history.replaceState(null,"",window.location.pathname);}catch{} setConfirmFlow(null); }}/>;
  if(authLoading) return <div style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#0c0e16",color:"#7a85a3",fontFamily:"'DM Sans',sans-serif"}}>Loading…</div>;
  if(!user) return <AuthScreen/>;

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:T.bg,color:T.text,height:"100%",display:"flex",overflow:"hidden",transition:"background .3s,color .3s"}}>
      <FontLink/>
      {toast&&(
        <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",zIndex:2000,display:"flex",alignItems:"center",gap:12,background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"10px 14px",boxShadow:"0 10px 30px rgba(0,0,0,.4)",animation:"slideIn .2s ease",maxWidth:"90vw"}}>
          <span style={{fontSize:13,color:T.text}}>{toast.msg}</span>
          {toast.undo&&<button onClick={toast.undo} style={{background:T.accentGlow,color:T.accent,border:"none",borderRadius:7,padding:"4px 12px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>Undo</button>}
          <button onClick={()=>setToast(null)} style={{background:"none",border:"none",cursor:"pointer",color:T.textMuted,display:"flex"}}><Ico n="x" s={13}/></button>
        </div>
      )}
      {aboutOpen&&<AboutModal T={T} onClose={()=>setAboutOpen(false)}/>}
      {imgView&&<ImgViewer T={T} url={imgView} onClose={()=>setImgView(null)}/>}
      {delCatModal&&<DelCatModal T={T} name={delCatModal} count={tasks.filter(t=>t.owner===user?.id&&t.tag===delCatModal).length} onConfirm={a=>confirmDeleteCat(delCatModal,a)} onClose={()=>setDelCatModal(null)}/>}
      {linkPick&&<LinkPicker T={T} tasks={myTasks.filter(t=>!t.done)} onPick={t=>{linkPick.onPick(t);setLinkPick(null);}} onClose={()=>setLinkPick(null)}/>}
      {cmdOpen&&<CmdPalette T={T} tasks={tasks} onClose={()=>setCmdOpen(false)} onGo={v=>{setView(v);setCmdOpen(false);}} onAdd={t=>{setInput(t);setCmdOpen(false);setTimeout(()=>inputRef.current?.focus(),80);}}/>}
      <aside style={{width:sideOpen?224:60,transition:"width .3s cubic-bezier(.4,0,.2,1)",background:T.sidebar,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",overflow:"hidden",flexShrink:0,zIndex:30}}>
        <div style={{padding:"18px 14px",display:"flex",alignItems:"center",gap:9}}>
          <button onClick={()=>setAboutOpen(true)} title="About FlowSpace" style={{display:"flex",alignItems:"center",gap:9,background:"none",border:"none",cursor:"pointer",padding:0,flex:1,minWidth:0}}>
            <div style={{width:30,height:30,borderRadius:9,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 3px 12px ${T.accent}55`}}>
              <Ico n="zap" s={14} c="#fff"/>
            </div>
            {sideOpen&&<span style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,letterSpacing:"-.4px",background:`linear-gradient(90deg,${T.accent},${T.accentAlt})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",whiteSpace:"nowrap"}}>FlowSpace</span>}
          </button>
          {sideOpen&&<button onClick={()=>goView("analytics")} title="Analytics" style={{width:28,height:28,borderRadius:7,border:"none",cursor:"pointer",background:view==="analytics"?T.accentGlow:"transparent",color:view==="analytics"?T.accent:T.textMuted,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico n="bar" s={15}/></button>}
          {sideOpen&&<button onClick={()=>goView("settings")} title="Settings" style={{width:28,height:28,borderRadius:7,border:"none",cursor:"pointer",background:view==="settings"?T.accentGlow:"transparent",color:view==="settings"?T.accent:T.textMuted,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico n="cog" s={15}/></button>}
        </div>
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
            <button key={item.id} onClick={()=>goView(item.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:sideOpen?"8px 10px":"8px 0",justifyContent:sideOpen?"flex-start":"center",borderRadius:9,border:"none",cursor:"pointer",marginBottom:1,transition:"all .15s",background:view===item.id?T.accentGlow:"transparent",color:view===item.id?T.accent:T.textMuted,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:view===item.id?600:400}}>
              <Ico n={item.icon} s={16} c={view===item.id?T.accent:T.textMuted}/>
              {sideOpen&&<span style={{flex:1,textAlign:"left",whiteSpace:"nowrap"}}>{item.label}</span>}
              {sideOpen&&item.badge>0&&<span style={{background:view===item.id?T.accent:T.surface3,color:view===item.id?"#fff":T.textMuted,fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:10}}>{item.badge}</span>}
            </button>
          ))}
          {(()=>{
            const FolderBtn=(name,meta,v,count,icon)=>{
              const active=view===v;
              return (
                <button key={v} onClick={()=>goView(v)} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:sideOpen?"8px 10px":"8px 0",justifyContent:sideOpen?"flex-start":"center",borderRadius:9,border:"none",cursor:"pointer",marginBottom:1,transition:"all .15s",background:active?T.accentGlow:"transparent",color:active?T.accent:T.textMuted,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:active?600:400}}>
                  {isImgIcon(icon)?<img src={icon} alt="" style={{width:16,height:16,borderRadius:4,objectFit:"cover",flexShrink:0}}/>:<span style={{fontSize:15,width:16,textAlign:"center",flexShrink:0}}>{icon}</span>}
                  {sideOpen&&<span style={{flex:1,textAlign:"left",whiteSpace:"nowrap",textTransform:"capitalize"}}>{name}</span>}
                  {sideOpen&&count>0&&<span style={{background:active?T.accent:T.surface3,color:active?"#fff":T.textMuted,fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:10}}>{count}</span>}
                </button>
              );
            };
            const defaults=Object.entries(cats).filter(([n])=>DEFAULT_CAT_NAMES.includes(n));
            const customs=Object.entries(cats).filter(([n])=>!DEFAULT_CAT_NAMES.includes(n));
            return (<>
              {sideOpen&&defaults.length>0&&(
                <button onClick={()=>setDefOpen(o=>!o)} style={{width:"100%",display:"flex",alignItems:"center",gap:5,padding:"12px 10px 4px",background:"none",border:"none",cursor:"pointer",fontSize:9,fontWeight:700,letterSpacing:".6px",textTransform:"uppercase",color:T.textMuted,fontFamily:"'DM Sans',sans-serif"}}>
                  <Ico n="chevron" s={10} c={T.textMuted} st={{transform:defOpen?"rotate(90deg)":"none",transition:"transform .15s"}}/> Default folders
                </button>
              )}
              {(defOpen||!sideOpen)&&defaults.map(([name,meta])=>FolderBtn(name,meta,`cat:${name}`,myTasks.filter(t=>t.tag===name&&!t.done).length,meta.icon))}
              {sideOpen&&customs.length>0&&(
                <button onClick={()=>setCustomOpen(o=>!o)} style={{width:"100%",display:"flex",alignItems:"center",gap:5,padding:"12px 10px 4px",background:"none",border:"none",cursor:"pointer",fontSize:9,fontWeight:700,letterSpacing:".6px",textTransform:"uppercase",color:T.textMuted,fontFamily:"'DM Sans',sans-serif"}}>
                  <Ico n="chevron" s={10} c={T.textMuted} st={{transform:customOpen?"rotate(90deg)":"none",transition:"transform .15s"}}/> My lists
                </button>
              )}
              {(customOpen||!sideOpen)&&customs.map(([name,meta])=>FolderBtn(name,meta,`cat:${name}`,myTasks.filter(t=>t.tag===name&&!t.done).length,meta.icon))}
              {sideOpen&&(
                <div style={{padding:"12px 10px 4px",fontSize:9,fontWeight:700,letterSpacing:".6px",textTransform:"uppercase",color:T.textMuted}}>Shared with me</div>
              )}
              {sideOpen&&sharedWithMe.length===0&&(
                <div style={{padding:"2px 10px 6px",fontSize:10,color:T.textMuted,opacity:.6,lineHeight:1.4}}>Nothing shared yet. Share a folder from Settings to collaborate.</div>
              )}
              {sharedWithMe.map(s=>FolderBtn(s.folder,null,`shared:${s.owner_id}:${s.folder}`,tasks.filter(t=>t.owner===s.owner_id&&t.tag===s.folder&&!t.done).length,"🤝"))}
            </>);
          })()}
        </nav>
        {sideOpen&&(
          <div style={{padding:"10px 12px"}}>
            <div style={{background:T.surface2,borderRadius:11,padding:12,border:`1px solid ${T.border}`,...(pomRun?{animation:"glow 2s infinite"}:{})}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:10,color:T.textMuted,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase"}}>Pomodoro</span>
                <button onClick={cyclePom} title={pomRun?"":"Tap to change length"} style={{background:"none",border:"none",cursor:pomRun?"default":"pointer",padding:0,display:"flex",alignItems:"center",gap:3,color:pomRun?T.accent:T.textMuted,fontSize:9,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>{!pomRun&&<span>{pomLen}m</span>}<Ico n="clock" s={12} c={pomRun?T.accent:T.textMuted}/></button>
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
          {view==="matrix"&&<MatrixView T={T} tasks={tasks} cats={cats} updateTask={updateTask} deleteTask={deleteTask} addMatrixTask={addMatrixTask} toggleMyDay={toggleMyDay} canvasNotes={canvasNotes} setCanvasNotes={setCanvasNotes} onCanvasToTask={addCanvasTask} requestLink={requestLink} onCanvasToNote={linkIdeaToTask}/>}
          {view==="notes"&&<NotesView T={T} notes={notes} setNotes={setNotes} tasks={myTasks} onGoToTask={t=>{keepSelRef.current=true;setView("all");setSelTask(t);}}/>}
          {view==="analytics"&&<AnalyticsView T={T} tasks={tasks} xp={xp} level={level} streak={streak}/>}
          {view==="settings"&&<SettingsView T={T} dark={dark} setDark={setDark} cats={cats} setCats={setCats} scheme={scheme} setScheme={setScheme} onExport={exportData} onImport={importData} onClearCompleted={clearCompleted} ownedShares={ownedShares} onShareFolder={shareFolder} onUnshare={unshareFolder} onUploadIcon={uploadCatIcon} onDeleteCat={deleteCat} deletedCats={deletedCats} onRestoreCat={restoreCat} onPurgeCat={purgeCat}/>}
          {(["myday","flagged","upcoming","all"].includes(view)||view.startsWith("cat:")||view.startsWith("shared:"))&&(
            <TaskPanel T={T} tasks={getViewTasks()} view={view} input={input} setInput={setInput} inputRef={inputRef} addTask={addTask} toggleTask={toggleTask} deleteTask={deleteTask} updateTask={updateTask} reorderTasks={reorderTasks} duplicateTask={duplicateTask} selTask={selTask} setSelTask={setSelTask} newAnim={newAnim} cats={cats} onUndoCarry={undoCarry} carriedCount={carriedIds.length} suggestions={mydaySuggestions} onAddToMyDay={addToMyDay} onAttach={attachFile} onRemoveAttach={removeAttach} onSetReminder={setReminder} onToggleMyDay={toggleMyDay} todStr={todStr} canDeleteFn={canDeleteTask} onClearDone={clearDone} onViewImage={setImgView}/>
          )}
        </div>
      </main>
      {(["myday","flagged","upcoming","all"].includes(view)||view.startsWith("cat:")||view.startsWith("shared:"))&&(
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

function DelCatModal({T,name,count,onConfirm,onClose}) {
  const [alsoTasks,setAlsoTasks]=useState(false);
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:1250,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{width:340,maxWidth:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,padding:22,boxShadow:"0 24px 60px rgba(0,0,0,.5)",animation:"slideIn .2s ease"}}>
        <div style={{fontFamily:"'Sora',sans-serif",fontSize:16,fontWeight:700,color:T.text,marginBottom:6,textTransform:"capitalize"}}>Delete "{name}"?</div>
        <div style={{fontSize:12,color:T.textMuted,lineHeight:1.5,marginBottom:14}}>The folder moves to Recently deleted{count>0?` (it has ${count} task${count===1?"":"s"})`:""}. You can restore it later.</div>
        <button onClick={()=>setAlsoTasks(v=>!v)} disabled={count===0} style={{display:"flex",alignItems:"center",gap:9,width:"100%",padding:"10px 12px",borderRadius:10,border:`1px solid ${alsoTasks?T.accent:T.border}`,background:alsoTasks?T.accentGlow:"transparent",cursor:count===0?"default":"pointer",opacity:count===0?.5:1,marginBottom:16,fontFamily:"'DM Sans',sans-serif"}}>
          <span style={{width:18,height:18,borderRadius:5,border:`2px solid ${alsoTasks?T.accent:T.textMuted}`,background:alsoTasks?T.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{alsoTasks&&<Ico n="check" s={11} c="#fff"/>}</span>
          <span style={{fontSize:13,fontWeight:700,color:alsoTasks?T.accent:T.text,textAlign:"left"}}>Also delete the {count} task{count===1?"":"s"} in this folder</span>
        </button>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} style={{flex:1,padding:"9px",borderRadius:9,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>Cancel</button>
          <button onClick={()=>onConfirm(alsoTasks)} style={{flex:1,padding:"9px",borderRadius:9,border:"none",background:T.danger,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function LinkPicker({T,tasks,onPick,onClose}) {
  const [q,setQ]=useState("");
  const filtered=tasks.filter(t=>!q||t.title.toLowerCase().includes(q.toLowerCase())).slice(0,40);
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:1300,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:90}}>
      <div onClick={e=>e.stopPropagation()} style={{width:420,maxWidth:"92vw",background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,overflow:"hidden",boxShadow:"0 24px 60px rgba(0,0,0,.5)",animation:"slideIn .2s ease"}}>
        <div style={{padding:"12px 14px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:8}}>
          <Ico n="search" s={15} c={T.textMuted}/>
          <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Link to which task?" style={{flex:1,background:"none",border:"none",outline:"none",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:14}}/>
        </div>
        <div style={{maxHeight:320,overflowY:"auto",padding:6}}>
          {filtered.length===0&&<div style={{padding:20,textAlign:"center",color:T.textMuted,fontSize:13}}>No tasks found</div>}
          {filtered.map(t=>(
            <div key={t.id} onClick={()=>onPick(t)} style={{padding:"9px 12px",borderRadius:8,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background=T.accentGlow} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <span style={{fontSize:13,color:T.text}}>{t.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ImgViewer({T,url,onClose}) {
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:1300,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,padding:24}}>
      <img src={url} alt="attachment" onClick={e=>e.stopPropagation()} style={{maxWidth:"92vw",maxHeight:"80vh",objectFit:"contain",borderRadius:10,boxShadow:"0 12px 40px rgba(0,0,0,.6)"}}/>
      <div onClick={e=>e.stopPropagation()} style={{display:"flex",gap:10}}>
        <a href={url} target="_blank" rel="noreferrer" style={{padding:"8px 16px",borderRadius:9,background:T.grad,color:"#fff",textDecoration:"none",fontSize:13,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>Open in browser ↗</a>
        <button onClick={onClose} style={{padding:"8px 16px",borderRadius:9,border:`1px solid rgba(255,255,255,.25)`,background:"transparent",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>Close</button>
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

function TaskPanel({T,tasks,view,input,setInput,inputRef,addTask,toggleTask,deleteTask,updateTask,reorderTasks,duplicateTask,selTask,setSelTask,newAnim,cats,onUndoCarry,carriedCount,suggestions,onAddToMyDay,onAttach,onRemoveAttach,onSetReminder,onToggleMyDay,todStr,canDeleteFn,onClearDone,onViewImage}) {
  const [filter,setFilter]=useState("all");
  const [catFilter,setCatFilter]=useState(null);
  const [sort,setSort]=useState("smart");
  const [showSugg,setShowSugg]=useState(true);
  const [dragId,setDragId]=useState(null);
  const [dropId,setDropId]=useState(null);
  const [swipeId,setSwipeId]=useState(null);
  const [swipeX,setSwipeX]=useState(0);
  const dragIdRef=useRef(null);
  const dropIdRef=useRef(null);
  const didDragRef=useRef(false);
  const labels={myday:"My Day",flagged:"Flagged",upcoming:"Upcoming",all:"All Tasks"};
  const catKey=view.startsWith("cat:")?view.slice(4):null;
  const sharedKey=view.startsWith("shared:")?view.slice(view.lastIndexOf(":")+1):null;
  const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
  const titleIcon=catKey?(cats[catKey]?.icon||"📁"):sharedKey?"🤝":null;
  const titleText=catKey?cap(catKey):sharedKey?cap(sharedKey):labels[view];
  let show=filter==="active"?tasks.filter(t=>!t.done):filter==="done"?tasks.filter(t=>t.done):tasks;
  if(view==="all"&&catFilter) show=show.filter(t=>t.tag===catFilter);
  const QRANK={q1:0,q3:1,q2:2,q4:3};
  const sortList=arr=>{
    const a=[...arr];
    if(sort==="priority") a.sort((x,y)=>(QRANK[x.quadrant]??9)-(QRANK[y.quadrant]??9));
    else if(sort==="az") a.sort((x,y)=>x.title.localeCompare(y.title));
    else if(sort==="due") a.sort((x,y)=>{if(!x.due&&!y.due)return 0;if(!x.due)return 1;if(!y.due)return -1;return x.due.localeCompare(y.due);});
    return a;
  };
  const dayTotal=view==="myday"?tasks.length:0;
  const dayDone=view==="myday"?tasks.filter(t=>t.done).length:0;
  const dayPct=dayTotal?Math.round(dayDone/dayTotal*100):0;

  const beginReorder=id=>{
    didDragRef.current=true; dragIdRef.current=id; setDragId(id); navigator.vibrate?.(20);
    runDrag(
      ev=>{ const el=document.elementFromPoint(ev.clientX,ev.clientY); const card=el&&el.closest("[data-task-id]"); dropIdRef.current=card?card.getAttribute("data-task-id"):null; setDropId(dropIdRef.current); },
      ()=>{ const from=dragIdRef.current,to=dropIdRef.current; if(from!=null&&to!=null&&String(from)!==String(to)) reorderTasks(from,to); dragIdRef.current=null; dropIdRef.current=null; setDragId(null); setDropId(null); }
    );
  };
  const beginSwipe=(id,sx)=>{
    didDragRef.current=true; setSwipeId(id); document.body.style.userSelect="none";
    const mv=ev=>setSwipeX(Math.max(-130,Math.min(ev.clientX-sx,130)));
    const up=ev=>{
      window.removeEventListener("pointermove",mv); window.removeEventListener("pointerup",up); window.removeEventListener("pointercancel",up);
      document.body.style.userSelect="";
      const dx=ev.clientX-sx;
      if(dx>70){ navigator.vibrate?.(20); onToggleMyDay?.(id); }
      else if(dx<-70){ navigator.vibrate?.(25); deleteTask(id); }
      setSwipeId(null); setSwipeX(0);
    };
    window.addEventListener("pointermove",mv); window.addEventListener("pointerup",up); window.addEventListener("pointercancel",up);
  };
  const onCardDown=(e,id)=>{
    if(e.target.closest("button")) return;
    didDragRef.current=false;
    const sx=e.clientX, sy=e.clientY, type=e.pointerType;
    let decided=false, timer=null;
    const teardown=()=>{ clearTimeout(timer); window.removeEventListener("pointermove",probe); window.removeEventListener("pointerup",end); window.removeEventListener("pointercancel",end); };
    const probe=ev=>{
      if(decided) return;
      const dx=ev.clientX-sx, dy=ev.clientY-sy;
      if(Math.abs(dx)<8 && Math.abs(dy)<8) return;
      decided=true; teardown();
      if(Math.abs(dx)>Math.abs(dy)) beginSwipe(id,sx); // horizontal → swipe (right = My Day, left = delete)
      else beginReorder(id);
    };
    const end=()=>teardown();
    if(type!=="mouse") timer=setTimeout(()=>{ if(!decided){ decided=true; teardown(); beginReorder(id); } }, 220);
    window.addEventListener("pointermove",probe); window.addEventListener("pointerup",end); window.addEventListener("pointercancel",end);
  };
  const selectCard=task=>{ if(didDragRef.current){ didDragRef.current=false; return; } setSelTask(task); };
  return (
    <div style={{flex:1,display:"flex",overflow:"hidden"}}>
      <div style={{flex:1,overflowY:"auto",padding:"22px 26px"}}>
        <div style={{marginBottom:18}}>
          {view==="myday"&&<div style={{fontSize:12,color:T.textMuted,fontWeight:500,marginBottom:3}}>{new Date().getHours()<12?"Good morning 🌤":new Date().getHours()<17?"Keep it up 💪":"Good evening 🌙"}</div>}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:700,letterSpacing:"-.5px",display:"flex",alignItems:"center",gap:8}}>{titleIcon&&<CatIcon icon={titleIcon} size={20}/>}{titleText}</h1>
              {view==="myday"&&dayTotal>0&&(
                <div style={{position:"relative",width:34,height:34}} title={`${dayDone}/${dayTotal} done`}>
                  <svg width="34" height="34" style={{transform:"rotate(-90deg)"}}>
                    <circle cx="17" cy="17" r="14" fill="none" stroke={T.surface3} strokeWidth="4"/>
                    <circle cx="17" cy="17" r="14" fill="none" stroke={T.accent} strokeWidth="4" strokeLinecap="round" strokeDasharray={2*Math.PI*14} strokeDashoffset={2*Math.PI*14*(1-dayPct/100)} style={{transition:"stroke-dashoffset .5s ease"}}/>
                  </svg>
                  <span style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:T.accent}}>{dayPct}%</span>
                </div>
              )}
            </div>
            {view!=="completed"&&(
              <select value={sort} onChange={e=>setSort(e.target.value)} style={{fontSize:11,color:T.textMuted,background:T.surface2,border:`1px solid ${T.border}`,borderRadius:8,padding:"4px 8px",fontFamily:"'DM Sans',sans-serif",outline:"none",cursor:"pointer"}}>
                <option value="smart">Smart sort</option>
                <option value="due">By due date</option>
                <option value="priority">By priority</option>
                <option value="az">A → Z</option>
              </select>
            )}
          </div>
          <div style={{fontSize:12,color:T.textMuted,marginTop:2}}>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}{view==="myday"&&` · ${tasks.filter(t=>!t.done).length} remaining`}</div>
        </div>
        {view==="myday"&&carriedCount>0&&(
          <button onClick={onUndoCarry} style={{display:"flex",alignItems:"center",gap:7,width:"100%",marginBottom:12,padding:"9px 12px",borderRadius:11,border:`1px solid ${T.border}`,background:T.surface2,color:T.textMuted,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>
            <Ico n="repeat" s={14} c={T.textMuted}/> Carried {carriedCount} unfinished {carriedCount===1?"task":"tasks"} forward · tap to undo
          </button>
        )}
        {view==="myday"&&suggestions&&suggestions.length>0&&(
          <div style={{marginBottom:14,border:`1px solid ${T.border}`,borderRadius:11,background:T.surface,overflow:"hidden"}}>
            <button onClick={()=>setShowSugg(s=>!s)} style={{width:"100%",display:"flex",alignItems:"center",gap:7,padding:"9px 12px",background:"none",border:"none",cursor:"pointer",color:T.text,fontFamily:"'DM Sans',sans-serif"}}>
              <Ico n="sparkles" s={14} c={T.accent}/>
              <span style={{fontSize:12,fontWeight:700,flex:1,textAlign:"left"}}>Suggestions for My Day</span>
              <span style={{fontSize:10,color:T.textMuted}}>{showSugg?"Hide":`Show ${suggestions.length}`}</span>
            </button>
            {showSugg&&(
              <div style={{padding:"0 8px 8px",display:"flex",flexDirection:"column",gap:3}}>
                {suggestions.map(t=>{const ov=t.due&&t.due<tod();return(
                  <div key={t.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",borderRadius:8,background:T.surface2}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.title}</div>
                      {t.due&&<div style={{fontSize:10,color:ov?T.danger:T.textMuted,fontWeight:ov?700:400}}>{ov?"Overdue · ":""}{fmtDate(t.due)}</div>}
                    </div>
                    <button onClick={()=>onAddToMyDay(t.id)} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:7,border:`1px solid ${T.accent}`,background:T.accentGlow,color:T.accent,cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"'DM Sans',sans-serif",flexShrink:0}}><Ico n="plus" s={11} c={T.accent}/>Add</button>
                  </div>
                );})}
              </div>
            )}
          </div>
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
        {view!=="myday"&&(
          <div style={{fontSize:10,color:T.textMuted,opacity:.55,marginBottom:10,marginTop:-4}}>💡 Tip: swipe a task right (or drag right) to add it to My Day ☀️</div>
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
              <button key={name} onClick={()=>setCatFilter(catFilter===name?null:name)} style={{padding:"4px 11px",borderRadius:20,border:`1px solid ${catFilter===name?meta.color:T.border}`,background:catFilter===name?meta.color+"22":"transparent",color:catFilter===name?meta.color:T.textMuted,cursor:"pointer",fontSize:11,fontWeight:catFilter===name?700:400,fontFamily:"'DM Sans',sans-serif",textTransform:"capitalize",display:"inline-flex",alignItems:"center",gap:4}}><CatIcon icon={meta.icon} size={11}/> {name}</button>
            ))}
          </div>
        )}
        <div style={{display:"flex",flexDirection:"column",gap:4}}>
          {sortList(show.filter(t=>!t.done)).map(task=>(
            <TCard key={task.id} task={task} T={T} cats={cats} onToggle={toggleTask} onDelete={deleteTask} onSel={selectCard} sel={selTask?.id===task.id} entering={newAnim===task.id} dragging={dragId===task.id} dropTarget={dropId===task.id}
              onDown={sort==="smart"?onCardDown:undefined} swipeX={swipeId===task.id?swipeX:0} canDelete={canDeleteFn?canDeleteFn(task):true} onToggleMyDay={onToggleMyDay}/>
          ))}
          {show.filter(t=>t.done).length>0&&<>
            <div style={{fontSize:10,color:T.textMuted,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",padding:"10px 2px 4px",display:"flex",alignItems:"center",gap:5}}>
              <Ico n="check" s={11} c={T.textMuted}/> Completed · {show.filter(t=>t.done).length}
              <button onClick={()=>onClearDone?.(show.filter(t=>t.done).map(t=>t.id))} style={{marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:T.danger,fontSize:10,fontWeight:700,letterSpacing:".3px",fontFamily:"'DM Sans',sans-serif",textTransform:"none"}}>Clear all</button>
            </div>
            {show.filter(t=>t.done).map(task=>(
              <TCard key={task.id} task={task} T={T} cats={cats} onToggle={toggleTask} onDelete={deleteTask} onSel={selectCard} sel={selTask?.id===task.id} canDelete={canDeleteFn?canDeleteFn(task):true} onToggleMyDay={onToggleMyDay}/>
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
      {selTask&&<TDetail task={selTask} T={T} cats={cats} onUpdate={updateTask} onDelete={deleteTask} onDuplicate={duplicateTask} onAttach={onAttach} onRemoveAttach={onRemoveAttach} onSetReminder={onSetReminder} canDelete={canDeleteFn?canDeleteFn(selTask):true} onViewImage={onViewImage} onClose={()=>setSelTask(null)}/>}
    </div>
  );
}

function TCard({task,T,cats,onToggle,onDelete,onSel,sel,entering,dragging,dropTarget,onDown,swipeX=0,canDelete=true,onToggleMyDay}) {
  const inMyDay=task.mydayDate===tod();
  const [hov,setHov]=useState(false);
  const ov=task.due&&task.due<tod()&&!task.done;
  const catMeta=cats[task.tag];
  const catColor=catMeta?.color||"#6b7280";
  const qColor=QUAD[task.quadrant]?.color;
  return (
    <div style={{position:"relative",borderRadius:11,overflow:"hidden"}}>
    {swipeX>0&&(
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",gap:6,paddingLeft:16,background:`linear-gradient(90deg,${T.warning}44,transparent)`,color:T.warning,fontWeight:700,fontSize:12,pointerEvents:"none"}}>
        <Ico n="sun" s={16} c={T.warning}/>{swipeX>70?"Release for My Day ☀️":"My Day"}
      </div>
    )}
    {swipeX<0&&(
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"flex-end",gap:6,paddingRight:16,background:`linear-gradient(270deg,${T.danger}44,transparent)`,color:T.danger,fontWeight:700,fontSize:12,pointerEvents:"none"}}>
        {swipeX<-70?"Release to delete 🗑":"Delete"}<Ico n="trash" s={16} c={T.danger}/>
      </div>
    )}
    <div className={entering?"te":""} data-task-id={task.id}
      onPointerDown={onDown?e=>onDown(e,task.id):undefined}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={()=>onSel(task)}
      style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",borderRadius:11,background:swipeX!==0?T.bg:(sel?T.accentGlow:dragging?"rgba(192,132,252,.06)":hov?"rgba(255,255,255,0.04)":"transparent"),border:`1px solid ${dropTarget?T.accent:sel?T.accent+"44":T.border}`,cursor:"pointer",transition:swipeX!==0?"none":"all .12s",position:"relative",opacity:task.done?.5:dragging?.4:1,transform:swipeX!==0?`translateX(${swipeX}px)`:dragging?"scale(.98)":"scale(1)",userSelect:"none",WebkitUserSelect:"none",touchAction:"pan-y"}}>
      {task.color&&<div style={{position:"absolute",left:0,top:8,bottom:8,width:3,borderRadius:2,background:task.color}}/>}
      <div style={{color:T.textMuted,opacity:hov?.6:0,transition:"opacity .15s",flexShrink:0,marginTop:1,cursor:"grab",paddingLeft:task.color?4:0}}><Ico n="grip" s={14} c={T.textMuted}/></div>
      <button onClick={e=>{e.stopPropagation();onToggle(task.id);}} style={{width:19,height:19,borderRadius:5,border:`2px solid ${task.done?T.success:qColor||T.border}`,background:task.done?T.success:"transparent",cursor:"pointer",flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
        {task.done&&<Ico n="check" s={10} c="#fff" st={{animation:"checkB .25s ease"}}/>}
      </button>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          <span style={{fontSize:13,fontWeight:500,color:task.done?T.textMuted:T.text,textDecoration:task.done?"line-through":"none"}}>{task.title}</span>
          {task.mydayDate===tod()&&<Ico n="sun" s={11} c="#f59e0b" st={{flexShrink:0}}/>}
          {task.starred&&<Ico n="flag" s={11} c="#f59e0b" st={{fill:"#f59e0b",flexShrink:0}}/>}
          {task.recurring&&<Ico n="repeat" s={11} c={T.textMuted} st={{flexShrink:0}}/>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5,marginTop:3,flexWrap:"wrap"}}>
          {task.tag&&<span style={{fontSize:10,padding:"1px 7px",borderRadius:20,background:catColor+"22",color:catColor,fontWeight:600,display:"inline-flex",alignItems:"center",gap:3}}>{catMeta?.icon&&<CatIcon icon={catMeta.icon} size={10}/>}{task.tag}</span>}
          {task.due&&<span style={{fontSize:11,color:ov?T.danger:T.textMuted,fontWeight:ov?700:400}}>{fmtDate(task.due)}</span>}
          {task.subtasks?.length>0&&<span style={{fontSize:10,color:T.textMuted}}>{task.subtasks.filter(s=>s.done).length}/{task.subtasks.length}</span>}
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:2,flexShrink:0,marginTop:1}}>
        {qColor&&<div title={QUAD[task.quadrant]?.label} style={{width:6,height:6,borderRadius:"50%",background:qColor,marginRight:3}}/>}
        <button onClick={e=>{e.stopPropagation();onToggleMyDay?.(task.id);}} title={inMyDay?"Remove from My Day":"Add to My Day"} style={{width:22,height:22,borderRadius:6,border:"none",cursor:"pointer",background:inMyDay?"#f59e0b22":"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="sun" s={12} c={inMyDay?"#f59e0b":T.textMuted}/></button>
        {canDelete&&<button onClick={e=>{e.stopPropagation();onDelete(task.id);}} title="Delete" style={{width:22,height:22,borderRadius:6,border:"none",cursor:"pointer",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="trash" s={11} c={T.textMuted}/></button>}
      </div>
    </div>
    </div>
  );
}

function TDetail({task,T,cats,onUpdate,onDelete,onDuplicate,onAttach,onRemoveAttach,onSetReminder,canDelete=true,onViewImage,onClose}) {
  const [uploading,setUploading]=useState(false);
  const fileRef=useRef(null);
  const doAttach=async files=>{ if(!files?.length)return; setUploading(true); try{ for(const f of files) await onAttach?.(task,f); }catch(e){ alert("Upload failed: "+(e.message||e)); } setUploading(false); };
  const [nts,setNts]=useState(task.notes||"");
  const [ns,setNs]=useState("");
  useEffect(()=>setNts(task.notes||""),[task.id]);
  const addSub=()=>{if(!ns.trim())return;onUpdate(task.id,{subtasks:[...(task.subtasks||[]),{id:Date.now(),title:ns.trim(),done:false}]});setNs("");};
  const COLS=[null,"#ef4444","#f97316","#f59e0b","#22c55e","#3b82f6","#a855f7"];
  const [closeX,setCloseX]=useState(0);
  const panelDown=e=>{
    if(e.target.closest("input,textarea,select,button,a")) return;
    const sx=e.clientX,sy=e.clientY; let decided=false;
    const cleanup=()=>{ window.removeEventListener("pointermove",mv);window.removeEventListener("pointerup",up);window.removeEventListener("pointercancel",up); };
    const mv=ev=>{ const dx=ev.clientX-sx,dy=ev.clientY-sy; if(!decided){ if(Math.abs(dx)<10&&Math.abs(dy)<10)return; decided=true; if(Math.abs(dx)<=Math.abs(dy)){cleanup();return;} } if(dx>0)setCloseX(Math.min(dx,320)); };
    const up=ev=>{ cleanup(); if(ev.clientX-sx>90)onClose(); else setCloseX(0); };
    window.addEventListener("pointermove",mv);window.addEventListener("pointerup",up);window.addEventListener("pointercancel",up);
  };
  return (
    <div onPointerDown={panelDown} style={{width:280,borderLeft:`1px solid ${T.border}`,background:T.surface,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:9,animation:closeX?"none":"slideIn .2s ease",flexShrink:0,transform:closeX?`translateX(${closeX}px)`:"none",transition:closeX?"none":"transform .2s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <h3 style={{fontFamily:"'Sora',sans-serif",fontSize:13,fontWeight:600,flex:1,lineHeight:1.4}}>{task.title}</h3>
        <button onClick={onClose} style={{width:24,height:24,borderRadius:6,border:"none",cursor:"pointer",background:T.surface2,color:T.textMuted,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginLeft:6}}><Ico n="x" s={13}/></button>
      </div>
      <DL label="Notes" T={T}>
        <textarea value={nts} onChange={e=>{setNts(e.target.value);onUpdate(task.id,{notes:e.target.value});}} placeholder="Notes, links, markdown…" style={{marginTop:4,width:"100%",minHeight:52,padding:"6px 9px",borderRadius:7,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none",resize:"vertical",lineHeight:1.5}}/>
      </DL>
      <DL label="Attachments 📎" T={T}>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:5}}>
          {(task.attachments||[]).map(att=>(
            <div key={att.path} style={{position:"relative",width:50,height:50,borderRadius:8,overflow:"hidden",border:`1px solid ${T.border}`,background:T.surface2}}>
              {(att.type||"").startsWith("image/")
                ? <img src={att.url} alt={att.name} onClick={()=>onViewImage?.(att.url)} style={{width:"100%",height:"100%",objectFit:"cover",cursor:"pointer"}}/>
                : <a href={att.url} target="_blank" rel="noreferrer" title={att.name} style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,textDecoration:"none"}}>📄</a>}
              <button onClick={()=>onRemoveAttach?.(task,att)} style={{position:"absolute",top:2,right:2,width:16,height:16,borderRadius:"50%",border:"none",cursor:"pointer",background:"rgba(0,0,0,.6)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" s={9} c="#fff"/></button>
            </div>
          ))}
        </div>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" multiple style={{display:"none"}} onChange={e=>{doAttach([...e.target.files]); e.target.value="";}}/>
        <button onClick={()=>fileRef.current?.click()} disabled={uploading} style={{marginTop:7,width:"100%",padding:"7px",borderRadius:8,border:`1px dashed ${T.border}`,background:"transparent",color:T.textMuted,cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{uploading?"Uploading…":"+ Add photo / screenshot"}</button>
      </DL>
      <DL label="Color Label" T={T}>
        <div style={{display:"flex",gap:5,marginTop:5,flexWrap:"wrap"}}>
          {COLS.map(c=><div key={c||"none"} onClick={()=>onUpdate(task.id,{color:c})} style={{width:18,height:18,borderRadius:4,background:c||T.surface3,border:`2px solid ${task.color===c?T.text:"transparent"}`,cursor:"pointer"}}/>)}
        </div>
      </DL>
      <DL label="Priority" T={T}>
        <div style={{display:"flex",gap:4,marginTop:5}}>
          {QUAD_ORDER.map(q=>{const m=QUAD[q],on=task.quadrant===q;return(
            <button key={q} title={m.label} onClick={()=>onUpdate(task.id,{quadrant:on?null:q})} style={{flex:1,padding:"5px 0",borderRadius:7,border:`1px solid ${on?m.color:T.border}`,background:on?m.color+"22":"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
              <span style={{width:9,height:9,borderRadius:"50%",background:m.color}}/>
              <span style={{fontSize:8,fontWeight:700,color:on?m.color:T.textMuted}}>{m.short}</span>
            </button>
          );})}
        </div>
      </DL>
      <DL label="Due · Repeat" T={T}>
        <div style={{display:"flex",gap:4,marginTop:5,marginBottom:5,flexWrap:"wrap"}}>
          {[["Today",tod()],["Tmrw",addDays(1)],["+1wk",addDays(7)],["Clear",""]].map(([lbl,val])=>(
            <button key={lbl} onClick={()=>onUpdate(task.id,{due:val||null})} style={{padding:"3px 9px",borderRadius:7,border:`1px solid ${task.due===val&&val?T.accent:T.border}`,background:task.due===val&&val?T.accentGlow:"transparent",color:task.due===val&&val?T.accent:T.textMuted,cursor:"pointer",fontSize:10,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{lbl}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:6}}>
          <input type="date" value={task.due||""} onChange={e=>onUpdate(task.id,{due:e.target.value})} style={{flex:1,minWidth:0,padding:"6px 8px",borderRadius:7,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none"}}/>
          <select value={task.recurring&&task.recurring.startsWith("custom:")?"custom":(task.recurring||"")} onChange={e=>onUpdate(task.id,{recurring:e.target.value==="custom"?"custom:1:weeks":(e.target.value||null)})} style={{flex:1,minWidth:0,padding:"6px 8px",borderRadius:7,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none",cursor:"pointer"}}>
            <option value="">No repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="custom">Custom…</option>
          </select>
        </div>
        {task.recurring&&task.recurring.startsWith("custom:")&&(()=>{
          const [,n,unit]=task.recurring.split(":");
          return (
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:6}}>
              <span style={{fontSize:11,color:T.textMuted}}>Every</span>
              <input type="number" min="1" value={n||1} onChange={e=>onUpdate(task.id,{recurring:`custom:${Math.max(1,parseInt(e.target.value)||1)}:${unit}`})} style={{width:52,padding:"5px 7px",borderRadius:6,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none"}}/>
              <select value={unit} onChange={e=>onUpdate(task.id,{recurring:`custom:${n||1}:${e.target.value}`})} style={{flex:1,padding:"5px 7px",borderRadius:6,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none",cursor:"pointer"}}>
                <option value="days">days</option><option value="weeks">weeks</option><option value="months">months</option><option value="years">years</option>
              </select>
            </div>
          );
        })()}
      </DL>
      <DL label="Reminder ⏰" T={T}>
        <div style={{display:"flex",gap:6,alignItems:"center",marginTop:5}}>
          <input type="datetime-local" value={task.remindAt||""} onChange={e=>onSetReminder?.(task.id,e.target.value)} style={{flex:1,minWidth:0,padding:"6px 8px",borderRadius:7,border:`1px solid ${task.remindAt?T.accent:T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none"}}/>
          {task.remindAt&&<button onClick={()=>onSetReminder?.(task.id,"")} title="Clear reminder" style={{width:24,height:24,borderRadius:6,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" s={11}/></button>}
        </div>
      </DL>
      <DL label="Category" T={T}>
        <div style={{display:"flex",gap:4,marginTop:5,flexWrap:"wrap"}}>
          {Object.entries(cats).map(([tag,meta])=>(
            <button key={tag} onClick={()=>onUpdate(task.id,{tag})} style={{padding:"3px 9px",borderRadius:20,border:`1px solid ${task.tag===tag?meta.color:T.border}`,background:task.tag===tag?meta.color+"22":"transparent",color:task.tag===tag?meta.color:T.textMuted,cursor:"pointer",fontSize:10,fontWeight:task.tag===tag?700:400,fontFamily:"'DM Sans',sans-serif",display:"inline-flex",alignItems:"center",gap:3}}><CatIcon icon={meta.icon} size={10}/> {tag}</button>
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
      <div style={{display:"flex",gap:6}}>
        <button onClick={()=>onUpdate(task.id,{starred:!task.starred})} style={{flex:1,padding:"7px",borderRadius:8,border:`1px solid ${task.starred?"#f59e0b":T.border}`,background:task.starred?"#f59e0b22":"transparent",color:task.starred?"#f59e0b":T.textMuted,cursor:"pointer",fontSize:11,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
          <Ico n="flag" s={12} c={task.starred?"#f59e0b":undefined} st={task.starred?{fill:"#f59e0b"}:{}}/>{task.starred?"Flagged":"Flag"}
        </button>
        <button onClick={()=>{onDuplicate?.(task);onClose();}} style={{flex:1,padding:"7px",borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,cursor:"pointer",fontSize:11,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
          <Ico n="layers" s={12}/>Copy
        </button>
        {canDelete&&<button onClick={()=>onDelete(task.id)} style={{flex:1,padding:"7px",borderRadius:8,border:`1px solid ${T.danger}22`,background:T.danger+"11",color:T.danger,cursor:"pointer",fontSize:11,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
          <Ico n="trash" s={12} c={T.danger}/>Delete
        </button>}
      </div>
    </div>
  );
}
const DL=({label,T,children})=><div><span style={{fontSize:10,fontWeight:700,letterSpacing:".6px",textTransform:"uppercase",color:T.textMuted}}>{label}</span>{children}</div>;

function MatrixView({T,tasks,cats,updateTask,deleteTask,addMatrixTask,toggleMyDay,canvasNotes,setCanvasNotes,onCanvasToTask,requestLink,onCanvasToNote}) {
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
        ?<EisenhowerMatrix T={T} tasks={tasks} cats={cats} updateTask={updateTask} deleteTask={deleteTask} addMatrixTask={addMatrixTask} toggleMyDay={toggleMyDay}/>
        :<FreeformCanvas T={T} notes={canvasNotes} setNotes={setCanvasNotes} onCanvasToTask={onCanvasToTask} requestLink={requestLink} onCanvasToNote={onCanvasToNote}/>}
    </div>
  );
}

function EisenhowerMatrix({T,tasks,cats,updateTask,deleteTask,addMatrixTask,toggleMyDay}) {
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
  const didDragNote=useRef(false);
  const onNoteDown=(e,task)=>{
    if(e.target.closest("button")||e.target.tagName==="TEXTAREA") return;
    didDragNote.current=false;
    startPressDrag(e,()=>{
      setDragId(task.id); navigator.vibrate?.(20);
      runDrag(
        ev=>{ didDragNote.current=true; const el=document.elementFromPoint(ev.clientX,ev.clientY); const qd=el&&el.closest("[data-quadrant]"); dragOverRef.current=qd?qd.getAttribute("data-quadrant"):null; setDragOver(dragOverRef.current); },
        ()=>{ const q=dragOverRef.current; if(q&&q!==task.quadrant) updateTask(task.id,{quadrant:q}); dragOverRef.current=null; setDragId(null); setDragOver(null); }
      );
    });
  };
  const editNote=task=>{ if(didDragNote.current){ didDragNote.current=false; return; } setEditId(task.id); };
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
          <div onClick={e=>{if(e.target===e.currentTarget&&addingIn!==qid){setAddingIn(qid);setNewText("");}}} style={{flex:1,padding:10,overflowY:"auto",display:"flex",flexWrap:"wrap",gap:7,alignContent:"flex-start",cursor:"text"}}>
            {tasks.filter(t=>t.quadrant===qid&&!t.done).map(task=>(
              <MNote key={task.id} task={task} qColor={q.color} catMeta={cats[task.tag]} T={T} onDown={onNoteDown} onClickNote={()=>editNote(task)} dragging={dragId===task.id} inMyDay={task.mydayDate===tod()} onRemove={()=>updateTask(task.id,{quadrant:null})} onDelete={()=>deleteTask(task.id)} onToMyDay={()=>toggleMyDay(task.id)} editing={editId===task.id} onEdit={()=>setEditId(task.id)} onSave={txt=>{const t=txt.trim();if(t)updateTask(task.id,{title:t});setEditId(null);}}/>
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

function MNote({task,qColor,catMeta,T,onDelete,onRemove,onToMyDay,editing,onEdit,onSave,onDown,onClickNote,dragging,inMyDay}) {
  const [hov,setHov]=useState(false);
  const [et,setEt]=useState(task.title);
  if (editing) return (
    <div style={{width:"100%"}}>
      <textarea autoFocus value={et} onChange={e=>setEt(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();onSave(et);}if(e.key==="Escape")onSave(task.title);}} onBlur={()=>onSave(et)} style={{width:"100%",minHeight:58,padding:"7px",borderRadius:7,border:`1px solid ${qColor}88`,background:qColor+"11",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none",resize:"none"}}/>
    </div>
  );
  return (
    <div onPointerDown={e=>onDown?.(e,task)} onClick={()=>onClickNote?.()}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{padding:"7px 9px",borderRadius:8,background:qColor+"1a",border:`1px solid ${qColor}44`,fontSize:12,color:T.text,lineHeight:1.5,position:"relative",minWidth:88,maxWidth:160,cursor:"grab",transition:"transform .15s,box-shadow .15s",transform:dragging?"scale(1.05) rotate(1deg)":hov?"translateY(-2px) rotate(.4deg)":"none",boxShadow:dragging?`0 10px 22px ${qColor}55`:hov?`0 6px 14px ${qColor}33`:"none",opacity:dragging?.85:1,userSelect:"none",WebkitUserSelect:"none",touchAction:"none"}}>
      <div style={{borderLeft:`3px solid ${qColor}`,paddingLeft:6}}>{task.title}</div>
      {catMeta&&<div style={{marginTop:4,fontSize:9,color:catMeta.color,fontWeight:600}}>{catMeta.icon} {task.tag}</div>}
      {!editing&&(
        <div style={{position:"absolute",top:-10,right:-4,display:"flex",gap:2,zIndex:10}}>
          <button title={inMyDay?"Remove from My Day":"Add to My Day"} onClick={e=>{e.stopPropagation();onToMyDay();}} style={{width:18,height:18,borderRadius:4,border:`1px solid ${inMyDay?"#f59e0b":T.border}`,cursor:"pointer",background:inMyDay?"#f59e0b":T.surface,color:inMyDay?"#fff":T.textMuted,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 6px rgba(0,0,0,.3)"}}><Ico n="sun" s={9} c={inMyDay?"#fff":T.textMuted}/></button>
          <button title="Remove from board" onClick={e=>{e.stopPropagation();onRemove();}} style={{width:18,height:18,borderRadius:4,border:"none",cursor:"pointer",background:T.surface,color:T.textMuted,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 6px rgba(0,0,0,.3)"}}><Ico n="x" s={9}/></button>
        </div>
      )}
    </div>
  );
}

function FreeformCanvas({T,notes,setNotes,onCanvasToTask,requestLink,onCanvasToNote}) {
  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const onPointerDown = useCallback((e, note) => {
    if (["TEXTAREA","INPUT","BUTTON"].includes(e.target.tagName)) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = canvasRef.current.getBoundingClientRect();
    dragRef.current = { id: note.id, ox: e.clientX-rect.left-note.x, oy: e.clientY-rect.top-note.y, sx:e.clientX, sy:e.clientY, moved:false };
  }, []);
  const onPointerMove = useCallback((e) => {
    if (!dragRef.current || !canvasRef.current) return;
    const d=dragRef.current;
    if(Math.hypot(e.clientX-d.sx,e.clientY-d.sy)>4) d.moved=true;
    if(!d.moved) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX-rect.left-d.ox, rect.width-150));
    const y = Math.max(0, Math.min(e.clientY-rect.top-d.oy, rect.height-90));
    setNotes(ns => ns.map(n => n.id===d.id ? {...n, x, y} : n));
  }, [setNotes]);
  const onPointerUp = useCallback(() => { const d=dragRef.current; dragRef.current=null; if(d&&!d.moved) setEditingId(d.id); }, []);
  const editingRef = useRef(null);
  useEffect(()=>{ editingRef.current=editingId; },[editingId]);
  const onCanvasClick = useCallback((e) => {
    if (!canvasRef.current || e.target !== canvasRef.current) return;
    if (editingRef.current){ setEditingId(null); return; } // a note was open → just close it, don't create
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left - 70);
    const y = Math.max(0, e.clientY - rect.top - 40);
    const newNote = { id: Date.now(), text: "New idea…", x, y, color: NOTE_COLS[notes.length % NOTE_COLS.length] };
    setNotes(ns => [...ns, newNote]);
    setEditingId(newNote.id);
  }, [notes.length, setNotes]);
  const convertToTask = (note, myDay) => { onCanvasToTask?.(note.text, myDay); setNotes(ns => ns.filter(n => n.id !== note.id)); };
  const linkToTask = (note) => { requestLink?.(t=>{ onCanvasToNote?.(note.text, t.id); setNotes(ns => ns.filter(n => n.id !== note.id)); }); };
  return (
    <div ref={canvasRef} style={{flex:1,position:"relative",background:T.canvas,overflow:"hidden",cursor:"crosshair"}}
      onPointerMove={onPointerMove} onPointerUp={onPointerUp} onClick={onCanvasClick}>
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",opacity:.15}}>
        <defs><pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M 28 0 L 0 0 0 28" fill="none" stroke={T.textMuted} strokeWidth=".5"/></pattern></defs>
        <rect width="100%" height="100%" fill="url(#grid)"/>
      </svg>
      {notes.length === 0 && (
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",color:T.textMuted,textAlign:"center",pointerEvents:"none",userSelect:"none"}}>
          <div style={{fontSize:32,marginBottom:8}}>✦</div>
          <div style={{fontWeight:600,fontSize:14}}>Click anywhere to create a note</div>
          <div style={{fontSize:12,marginTop:4,opacity:.6}}>Drag notes freely · hover for options</div>
        </div>
      )}
      {notes.map(note => (
        <FreeNote key={note.id} note={note} T={T} editing={editingId===note.id}
          onPointerDown={e=>onPointerDown(e,note)} onEdit={()=>setEditingId(note.id)}
          onSave={txt=>{setNotes(ns=>ns.map(n=>n.id===note.id?{...n,text:txt}:n));setEditingId(null);}}
          onDelete={()=>setNotes(ns=>ns.filter(n=>n.id!==note.id))}
          onToMyDay={()=>convertToTask(note,true)}
          onConvert={()=>convertToTask(note,false)}
          onLink={()=>linkToTask(note)}
          onColorChange={c=>setNotes(ns=>ns.map(n=>n.id===note.id?{...n,color:c}:n))}
        />
      ))}
      <div style={{position:"absolute",bottom:12,right:16,fontSize:10,color:T.textMuted,userSelect:"none",pointerEvents:"none"}}>Click empty space = new note · click a note to edit · drag to move</div>
    </div>
  );
}

function FreeNote({note,T,editing,onPointerDown,onEdit,onSave,onDelete,onToMyDay,onConvert,onLink,onColorChange}) {
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
        <div onPointerDown={onPointerDown}
          style={{minWidth:120,maxWidth:200,padding:"9px 11px",borderRadius:10,background:note.color+"20",border:`1px solid ${note.color}55`,fontSize:12,color:T.text,lineHeight:1.5,cursor:"grab",boxShadow:hov?`0 8px 20px ${note.color}44`:"0 2px 8px rgba(0,0,0,.2)",transform:hov?"scale(1.03) rotate(.5deg)":"scale(1)",transition:"transform .15s,box-shadow .15s",userSelect:"none",whiteSpace:"pre-wrap",wordBreak:"break-word"}}>
          <div style={{borderLeft:`3px solid ${note.color}`,paddingLeft:7}}>{note.text}</div>
        </div>
      )}
      {hov&&!editing&&(
        <div style={{position:"absolute",top:-28,left:0,display:"flex",gap:3,animation:"fadeIn .1s",zIndex:30,background:T.surface2,borderRadius:8,padding:"3px 5px",border:`1px solid ${T.border}`,boxShadow:"0 4px 12px rgba(0,0,0,.3)"}}>
          <button title="Add to My Day" onClick={onToMyDay} style={{width:20,height:20,borderRadius:4,border:"none",cursor:"pointer",background:"#f59e0b",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="sun" s={10} c="#fff"/></button>
          {NOTE_COLS.slice(0,5).map(c=><div key={c} onClick={()=>onColorChange(c)} style={{width:10,height:10,borderRadius:"50%",background:c,cursor:"pointer",border:`1px solid ${note.color===c?"#fff":"transparent"}`,marginTop:5}}/>)}
          <button title="Link to a task (adds it as a note on that task)" onClick={onLink} style={{width:20,height:20,borderRadius:4,border:"none",cursor:"pointer",background:"#14b8a6",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="link" s={10} c="#fff"/></button>
          <button title="Add as a task" onClick={onConvert} style={{width:20,height:20,borderRadius:4,border:"none",cursor:"pointer",background:"#818cf8",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="arr" s={9} c="#fff"/></button>
          <button title="Delete" onClick={onDelete} style={{width:20,height:20,borderRadius:4,border:"none",cursor:"pointer",background:"transparent",color:T.danger,display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" s={10}/></button>
        </div>
      )}
    </div>
  );
}

function DrawPad({value,T,onChange}) {
  const cv=useRef(null);
  const drawing=useRef(false);
  const last=useRef(null);
  const [pen,setPen]=useState("#1e293b");
  const [erase,setErase]=useState(false);
  const W=1600,H=820;
  useEffect(()=>{
    const c=cv.current; if(!c) return; const ctx=c.getContext("2d");
    ctx.clearRect(0,0,W,H);
    if(value){ const img=new Image(); img.onload=()=>ctx.drawImage(img,0,0,W,H); img.src=value; }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  const pos=e=>{ const r=cv.current.getBoundingClientRect(); return {x:(e.clientX-r.left)*(W/r.width), y:(e.clientY-r.top)*(H/r.height)}; };
  const down=e=>{ e.preventDefault(); cv.current.setPointerCapture?.(e.pointerId); drawing.current=true; last.current=pos(e); };
  const move=e=>{ if(!drawing.current) return; const ctx=cv.current.getContext("2d"); const p=pos(e);
    ctx.lineWidth=erase?48:5; ctx.lineCap="round"; ctx.lineJoin="round";
    ctx.globalCompositeOperation=erase?"destination-out":"source-over"; ctx.strokeStyle=pen;
    ctx.beginPath(); ctx.moveTo(last.current.x,last.current.y); ctx.lineTo(p.x,p.y); ctx.stroke(); last.current=p; };
  const up=()=>{ if(!drawing.current) return; drawing.current=false; onChange(cv.current.toDataURL("image/png")); };
  const clear=()=>{ const ctx=cv.current.getContext("2d"); ctx.clearRect(0,0,W,H); onChange(""); };
  const [full,setFull]=useState(false);
  const PENS=["#1e293b","#ef4444","#f59e0b","#22c55e","#3b82f6","#a855f7","#ec4899"];
  return (
    <div style={full?{position:"fixed",inset:0,zIndex:1500,background:T.bg,padding:16,display:"flex",flexDirection:"column",gap:8}:{display:"flex",flexDirection:"column",gap:8}}>
      <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
        {PENS.map(c=><button key={c} onClick={()=>{setPen(c);setErase(false);}} style={{width:22,height:22,borderRadius:"50%",background:c,border:`2px solid ${!erase&&pen===c?T.accent:"transparent"}`,cursor:"pointer",flexShrink:0}}/>)}
        <button onClick={()=>setErase(e=>!e)} style={{padding:"4px 10px",borderRadius:7,border:`1px solid ${erase?T.accent:T.border}`,background:erase?T.accentGlow:"transparent",color:erase?T.accent:T.textMuted,cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>Eraser</button>
        <button onClick={clear} style={{padding:"4px 10px",borderRadius:7,border:`1px solid ${T.danger}33`,background:T.danger+"11",color:T.danger,cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>Clear</button>
        <button onClick={()=>setFull(f=>!f)} style={{marginLeft:"auto",padding:"4px 10px",borderRadius:7,border:`1px solid ${T.accent}`,background:T.accentGlow,color:T.accent,cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{full?"✕ Close":"⛶ Fullscreen"}</button>
      </div>
      <canvas ref={cv} width={W} height={H} onPointerDown={down} onPointerMove={move} onPointerUp={up}
        style={{width:"100%",...(full?{flex:1,minHeight:0}:{aspectRatio:`${W}/${H}`}),borderRadius:12,border:`1px solid ${T.border}`,background:"#ffffff",touchAction:"none",cursor:"crosshair"}}/>
    </div>
  );
}

function NotesView({T,notes,setNotes,tasks,onGoToTask}) {
  const [sel,setSel]=useState(null);
  const [nt,setNt]=useState("");
  const [mode,setMode]=useState("text");
  const [listOpen,setListOpen]=useState(true);
  const taskNotes=(tasks||[]).filter(t=>t.notes&&t.notes.trim());
  const onEditorDown=e=>{
    if(e.target.closest("input,textarea,select,button,a,canvas")) return;
    const sx=e.clientX,sy=e.clientY; let decided=false;
    const cleanup=()=>{window.removeEventListener("pointermove",mv);window.removeEventListener("pointerup",up);window.removeEventListener("pointercancel",up);};
    const mv=ev=>{ if(decided)return; const dx=ev.clientX-sx,dy=ev.clientY-sy; if(Math.abs(dx)<14&&Math.abs(dy)<14)return; decided=true; cleanup(); if(Math.abs(dx)>Math.abs(dy)) setListOpen(dx>0); };
    const up=()=>cleanup();
    window.addEventListener("pointermove",mv);window.addEventListener("pointerup",up);window.addEventListener("pointercancel",up);
  };
  const ACC=["#3b82f6","#22c55e","#f59e0b","#ef4444","#a855f7","#ec4899","#14b8a6"];
  const addNote=()=>{if(!nt.trim())return;const n={id:Date.now(),title:nt.trim(),body:"",pinned:false,color:ACC[notes.length%ACC.length],created:tod()};setNotes(ns=>[n,...ns]);setSel(n);setNt("");};
  const upNote=(id,patch)=>{setNotes(ns=>ns.map(n=>n.id===id?{...n,...patch}:n));if(sel?.id===id)setSel(s=>({...s,...patch}));};
  const delNote=id=>{setNotes(ns=>ns.filter(n=>n.id!==id));if(sel?.id===id)setSel(null);};
  return (
    <div style={{flex:1,display:"flex",overflow:"hidden"}}>
      <div style={{width:listOpen?248:0,minWidth:0,opacity:listOpen?1:0,borderRight:listOpen?`1px solid ${T.border}`:"none",display:"flex",flexDirection:"column",overflowY:"auto",overflowX:"hidden",background:T.sidebar,transition:"width .2s ease,opacity .15s ease",flexShrink:0}}>
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
        {taskNotes.length>0&&(
          <div style={{padding:"4px 8px 16px",borderTop:`1px solid ${T.border}`}}>
            <div style={{padding:"10px 4px 4px",fontSize:9,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",color:T.textMuted}}>📋 Notes on tasks</div>
            {taskNotes.map(t=>(
              <div key={t.id} onClick={()=>onGoToTask?.(t)} title="Go to task" style={{padding:"8px",borderRadius:8,cursor:"pointer",marginBottom:2,background:"transparent",transition:"background .12s"}} onMouseEnter={e=>e.currentTarget.style.background=T.surface2} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <Ico n="check" s={11} c={T.textMuted}/>
                  <span style={{fontSize:12,fontWeight:600,color:T.text,flex:1,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{t.title}</span>
                  <span style={{fontSize:9,color:T.accent,fontWeight:700,whiteSpace:"nowrap"}}>Go →</span>
                </div>
                <div style={{fontSize:11,color:T.textMuted,marginTop:2,marginLeft:16,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{t.notes.slice(0,46)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}} onPointerDown={onEditorDown}>
      <div style={{padding:"8px 14px",borderBottom:`1px solid ${T.border}`,flexShrink:0,display:"flex",alignItems:"center",gap:8}}>
        <button onClick={()=>setListOpen(o=>!o)} title={listOpen?"Hide list for more room":"Show list"} style={{width:28,height:28,borderRadius:7,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico n="menu" s={15}/></button>
        <span style={{fontSize:11,color:T.textMuted}}>{listOpen?"Swipe left (or tap) to hide the list":"Swipe right (or tap) to show the list"}</span>
      </div>
      {sel?(
        <div style={{flex:1,display:"flex",flexDirection:"column",padding:"18px 26px 22px",overflowY:"auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
            <input value={sel.title} onChange={e=>upNote(sel.id,{title:e.target.value})} style={{flex:1,fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:700,background:"transparent",border:"none",outline:"none",color:T.text,letterSpacing:"-.3px"}}/>
            <div style={{display:"flex",gap:5}}>
              {ACC.slice(0,5).map(c=><div key={c} onClick={()=>upNote(sel.id,{color:c})} style={{width:14,height:14,borderRadius:"50%",background:c,cursor:"pointer",border:`2px solid ${sel.color===c?T.text:"transparent"}`,transition:"border-color .15s"}}/>)}
            </div>
          </div>
          <div style={{height:3,width:36,borderRadius:2,background:sel.color,marginBottom:14}}/>
          <div style={{display:"flex",gap:5,marginBottom:14}}>
            {[["text","✏️ Write"],["draw","🎨 Draw"]].map(([m,lbl])=>(
              <button key={m} onClick={()=>setMode(m)} style={{padding:"5px 14px",borderRadius:8,border:`1px solid ${mode===m?T.accent:T.border}`,background:mode===m?T.accentGlow:"transparent",color:mode===m?T.accent:T.textMuted,cursor:"pointer",fontSize:12,fontWeight:mode===m?700:500,fontFamily:"'DM Sans',sans-serif"}}>{lbl}{m==="draw"&&sel.drawing?" •":""}</button>
            ))}
          </div>
          {mode==="text"?(
            <textarea value={sel.body} onChange={e=>upNote(sel.id,{body:e.target.value})} placeholder={"Start writing…\n\nUse for meeting notes, ideas, journaling, research."} style={{flex:1,minHeight:300,background:"transparent",border:"none",outline:"none",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:14,lineHeight:1.8,resize:"none"}}/>
          ):(
            <DrawPad key={sel.id} value={sel.drawing} T={T} onChange={d=>upNote(sel.id,{drawing:d})}/>
          )}
          <div style={{fontSize:10,color:T.textMuted,marginTop:10}}>{fmtDate(sel.created)||sel.created} · {sel.body.split(/\s+/).filter(Boolean).length} words{sel.drawing?" · has sketch 🎨":""}</div>
        </div>
      ):(
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:T.textMuted,flexDirection:"column",gap:8}}>
          <div style={{fontSize:40}}>📝</div>
          <div style={{fontWeight:600}}>Select a note to edit</div>
        </div>
      )}
      </div>
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

function SettingsView({T,dark,setDark,cats,setCats,scheme,setScheme,onExport,onImport,onClearCompleted,ownedShares,onShareFolder,onUnshare,onUploadIcon,onDeleteCat,deletedCats,onRestoreCat,onPurgeCat}) {
  const importRef=useRef(null);
  const iconFileRef=useRef(null);
  const [shareFolderName,setShareFolderName]=useState("");
  const [shareEmail,setShareEmail]=useState("");
  const [sharePerm,setSharePerm]=useState("edit");
  const [iconPicked,setIconPicked]=useState(false);
  const [notifs,setNotifs]=useState(true);
  const [focus,setFocus]=useState(false);
  const [weekly,setWeekly]=useState(true);
  const [pomLen,setPomLen]=useState(25);
  const [newCat,setNewCat]=useState("");
  const [newCatColor,setNewCatColor]=useState(CAT_COLORS[5]);
  const [newCatIcon,setNewCatIcon]=useState(CAT_ICONS[0]);
  const [iconMenuFor,setIconMenuFor]=useState(null);
  const addCat=()=>{const name=newCat.trim().toLowerCase();if(!name||cats[name])return;setCats(c=>({...c,[name]:{color:newCatColor,icon:newCatIcon}}));setNewCat("");setNewCatIcon(CAT_ICONS[0]);setIconPicked(false);};
  const onNameChange=v=>{ setNewCat(v); if(!iconPicked) setNewCatIcon(guessIcon(v)); };
  const pickIcon=em=>{if(iconMenuFor==="__new__"){setNewCatIcon(em);setIconPicked(true);}else setCats(c=>({...c,[iconMenuFor]:{...c[iconMenuFor],icon:em}}));setIconMenuFor(null);};
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
              <button onClick={()=>setIconMenuFor(iconMenuFor===name?null:name)} title="Change icon" style={{border:"none",background:"transparent",cursor:"pointer",lineHeight:1,padding:0,display:"flex",alignItems:"center"}}><CatIcon icon={meta.icon} size={15}/></button>
              <span style={{fontSize:12,color:meta.color,fontWeight:600}}>{name}</span>
              <button onClick={()=>onDeleteCat(name)} title="Delete folder" style={{width:14,height:14,borderRadius:"50%",border:"none",cursor:"pointer",background:T.surface3,color:T.textMuted,display:"flex",alignItems:"center",justifyContent:"center",marginLeft:1}}><Ico n="x" s={8}/></button>
            </div>
          ))}
        </div>
        {iconMenuFor&&(
          <div style={{padding:"4px 0 10px"}}>
            <input ref={iconFileRef} type="file" accept="image/*" style={{display:"none"}} onChange={async e=>{const f=e.target.files[0]; e.target.value=""; if(f&&onUploadIcon){const url=await onUploadIcon(f); if(url)pickIcon(url);}}}/>
            <button onClick={()=>iconFileRef.current?.click()} style={{marginBottom:6,padding:"5px 10px",borderRadius:7,border:`1px dashed ${T.accent}`,background:T.accentGlow,color:T.accent,cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>🖼️ Upload image</button>
            <div style={{display:"flex",flexWrap:"wrap",gap:3,maxHeight:120,overflowY:"auto"}}>
              {CAT_ICONS.map(em=>(
                <button key={em} onClick={()=>pickIcon(em)} style={{width:30,height:30,borderRadius:7,border:`1px solid ${T.border}`,background:T.surface2,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>{em}</button>
              ))}
            </div>
          </div>
        )}
        <div style={{display:"flex",gap:6,paddingBottom:12,alignItems:"center"}}>
          <button onClick={()=>setIconMenuFor(iconMenuFor==="__new__"?null:"__new__")} title="Pick icon" style={{width:32,height:32,borderRadius:8,border:`1px solid ${T.border}`,background:T.surface2,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}><CatIcon icon={newCatIcon} size={16}/></button>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginRight:4}}>
            {CAT_COLORS.map(c=><div key={c} onClick={()=>setNewCatColor(c)} style={{width:16,height:16,borderRadius:"50%",background:c,cursor:"pointer",border:`2px solid ${newCatColor===c?T.text:"transparent"}`,flexShrink:0}}/>)}
          </div>
          <input value={newCat} onChange={e=>onNameChange(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCat()} placeholder="New list name…" style={{flex:1,padding:"6px 9px",borderRadius:8,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none"}}/>
          <button onClick={addCat} style={{padding:"6px 14px",borderRadius:8,border:"none",cursor:"pointer",background:T.grad,color:"#fff",fontSize:12,fontWeight:700}}>Add</button>
        </div>
        <div style={{fontSize:10,color:T.textMuted,paddingBottom:12,marginTop:-4}}>An icon is auto-picked from the name — tap it above to change.</div>
        {deletedCats&&deletedCats.length>0&&(
          <div style={{paddingBottom:12}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",color:T.textMuted,marginBottom:6}}>Recently deleted</div>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {deletedCats.map(d=>(
                <div key={d.name} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 9px",borderRadius:8,background:T.surface2,border:`1px solid ${T.border}`}}>
                  <CatIcon icon={d.icon} size={14}/>
                  <span style={{fontSize:12,fontWeight:600,color:T.textMuted,flex:1,textTransform:"capitalize"}}>{d.name}</span>
                  <button onClick={()=>onRestoreCat(d.name)} style={{padding:"3px 10px",borderRadius:6,border:`1px solid ${T.accent}`,background:T.accentGlow,color:T.accent,cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>Restore</button>
                  <button onClick={()=>onPurgeCat(d.name)} title="Remove permanently" style={{background:"none",border:"none",cursor:"pointer",color:T.textMuted,display:"flex"}}><Ico n="x" s={12}/></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"0 16px",marginBottom:14}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".6px",textTransform:"uppercase",color:T.textMuted,padding:"12px 0 6px"}}>Share a folder 🤝</div>
        <div style={{fontSize:11,color:T.textMuted,marginBottom:8,lineHeight:1.5}}>Invite another FlowSpace user by email. They'll see and can edit tasks in that folder. Use the email they signed up with.</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",paddingBottom:10}}>
          <select value={shareFolderName} onChange={e=>setShareFolderName(e.target.value)} style={{padding:"6px 9px",borderRadius:8,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none",cursor:"pointer"}}>
            <option value="">Choose folder…</option>
            {Object.keys(cats).map(n=><option key={n} value={n}>{n}</option>)}
          </select>
          <input value={shareEmail} onChange={e=>setShareEmail(e.target.value)} placeholder="their@email.com" type="email" style={{flex:1,minWidth:120,padding:"6px 9px",borderRadius:8,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none"}}/>
          <select value={sharePerm} onChange={e=>setSharePerm(e.target.value)} style={{padding:"6px 9px",borderRadius:8,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none",cursor:"pointer"}}>
            <option value="edit">Edit & add</option>
            <option value="delete">Edit, add & delete</option>
          </select>
          <button onClick={()=>{if(shareFolderName&&shareEmail.trim()){onShareFolder(shareFolderName,shareEmail,sharePerm==="delete");setShareEmail("");}}} style={{padding:"6px 14px",borderRadius:8,border:"none",cursor:"pointer",background:T.grad,color:"#fff",fontSize:12,fontWeight:700}}>Invite</button>
        </div>
        {ownedShares&&ownedShares.length>0&&(
          <div style={{paddingBottom:12,display:"flex",flexDirection:"column",gap:5}}>
            {ownedShares.map(s=>(
              <div key={s.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",borderRadius:8,background:T.surface2,border:`1px solid ${T.border}`}}>
                <span style={{fontSize:14}}>🤝</span>
                <span style={{fontSize:12,fontWeight:600,textTransform:"capitalize"}}>{s.folder}</span>
                <span style={{fontSize:11,color:T.textMuted,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>→ {s.shared_with_email}</span>
                <span style={{fontSize:9,fontWeight:700,color:s.can_delete?T.danger:T.textMuted,background:(s.can_delete?T.danger:T.textMuted)+"22",padding:"1px 6px",borderRadius:10}}>{s.can_delete?"can delete":"edit"}</span>
                <button onClick={()=>onUnshare(s.id)} style={{background:"none",border:"none",cursor:"pointer",color:T.danger,fontSize:11,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>Remove</button>
              </div>
            ))}
          </div>
        )}
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
          {label:"Export Data",desc:"Download a full backup file",el:<button onClick={onExport} style={{padding:"5px 11px",borderRadius:7,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,cursor:"pointer",fontSize:12}}>Export JSON</button>},
          {label:"Import Data",desc:"Restore from a backup file",el:<><input ref={importRef} type="file" accept="application/json" style={{display:"none"}} onChange={e=>{if(e.target.files[0]){onImport(e.target.files[0]);e.target.value="";}}}/><button onClick={()=>importRef.current?.click()} style={{padding:"5px 11px",borderRadius:7,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,cursor:"pointer",fontSize:12}}>Import JSON</button></>},
          {label:"Clear Completed",desc:"Remove all completed tasks",el:<button onClick={onClearCompleted} style={{padding:"5px 11px",borderRadius:7,border:`1px solid ${T.danger}33`,background:T.danger+"11",color:T.danger,cursor:"pointer",fontSize:12}}>Clear</button>},
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
