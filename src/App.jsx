import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import { supabase } from "./supabase";
import { db, fromDbTask } from "./db";
import AuthScreen, { SignupSuccess, ResetPassword } from "./AuthScreen";
import {
  stripListName, matchListName, guessCat, ymd, tod, addDays, DUE_TBD, isTbd,
  dueKey, fmtDate, fmtClock, parseNL, cleanTitle, titleEditPatch, guessIcon, nextDue,
  mergeGami, gamiRowDiffers, moveDuePatch, whenPatch,
} from "./logic";

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
    #root{user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;}
    input,textarea{user-select:text;-webkit-user-select:text;}
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
    sparkles:<><path d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5L12 3Z"/><path d="M5 3L5.5 5L7 5.5L5.5 6L5 8L4.5 6L3 5.5L4.5 5L5 3Z"/><path d="M19 13L19.5 15L21 15.5L19.5 16L19 18L18.5 16L17 15.5L18.5 15L19 13Z"/></>,
    fire:<><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></>,
    arr:<><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    repeat:<><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></>,
    grip:<><circle cx="9" cy="6" r="1" fill="currentColor"/><circle cx="15" cy="6" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="18" r="1" fill="currentColor"/><circle cx="15" cy="18" r="1" fill="currentColor"/></>,
    target:<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
    edit:<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    flag:<><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></>,
    chevron:<><polyline points="9 18 15 12 9 6"/></>,
    link:<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
    user:<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    send:<><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
    chat:<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="13" y2="13"/></>,
    users:<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
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
// Grid reads left→right, top→bottom: Do First · Schedule / Delegate · Whenever (classic Eisenhower layout).
const QUAD_ORDER = ["q1","q2","q3","q4"];
// This device's id. Completion counts are kept PER DEVICE and summed for display, so two phones
// used on the same day never overwrite each other and nothing is ever counted twice.
const DEVICE_ID=(()=>{ try{ let id=localStorage.getItem("fs_device"); if(!id){ id=Math.random().toString(36).slice(2,10); localStorage.setItem("fs_device",id); } return id; }catch{ return "local"; } })();
// Robust press-to-drag: mouse drags after a tiny move; touch drags after a 250ms hold (same as tasks —
// a finger that rests a moment before scrolling must not pick the item up).
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
  if (type !== "mouse") timer = setTimeout(activate, 250);
  window.addEventListener("pointermove", mv);
  window.addEventListener("pointerup", up);
  window.addEventListener("pointercancel", up);
}

// Runs an active drag via window listeners (reliable across re-renders). Blocks text-select/scroll while dragging.
function runDrag(onMove, onDrop) {
  document.body.style.userSelect = "none";
  document.body.style.webkitUserSelect = "none";
  document.body.style.touchAction = "none";
  // Non-passive touchmove preventDefault → stops the browser from scroll-hijacking the touch mid-drag on mobile.
  const blockScroll = e => { e.preventDefault(); };
  document.addEventListener("touchmove", blockScroll, { passive: false });
  const mv = e => onMove(e);
  const up = e => {
    window.removeEventListener("pointermove", mv);
    window.removeEventListener("pointerup", up);
    window.removeEventListener("pointercancel", up);
    document.removeEventListener("touchmove", blockScroll);
    document.body.style.userSelect = "";
    document.body.style.webkitUserSelect = "";
    document.body.style.touchAction = "";
    onDrop(e);
  };
  window.addEventListener("pointermove", mv);
  window.addEventListener("pointerup", up);
  window.addEventListener("pointercancel", up);
}

// A task can be assigned to several people. Stored as a comma-separated email list in assigned_to.
const assigneesOf = task => (task?.assignedTo||"").split(",").map(s=>s.trim().toLowerCase()).filter(Boolean);
// System notices in a team chat (e.g. "X was added") are normal messages prefixed with this marker.
const SYS_MARK = "⁣sys⁣";
// Display a person by their saved nickname (fs_contacts) when there is one, else their email.
const nickOf = email => { if(!email) return ""; try{ const c=JSON.parse(localStorage.getItem("fs_contacts")||"{}"); return (c[email]&&c[email].trim())||email; }catch{ return email; } };
const initialOf = email => (nickOf(email)||"?").trim().charAt(0).toUpperCase();
// Stable-ish color for an avatar from the email string.
const AVATAR_COLORS = ["#c084fc","#818cf8","#fda4af","#6ee7b7","#fcd34d","#93c5fd","#fb7185","#14b8a6"];
const avatarColor = email => AVATAR_COLORS[[...(email||"?")].reduce((a,c)=>a+c.charCodeAt(0),0)%AVATAR_COLORS.length];
// People pick their own emoji avatar (stored in their profile; cached locally in fs_avatars for instant rendering).
const AVATAR_EMOJI = ["😀","😎","🤓","🥳","😺","🦊","🐼","🐸","🦄","🐯","🐨","🦁","🐵","🤖","👻","🐙","🦋","🌟","🔥","🌈","🍀","🍕","⚡","🎧"];
const avatarOf = email => { if(!email) return ""; try{ const a=JSON.parse(localStorage.getItem("fs_avatars")||"{}"); return a[email.toLowerCase()]||""; }catch{ return ""; } };
const Avatar = ({email,size=18}) => avatarOf(email)
  ? <span style={{width:size,height:size,borderRadius:"50%",background:"rgba(128,128,128,.18)",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:size*0.68,flexShrink:0,lineHeight:1}}>{avatarOf(email)}</span>
  : <span style={{width:size,height:size,borderRadius:"50%",background:avatarColor(email),color:"#fff",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:Math.max(8,size*0.5),fontWeight:700,flexShrink:0}}>{initialOf(email)}</span>;

// Download an attachment (the plain `download` attribute is ignored cross-origin, so fetch → blob → save).
const downloadFile=async(url,name)=>{
  try{
    const r=await fetch(url); const b=await r.blob();
    const u=URL.createObjectURL(b);
    const a=document.createElement("a"); a.href=u; a.download=name||"attachment"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(u),4000);
  }catch{ window.open(url,"_blank"); }
};

// Floating "ghost" chip that follows the pointer during any drag (Microsoft-To-Do-style).
// Plain DOM node so it never fights React re-renders at 60fps.
function makeDragGhost(label, color, T) {
  const g = document.createElement("div");
  g.textContent = (label||"").length > 36 ? label.slice(0,34)+"…" : (label||"");
  g.style.cssText = `position:fixed;left:0;top:0;z-index:3000;pointer-events:none;padding:6px 12px;border-radius:10px;background:${T.surface};color:${T.text};font:600 12px 'DM Sans',sans-serif;border:1.5px solid ${color};box-shadow:0 10px 28px rgba(0,0,0,.45);max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transform:translate(-9999px,-9999px) rotate(2deg);`;
  document.body.appendChild(g);
  return {
    move: (x,y) => { g.style.transform = `translate(${x+14}px,${y-34}px) rotate(2deg)`; },
    remove: () => g.remove(),
  };
}
// True on a phone-sized screen. Side-by-side panels don't fit there, so they take the screen instead.
const useNarrow = (bp=640) => {
  const [n,setN] = useState(()=>typeof window!=="undefined" && window.innerWidth<bp);
  useEffect(()=>{ const f=()=>setN(window.innerWidth<bp); window.addEventListener("resize",f); window.addEventListener("orientationchange",f);
    return ()=>{ window.removeEventListener("resize",f); window.removeEventListener("orientationchange",f); }; },[bp]);
  return n;
};
// A finger can't "pull to reorder" — pulling along the list is the page scrolling — so the
// on-screen hints have to describe the gesture that actually works on THIS device.
const COARSE = typeof window !== "undefined" && !!window.matchMedia?.("(pointer: coarse)")?.matches;
const dragHint = (axis="list") => axis==="matrix"
  ? (COARSE ? "hold a note, then drag it to another box" : "hold a note — or pull it — to move it between boxes")
  : (COARSE ? "hold a task, then drag to reorder" : "hold a task — or pull it up/down — to reorder");

// The one place that knows how the sidebar is arranged: your stored order and folders, plus two
// defaults — anything you haven't placed goes to the end, and a list someone shares with you starts
// out inside a "Shared with me" folder until you drag it wherever you like, the very top included.
const SHARED_GID = "g:shared";
const sidebarLayout = (items, org) => {
  const groupsIn = (org?.groups) || [];
  const groups = groupsIn.some(g => g.id === SHARED_GID) ? groupsIn : [...groupsIn, { id: SHARED_GID, name: "Shared with me", icon: "🤝", collapsed: false }];
  const gmap = Object.fromEntries(groups.map(g => [g.id, g]));
  const byId = Object.fromEntries(items.map(i => [i.id, i]));
  const allIds = [...items.map(i => i.id), ...groups.map(g => g.id)];
  const parentRaw = (org?.parent) || {};
  const stored = ((org?.order) || []).filter(id => allIds.includes(id));
  const order = [...stored, ...allIds.filter(id => !stored.includes(id))];
  const parentOf = id => {
    if (id in parentRaw) { const p = parentRaw[id]; return (p && gmap[p]) ? p : null; }   // an explicit null means "at the root, on purpose"
    return id.startsWith("s:") ? SHARED_GID : null;
  };
  const childrenOf = pid => order.filter(id => parentOf(id) === pid);
  return { groups, gmap, byId, allIds, parentRaw, order, parentOf, childrenOf };
};
// Freely opens on whichever tab is first in that order, folders opened in place — a shared list can be it too.
const firstTreeView = (items, org) => {
  const L = sidebarLayout(items, org);
  const walk = (pid, depth) => {
    if (depth > 40) return null;
    for (const id of L.childrenOf(pid)) {
      if (L.gmap[id]) { const hit = walk(id, depth + 1); if (hit) return hit; }
      else if (L.byId[id]) return L.byId[id].view;
    }
    return null;
  };
  return walk(null, 0);
};

const DEFAULT_CATS = {
  work:     {color:"#0ea5e9", icon:"💼"},
  school:   {color:"#6366f1", icon:"📚"},
  health:   {color:"#10b981", icon:"🏃"},
  personal: {color:"#f59e0b", icon:"💜"}, // not a star/sun — those read like the My Day ☀️ marker
  finance:  {color:"#a855f7", icon:"💰"},
};

// Starter tasks for a brand-new account — a tiny guided tour that lives right in the task list.
const sampleTasks = (uid) => {
  const base = Date.now(), today = tod(), tmrw = addDays(1);
  const mk = (title, extra) => ({
    id: crypto.randomUUID(), title, done:false, priority:"medium", tag:"personal", due:null, starred:false,
    notes:"", color:null, subtasks:[], recurring:null, quadrant:null, remindAt:null, endTime:null,
    attachments:[], owner:uid, position:0, mydayDate:null, ...extra,
  });
  // Each one teaches exactly one thing and says so in its own notes, so the tutorial is the app
  // itself rather than a slideshow you skip. Delete them whenever you like — Settings → 📖 brings them back.
  return [
    mk("👋 Start here — tap me open", { position:base+8, mydayDate:today,
      notes:"You're looking at a task. Tap it and the details panel opens: steps, a date, a time, notes, photos, a colour, a priority, and who it belongs to.\n\nTap the circle on the left to finish a task. Tap the title in here to rename it.",
      subtasks:[{id:1,title:"Tap this circle to finish a step ✓",done:false,due:null,time:null},{id:2,title:"Add a step of your own below",done:false,due:null,time:null}] }),
    mk("Type it like you'd say it ✨", { position:base+7, tag:"health", due:tmrw, remindAt:`${tmrw}T15:00`,
      notes:"This task was typed as “Call the dentist tomorrow 3pm”. Freely took the date and the time out of the sentence and left the title clean.\n\nTry it in any add box:\n• “Essay draft friday”\n• “Team sync sept 30 4:00 pm - 5:30 pm”\n\nSpelling is forgiven — “tommorow” and “julky” both land." }),
    mk("👆 Swipe me, or pick me up", { position:base+6,
      notes:"Two gestures, everywhere:\n• Swipe ← to delete · swipe → to add to My Day ☀️\n• To reorder, hold a task for a moment and drag. With a mouse you can just pull it up or down.\n\nA glowing line shows exactly where it will land before you let go." }),
    mk("🎯 I'm urgent AND important", { position:base+5, tag:"work", quadrant:"q1",
      notes:"Open the Priority Matrix tab and you'll find me in the top-left box.\n\nFour boxes: do it now · schedule it · hand it off · drop it. Drag a note between boxes to change its priority — the matrix and your lists are the same tasks." }),
    mk("📅 I'm waiting in Upcoming", { position:base+4, tag:"work", due:addDays(3),
      notes:"Anything with a date shows up in Upcoming and on the Calendar, soonest first. Miss a date and it gets pinned to the top in red with a one-tap “Move to today”.\n\nOn the Calendar you can drag me onto a different day." }),
    mk("🤷 No date decided yet? Type “tbd”", { position:base+3, due:DUE_TBD,
      notes:"“tbd”, “tba” or “unknown” files a task as Date TBD instead of guessing a day for it. It waits at the bottom of Upcoming and never counts as overdue." }),
    mk("🤝 Share this list with someone", { position:base+2, tag:"work",
      notes:"Open any of your own lists and tap 🤝 Share at the top. Invite by email and they see it the moment they sign in.\n\nThen assign a task to one person or to everyone at once. Mark an assignment 🔒 private and only that person can see it. Work handed to you shows under “Assigned to me”." }),
    mk("📖 Stuck? The whole guide is in Settings", { position:base+1, tag:"personal",
      notes:"Settings → “How Freely works” explains every part of the app in plain language, and it's searchable.\n\nWhile you're there: habits with streaks, a 🍅 focus timer, notes, a freeform canvas, and analytics of what you actually finished." }),
  ];
};
const isImgIcon = ic => typeof ic === "string" && (ic.startsWith("http") || ic.startsWith("data:"));
// Folders render as the platform's own 📁 emoji (the "3D" one) — the user prefers each device's native look.
const CatIcon = ({icon, size=14}) => isImgIcon(icon)
  ? <img src={icon} alt="" style={{width:size,height:size,borderRadius:4,objectFit:"cover",verticalAlign:"middle",flexShrink:0}}/>
  : <span style={{fontSize:size+1,lineHeight:1}}>{icon}</span>;
// The icon gallery, grouped the way people think about their lists. Roughly 190 choices; the
// picker shows them in this order so related icons sit together.
const CAT_ICONS = [
  // work & study
  "💼","📚","🎓","📝","📋","📊","📈","💻","🖥️","⌨️","🗂️","📁","📎","📌","🧾","📄","📜","🔬","🧪","🔢","🗣️","🧠","💡","🎯","🏁","🚀","🏢","🤝","📨","📧","☎️","📞",
  // money
  "💰","💳","🏦","💵","🪙","🧮","🛡️","⚖️",
  // home & errands
  "🏠","🛒","🛍️","🧹","🧺","🧼","🔧","🔨","🪴","🌱","🌿","🌸","🌻","📦","🧳","🔑","🚗","🚲","⛽","🛠️","🧰","🪑","🛋️","🛏️","🚿","🧴",
  // health & body
  "🏃","🏋️","🧘","🚶","🏊","🚴","🥾","⚽","🏀","🎾","⛳","⛷️","🏄","🥊","🩺","🦷","💊","🩹","🧬","💪","🥗","🍎","💧","😴","🌅",
  // food
  "🍔","🍕","🍜","🍣","🍳","🥐","🧁","🍰","🍦","🍫","☕","🍵","🧋","🍷","🍺",
  // creative & fun
  "🎨","🎬","🎵","🎸","🎹","🎤","🎧","🎮","🎲","♟️","🎭","📷","📸","✏️","🖌️","🧵","🧶","📖","✍️","🎪","🎡",
  // people & occasions
  "❤️","💜","👪","👶","👥","💍","🎂","🎉","🎁","🎄","🎃","🕯️","🙏","⛪","🕌",
  // travel & places
  "✈️","🛫","🗺️","🧭","🏖️","🏔️","⛺","🏨","🚆","🚢","🌍","🗽","🎢",
  // animals & nature
  "🐶","🐱","🐟","🐦","🐾","🐴","🐢","🦋","🌳","🌊","☀️","🌙","⭐","🌈","❄️","🔥",
  // symbols & moods
  "⚡","✨","💎","🏆","🥇","🎖️","🔔","⏰","📅","🗓️","🔒","🔓","✅","❌","⚠️","♻️","🧭","🎈","🪄","🧿","🫶","🤞","🙌",
];
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

// Joyful little major-arpeggio chime via Web Audio (no asset). (#29)
let _actx=null;
const SOUND_OPTIONS=[
  {id:"soft",label:"Soft chime",hint:"Quick 2-note chime (default)"},
  {id:"ding",label:"Ding",hint:"A clean single bell"},
  {id:"pop",label:"Pop",hint:"A short bubble pop"},
  {id:"tick",label:"Tick",hint:"A tiny, subtle click"},
  {id:"chime",label:"Full chime",hint:"Playful 3-note rise"},
  {id:"custom",label:"My sound ⬆",hint:"Upload your own audio clip"},
  {id:"off",label:"Off",hint:"Silent"},
];
let _customAudio=null;
function playComplete(mode){
  if(!mode||mode==="off") return;
  if(mode==="custom"){
    try{ const url=localStorage.getItem("fs_sound_custom"); if(!url) return; _customAudio=_customAudio||new Audio(); _customAudio.src=url; _customAudio.currentTime=0; _customAudio.play().catch(()=>{}); }catch{}
    return;
  }
  try{
    _actx=_actx||new (window.AudioContext||window.webkitAudioContext)();
    const ctx=_actx, now=ctx.currentTime;
    const beep=(f,t,dur,vol,type)=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.type=type||"sine"; o.frequency.value=f; g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+0.012); g.gain.exponentialRampToValueAtTime(0.0006,t+dur); o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t+dur+0.05); };
    if(mode==="soft"){ beep(659.25,now,0.14,0.13,"sine"); beep(987.77,now+0.085,0.16,0.12,"sine"); } // short rising 2-note chime (default)
    else if(mode==="chime") [523.25,659.25,783.99].forEach((f,i)=>beep(f,now+i*0.08,0.32,0.15,"triangle"));
    else if(mode==="pop") beep(392,now,0.13,0.13,"sine");
    else if(mode==="ding") beep(880,now,0.4,0.13,"sine");
    else beep(600,now,0.07,0.09,"sine"); // tick
  }catch{}
}

export default function Freely() {
  const [dark, setDark] = useState(()=>{ try{ return localStorage.getItem("fs_dark")!=="0"; }catch{ return true; } });
  const [scheme, setScheme] = useState(()=>localStorage.getItem("fs_scheme")||"lavender");
  useEffect(()=>{ try{localStorage.setItem("fs_scheme",scheme);}catch{} },[scheme]);
  useEffect(()=>{ try{localStorage.setItem("fs_dark",dark?"1":"0");}catch{} },[dark]);
  const [sound, setSound] = useState(()=>localStorage.getItem("fs_sound2")||"soft");
  useEffect(()=>{ try{localStorage.setItem("fs_sound2",sound);}catch{} },[sound]);
  const T = mkT(dark, PALETTES[scheme]||PALETTES.lavender);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);   // the "How Freely works" guide
  const [imgView, setImgView] = useState(null);
  const [linkPick, setLinkPick] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const showToast = (msg, undo) => { setToast({msg, undo}); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(()=>setToast(null), 5000); };
  const [view, setView] = useState("myday");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [ownedShares, setOwnedShares] = useState([]);
  const [sharedWithMe, setSharedWithMe] = useState([]);
  const [deletedCats, setDeletedCats] = useState([]);
  const [delCatModal, setDelCatModal] = useState(null);
  const [canvasNotes, setCanvasNotes] = useState([]);
  const [notes, setNotes] = useState([]);
  const [habits, setHabits] = useState([]);
  // My Day for tasks in other people's lists. Their row belongs to them, so your "in My Day" can't be
  // written onto it — it lives here instead (and syncs with your preferences): {date, ids, at}.
  const [mydayExtra,setMydayExtra]=useState(()=>{ try{ return JSON.parse(localStorage.getItem("fs_myday_extra")||"null")||{date:"",ids:[],at:0}; }catch{ return {date:"",ids:[],at:0}; } });
  useEffect(()=>{ try{ localStorage.setItem("fs_myday_extra",JSON.stringify(mydayExtra)); }catch{} },[mydayExtra]);
  // Real per-day completion counts (fuels Analytics' weekly bars + heatmap). Device-local, capped at ~70 days.
  const [dayStats,setDayStats]=useState(()=>{ try{ return JSON.parse(localStorage.getItem("fs_daystats")||"{}"); }catch{ return {}; } });
  const bumpStat=delta=>setDayStats(s=>{ const d=tod(); const n={...s,[d]:Math.max(0,(s[d]||0)+delta)}; const ks=Object.keys(n).sort(); while(ks.length>70) delete n[ks.shift()]; try{localStorage.setItem("fs_daystats",JSON.stringify(n));}catch{} return n; });
  // Completion counts from your OTHER devices, keyed by device id; summed with this device's for display.
  const [remoteStats,setRemoteStats]=useState(()=>{ try{ return JSON.parse(localStorage.getItem("fs_stats_remote")||"{}"); }catch{ return {}; } });
  const allStats=(()=>{ const out={...dayStats}; Object.values(remoteStats).forEach(m=>Object.entries(m||{}).forEach(([d,n])=>{ out[d]=(out[d]||0)+(n||0); })); return out; })();
  // Focus mode: tie a task to the Pomodoro timer.
  const [focusTask,setFocusTask]=useState(null);
  const [messages,setMessages]=useState([]);   // 1:1 DMs
  const [dmPeer,setDmPeer]=useState(null);      // selected conversation email
  const [zenOpen,setZenOpen]=useState(false); // full-screen focus overlay
  const [tourStep,setTourStep]=useState(()=>{ try{ return localStorage.getItem("fs_tour")?-1:0; }catch{ return -1; } }); // first-run welcome tour (-1 = done)
  const [tourDemo,setTourDemo]=useState("Dentist tomorrow 3pm");   // the tour's live "type it" box
  const [navOrg, setNavOrg] = useState(()=>{ try{ return JSON.parse(localStorage.getItem("fs_navorg")||"null"); }catch{ return null; } });
  const [hiddenTabs, setHiddenTabs] = useState(()=>{ try{ return JSON.parse(localStorage.getItem("fs_hidden_tabs")||"[]"); }catch{ return []; } });
  // Sidebar order + hidden tabs + sort choice ride along with the gamification row so every device agrees.
  // Last write wins, decided by the `at` stamp saved next to them.
  const [sortMode, setSortMode] = useState(()=>{ const v=localStorage.getItem("fs_sort")||"due"; return v==="smart"?"manual":v; });
  useEffect(()=>{ try{ localStorage.setItem("fs_sort",sortMode); }catch{} },[sortMode]);
  // New tasks join the END of the list, the way a to-do list is normally written. Settings can flip it back.
  const [newAtBottom, setNewAtBottom] = useState(()=>localStorage.getItem("fs_new_bottom")!=="0");
  useEffect(()=>{ try{ localStorage.setItem("fs_new_bottom",newAtBottom?"1":"0"); }catch{} },[newAtBottom]);
  const prefsAtRef = useRef(Number(localStorage.getItem("fs_prefs_at")||0));
  useEffect(()=>{ try{ localStorage.setItem("fs_hidden_tabs",JSON.stringify(hiddenTabs)); }catch{} },[hiddenTabs]);
  const [sGroups,setSGroups]=useState([]);   // teams I'm in (chat + manage): [{id,name,icon,created_by,members:[emails]}]
  const [allGroups,setAllGroups]=useState([]); // every team I can see — used so you can assign to a team you're not on
  const [chatReqs,setChatReqs]=useState([]); // chat requests involving me
  const [profRows,setProfRows]=useState([]); // profiles (id,email,avatar) — powers avatars + account lookups
  const [myAvatar,setMyAvatar]=useState(()=>{ try{ return localStorage.getItem("fs_avatar")||""; }catch{ return ""; } });
  useEffect(()=>{ try{ navOrg?localStorage.setItem("fs_navorg",JSON.stringify(navOrg)):localStorage.removeItem("fs_navorg"); }catch{} },[navOrg]);
  const [cats, setCats] = useState(DEFAULT_CATS);
  // A phone has no room for a permanent sidebar: it starts closed there and opens OVER the
  // content as a drawer, the way every mobile app does it.
  const narrow = useNarrow();
  const [sideOpen, setSideOpen] = useState(()=> typeof window==="undefined" || window.innerWidth>=640);
  useEffect(()=>{ if(narrow) setSideOpen(false); },[narrow]);
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
  const cyclePom = ()=>{ if(pomRun) return; const opts=[5,15,25,30,45,50]; let i=opts.indexOf(pomLen); if(i<0)i=2; const m=opts[(i+1)%opts.length]; setPomLen(m); setPomSecs(m*60); };
  const inputRef = useRef(null);
  // The countdown reads the clock rather than counting ticks: phones throttle timers while the screen is
  // locked, and a tick counter stretched a 25-minute session to however long the phone slept.
  const pomEndRef = useRef(0);
  useEffect(()=>{
    if(!pomRun) return;
    pomEndRef.current=Date.now()+pomSecs*1000;
    const iv=setInterval(()=>setPomSecs(Math.max(0,Math.round((pomEndRef.current-Date.now())/1000))),500);
    return ()=>clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[pomRun]);
  useEffect(()=>{
    if(!pomRun||pomSecs>0) return;
    setPomRun(false); setPomSecs(pomLen*60);
    navigator.vibrate?.([60,60,60]); playComplete(sound); awardXp(null,25);
    showToast(focusTask?`🍅 Focus session done: "${focusTask.title}" · +25 XP`:"🍅 Pomodoro complete! +25 XP");
    setFocusTask(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[pomSecs,pomRun]);

  useEffect(()=>{
    const fn=e=>{
      if((e.metaKey||e.ctrlKey)&&e.key==="k"){e.preventDefault();setCmdOpen(c=>!c);}
      if(e.key==="Escape"){ setCmdOpen(false); setShowSearch(false); const ae=document.activeElement; if(!ae||!/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)) setSelTask(null); }
    };
    window.addEventListener("keydown",fn);
    return ()=>window.removeEventListener("keydown",fn);
  },[]);

  useEffect(()=>{
    supabase.auth.getSession()
      .then(({data:{session}})=>setUser(session?.user??null))
      .catch(()=>{})                          // offline start: show sign-in rather than "Loading…" forever
      .finally(()=>setAuthLoading(false));
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>setUser(session?.user??null));
    return ()=>subscription.unsubscribe();
  },[]);

  // ── Loading and saving ────────────────────────────────────────────────────────────────────────────
  // Tasks save the moment they change and arrive live from other devices. Notes, the canvas, habits and
  // lists save a moment after you stop editing, as a DIFF against `syncedRef` — the copy this device last
  // loaded or saved (see syncRows in db.js). null there means "not loaded yet", which is what stops a
  // half-loaded app from ever writing. There is no loading flag that can get stuck.
  const userRef=useRef(null); userRef.current=user;
  const syncedRef=useRef({notes:null,canvas:null,habits:null,cats:null});
  const tasksLoadedRef=useRef(false);   // the task list has arrived at least once since sign-in
  const latestRef=useRef({}); latestRef.current={notes,canvas:canvasNotes,habits,cats};
  const saveTimerRef=useRef({}), saveChainRef=useRef({}), saveErrAtRef=useRef(0), reloadTimerRef=useRef(null);
  const SAVERS={notes:db.syncNotes,canvas:db.syncCanvas,habits:db.syncHabits,cats:db.syncCats};
  const runSave=name=>{
    clearTimeout(saveTimerRef.current[name]); saveTimerRef.current[name]=null;
    const job=(saveChainRef.current[name]||Promise.resolve()).then(async()=>{
      const prev=syncedRef.current[name], next=latestRef.current[name], uid=userRef.current?.id;
      if(!uid||prev==null||prev===next) return;
      try{ await SAVERS[name](prev,next,uid); if(syncedRef.current[name]===prev) syncedRef.current[name]=next; }
      catch(e){
        console.error(`saving ${name} failed`,e);
        if(Date.now()-saveErrAtRef.current>30000){ saveErrAtRef.current=Date.now(); showToast("Couldn't save your latest changes — Freely will keep retrying."); }
        saveTimerRef.current[name]=setTimeout(()=>runSave(name),15000);
      }
    });
    saveChainRef.current[name]=job;
    return job;
  };
  const scheduleSave=name=>{ if(syncedRef.current[name]==null) return; clearTimeout(saveTimerRef.current[name]); saveTimerRef.current[name]=setTimeout(()=>runSave(name),1200); };
  useEffect(()=>{ scheduleSave("notes"); },[notes]);
  useEffect(()=>{ scheduleSave("canvas"); },[canvasNotes]);
  useEffect(()=>{ scheduleSave("habits"); },[habits]);
  useEffect(()=>{ scheduleSave("cats"); },[cats]);
  // Everything waiting to save goes now; anything already saving finishes first.
  const flushSaves=()=>Promise.all(Object.keys(SAVERS).map(n=>saveTimerRef.current[n]?runSave(n):(saveChainRef.current[n]||Promise.resolve())));
  // Combine a fresh load with what's on screen. If nothing was touched here since the load began, the
  // server's copy is simply shown. Otherwise: this device's edits win, rows that only exist on the server
  // (added on another device) are kept, and rows deleted here stay deleted.
  const mergeLoaded=(start,local,server)=>{
    if(local===start) return server;
    if(Array.isArray(server)){ const had=new Set((start||[]).map(x=>String(x.id))), mine=new Set(local.map(x=>String(x.id)));
      return [...local,...server.filter(x=>!mine.has(String(x.id))&&!had.has(String(x.id)))]; }
    const out={...local}; for(const k of Object.keys(server)) if(!(k in local)&&!(start&&k in start)) out[k]=server[k]; return out;
  };
  const loadAll=async initial=>{
    const u=userRef.current; if(!u) return;
    clearTimeout(reloadTimerRef.current);
    if(!initial) await flushSaves();
    const start={...latestRef.current};
    if(initial) setSyncing(true);
    const [t,c,n,h,k,os,sm]=await Promise.allSettled([db.loadTasks(),db.loadCanvas(u.id),db.loadNotes(u.id),db.loadHabits(u.id),db.loadCats(u.id),db.loadOwnedShares(u.id),db.loadSharedWithMe(u.email)]);
    if(initial) setSyncing(false);
    if(userRef.current?.id!==u.id) return;          // signed out or switched accounts meanwhile
    const ok=r=>r.status==="fulfilled";
    if(ok(t)){
      let list=t.value;
      // A brand-new account gets the starter tasks — once, on its first day. Not on every new device an
      // existing account signs in on, just because it happens to have no tasks.
      const newAccount=u.created_at&&Date.now()-new Date(u.created_at).getTime()<86400000;
      if(initial&&!list.length&&newAccount){ try{ if(!localStorage.getItem("fs_seed_"+u.id)){ localStorage.setItem("fs_seed_"+u.id,"1"); list=sampleTasks(u.id); list.forEach(s=>db.insertTask(s,u.id).catch(()=>{})); } }catch{} }
      setTasks(list); tasksLoadedRef.current=true;
    }
    const adopt=(name,res,set)=>{
      if(!ok(res)) return;
      const cur=latestRef.current[name];
      const server=name==="cats"?(res.value||{}):res.value;
      let shown=mergeLoaded(start[name],cur,server);
      if(name==="cats"&&!res.value&&cur===start[name]) shown=DEFAULT_CATS;   // no lists saved yet → the built-in ones, written by the next save
      syncedRef.current[name]=server;
      set(shown);
      if(shown!==server) scheduleSave(name);
    };
    adopt("canvas",c,setCanvasNotes); adopt("notes",n,setNotes); adopt("habits",h,setHabits); adopt("cats",k,setCats);
    if(ok(os)) setOwnedShares(os.value);
    if(ok(sm)) setSharedWithMe(dropLeftShares(sm.value));
    if([t,c,n,h,k].some(r=>!ok(r))){
      showToast("Couldn't load everything — retrying in a moment…");
      reloadTimerRef.current=setTimeout(()=>loadAll(false),10000);
    }
  };

  useEffect(()=>{
    syncedRef.current={notes:null,canvas:null,habits:null,cats:null}; tasksLoadedRef.current=false;
    if(!user){setTasks([]);setCanvasNotes([]);setNotes([]);setHabits([]);setCats(DEFAULT_CATS);setOwnedShares([]);setSharedWithMe([]);setMessages([]);setSGroups([]);setChatReqs([]);return;}
    db.loadMessages().then(setMessages).catch(()=>{});
    db.loadChatReqs(user.email).then(setChatReqs).catch(()=>{});
    db.loadProfiles().then(rows=>{ setProfRows(rows); try{ localStorage.setItem("fs_avatars",JSON.stringify(Object.fromEntries(rows.map(r=>[r.email,r.avatar||""])))); }catch{} }).catch(()=>{});
    db.upsertProfile(user.id,user.email,myAvatar||undefined).catch(()=>{});
    refreshGroups();
    loadAll(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[user]);

  // Leaving the app saves anything pending at once; coming back picks up what other devices changed.
  useEffect(()=>{
    if(!user) return;
    const onVis=()=>{ syncGami(); if(document.hidden) flushSaves(); else loadAll(false); };
    const onHide=()=>{ flushSaves(); syncGami(); };
    document.addEventListener("visibilitychange",onVis); window.addEventListener("pagehide",onHide);
    return ()=>{ document.removeEventListener("visibilitychange",onVis); window.removeEventListener("pagehide",onHide); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[user]);

  useEffect(()=>{ if(keepSelRef.current){ keepSelRef.current=false; return; } setSelTask(null); },[view]);
  // Opening tab: the first one in your own sidebar order (see the effect further down, which needs
  // the sidebar list to exist first). Once you pick a tab yourself, Freely stops moving under you.
  const viewPickedRef = useRef(false);
  // Going somewhere from the palette, the calendar, a note… is your choice too — otherwise the
  // "open on your first tab" rule would snap straight back to that tab.
  const navTo=v=>{ viewPickedRef.current=true; setView(v); };
  const goView=v=>{ navTo(v); setSideOpen(false); };

  // Swipe anywhere on the sidebar itself: drag right = open, drag left = collapse.
  // The rail is always visible (60px), so it's always grabbable — no fiddly screen-edge needed.
  const sideSwipe=e=>{
    // Don't hijack folder drag-and-drop (folders live inside data-folderrow / data-groupzone).
    if(e.target.closest("[data-folderrow],[data-groupzone]")) return;
    const sx=e.clientX,sy=e.clientY; let done=false;
    const cleanup=()=>{window.removeEventListener("pointermove",mv);window.removeEventListener("pointerup",up);window.removeEventListener("pointercancel",up);};
    const mv=ev=>{ if(done)return; const dx=ev.clientX-sx,dy=ev.clientY-sy; if(Math.abs(dx)<45||Math.abs(dx)<Math.abs(dy)*1.2)return; done=true; cleanup(); navigator.vibrate?.(12); setSideOpen(dx>0); };
    const up=()=>cleanup();
    window.addEventListener("pointermove",mv);window.addEventListener("pointerup",up);window.addEventListener("pointercancel",up);
  };

  // Shares the user chose to leave are remembered by row id — if the owner re-shares later (new row id), it shows again.
  const dropLeftShares=arr=>{ try{ const left=JSON.parse(localStorage.getItem("fs_left_shares")||"[]"); return arr.filter(s=>!left.includes(s.id)); }catch{ return arr; } };
  const refreshShares=useCallback(()=>{
    if(!user) return;
    db.loadOwnedShares(user.id).then(setOwnedShares).catch(()=>{});
    db.loadSharedWithMe(user.email).then(sm=>setSharedWithMe(dropLeftShares(sm))).catch(()=>{});
  },[user]);
  const leaveShare=async(ownerId,folder)=>{
    const s=sharedWithMe.find(x=>x.owner_id===ownerId&&x.folder===folder);
    if(!s) return;
    await db.removeShare(s.id).catch(()=>{}); // may be blocked for non-owners — the local leave below still applies
    try{ const left=JSON.parse(localStorage.getItem("fs_left_shares")||"[]"); localStorage.setItem("fs_left_shares",JSON.stringify([...new Set([...left,s.id])])); }catch{}
    setSharedWithMe(sm=>sm.filter(x=>x.id!==s.id));
    if(view===`shared:${ownerId}:${folder}`) navTo("myday");
    showToast(`You left "${folder}" 👋`);
  };
  const refreshGroups=useCallback(()=>{
    if(!user) return; const me=user.email.toLowerCase();
    Promise.all([db.loadGroups(),db.loadGroupMembers()])
      .then(([gs,ms])=>{
        // A team has full members (they read the chat) and guests, invited only to assign work to it.
        const withM=gs.map(g=>{ const rows=ms.filter(m=>m.group_id===g.id);
          return {...g,
            members:rows.filter(r=>(r.role||"member")==="member").map(r=>r.email),
            guests: rows.filter(r=>r.role==="assigner").map(r=>r.email)}; });
        setAllGroups(withM);                                                     // everything I may assign to
        setSGroups(withM.filter(g=>g.members.includes(me)||g.created_by===user.id)); }) // teams I'm really in
      .catch(()=>{});
  },[user]);

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
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"messages"},({new:m})=>{ setMessages(ms=>ms.some(x=>x.id===m.id)?ms:[...ms,m]); }) // RLS only delivers rows we may see (own DMs + our team chats)
      .on("postgres_changes",{event:"*",schema:"public",table:"group_members"},()=>{ refreshGroups(); })
      .on("postgres_changes",{event:"*",schema:"public",table:"groups"},()=>{ refreshGroups(); })
      .on("postgres_changes",{event:"*",schema:"public",table:"chat_requests"},()=>{ db.loadChatReqs(user.email).then(setChatReqs).catch(()=>{}); })
      .subscribe();
    return ()=>{ supabase.removeChannel(ch); };
  },[user]);

  // ── XP, streak and preferences, synced between devices (the merge rules: mergeGami in logic.js) ──────
  const xpBaseRef=useRef(0);   // XP as last agreed with the server — anything above it was earned on this device since
  const gamiChainRef=useRef(Promise.resolve()), gamiTimerRef=useRef(null);
  const layout={navOrg,hiddenTabs,sort:sortMode,newAtBottom,dark,scheme};
  const layoutJson=JSON.stringify(layout);
  // The layout's `at` moves only when you change the layout HERE — never when another device's layout is
  // adopted, and never because a task was ticked. That is what stops a phone left open all day from
  // overwriting the sidebar you just rearranged on your laptop.
  const layoutSeenRef=useRef(layoutJson);
  useEffect(()=>{ if(layoutJson===layoutSeenRef.current) return; layoutSeenRef.current=layoutJson; prefsAtRef.current=Date.now(); try{ localStorage.setItem("fs_prefs_at",String(prefsAtRef.current)); }catch{} },[layoutJson]);
  const gamiLocalRef=useRef(null); gamiLocalRef.current={xp,streak,layout,dayStats,myday:mydayExtra};
  const syncGami=useCallback(()=>{
    clearTimeout(gamiTimerRef.current);
    gamiChainRef.current=gamiChainRef.current.then(async()=>{
      const u=userRef.current; if(!u) return;
      const server=await db.loadGami(u.id);
      const L=gamiLocalRef.current;
      const m=mergeGami(server,{...L,lastActive:lastActiveRef.current,awarded:[...awardedRef.current],at:prefsAtRef.current,device:DEVICE_ID},xpBaseRef.current,tod());
      if(gamiRowDiffers(server,m)) await db.saveGami(u.id,m);
      if(userRef.current?.id!==u.id) return;
      // Take the merged result. XP earned while this round-trip was in flight stays on top of it.
      xpBaseRef.current=m.xp; setXp(x=>m.xp+Math.max(0,x-L.xp));
      m.awarded.forEach(a=>awardedRef.current.add(a));
      if((m.last_active||"")>=(lastActiveRef.current||"")){ lastActiveRef.current=m.last_active; setStreak(m.last_active===tod()||m.last_active===addDays(-1)?m.streak:0); }
      if(m.serverLayoutNewer){
        const p=m.prefs, next={navOrg:p.navOrg??null,hiddenTabs:Array.isArray(p.hiddenTabs)?p.hiddenTabs:[],sort:p.sort==="smart"?"manual":(p.sort||"due"),newAtBottom:p.newAtBottom!==false,dark:p.dark!==false,scheme:PALETTES[p.scheme]?p.scheme:"lavender"};
        layoutSeenRef.current=JSON.stringify(next); prefsAtRef.current=p.at; try{ localStorage.setItem("fs_prefs_at",String(p.at)); }catch{}
        setNavOrg(next.navOrg); setHiddenTabs(next.hiddenTabs); setSortMode(next.sort); setNewAtBottom(next.newAtBottom); setDark(next.dark); setScheme(next.scheme);
      }
      const others={...m.prefs.stats}; delete others[DEVICE_ID];
      setRemoteStats(others); try{ localStorage.setItem("fs_stats_remote",JSON.stringify(others)); }catch{}
      if(m.prefs.myday&&JSON.stringify(m.prefs.myday)!==JSON.stringify(L.myday)) setMydayExtra(m.prefs.myday);
    }).catch(e=>console.error("syncing XP / preferences failed",e));
    return gamiChainRef.current;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  const gamiSig=JSON.stringify([xp,streak,layoutJson,dayStats,mydayExtra]);
  useEffect(()=>{ if(!user) return; clearTimeout(gamiTimerRef.current); gamiTimerRef.current=setTimeout(syncGami,1500); return ()=>clearTimeout(gamiTimerRef.current); },[gamiSig,user,syncGami]);
  useEffect(()=>{
    if(user){ syncGami(); return; }
    setXp(0); setStreak(0); awardedRef.current=new Set(); lastActiveRef.current=null; xpBaseRef.current=0;
  },[user,syncGami]);

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

  // ── Creating tasks ────────────────────────────────────────────────────────────────────────────────
  // Every new task is built and saved here, so defaults, placement and failure handling can't drift apart
  // between the different add boxes (list, matrix, calendar, canvas, repeats, duplicates).
  const newTask=fields=>{
    const open=tasks.filter(x=>!x.done).map(x=>x.position||0);
    return {id:crypto.randomUUID(),title:"",done:false,priority:"medium",tag:null,due:null,starred:false,notes:"",color:null,
      subtasks:[],recurring:null,quadrant:null,remindAt:null,endTime:null,attachments:[],assignedTo:null,assignPrivate:false,
      owner:user?.id,mydayDate:null,position:(newAtBottom&&open.length)?Math.min(...open)-1000:Date.now(),...fields};
  };
  const createTask=(t,{xp=true}={})=>{
    setTasks(ts=>[t,...ts]); if(xp) awardXp("add-"+t.id,10);
    if(user) db.insertTask(t,t.owner||user.id).catch(e=>{ setTasks(ts=>ts.filter(x=>x.id!==t.id)); showToast(`Couldn't save "${t.title}" — ${e.message||e}`); });
    return t;
  };
  // "writing essay" → the task "essay" in your Writing list; otherwise the list is guessed from the words.
  const fileUnder=title=>{ const hit=matchListName(title,cats); return hit?{tag:hit,title:stripListName(title,hit)}:{tag:guessCat(title,cats),title}; };
  // A typed sentence → a task. The date, time, repeat and list come out of the words; `over` pins any of
  // them from context — the calendar day you tapped, the list you're in, the matrix box.
  const taskFromText=(raw,over={})=>{
    const p=parseNL(raw);
    const due=over.due!==undefined?over.due:(p.due||(p.time?tod():null));
    const filed=over.tag?{tag:over.tag,title:p.title}:fileUnder(p.title);
    return newTask({...filed,recurring:p.recurring||null,remindAt:p.time&&due&&!isTbd(due)?`${due}T${p.time}`:null,endTime:p.time?(p.endTime||null):null,...over,due});
  };
  const addTask=()=>{
    const raw=input.trim(); if(!raw) return;
    const p=parseNL(raw), over={starred:view==="flagged",mydayDate:view==="myday"?todStr:null};
    if(view.startsWith("cat:")) over.tag=view.slice(4);
    if(view.startsWith("shared:")){
      const rest=view.slice(7),ci=rest.indexOf(":"); over.owner=rest.slice(0,ci); over.tag=rest.slice(ci+1);
      const sh=sharedWithMe.find(x=>x.owner_id===over.owner&&x.folder===over.tag);
      if(sh&&sh.can_edit===false){ showToast("View only — ask the owner for edit access 👀"); return; }
    }
    if(view==="upcoming"&&!p.due&&!p.time) over.due=DUE_TBD;   // Upcoming with no date typed → Date TBD, not a silent guess
    // A pasted blurb can carry a multi-day span and extra fields (Location, Cost…) — they go on the notes.
    const abs=s=>new Date(s+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"});
    over.notes=[p.spanEnd&&p.due?`📅 Runs ${abs(p.due)} → ${abs(p.spanEnd)}`:"",p.extra||""].filter(Boolean).join("\n");
    const t=createTask(taskFromText(raw,over));
    setInput(""); setNewAnim(t.id); setTimeout(()=>setNewAnim(null),600);
    if(view==="myday") markActiveDay();
  };

  // Analytics counts a completion on the day it happens. Unticking takes it back only if it was ticked
  // today on this device — unticking something finished last week must not lower today's count.
  const doneTodayRef=useRef(null);
  const countCompletion=(id,done)=>{
    const today=tod();
    if(doneTodayRef.current?.date!==today){ try{ const s=JSON.parse(localStorage.getItem("fs_done_today")||"null"); doneTodayRef.current=s&&s.date===today&&Array.isArray(s.ids)?s:{date:today,ids:[]}; }catch{ doneTodayRef.current={date:today,ids:[]}; } }
    const d=doneTodayRef.current, had=d.ids.includes(id);
    if(done&&!had){ d.ids.push(id); bumpStat(1); }
    else if(!done&&had){ d.ids=d.ids.filter(x=>x!==id); bumpStat(-1); }
    try{ localStorage.setItem("fs_done_today",JSON.stringify(d)); }catch{}
  };
  const toggleTask = id=>{
    const task=tasks.find(t=>t.id===id);
    if(!task) return;
    if(!canEditTask(task)){ showToast("View only — ask the owner for edit access 👀"); return; }
    const done=!task.done;
    updateTask(id,{done});
    countCompletion(id,done);
    if(!done) return;
    awardXp("done-"+id,20); markActiveDay(); navigator.vibrate?.(30); playComplete(sound);
    // A repeating task spawns its next occurrence once, however often it's ticked and unticked — in the same
    // list and under the same owner, so a repeat in a shared list stays in that list.
    if(task.recurring && !awardedRef.current.has("recur-"+id)){
      awardedRef.current.add("recur-"+id);
      const nd=nextDue(isTbd(task.due)?null:task.due,task.recurring);
      if(nd){
        createTask({...task,id:crypto.randomUUID(),done:false,attachments:[],mydayDate:null,...moveDuePatch(task,nd),
          subtasks:(task.subtasks||[]).map(s=>({...s,done:false,due:null,time:null}))},{xp:false});
        showToast(`↻ Next "${task.title}" scheduled for ${fmtDate(nd)}`);
      }
    }
  };
  const canDeleteTask=task=>{
    if(!task) return true;
    if(task.owner===user?.id) return true;
    const sh=sharedWithMe.find(s=>s.owner_id===task.owner&&s.folder===task.tag);
    return !!(sh&&sh.can_delete);
  };
  // View-only collaborators can look but not touch. Work assigned to you is yours to tick off.
  // A share row from before the can_edit column exists is treated as editable.
  const canEditTask=task=>{
    if(!task) return true;
    if(task.owner===user?.id) return true;
    if(assigneesOf(task).includes(user?.email?.toLowerCase())) return true;
    const sh=sharedWithMe.find(s=>s.owner_id===task.owner&&s.folder===task.tag);
    return !sh || sh.can_edit!==false;
  };
  // Files leave storage only when their task is really gone: after the undo window, or at once for deletes
  // that can't be undone. Before this, every deleted task left its attachments in storage forever.
  const purgeFiles=list=>db.deleteAttachments(list.flatMap(t=>(t.attachments||[]).map(a=>a.path))).catch(()=>{});
  const deleteTask = id=>{
    const t=tasks.find(x=>x.id===id);
    if(!t) return;
    if(!canDeleteTask(t)){ showToast("You don't have permission to delete this shared task"); return; }
    setTasks(ts=>ts.filter(x=>x.id!==id)); if(selTask?.id===id)setSelTask(null);
    if(user)db.deleteTask(id)
      .then(r=>{ if(r&&r.deleted===false) reportDroppedWrite("That task didn't delete — you may not have permission to remove it."); })
      .catch(console.error);
    let undone=false;
    const purge=setTimeout(()=>{ if(!undone&&user) purgeFiles([t]); },8000);
    showToast("Task deleted", ()=>{ undone=true; clearTimeout(purge); setTasks(ts=>[t,...ts]); if(user) db.insertTask(t,t.owner||user.id).catch(console.error); setToast(null); });
  };
  // A copy stays in the same list and under the same owner — including in a list shared with you.
  const duplicateTask = task=>{ createTask({...task,id:crypto.randomUUID(),done:false,title:task.title+" (copy)",attachments:[]},{xp:false}); showToast("Task duplicated"); };
  // Bring the starter tour tasks back from the guide. Skips any you still have, so tapping it
  // twice doesn't leave you with two of everything.
  const addSamplesAgain = ()=>{
    if(!user) return;
    const have=new Set(tasks.map(t=>t.title));
    const seeds=sampleTasks(user.id).filter(s=>!have.has(s.title));
    if(!seeds.length){ showToast("The starter tasks are already in your list ✓"); return; }
    setTasks(ts=>[...seeds,...ts]);
    seeds.forEach(s=>db.insertTask(s,user.id).catch(()=>{}));
    navTo("myday");
    showToast(`Added ${seeds.length} starter task${seeds.length===1?"":"s"} — delete them whenever you're done 👋`);
  };
  // Uploads go one after another, then the task is updated once from its LATEST attachment list — reading
  // the list from before the uploads started made a second file silently replace the first.
  const tasksRef=useRef(tasks); tasksRef.current=tasks;
  const attachFiles=async(task,files)=>{
    if(!user) return;
    const metas=[];
    try{ for(const f of files) metas.push(await db.uploadAttachment(f,user.id,task.id)); }
    finally{ if(metas.length){ const cur=tasksRef.current.find(x=>x.id===task.id)||task; updateTask(task.id,{attachments:[...(cur.attachments||[]),...metas]}); } }
  };
  const removeAttach=(task,att)=>{
    db.deleteAttachments([att.path]).catch(()=>{});
    const cur=tasksRef.current.find(x=>x.id===task.id)||task;
    updateTask(task.id,{attachments:(cur.attachments||[]).filter(a=>a.path!==att.path)});
  };
  const setReminder = (id,val)=>{ updateTask(id,{remindAt:val||null}); if(val&&"Notification"in window&&Notification.permission==="default") Notification.requestPermission(); };
  const uploadCatIcon = async file=>{
    if(!user) return null;
    try{ return (await db.uploadAttachment(file,user.id,"icons")).url; }
    catch(e){ showToast("Couldn't upload that image — "+(e.message||e)); return null; }
  };
  useEffect(()=>{ if(!user){setDeletedCats([]);return;} try{ setDeletedCats(JSON.parse(localStorage.getItem(`fs_delcats_${user.id}`)||"[]")); }catch{ setDeletedCats([]); } },[user]);
  const persistDeleted=arr=>{ setDeletedCats(arr); if(user){ try{localStorage.setItem(`fs_delcats_${user.id}`,JSON.stringify(arr));}catch{} } };
  const deleteCat=name=>{ if(cats[name]) setDelCatModal(name); };
  const confirmDeleteCat=(name,alsoTasks)=>{
    const meta=cats[name]; setDelCatModal(null); if(!meta) return;
    setCats(c=>{ const n={...c}; delete n[name]; return n; });
    persistDeleted([{name,color:meta.color,icon:meta.icon},...deletedCats.filter(d=>d.name!==name)].slice(0,20));
    // Sharing ends with the list — otherwise collaborators are left holding an empty ghost of it.
    if(user&&ownedShares.some(s=>s.folder===name)) db.removeSharesOfFolder(user.id,name).then(refreshShares).catch(()=>{});
    if(view===`cat:${name}`) navTo("all");
    if(alsoTasks){ const n=clearTasks(myTasks.filter(t=>t.tag===name)); showToast(`Deleted "${name}" and ${n} task${n===1?"":"s"}`); }
    else showToast(`List "${name}" deleted — its tasks were kept`);
  };
  const restoreCat=name=>{ const d=deletedCats.find(x=>x.name===name); if(!d) return; setCats(c=>({...c,[name]:{color:d.color,icon:d.icon}})); persistDeleted(deletedCats.filter(x=>x.name!==name)); showToast(`Folder "${name}" restored`); };
  const purgeCat=name=>{ persistDeleted(deletedCats.filter(x=>x.name!==name)); };
  // Deletes that can't be undone. Only tasks you may delete: "Clear completed" used to include tasks in
  // lists shared with you, deleting other people's work without asking.
  const clearTasks=list=>{
    if(!list.length) return 0;
    const ids=new Set(list.map(t=>t.id));
    setTasks(ts=>ts.filter(t=>!ids.has(t.id)));
    if(user){ list.forEach(t=>db.deleteTask(t.id).catch(()=>{})); purgeFiles(list); }
    return list.length;
  };
  const clearCompleted=()=>{ const n=clearTasks(myTasks.filter(t=>t.done)); showToast(n?`Cleared ${n} completed`:"No completed tasks"); };
  const clearDone=ids=>{ const n=clearTasks(tasks.filter(t=>ids?.includes(t.id)&&canDeleteTask(t))); if(n) showToast(`Cleared ${n} completed`); };
  const exportData = ()=>{
    const data={app:"Freely",version:2,exportedAt:new Date().toISOString(),tasks:myTasks,notes,canvasNotes,habits,cats};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="freely-backup.json"; a.click(); URL.revokeObjectURL(url);
    showToast("Backup downloaded");
  };
  // Restoring adds what's missing and never overwrites. Imported rows become yours, with ids the database
  // accepts (older backups carried numeric note ids).
  const importData = file=>{
    const reader=new FileReader();
    reader.onload=()=>{ try{
      const d=JSON.parse(reader.result);
      const isUuid=id=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id));
      const missing=(list,cur)=>{ const have=new Set(cur.map(x=>String(x.id))); return list.filter(x=>x&&!have.has(String(x.id))); };
      if(Array.isArray(d.tasks)){ const inc=missing(d.tasks,tasks).filter(t=>isUuid(t.id)).map(t=>({...t,owner:user?.id})); setTasks(ts=>[...inc,...ts]); if(user) inc.forEach(t=>db.insertTask(t,user.id).catch(()=>{})); }
      if(Array.isArray(d.notes)) setNotes(ns=>[...missing(d.notes,ns).map(n=>isUuid(n.id)?n:{...n,id:crypto.randomUUID()}),...ns]);
      if(Array.isArray(d.canvasNotes)) setCanvasNotes(ns=>[...ns,...missing(d.canvasNotes,ns).map(n=>isUuid(n.id)?n:{...n,id:crypto.randomUUID()})]);
      if(Array.isArray(d.habits)) setHabits(hs=>[...hs,...missing(d.habits,hs).map((h,i)=>Number.isSafeInteger(Number(h.id))?{...h,id:Number(h.id)}:{...h,id:Date.now()+i})]);
      if(d.cats&&typeof d.cats==="object") setCats(c=>({...d.cats,...c}));
      showToast("Backup imported ✓");
    }catch{ showToast("Import failed — that isn't a Freely backup file"); } };
    reader.readAsText(file);
  };
  // Edits show instantly and reach the server a moment later. If the server refuses one it changes
  // nothing and raises no error — so the screen would quietly disagree with what is really stored.
  // Say so, and reload the truth rather than leaving a change that only exists on this device.
  const lastDropRef=useRef(0);
  const reportDroppedWrite=useCallback(msg=>{
    if(Date.now()-lastDropRef.current<4000) return;   // one warning per burst, not one per task
    lastDropRef.current=Date.now();
    showToast(msg);
    if(user) db.loadTasks().then(setTasks).catch(()=>{});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[user]);

  const updateTask = (id,patch)=>{
    const cur=tasks.find(t=>t.id===id);
    if(cur&&!canEditTask(cur)){ showToast("View only — ask the owner for edit access 👀"); return; }
    setTasks(ts=>ts.map(t=>t.id===id?{...t,...patch}:t));
    // Decide from the CURRENT selection, not this render's copy: an update that lands after the panel
    // closed (a finished upload, a title flushed on close) used to reopen it with a half-empty ghost task.
    setSelTask(s=>s&&s.id===id?{...s,...patch}:s);
    if(user)db.updateTask(id,patch)
      .then(r=>{ if(r&&r.saved===false) reportDroppedWrite("That change didn't save — you may not have permission to edit this shared task."); })
      .catch(console.error);
  };
  // Drop-position aware reorder: `before` says whether the card lands above or below the target
  // (from the pointer's position over the target's midpoint) — so first/last slots work too.
  const reorderTasks = (fromId,toId,before)=>{
    if(String(fromId)===String(toId)) return;
    const sorted=tasks.filter(t=>!t.done).sort((a,b)=>(b.position||0)-(a.position||0));
    const fromIdx=sorted.findIndex(t=>String(t.id)===String(fromId)), toIdx=sorted.findIndex(t=>String(t.id)===String(toId));
    if(fromIdx<0||toIdx<0) return;
    if(before===undefined) before=fromIdx>toIdx; // legacy callers: infer from drag direction
    const toT=sorted[toIdx], fromT=sorted[fromIdx];
    let newPos;
    if(before){ const above=sorted[toIdx-1]; if(above&&above.id===fromT.id) return; newPos=above?((above.position||0)+(toT.position||0))/2:(toT.position||0)+1; }
    else { const below=sorted[toIdx+1]; if(below&&below.id===fromT.id) return; newPos=below?((toT.position||0)+(below.position||0))/2:(toT.position||0)-1; }
    updateTask(fromT.id,{position:newPos});
  };

  // "Today" follows the device clock: re-checked on a timer and whenever the app regains focus, so crossing
  // midnight — or landing in a new time zone — moves the whole app onto the right day without a reload.
  const [todStr,setTodStr]=useState(tod);
  useEffect(()=>{
    const tick=()=>setTodStr(cur=>{ const d=tod(); return cur===d?cur:d; });
    const iv=setInterval(tick,20000);
    document.addEventListener("visibilitychange",tick); window.addEventListener("focus",tick);
    return ()=>{ clearInterval(iv); document.removeEventListener("visibilitychange",tick); window.removeEventListener("focus",tick); };
  },[]);
  const myTasks=tasks.filter(t=>t.owner===user?.id);
  // In My Day today? Your own tasks carry it on the task itself; other people's tasks can't (the row is
  // theirs — writing it put your My Day into theirs), so those live in `mydayExtra`.
  const inMyDay=t=>t.owner===user?.id?t.mydayDate===todStr:(mydayExtra.date===todStr&&mydayExtra.ids.includes(t.id));
  const setInMyDay=(t,on)=>{
    if(!t) return;
    if(t.owner===user?.id){ updateTask(t.id,{mydayDate:on?todStr:null}); return; }
    setMydayExtra(m=>{ const ids=m.date===todStr?m.ids.filter(x=>x!==t.id):[]; return {date:todStr,ids:on?[...ids,t.id]:ids,at:Date.now()}; });
  };
  const myDay=tasks.filter(inMyDay);
  // Upcoming keeps anything still open, however overdue — a past deadline must never make a task vanish.
  const upcoming=myTasks.filter(t=>t.due&&(!t.done||t.due>todStr));
  const myDayAllDone=myDay.length>0&&myDay.every(t=>t.done);
  const prevMyDayDone=useRef(false);
  useEffect(()=>{ if(myDayAllDone&&!prevMyDayDone.current) fireConfetti(); prevMyDayDone.current=myDayAllDone; },[myDayAllDone]);
  // Shortlist that complements My Day: tasks worth pulling in today (overdue → due soon → the rest).
  const mydaySuggestions=myTasks
    .filter(t=>!t.done && !inMyDay(t))
    .sort((a,b)=>{
      const ao=a.due&&a.due<todStr, bo=b.due&&b.due<todStr;
      if(ao!==bo) return ao?-1:1;
      if(a.due&&b.due) return dueKey(a).localeCompare(dueKey(b));
      if(a.due) return -1; if(b.due) return 1; return 0;
    }).slice(0,6);
  const addToMyDay=id=>{ navigator.vibrate?.(10); setInMyDay(tasks.find(x=>x.id===id),true); markActiveDay(); };
  const toggleMyDay=id=>{ const t=tasks.find(x=>x.id===id); if(!t)return; const on=!inMyDay(t); navigator.vibrate?.(15); setInMyDay(t,on); if(on) markActiveDay(); };
  // Unfinished My Day tasks from an earlier day move to today — once per day, including when the app stays
  // open past midnight (it used to happen only once per session). The banner offers to undo it.
  const carriedForRef=useRef("");
  const [carriedIds,setCarriedIds]=useState([]);
  useEffect(()=>{ carriedForRef.current=""; setCarriedIds([]); },[user]);
  useEffect(()=>{
    if(!user||!tasks.length||carriedForRef.current===todStr) return;
    carriedForRef.current=todStr;
    const own=tasks.filter(t=>t.owner===user.id&&!t.done&&t.mydayDate&&t.mydayDate<todStr);
    own.forEach(t=>updateTask(t.id,{mydayDate:todStr}));
    let others=[];
    if(mydayExtra.date&&mydayExtra.date<todStr){ others=mydayExtra.ids.filter(id=>{ const t=tasks.find(x=>x.id===id); return t&&!t.done; }); setMydayExtra({date:todStr,ids:others,at:Date.now()}); }
    const ids=[...own.map(t=>t.id),...others];
    if(ids.length) setCarriedIds(ids);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[tasks,user,todStr]);
  const undoCarry=()=>{ if(!carriedIds.length)return; navigator.vibrate?.(10); carriedIds.forEach(id=>setInMyDay(tasks.find(x=>x.id===id),false)); setCarriedIds([]); showToast("Carry-over undone"); };
  const shareFolder=async(folder,email,perm)=>{ if(!user||!email.trim())return; try{ await db.addShare(user.id,folder,email,perm); refreshShares(); showToast(`Shared "${folder}" with ${email.trim()}`); }catch(e){ showToast("Share failed: "+(e.message||e)); } };
  const unshareFolder=async id=>{ await db.removeShare(id).catch(()=>{}); refreshShares(); showToast("Collaborator removed"); };

  // A reminder fires once, when its time comes, for work that's yours (owned, or assigned to you — not every
  // task in lists shared with you). Remembered per task AND time, so moving a reminder re-arms it. One more
  // than 30 minutes stale is marked handled quietly: a phone opened in the morning must not replay the
  // night's reminders, and a new device must not replay a year of them.
  const remindedRef=useRef(null);
  if(!remindedRef.current){ try{ localStorage.removeItem("fs_reminded"); const r=JSON.parse(localStorage.getItem("fs_reminded2")||"{}"); remindedRef.current=r&&typeof r==="object"&&!Array.isArray(r)?r:{}; }catch{ remindedRef.current={}; } }
  useEffect(()=>{
    if(!user||!tasksLoadedRef.current) return;   // before tasks load the list is empty — that must not read as "everything was deleted"
    const me=user.email?.toLowerCase();
    const check=()=>{
      const now=Date.now(), seen=remindedRef.current, live=new Set(); let changed=false;
      for(const t of tasks){
        if(!t.remindAt||t.done||!(t.owner===user.id||assigneesOf(t).includes(me))) continue;
        const key=t.id+"|"+t.remindAt, at=new Date(t.remindAt).getTime();
        live.add(key);
        if(seen[key]||isNaN(at)||at>now) continue;
        seen[key]=1; changed=true;
        if(now-at>30*60000) continue;
        navigator.vibrate?.([30,40,30]); playComplete(sound);
        try{ if("Notification"in window&&Notification.permission==="granted") new Notification("Freely reminder ⏰",{body:t.title}); }catch{}
        showToast(`⏰ Reminder: ${t.title}`);
      }
      for(const k of Object.keys(seen)) if(!live.has(k)){ delete seen[k]; changed=true; }   // finished, moved or deleted
      if(changed) try{ localStorage.setItem("fs_reminded2",JSON.stringify(seen)); }catch{}
    };
    check(); const iv=setInterval(check,30000); return ()=>clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[tasks,user]);
  const addMatrixTask=(quadrant,text)=>{ const raw=(text||"").trim(); if(raw) createTask(taskFromText(raw,{quadrant})); };
  const requestLink=cb=>setLinkPick({onPick:cb});
  const linkIdeaToTask=(text,taskId)=>{
    const t=tasks.find(x=>x.id===taskId); if(!t)return;
    const txt=(text||"").trim();
    const ACC=["#3b82f6","#22c55e","#f59e0b","#ef4444","#a855f7","#ec4899","#14b8a6"];
    const n={id:crypto.randomUUID(),title:txt||"Linked note",body:"",pinned:false,color:ACC[(notes?.length||0)%ACC.length],drawing:null,taskId,created:tod()};
    setNotes(ns=>[n,...ns]);
    foldNoteIntoTask(n,t);
    showToast(`Linked to "${t.title}" — pulled its date/time into the task`);
  };
  // When a note links to a task, surface it on the task and take any date/time out of it.
  const foldNoteIntoTask=(note,task)=>{
    if(!note||!task) return;
    const raw=(note.title||"").trim();
    const p=parseNL(raw), patch=whenPatch(task,p);
    // Keep the note's words — unless they were nothing BUT a date ("tomorrow 3pm"), which the task now carries.
    const words=(p.due||p.time)&&p.title===raw?"":p.title;
    const noteText=[words,(note.body||"").trim()].filter(Boolean).join(" — ").trim();
    if(noteText){ const existing=(task.notes||"").trim(); if(!existing.includes(noteText)) patch.notes=(existing?existing+"\n":"")+noteText; }
    if(Object.keys(patch).length) updateTask(task.id,patch);
  };
  const startFocus=t=>{ setFocusTask({id:t.id,title:t.title}); setPomSecs(pomLen*60); setPomRun(true); setZenOpen(true); navigator.vibrate?.(20); showToast(`🍅 Focusing on "${t.title}" — ${pomLen} min timer started`); };
  const meEmail=user?.email?.toLowerCase();
  // People I'm properly linked to: folder shares (both directions, via profiles for owner emails) + teammates.
  const idEmail=Object.fromEntries(profRows.map(r=>[r.id,r.email]));
  const trusted=[...new Set([
    ...(ownedShares||[]).map(s=>s.shared_with_email),
    ...sharedWithMe.map(s=>idEmail[s.owner_id]).filter(Boolean),
    ...sGroups.flatMap(g=>g.members||[]),
  ])].filter(e=>e&&e!==meEmail);
  // Everyone pickable in assign/chat lists = trusted + anyone I've exchanged DMs with.
  const knownPeople=[...new Set([...trusted,...messages.filter(m=>!m.group_id).map(m=>m.sender_email===meEmail?m.recipient_email:m.sender_email)])].filter(e=>e&&e!==meEmail);
  // Everyone who can already see a given list — the people you'd hand its work to.
  // Works both ways: lists I share out, and lists shared with me (then it's the owner + the other guests).
  const collaboratorsOf=tag=>{
    const out=new Set();
    (ownedShares||[]).filter(s=>s.folder===tag).forEach(s=>out.add((s.shared_with_email||"").toLowerCase()));
    sharedWithMe.filter(s=>s.folder===tag).forEach(s=>{ const em=idEmail[s.owner_id]; if(em) out.add(em.toLowerCase()); });
    out.delete(meEmail); out.delete("");
    return [...out];
  };
  // Who shared the list I'm currently looking at (for the "Shared by …" header + Leave button).
  const sharedViewInfo=view.startsWith("shared:")?(()=>{ const rest=view.slice(7),ci=rest.indexOf(":"),o=rest.slice(0,ci),f=rest.slice(ci+1); const em=idEmail[o]; const sh=sharedWithMe.find(x=>x.owner_id===o&&x.folder===f); return {owner:o,folder:f,email:em||null,nick:em?nickOf(em):null,canEdit:!sh||sh.can_edit!==false}; })():null;
  // Can I chat freely with them? (trusted, accepted request either way, or they've messaged me)
  const chatLinked=em=>trusted.includes(em)
    ||chatReqs.some(r=>r.status==="accepted"&&((r.from_email===em&&r.to_email===meEmail)||(r.to_email===em&&r.from_email===meEmail)))
    ||messages.some(m=>!m.group_id&&m.sender_email===em&&m.recipient_email===meEmail);
  // Send a DM or a team-chat message (peer "g:<id>" = team). First DM to a stranger also files a chat request.
  const sendDM=async(peer,body)=>{ if(!user||!peer||!body.trim()) return;
    try{
      if(typeof peer==="string"&&peer.startsWith("g:")){
        const m=await db.sendMessage(user.id,user.email,null,body.trim(),parseInt(peer.slice(2),10));
        setMessages(ms=>ms.some(x=>x.id===m.id)?ms:[...ms,m]); return;
      }
      const firstContact=!chatLinked(peer);
      if(firstContact) await db.sendChatReq(user.email,peer).catch(()=>{}); // file the request first so it lands as "a new person"
      const m=await db.sendMessage(user.id,user.email,peer,body.trim());
      setMessages(ms=>ms.some(x=>x.id===m.id)?ms:[...ms,m]);
      if(firstContact) showToast(`Friend request sent to ${nickOf(peer).split("@")[0]} 🤝 — they'll see it as a new chat.`);
    }catch(e){ showToast(setupError(e)?"⚙️ One-time setup needed: open Supabase → SQL Editor and run supabase/setup.sql, then reload.":/policy|violates/i.test(e.message||"")?"They haven't accepted your request yet — one message at a time until they do.":"Message failed: "+(e.message||e)); }
  };
  const openDM=peer=>{ setDmPeer(peer); navTo("messages"); setSideOpen(false);
    if(typeof peer==="string"&&!peer.startsWith("g:")){
      const unread=messages.filter(m=>m.recipient_email===meEmail&&m.sender_email===peer&&!m.read).map(m=>m.id);
      if(unread.length){ setMessages(ms=>ms.map(m=>unread.includes(m.id)?{...m,read:true}:m)); db.markMessagesRead(unread).catch(()=>{}); }
    }
  };
  // Message anyone with a Freely account: look the email up in profiles first.
  const startChat=async raw=>{ const em=(raw||"").trim().toLowerCase();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){ showToast("Enter a valid email like name@example.com"); return; }
    if(em===meEmail){ showToast("That's you 😄"); return; }
    // Just open the thread. Your first message files a friend request; no confusing account-lookup message.
    openDM(em);
  };
  const answerReq=(id,status)=>{ setChatReqs(rs=>rs.map(r=>r.id===id?{...r,status}:r)); db.answerChatReq(id,status).catch(()=>{}); if(status==="accepted") showToast("Request accepted — you're connected 🤝"); };
  const pickAvatar=em=>{ setMyAvatar(em); try{ localStorage.setItem("fs_avatar",em); const a=JSON.parse(localStorage.getItem("fs_avatars")||"{}"); a[meEmail]=em; localStorage.setItem("fs_avatars",JSON.stringify(a)); }catch{} setProfRows(rs=>rs.map(r=>r.email===meEmail?{...r,avatar:em}:r)); if(user) db.upsertProfile(user.id,user.email,em).catch(()=>{}); showToast("Avatar updated "+em); };
  // Teams: create / any member adds members (accounts only) / leave-remove / creator deletes.
  const setupError=e=>/schema cache|find the table|does not exist|infinite recursion|violates row-level security/i.test(e?.message||"");
  const createTeam=async name=>{ if(!user||!name.trim()) return; try{ await db.createGroup(user.id,name.trim(),guessIcon(name,"👥"),user.email); refreshGroups(); showToast(`Team "${name.trim()}" created ✓`); }catch(e){ showToast(setupError(e)?"⚙️ One-time setup needed: open Supabase → SQL Editor and run supabase/setup.sql, then reload.":"Couldn't create team: "+(e.message||e)); } };
  // role "member" = full teammate (chat included) · "assigner" = guest who may only assign work to the team
  const addTeamMember=async(gid,emRaw,role="member")=>{ const em=(emRaw||"").trim().toLowerCase(); if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){ showToast("Enter a valid email"); return; }
    if(em===meEmail){ showToast("You're already in this team 🙂"); return; }
    try{
      await db.addGroupMember(gid,em,user.email,role); refreshGroups();
      const who=nickOf(em).split("@")[0], byWho=nickOf(user.email).split("@")[0];
      // Post a notice in the team chat so everyone sees who was pulled in.
      db.sendMessage(user.id,user.email,null,`${SYS_MARK}👋 ${byWho} ${role==="assigner"?`invited ${who} to assign work to this team`:`added ${who} to the team`}`,gid).catch(()=>{});
      const known=await db.findProfile(em).catch(()=>null);
      showToast(known?`Added ${nickOf(em)} ✓`:`Added ${nickOf(em)} — they'll see the team once they sign in`);
    }catch(e){ showToast("Couldn't add: "+(e.message||e)); }
  };
  const removeTeamMember=async(gid,em)=>{ await db.removeGroupMember(gid,em).catch(()=>{});
    if(em!==meEmail) db.sendMessage(user.id,user.email,null,`${SYS_MARK}👋 ${nickOf(em).split("@")[0]} left the team`,gid).catch(()=>{});
    refreshGroups(); };
  const deleteTeam=async gid=>{ await db.deleteGroup(gid).catch(()=>{}); refreshGroups(); };
  // Bulk assign: add these people to every not-done task in the given lists.
  const assignAllInLists=(names,emails)=>{ const add=emails.map(e=>e.toLowerCase()).filter(Boolean); if(!add.length) return; let n=0;
    tasks.filter(t=>names.includes(t.tag)&&t.owner===user?.id&&!t.done).forEach(t=>{ const merged=[...new Set([...assigneesOf(t),...add])]; updateTask(t.id,{assignedTo:merged.join(",")}); n++; });
    showToast(n?`Assigned ${n} task${n===1?"":"s"} ✓`:"No open tasks in there yet"); };
  // Habits scheduled for today (day-picked habits only count on their weekdays) — shown as a strip in My Day.
  const todWd=new Date(todStr+"T12:00:00").getDay();
  const habitsToday=habits.filter(h=>!h.days||h.days.length===0||h.days.includes(todWd)).slice().sort((a,b)=>(a.prio??999)-(b.prio??999));
  const toggleHabitToday=id=>{ const h=habits.find(x=>x.id===id); if(!h)return; const done=(h.log||[]).includes(todStr);
    setHabits(hs=>hs.map(x=>x.id===id?{...x,log:done?(x.log||[]).filter(d=>d!==todStr):[...(x.log||[]),todStr]}:x));
    if(!done){ awardXp("habit-"+id+"-"+todStr,15); markActiveDay(); navigator.vibrate?.(20); if(habitsToday.every(x=>x.id===id||(x.log||[]).includes(todStr))) fireConfetti(); }
    else navigator.vibrate?.(8); };
  const toggleStep=(taskId,subId)=>{ const t=tasks.find(x=>x.id===taskId); if(!t)return; updateTask(taskId,{subtasks:(t.subtasks||[]).map(s=>s.id===subId?{...s,done:!s.done}:s)}); };
  const moveStep=(taskId,subId,day)=>{ const t=tasks.find(x=>x.id===taskId); if(!t)return; navigator.vibrate?.(15); updateTask(taskId,{subtasks:(t.subtasks||[]).map(s=>s.id===subId?{...s,due:day}:s)}); showToast(day?`Step scheduled for ${fmtDate(day)} 📅`:"Step date cleared"); };
  // Dragging a task onto a calendar day: keep its reminder at the same time-of-day on the new date.
  // Dragging a task onto a calendar day: its reminder moves with it, same time of day.
  const moveTaskDay=(id,day)=>{ const t=tasks.find(x=>x.id===id); if(!t||!day)return; navigator.vibrate?.(15); updateTask(id,moveDuePatch(t,day)); showToast(`Moved to ${fmtDate(day)} 📅`); };
  // Quick-add from the Calendar: the task lands on the tapped day; a typed time ("dentist 3pm") becomes its reminder.
  const addCalendarTask=(dateStr,text)=>{ const raw=(text||"").trim(); if(raw&&dateStr) createTask(taskFromText(raw,{due:dateStr})); };
  const addCanvasTask=(text,myDay)=>{
    const raw=(text||"").trim(); if(!raw) return;
    createTask(taskFromText(raw,{notes:"From Canvas",mydayDate:myDay?todStr:null}));
    if(myDay) markActiveDay();
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
    else if(view==="assigned"){ const me=user?.email?.toLowerCase(); base=tasks.filter(t=>assigneesOf(t).includes(me)); }
    else base=view==="myday"?myDay:view==="upcoming"?upcoming:myTasks;
    if(search) base=base.filter(t=>t.title.toLowerCase().includes(search.toLowerCase()));
    return byPosition(base);
  };

  const navItems=[
    {id:"myday",label:"My Day",icon:"sun",badge:myDay.filter(t=>!t.done).length},
    {id:"habits",label:"Habits",icon:"repeat",badge:habits.filter(h=>!h.log?.includes(todStr)).length||null},
    {id:"matrix",label:"Priority Matrix",icon:"grid",badge:null},
    {id:"upcoming",label:"Upcoming",icon:"arr",badge:upcoming.filter(t=>!t.done).length},
    {id:"calendar",label:"Calendar",icon:"cal",badge:null},
    {id:"assigned",label:"Assigned to me",icon:"user",badge:tasks.filter(t=>!t.done&&assigneesOf(t).includes(user?.email?.toLowerCase())).length||null},
    {id:"flagged",label:"Flagged",icon:"flag",badge:myTasks.filter(t=>t.starred&&!t.done).length},
    {id:"all",label:"All Tasks",icon:"layers",badge:null},
    {id:"messages",label:"Messages",icon:"chat",badge:messages.filter(m=>m.recipient_email===user?.email?.toLowerCase()&&!m.read).length||null,tint:"#ef4444"},
    {id:"notes",label:"Notes",icon:"note",badge:null},
  ];
  // Unified sidebar items (views + folders + shared) — all reorderable/groupable via SidebarTree.
  const sidebarItems=[
    ...navItems.filter(it=>!hiddenTabs.includes(it.id)).map(it=>({id:"n:"+it.id, view:it.id, label:it.label, icon:it.icon, iconType:"ico", badge:it.badge, tint:it.tint})),
    ...Object.entries(cats).map(([name,meta])=>({id:"c:"+name, view:"cat:"+name, label:name, icon:meta.icon, iconType:"cat", cap:true, badge:myTasks.filter(t=>t.tag===name&&!t.done).length})),
    ...sharedWithMe.map(s=>({id:"s:"+s.owner_id+":"+s.folder, view:"shared:"+s.owner_id+":"+s.folder, label:s.folder, icon:"🤝", iconType:"cat", cap:true, badge:tasks.filter(t=>t.owner===s.owner_id&&t.tag===s.folder&&!t.done).length, owner:s.owner_id, folder:s.folder, sub:idEmail[s.owner_id]?`from ${nickOf(idEmail[s.owner_id]).split("@")[0]}`:null})),
  ];
  // Whatever sits at the top of your sidebar is your home screen. Drag "Upcoming" above "My Day"
  // and Freely opens on Upcoming — on this device and, once prefs sync, on every other one.
  const homeView = firstTreeView(sidebarItems, navOrg);
  useEffect(()=>{
    if(hiddenTabs.includes(view)){ setView(homeView||"myday"); return; }   // you hid the tab you were on
    if(!viewPickedRef.current && homeView && homeView!==view) setView(homeView);
  },[homeView,hiddenTabs,view]);

  const addSidebarList=(name,icon,color)=>{ const n=(name||"").trim(); // typed capitalization is kept ("GoDo" stays "GoDo")
    if(!n||Object.keys(cats).some(k=>k.toLowerCase()===n.toLowerCase())) return false;
    setCats(c=>({...c,[n]:{color:color||CAT_COLORS[Object.keys(c).length%CAT_COLORS.length],icon:icon||guessIcon(n)}}));
    // The new list adopts existing tasks that already mention its name ("ACA essay" → the new "aca" list).
    const esc=n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
    const rx=new RegExp("(^|[^a-z0-9])"+esc+"($|[^a-z0-9])","i");
    const hits=tasks.filter(t=>t.owner===user?.id&&t.tag!==n&&rx.test(t.title));
    hits.forEach(t=>updateTask(t.id,{tag:n}));
    if(hits.length) showToast(`Moved ${hits.length} matching task${hits.length===1?"":"s"} into "${n}" 📁`);
    return true; };
  // Rename a list: carries its color/icon, moves every task's tag, keeps shares alive under the new name.
  const renameCat=(old,nuRaw)=>{
    const nu=(nuRaw||"").trim(); // typed capitalization is kept; a case-only rename ("godo" → "GoDo") is allowed
    if(!nu||nu===old) return false;
    if(nu.toLowerCase()!==old.toLowerCase() && Object.keys(cats).some(k=>k.toLowerCase()===nu.toLowerCase())){ showToast(`A list called "${nu}" already exists`); return false; }
    // Re-guess the icon on rename — but only when the new name has a real keyword match, and the old icon
    // looked auto (matched the old name's guess, the built-in default, or the plain fallback). Hand-picked icons stay.
    const guessedNew=guessIcon(nu,null);
    setCats(c=>{ const n={}; Object.entries(c).forEach(([k,v])=>{ if(k===old){
      const wasAuto=!v.icon||v.icon==="📁"||v.icon===guessIcon(old)||v.icon===DEFAULT_CATS[old]?.icon;
      const ic=(guessedNew&&(wasAuto||guessedNew!==guessIcon(old,null)))?guessedNew:v.icon;   // a hand-picked icon still gives way when the new name clearly means something else
      n[nu]={...v,icon:ic};
    } else n[k]=v; }); return n; });
    tasks.filter(t=>t.tag===old&&t.owner===user?.id).forEach(t=>updateTask(t.id,{tag:nu}));
    ownedShares.filter(s=>s.folder===old).forEach(s=>{ db.addShare(user.id,nu,s.shared_with_email,s.can_edit===false?"view":s.can_delete?"delete":"edit").then(()=>db.removeShare(s.id)).then(()=>refreshShares()).catch(()=>{}); });
    // Keep the sidebar-org id in sync ("c:old" → "c:new") so the list keeps its position/group.
    const oid="c:"+old,nid="c:"+nu;
    setNavOrg(o=>{ if(!o)return o; const order=(o.order||[]).map(x=>x===oid?nid:x); const parent={}; Object.entries(o.parent||{}).forEach(([k,v])=>{ parent[k===oid?nid:k]=v; }); return {...o,order,parent}; });
    if(view==="cat:"+old){ viewPickedRef.current=true; setView("cat:"+nu); }
    showToast(`Renamed "${old}" → "${nu}" ✓`);
    return true;
  };

  if(confirmFlow==="signup") return <SignupSuccess onContinue={()=>{ try{window.history.replaceState(null,"",window.location.pathname);}catch{} setConfirmFlow(null); }}/>;
  if(confirmFlow==="recovery") return <ResetPassword onDone={()=>{ try{window.history.replaceState(null,"",window.location.pathname);}catch{} setConfirmFlow(null); }}/>;
  if(authLoading) return <div style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#0c0e16",color:"#7a85a3",fontFamily:"'DM Sans',sans-serif"}}>Loading…</div>;
  if(!user) return <AuthScreen/>;

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:T.bg,color:T.text,height:"100%",display:"flex",overflow:"hidden",transition:"background .3s,color .3s"}}>
      <FontLink/>
      {focusTask&&zenOpen&&(
        <div style={{position:"fixed",inset:0,zIndex:1500,background:"linear-gradient(160deg,#0c0e16,#1b1038)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,color:"#eef0fa",padding:20}}>
          <style>{`@keyframes fsBreathe{0%,100%{transform:scale(1);opacity:.45}50%{transform:scale(1.12);opacity:1}}`}</style>
          <div style={{position:"relative",width:250,height:250,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{position:"absolute",inset:0,borderRadius:"50%",border:"2px solid rgba(192,132,252,.55)",animation:"fsBreathe 4s ease-in-out infinite"}}/>
            <div style={{position:"absolute",inset:26,borderRadius:"50%",border:"1.5px solid rgba(129,140,248,.4)",animation:"fsBreathe 4s ease-in-out infinite .6s"}}/>
            <div style={{fontFamily:"'Sora',sans-serif",fontSize:54,fontWeight:800,letterSpacing:"-1px"}}>{pmm}:{pms}</div>
          </div>
          <div style={{fontSize:12,color:"#7a85a3",letterSpacing:".5px",textTransform:"uppercase",fontWeight:700}}>Focusing on</div>
          <div style={{fontFamily:"'Sora',sans-serif",fontSize:19,fontWeight:700,maxWidth:"85%",textAlign:"center",lineHeight:1.35}}>🍅 {focusTask.title}</div>
          <div style={{display:"flex",gap:10,marginTop:10,flexWrap:"wrap",justifyContent:"center"}}>
            <button onClick={()=>setPomRun(r=>!r)} style={{padding:"9px 20px",borderRadius:10,border:"none",cursor:"pointer",background:pomRun?"rgba(255,255,255,.1)":T.grad,color:"#fff",fontSize:13,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>{pomRun?"⏸ Pause":"▶ Resume"}</button>
            <button onClick={()=>setZenOpen(false)} style={{padding:"9px 20px",borderRadius:10,border:"1px solid rgba(255,255,255,.15)",cursor:"pointer",background:"transparent",color:"#7a85a3",fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>Minimize</button>
            <button onClick={()=>{setPomRun(false);setFocusTask(null);setZenOpen(false);setPomSecs(pomLen*60);}} style={{padding:"9px 20px",borderRadius:10,border:"1px solid rgba(239,68,68,.35)",cursor:"pointer",background:"rgba(239,68,68,.12)",color:"#f87171",fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>End session</button>
          </div>
          <div style={{fontSize:11,color:"#7a85a3",marginTop:4}}>Breathe with the ring · finish the timer to earn +25 XP</div>
        </div>
      )}
            {tourStep>=0&&(()=>{
        // Four cards, and the one that matters is LIVE: you type a sentence and watch Freely read it.
        // Everything not on these cards is either obvious on sight or one tap away in the guide.
        const demo=parseNL(tourDemo);
        const TOUR=[
          ["⚡","Welcome to Freely","One calm place for everything you need to do. Three short cards and you're in — the rest you'll find by tapping around."],
          ["✨","Just type it — go on, try",(
            <div>
              <div style={{marginBottom:10}}>No date pickers. Write the whole thing as one sentence and the date, time, repeat and list come out of it. Typos are fine.</div>
              <input value={tourDemo} onChange={e=>setTourDemo(e.target.value)} placeholder="e.g. Dentist tomorrow 3pm" style={{width:"100%",boxSizing:"border-box",padding:"10px 12px",borderRadius:10,border:`1px solid ${T.accent}66`,background:T.surface2,color:T.text,fontSize:13,outline:"none",fontFamily:"'DM Sans',sans-serif"}}/>
              <div style={{display:"flex",flexWrap:"wrap",gap:5,justifyContent:"center",marginTop:8,minHeight:26}}>
                {tourDemo.trim()&&<span style={{padding:"3px 9px",borderRadius:8,background:T.surface3,color:T.text,fontSize:11,fontWeight:700}}>{demo.title}</span>}
                {demo.due&&<span style={{padding:"3px 9px",borderRadius:8,background:T.accentGlow,color:T.accent,fontSize:11,fontWeight:700}}>📅 {fmtDate(demo.due)}</span>}
                {demo.time&&<span style={{padding:"3px 9px",borderRadius:8,background:T.accentGlow,color:T.accent,fontSize:11,fontWeight:700}}>⏰ {fmtClock(demo.time)}{demo.endTime?` – ${fmtClock(demo.endTime)}`:""}</span>}
                {demo.recurring&&<span style={{padding:"3px 9px",borderRadius:8,background:T.accentGlow,color:T.accent,fontSize:11,fontWeight:700}}>🔁 {demo.recurring.startsWith("custom:")?"repeats":demo.recurring}</span>}
              </div>
              <div style={{fontSize:11,color:T.textMuted,marginTop:6}}>Try “pay rent every month”, “gym sat 10am”, or “essay in 2 weeks”.</div>
            </div>
          )],
          ["👆","Two gestures, that's all",(
            <div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,margin:"4px 0 10px",fontSize:12,fontWeight:700}}>
                <span style={{color:T.danger}}>🗑 ←</span>
                <span style={{padding:"8px 14px",borderRadius:10,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontWeight:600}}>a task</span>
                <span style={{color:T.warning}}>→ ☀️</span>
              </div>
              <div>Swipe <b>left</b> to delete, <b>right</b> to add it to My Day. To reorder, {COARSE?"hold a task for a moment, then drag":"hold a task — or just pull it up or down"}. A line shows where it will land.</div>
            </div>
          )],
          ["🏁","That's genuinely it","The tab at the top of your sidebar is the screen Freely opens on — drag your favourite up there. Sharing, teams, habits, focus and everything else are in Settings → 📖 whenever you want them."],
        ];
        const [em,ti,body]=TOUR[tourStep]; const last=tourStep===TOUR.length-1;
        const endTour=()=>{ try{localStorage.setItem("fs_tour","1");}catch{} setTourStep(-1); };
        return (
        <div style={{position:"fixed",inset:0,zIndex:2500,background:"rgba(5,6,12,.72)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{width:400,maxWidth:"94vw",maxHeight:"90vh",overflowY:"auto",background:T.surface,border:`1px solid ${T.border}`,borderRadius:20,padding:"24px 22px 18px",textAlign:"center",boxShadow:"0 24px 80px rgba(0,0,0,.5)"}}>
            <div style={{fontSize:42,marginBottom:8}}>{em}</div>
            <div style={{fontFamily:"'Sora',sans-serif",fontSize:19,fontWeight:800,marginBottom:8}}>{ti}</div>
            <div style={{fontSize:13,color:T.textMuted,lineHeight:1.6,minHeight:62}}>{body}</div>
            <div style={{display:"flex",justifyContent:"center",gap:6,margin:"14px 0"}}>
              {TOUR.map((_,i)=><span key={i} style={{width:i===tourStep?18:7,height:7,borderRadius:4,background:i===tourStep?T.accent:T.surface3,transition:"all .25s"}}/>)}
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={endTour} style={{flex:1,padding:"10px",borderRadius:10,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>Skip</button>
              <button onClick={()=>last?endTour():setTourStep(s=>s+1)} style={{flex:2,padding:"10px",borderRadius:10,border:"none",background:T.grad,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>{last?"Let's go ⚡":"Next"}</button>
            </div>
          </div>
        </div>
        );})()}
      {toast&&(
        <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",zIndex:2000,display:"flex",alignItems:"center",gap:12,background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"10px 14px",boxShadow:"0 10px 30px rgba(0,0,0,.4)",animation:"slideIn .2s ease",maxWidth:"90vw"}}>
          <span style={{fontSize:13,color:T.text}}>{toast.msg}</span>
          {toast.undo&&<button onClick={toast.undo} style={{background:T.accentGlow,color:T.accent,border:"none",borderRadius:7,padding:"4px 12px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>Undo</button>}
          <button onClick={()=>setToast(null)} style={{background:"none",border:"none",cursor:"pointer",color:T.textMuted,display:"flex"}}><Ico n="x" s={13}/></button>
        </div>
      )}
      {aboutOpen&&<AboutModal T={T} onClose={()=>setAboutOpen(false)} onHelp={()=>{setAboutOpen(false);setHelpOpen(true);}}/>}
      {helpOpen&&<HelpGuide T={T} onClose={()=>setHelpOpen(false)}
        onReplayTour={()=>{ setHelpOpen(false); setTourStep(0); }}
        onSamples={()=>{ setHelpOpen(false); addSamplesAgain(); }}/>}
      {imgView&&<ImgViewer T={T} url={imgView} onClose={()=>setImgView(null)}/>}
      {delCatModal&&<DelCatModal T={T} name={delCatModal} count={tasks.filter(t=>t.owner===user?.id&&t.tag===delCatModal).length} onConfirm={a=>confirmDeleteCat(delCatModal,a)} onClose={()=>setDelCatModal(null)}/>}
      {linkPick&&<LinkPicker T={T} tasks={myTasks.filter(t=>!t.done)} onPick={t=>{linkPick.onPick(t);setLinkPick(null);}} onClose={()=>setLinkPick(null)}/>}
      {cmdOpen&&<CmdPalette T={T} tasks={tasks} notes={notes} onClose={()=>setCmdOpen(false)} onGo={v=>{navTo(v);setCmdOpen(false);}} onAdd={t=>{setInput(t);setCmdOpen(false);setTimeout(()=>inputRef.current?.focus(),80);}} onPickTask={t=>{keepSelRef.current=true;navTo("all");setSelTask(t);setCmdOpen(false);}}/>}
      {/* Drawer backdrop — phone only. Tap anywhere off the sidebar to put it away. */}
      {narrow&&sideOpen&&<div onClick={()=>setSideOpen(false)} style={{position:"fixed",inset:0,zIndex:55,background:"rgba(5,6,12,.55)",animation:"fadeIn .15s ease"}}/>}
      <aside onPointerDown={sideSwipe} style={{width:sideOpen?(narrow?272:224):60,transition:narrow?"none":"width .3s cubic-bezier(.4,0,.2,1)",background:T.sidebar,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",overflow:"hidden",flexShrink:0,zIndex:narrow&&sideOpen?60:30,touchAction:"pan-y",userSelect:"none",WebkitUserSelect:"none",WebkitTouchCallout:"none",
        ...(narrow&&sideOpen?{position:"fixed",top:0,bottom:0,left:0,maxWidth:"84vw",boxShadow:"0 0 48px rgba(0,0,0,.6)",animation:"slideIn .18s ease"}:null)}}>
        <div style={{padding:"18px 14px",display:"flex",alignItems:"center",gap:9}}>
          <button onClick={()=>setAboutOpen(true)} title="About Freely" style={{display:"flex",alignItems:"center",gap:9,background:"none",border:"none",cursor:"pointer",padding:0,flex:1,minWidth:0}}>
            {/* App logo: /public/logo.png when present; falls back to the ⚡ gradient if the file is missing. */}
            <div style={{position:"relative",width:30,height:30,borderRadius:9,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 3px 12px ${T.accent}55`,overflow:"hidden"}}>
              <Ico n="zap" s={14} c="#fff"/>
              {/* logo-128 is pre-downscaled with a proper resampler so it stays crisp at icon size (the raw 1097px file goes mushy when the browser shrinks it 36×). */}
              <img src="/logo-128.png" alt="" onError={e=>{ if(!e.currentTarget.dataset.f){e.currentTarget.dataset.f="1";e.currentTarget.src="/logo.png";} else e.currentTarget.style.display="none"; }} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
            </div>
            {sideOpen&&<span style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,letterSpacing:"-.4px",background:`linear-gradient(90deg,${T.accent},${T.accentAlt})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",whiteSpace:"nowrap"}}>Freely</span>}
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
          <SidebarTree T={T} sideOpen={sideOpen} items={sidebarItems} view={view} onOpen={goView} org={navOrg} setOrg={setNavOrg} onAddList={addSidebarList} onRenameList={renameCat} onShareFolder={shareFolder} onUnshare={unshareFolder} ownedShares={ownedShares} onDeleteList={deleteCat} setCats={setCats} cats={cats} onAssignAll={assignAllInLists} assignGroups={allGroups} onUploadIcon={uploadCatIcon} onLeaveShare={leaveShare}/>
        </nav>
        {sideOpen&&(
          <div style={{padding:"10px 12px"}}>
            <div style={{background:T.surface2,borderRadius:11,padding:12,border:`1px solid ${T.border}`,...(pomRun?{animation:"glow 2s infinite"}:{})}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:10,color:T.textMuted,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase"}}>Pomodoro</span>
                <button onClick={cyclePom} title={pomRun?"":"Tap to change length"} style={{background:"none",border:"none",cursor:pomRun?"default":"pointer",padding:0,display:"flex",alignItems:"center",gap:3,color:pomRun?T.accent:T.textMuted,fontSize:9,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>{!pomRun&&<span>{pomLen}m</span>}<Ico n="clock" s={12} c={pomRun?T.accent:T.textMuted}/></button>
              </div>
              {focusTask&&(
                <div onClick={()=>setZenOpen(true)} title="Tap to go full-screen zen" style={{display:"flex",alignItems:"center",gap:5,marginBottom:6,padding:"4px 8px",borderRadius:7,background:T.accentGlow,border:`1px solid ${T.accent}33`,cursor:"pointer"}}>
                  <span style={{fontSize:10}}>🍅</span>
                  <span style={{flex:1,minWidth:0,fontSize:10,fontWeight:700,color:T.accent,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{focusTask.title}</span>
                  <button onClick={e=>{e.stopPropagation();setFocusTask(null);setZenOpen(false);}} title="Stop focusing" style={{background:"none",border:"none",cursor:"pointer",color:T.textMuted,display:"flex",padding:0}}><Ico n="x" s={10}/></button>
                </div>
              )}
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
          <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"center"}}>
            {syncing&&<div style={{width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:6,height:6,borderRadius:"50%",background:T.accent,animation:"pulse 1s infinite"}}/></div>}
            {!sideOpen&&<SB T={T} onClick={()=>goView("settings")}><Ico n="cog" s={14} c={view==="settings"?T.accent:undefined}/></SB>}
            {!sideOpen&&<SB T={T} onClick={()=>goView("analytics")}><Ico n="bar" s={14} c={view==="analytics"?T.accent:undefined}/></SB>}
            <SB T={T} onClick={()=>setShowSearch(s=>!s)}><Ico n="search" s={14}/></SB>
            <SB T={T} onClick={()=>setDark(d=>!d)}><Ico n={dark?"sun":"moon"} s={14}/></SB>
            <SB T={T} onClick={()=>setSideOpen(s=>!s)}><Ico n="menu" s={14}/></SB>
          </div>
        </div>
      </aside>
      <main style={{flex:1,minWidth:0,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{background:T.surface2,borderBottom:`1px solid ${T.border}`,padding:"5px 20px",display:"flex",alignItems:"center",gap:16,flexShrink:0}}>
          <button onClick={()=>setCmdOpen(true)} style={{display:"flex",alignItems:"center",gap:5,background:"none",border:"none",cursor:"pointer",color:T.textMuted,fontSize:11,fontFamily:"'DM Sans',sans-serif"}}>
            <span style={{background:T.surface3,border:`1px solid ${T.border}`,padding:"1px 6px",borderRadius:4,fontSize:10,fontWeight:600}}>⌘K</span>
            <span>Command Palette</span>
          </button>
          <span style={{marginLeft:"auto",fontSize:11,color:T.textMuted}}>{myTasks.filter(t=>!t.done).length} tasks remaining</span>
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
          {view==="matrix"&&<MatrixView T={T} tasks={tasks} cats={cats} updateTask={updateTask} deleteTask={deleteTask} addMatrixTask={addMatrixTask} toggleMyDay={toggleMyDay} isInMyDay={inMyDay} canvasNotes={canvasNotes} setCanvasNotes={setCanvasNotes} onCanvasToTask={addCanvasTask} requestLink={requestLink} onCanvasToNote={linkIdeaToTask} onOpenTask={setSelTask} selId={selTask?.id}/>}
          {view==="matrix"&&selTask&&<TDetail task={selTask} T={T} cats={cats} onUpdate={updateTask} onDelete={id=>{deleteTask(id);setSelTask(null);}} onDuplicate={duplicateTask} onAttach={attachFiles} onRemoveAttach={removeAttach} onSetReminder={setReminder} canDelete={canDeleteTask(selTask)} onViewImage={setImgView} onClose={()=>setSelTask(null)} onFocus={startFocus}/>}
          {view==="notes"&&<NotesView T={T} notes={notes} setNotes={setNotes} tasks={myTasks} requestLink={requestLink} onLinkNote={foldNoteIntoTask} onClearTaskNotes={id=>updateTask(id,{notes:""})} onGoToTask={t=>{keepSelRef.current=true;navTo("all");setSelTask(t);}}/>}
          {view==="habits"&&<HabitsView T={T} habits={habits} setHabits={setHabits} todStr={todStr} showToast={showToast} onCheckin={key=>{awardXp("habit-"+key+"-"+todStr,15);markActiveDay();navigator.vibrate?.(20);}}/>}
          {view==="calendar"&&<CalendarView T={T} tasks={myTasks} cats={cats} todStr={todStr} onToggle={toggleTask} onToggleStep={toggleStep} onQuickAdd={addCalendarTask} onMoveTask={moveTaskDay} onMoveStep={moveStep} onOpenTask={t=>{keepSelRef.current=true;navTo("all");setSelTask(t);}}/>}
          {view==="analytics"&&<AnalyticsView T={T} tasks={tasks} xp={xp} level={level} streak={streak} habits={habits} dayStats={allStats} todStr={todStr}/>}
          {view==="settings"&&<SettingsView T={T} dark={dark} setDark={setDark} scheme={scheme} setScheme={setScheme} sound={sound} setSound={setSound} onExport={exportData} onImport={importData} onClearCompleted={clearCompleted} ownedShares={ownedShares} onUnshare={unshareFolder} deletedCats={deletedCats} pomLen={pomLen} onPomLen={m=>{ setPomLen(m); if(!pomRun) setPomSecs(m*60); }} onRestoreCat={restoreCat} onPurgeCat={purgeCat} navTabs={navItems.map(n=>({id:n.id,label:n.label}))} hiddenTabs={hiddenTabs} setHiddenTabs={setHiddenTabs} knownPeople={knownPeople} teams={sGroups} myEmail={meEmail} myId={user?.id} onTeamCreate={createTeam} onTeamAddMember={addTeamMember} onTeamRemoveMember={removeTeamMember} onTeamDelete={deleteTeam} myAvatar={myAvatar} onPickAvatar={pickAvatar} newAtBottom={newAtBottom} setNewAtBottom={setNewAtBottom} onHelp={()=>setHelpOpen(true)}/>}
          {(["myday","flagged","upcoming","all","assigned"].includes(view)||view.startsWith("cat:")||view.startsWith("shared:"))&&(
            <TaskPanel T={T} tasks={getViewTasks()} view={view} input={input} setInput={setInput} inputRef={inputRef} addTask={addTask} toggleTask={toggleTask} deleteTask={deleteTask} updateTask={updateTask} reorderTasks={reorderTasks} duplicateTask={duplicateTask} selTask={selTask} setSelTask={setSelTask} newAnim={newAnim} cats={cats} onUndoCarry={undoCarry} carriedCount={carriedIds.length} suggestions={mydaySuggestions} onAddToMyDay={addToMyDay} onAttach={attachFiles} onRemoveAttach={removeAttach} onSetReminder={setReminder} onToggleMyDay={toggleMyDay} isInMyDay={inMyDay} todStr={todStr} canDeleteFn={canDeleteTask} canEditFn={canEditTask} onClearDone={clearDone} onViewImage={setImgView} onFocusTask={startFocus} mydayHabits={habitsToday} onHabitToggle={toggleHabitToday} onRenameList={renameCat} myEmail={meEmail} people={knownPeople} peopleGroups={allGroups} listPeople={collaboratorsOf} onAssign={(id,list)=>updateTask(id,{assignedTo:(list&&list.length)?[...new Set(list.map(e=>e.toLowerCase()))].join(","):null})}
              sortMode={sortMode} setSortMode={setSortMode} showToast={showToast} onHelp={()=>setHelpOpen(true)}
              sharedInfo={sharedViewInfo} onLeaveShare={sharedViewInfo?()=>leaveShare(sharedViewInfo.owner,sharedViewInfo.folder):null}
              listManage={{ownedShares, onShare:shareFolder, onUnshare:unshareFolder, onDelete:deleteCat, setCats, onAssignAll:assignAllInLists, assignGroups:allGroups, onUploadIcon:uploadCatIcon}}/>
          )}
          {view==="messages"&&<MessagesView T={T} myEmail={meEmail} messages={messages} people={knownPeople} groups={sGroups} reqs={chatReqs} trusted={trusted} peer={dmPeer} onOpenPeer={openDM} onSend={sendDM} onAnswerReq={answerReq} onStartChat={startChat} onOpenTeams={()=>goView("settings")}/>}
        </div>
      </main>
      {!selTask&&(["myday","flagged","upcoming","all","assigned"].includes(view)||view.startsWith("cat:")||view.startsWith("shared:"))&&(
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

function AboutModal({T,onClose,onHelp}) {
  const socials=[
    {label:"Instagram", handle:"@freelytodo", href:"https://instagram.com/freelytodo", emoji:"📷"},
  ];
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:1200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{width:360,maxWidth:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:18,padding:26,boxShadow:"0 24px 60px rgba(0,0,0,.5)",animation:"slideIn .2s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{position:"relative",width:40,height:40,borderRadius:11,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 16px ${T.accent}55`,overflow:"hidden"}}>
              <Ico n="zap" s={20} c="#fff"/>
              <img src="/logo-128.png" alt="" onError={e=>{ if(!e.currentTarget.dataset.f){e.currentTarget.dataset.f="1";e.currentTarget.src="/logo.png";} else e.currentTarget.style.display="none"; }} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
            </div>
            <div>
              <div style={{fontFamily:"'Sora',sans-serif",fontSize:18,fontWeight:700,color:T.text}}>Freely</div>
              <div style={{fontSize:11,color:T.textMuted}}>Focus. Flow. Finish.</div>
            </div>
          </div>
          <button onClick={onClose} style={{width:26,height:26,borderRadius:7,border:"none",cursor:"pointer",background:T.surface2,color:T.textMuted,display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" s={13}/></button>
        </div>
        <p style={{fontSize:12,color:T.textMuted,lineHeight:1.6,marginBottom:14}}>Your all-in-one space for tasks, priorities, notes and focus. Thanks for being here 💜</p>
        {onHelp&&(
          <button onClick={onHelp} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",marginBottom:10,borderRadius:10,border:`1px solid ${T.accent}55`,background:T.accentGlow,color:T.accent,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textAlign:"left"}}>
            <span style={{fontSize:16}}>📖</span>
            <span style={{fontSize:13,fontWeight:700,flex:1}}>How Freely works</span>
            <span style={{fontSize:12,opacity:.7}}>›</span>
          </button>
        )}
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {socials.map(s=>(
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,border:`1px solid ${T.border}`,background:T.surface2,textDecoration:"none",color:T.text}}>
              <span style={{fontSize:16}}>{s.emoji}</span>
              <span style={{fontSize:13,fontWeight:600,flex:1}}>{s.label}</span>
              <span style={{fontSize:12,color:T.textMuted}}>{s.handle}</span>
            </a>
          ))}
        </div>
        <div style={{fontSize:10,color:T.textMuted,textAlign:"center",marginTop:16,opacity:.6}}>v1.0 · made with Freely</div>
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
        <button onClick={()=>downloadFile(url,"photo-"+Date.now()+".png")} style={{padding:"8px 16px",borderRadius:9,border:"none",background:T.grad,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>⬇ Download</button>
        <a href={url} target="_blank" rel="noreferrer" style={{padding:"8px 16px",borderRadius:9,border:`1px solid rgba(255,255,255,.25)`,color:"#fff",textDecoration:"none",fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>Open ↗</a>
        <button onClick={onClose} style={{padding:"8px 16px",borderRadius:9,border:`1px solid rgba(255,255,255,.25)`,background:"transparent",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>Close</button>
      </div>
    </div>
  );
}

function CmdPalette({T,tasks,notes=[],onClose,onGo,onAdd,onPickTask}) {
  const [q,setQ]=useState("");
  const PAGES={myday:"My Day",upcoming:"Upcoming",calendar:"Calendar",all:"All Tasks",matrix:"Priority Matrix",habits:"Habits",notes:"Notes",messages:"Messages",analytics:"Analytics",settings:"Settings"};
  const pages=Object.keys(PAGES);
  const ql=q.toLowerCase();
  const ft=tasks.filter(t=>!t.done&&q&&t.title.toLowerCase().includes(ql)).slice(0,4);
  const fn=notes.filter(n=>q&&((n.title||"").toLowerCase().includes(ql)||(n.body||"").toLowerCase().includes(ql))).slice(0,3);
  const fp=pages.filter(p=>p.includes(ql)||PAGES[p].toLowerCase().includes(ql));
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:1000,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:110}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{width:500,maxWidth:"94vw",background:T.surface,border:`1px solid ${T.accent}44`,borderRadius:16,overflow:"hidden",boxShadow:"0 24px 60px rgba(0,0,0,.5)",animation:"slideIn .2s ease"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"13px 16px",borderBottom:`1px solid ${T.border}`}}>
          <Ico n="search" s={16} c={T.textMuted}/>
          <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search tasks, navigate…" style={{flex:1,background:"none",border:"none",outline:"none",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:15}} onKeyDown={e=>e.key==="Escape"&&onClose()}/>
          <kbd style={{fontSize:10,color:T.textMuted,background:T.surface2,padding:"2px 6px",borderRadius:4,border:`1px solid ${T.border}`}}>ESC</kbd>
        </div>
        <div style={{maxHeight:300,overflowY:"auto"}}>
          {fp.length>0&&<CS label="Navigate">{fp.slice(0,4).map(p=><CR key={p} icon="arr" label={`Go to ${PAGES[p]}`} T={T} onClick={()=>onGo(p)}/>)}</CS>}
          {ft.length>0&&<CS label="Tasks">{ft.map(t=><CR key={t.id} icon="check" label={t.title} sub={t.due?fmtDate(t.due):""} T={T} onClick={()=>{onPickTask?onPickTask(t):onClose();}}/>)}</CS>}
          {fn.length>0&&<CS label="Notes">{fn.map(n=><CR key={n.id} icon="note" label={n.title||"Untitled"} sub={(n.body||"").slice(0,24)} T={T} onClick={()=>onGo("notes")}/>)}</CS>}
          {q&&<CS label="Create"><CR icon="plus" label={`Add task: "${q}"`} T={T} onClick={()=>onAdd(q)}/></CS>}
          {!q&&<CS label="Quick Nav">{["myday","matrix","analytics","notes"].map(p=><CR key={p} icon="arr" label={`Go to ${PAGES[p]}`} T={T} onClick={()=>onGo(p)}/>)}</CS>}
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

function TaskPanel({T,tasks,view,input,setInput,inputRef,addTask,toggleTask,deleteTask,updateTask,reorderTasks,duplicateTask,selTask,setSelTask,newAnim,cats,onUndoCarry,carriedCount,suggestions,onAddToMyDay,onAttach,onRemoveAttach,onSetReminder,onToggleMyDay,todStr,canDeleteFn,onClearDone,onViewImage,onFocusTask,mydayHabits=[],onHabitToggle,onRenameList,myEmail,people=[],onAssign,peopleGroups=[],listPeople=null,sharedInfo=null,onLeaveShare=null,listManage=null,sortMode="due",setSortMode,showToast,onHelp,canEditFn=null,isInMyDay}) {
  const narrow=useNarrow();
  const readOnly=!!(sharedInfo&&sharedInfo.canEdit===false);   // a view-only share: no add box, no ticking, no swiping
  const [manageMode,setManageMode]=useState(null); // "edit" (name/icon/color) | "share" (share/assign)
  const [collabOpen,setCollabOpen]=useState(false);
  const [filter,setFilter]=useState("all");
  const [catFilter,setCatFilter]=useState(null);
  const sort=sortMode==="smart"?"manual":sortMode; // (older devices saved "smart" for the manual order)
  const [showSugg,setShowSugg]=useState(false); // folded by default — your own tasks come first
  const [dragId,setDragId]=useState(null);
  const [drop,setDrop]=useState(null); // {id,before} — where the dragged card will land
  const [swipeId,setSwipeId]=useState(null);
  const [swipeX,setSwipeX]=useState(0);
  const dragIdRef=useRef(null);
  const dropRef=useRef(null);
  const didDragRef=useRef(false);
  const labels={myday:"My Day",flagged:"Flagged",upcoming:"Upcoming",all:"All Tasks",assigned:"Assigned to me"};
  const catKey=view.startsWith("cat:")?view.slice(4):null;
  const sharedKey=view.startsWith("shared:")?view.slice(view.indexOf(":",7)+1):null;   // "shared:<owner>:<list>" — the list name may itself contain ":"
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
    else if(sort==="due") a.sort((x,y)=>{if(!x.due&&!y.due)return 0;if(!x.due)return 1;if(!y.due)return -1;return dueKey(x).localeCompare(dueKey(y));});
    return a;
  };
  const dayTotal=view==="myday"?tasks.length:0;
  const dayDone=view==="myday"?tasks.filter(t=>t.done).length:0;
  const dayPct=dayTotal?Math.round(dayDone/dayTotal*100):0;

  const canReorder = sort==="manual";
  const beginReorder=id=>{
    // Hand-arranging is only meaningful in "My order". In any other sort the list re-sorts itself
    // the moment you let go, so the drag is refused outright rather than quietly changing your sort.
    if(!canReorder){ navigator.vibrate?.(8); showToast?.("Dragging only works in “My order” — change the sort above to arrange by hand ✋"); return; }
    if(canEditFn){ const tk=tasks.find(x=>String(x.id)===String(id)); if(tk&&!canEditFn(tk)) return; }
    didDragRef.current=true; dragIdRef.current=id; setDragId(id); navigator.vibrate?.(20);
    const t=tasks.find(x=>String(x.id)===String(id));
    const ghost=makeDragGhost(t?t.title:"Task",T.accent,T);
    runDrag(
      ev=>{ ghost.move(ev.clientX,ev.clientY);
        const el=document.elementFromPoint(ev.clientX,ev.clientY); const card=el&&el.closest("[data-task-id]");
        let hit=null;
        if(card){ const cid=card.getAttribute("data-task-id");
          if(cid!==String(id)){
            const r=card.getBoundingClientRect(), mid=r.top+r.height/2;
            // A dead band around the midpoint. Without it the smallest wobble of a finger flips
            // above/below over and over and the marker twitches between two slots.
            const band=Math.min(14,r.height*0.2), prev=dropRef.current;
            const before=(prev&&prev.id===cid)
              ? (ev.clientY<mid-band ? true : ev.clientY>mid+band ? false : prev.before)
              : ev.clientY<mid;
            hit={id:cid,before};
          } }
        dropRef.current=hit; setDrop(hit); },
      ()=>{ ghost.remove(); const from=dragIdRef.current,to=dropRef.current;
        if(from!=null&&to) reorderTasks(from,to.id,to.before);
        dragIdRef.current=null; dropRef.current=null; setDragId(null); setDrop(null); }
    );
  };
  // Swipe travel is capped short (±95). Pulling far past it AND moving vertically hands over to
  // reorder-drag — a pure horizontal fling (a fast delete/My-Day swipe) always stays a swipe.
  // Sideways is ONLY ever My Day / delete — a swipe never turns into a drag, however far it travels.
  const beginSwipe=(id,sx)=>{
    didDragRef.current=true; setSwipeId(id); document.body.style.userSelect="none";
    const done=()=>{ window.removeEventListener("pointermove",mv); window.removeEventListener("pointerup",up); window.removeEventListener("pointercancel",up); document.body.style.userSelect=""; };
    let lastDx=0;
    const mv=ev=>{ lastDx=ev.clientX-sx; setSwipeX(Math.max(-95,Math.min(lastDx,95))); };
    // Only a real release counts, and only where the finger was LAST SEEN. A pointercancel (the
    // browser taking the touch over to scroll) reports clientX 0 — read as a full swipe left, it
    // deleted tasks under a plain scroll, faster than anyone could react.
    const up=ev=>{
      done();
      const dx=ev.type==="pointercancel"?0:lastDx;
      if(dx>60){ navigator.vibrate?.(20); onToggleMyDay?.(id); }
      else if(dx<-60){ navigator.vibrate?.(25); deleteTask(id); }
      setSwipeId(null); setSwipeX(0);
    };
    window.addEventListener("pointermove",mv); window.addEventListener("pointerup",up); window.addEventListener("pointercancel",up);
  };
  // Card body gestures: desktop → drag vertically anywhere to reorder, horizontally to swipe.
  // Mobile → quick horizontal = swipe, quick vertical = scroll, press-and-hold anywhere = reorder.
  // (The grip handle also reorders, for discoverability.)
  const onCardDown=(e,id)=>{
    if(e.target.closest("button,[data-grip]")) return;
    if(canEditFn){ const tk=tasks.find(x=>String(x.id)===String(id)); if(tk&&!canEditFn(tk)) return; }   // view-only: a tap opens it, nothing else
    didDragRef.current=false;
    const sx=e.clientX, sy=e.clientY, type=e.pointerType;
    let decided=false, timer=null, moved=0;
    const teardown=()=>{ clearTimeout(timer); window.removeEventListener("pointermove",probe); window.removeEventListener("pointerup",end); window.removeEventListener("pointercancel",end); };
    // Two ways to pick a card up: hold it still, or pull it ALONG the list (vertically). Pulling ACROSS
    // the list is always My Day / delete, so the two gestures can never be mistaken for each other.
    const probe=ev=>{
      if(decided) return;
      const dx=ev.clientX-sx, dy=ev.clientY-sy;
      moved=Math.max(moved,Math.hypot(dx,dy));
      if(moved>8) clearTimeout(timer);            // it moved, so it is no longer a long-press
      if(Math.abs(dx)<8 && Math.abs(dy)<8) return;
      decided=true; teardown();
      if(Math.abs(dx)>Math.abs(dy)) beginSwipe(id,sx);  // across the list → My Day / delete
      else if(type==="mouse") beginReorder(id);         // along the list → reorder
      // touch + vertical belongs to the scroller; hold still to reorder by finger
    };
    const end=()=>teardown();
    timer=setTimeout(()=>{ if(!decided&&moved<=8){ decided=true; teardown(); beginReorder(id); } }, 250);
    window.addEventListener("pointermove",probe); window.addEventListener("pointerup",end); window.addEventListener("pointercancel",end);
  };
  const gripDown=(e,id)=>{ e.stopPropagation(); e.preventDefault(); beginReorder(id); };
  const selectCard=task=>{ if(didDragRef.current){ didDragRef.current=false; return; } setSelTask(task); };
  return (
    <div style={{flex:1,display:"flex",overflow:"hidden"}}>
      <div onClick={e=>{ if(selTask && !e.target.closest("[data-task-id],button,input,select,textarea,a")) setSelTask(null); }} style={{flex:1,minWidth:0,overflowY:"auto",padding:narrow?"16px 13px":"22px 26px",paddingBottom:86,display:(narrow&&selTask)?"none":"block"}}>
        <div style={{marginBottom:18}}>
          {view==="myday"&&<div style={{fontSize:12,color:T.textMuted,fontWeight:500,marginBottom:3}}>{new Date().getHours()<12?"Good morning 🌤":new Date().getHours()<17?"Keep it up 💪":"Good evening 🌙"}</div>}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0,flexGrow:1}}>
              <h1 onClick={()=>{ if(catKey&&listManage) setManageMode("edit"); }} title={catKey&&listManage?"Tap to edit this list — name, icon, color":undefined} style={{fontFamily:"'Sora',sans-serif",fontSize:narrow?19:22,fontWeight:700,letterSpacing:"-.5px",display:"flex",alignItems:"center",gap:8,minWidth:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",cursor:catKey&&listManage?"pointer":"default"}}>{titleIcon&&<CatIcon icon={titleIcon} size={20}/>}{titleText}{catKey&&listManage&&<Ico n="edit" s={13} c={T.textMuted} st={{opacity:.5}}/>}</h1>
              {catKey&&listManage&&(
                <button onClick={()=>setManageMode("share")} title="Share this list & assign people" style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 12px",borderRadius:20,border:`1px solid ${T.accent}55`,background:T.accentGlow,color:T.accent,cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>🤝 Share</button>
              )}
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
            {(
              <select value={sort} onChange={e=>setSortMode?.(e.target.value)} title="Your choice is remembered on every device" style={{fontSize:11,color:T.textMuted,background:T.surface2,border:`1px solid ${T.border}`,borderRadius:8,padding:"4px 8px",fontFamily:"'DM Sans',sans-serif",outline:"none",cursor:"pointer"}}>
                <option value="due">By due date</option>
                <option value="priority">By priority</option>
                <option value="az">A → Z</option>
                <option value="manual">My order (drag)</option>
              </select>
            )}
          </div>
          <div style={{fontSize:12,color:T.textMuted,marginTop:2}}>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}{view==="myday"&&` · ${tasks.filter(t=>!t.done).length} remaining`}</div>
          {sharedKey&&(
            <div style={{fontSize:11,color:T.textMuted,marginTop:4,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <span>🤝 Shared by <b style={{color:T.text}}>{sharedInfo?.nick||"a collaborator"}</b>{sharedInfo?.email&&sharedInfo.nick!==sharedInfo.email?` (${sharedInfo.email})`:""}</span>
              {readOnly&&<span title="You can see this list but not change it" style={{fontSize:9,fontWeight:800,color:T.warning,background:T.warning+"22",padding:"2px 8px",borderRadius:8}}>👀 VIEW ONLY</span>}
              <button onClick={()=>setCollabOpen(true)} style={{padding:"2px 10px",borderRadius:8,border:`1px solid ${T.accent}55`,background:T.accentGlow,color:T.accent,cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>👥 Collaborators</button>
              {onLeaveShare&&<button onClick={()=>{ if(window.confirm("Leave this shared list? You'll stop seeing its tasks.")) onLeaveShare(); }} style={{padding:"2px 10px",borderRadius:8,border:`1px solid ${T.danger}44`,background:T.danger+"11",color:T.danger,cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>Leave ✕</button>}
            </div>
          )}
        </div>
        {collabOpen&&sharedKey&&(()=>{
          const assignees=[...new Set(tasks.flatMap(t=>assigneesOf(t)))].filter(e=>e&&e!==sharedInfo?.email&&e!==myEmail);
          return (
            <div onClick={()=>setCollabOpen(false)} style={{position:"fixed",inset:0,zIndex:2600,background:"rgba(5,6,12,.6)",display:"flex",alignItems:"center",justifyContent:"center",padding:18}}>
              <div onClick={e=>e.stopPropagation()} style={{width:320,maxWidth:"94vw",maxHeight:"80vh",overflowY:"auto",background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,padding:18,boxShadow:"0 24px 80px rgba(0,0,0,.5)",fontFamily:"'DM Sans',sans-serif"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <span style={{fontSize:18}}>👥</span>
                  <div style={{flex:1,fontSize:15,fontWeight:800,fontFamily:"'Sora',sans-serif"}}>People on this list</div>
                  <button onClick={()=>setCollabOpen(false)} style={{width:26,height:26,borderRadius:7,border:"none",cursor:"pointer",background:T.surface2,color:T.textMuted,display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" s={13}/></button>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {sharedInfo?.email&&(
                    <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:9,background:T.surface2,border:`1px solid ${T.border}`}}>
                      <Avatar email={sharedInfo.email} size={24}/>
                      <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:700,color:T.text}}>{sharedInfo.nick}</div><div style={{fontSize:9,color:T.textMuted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sharedInfo.email}</div></div>
                      <span style={{fontSize:8,fontWeight:700,color:T.accent,background:T.accentGlow,padding:"2px 7px",borderRadius:8}}>OWNER</span>
                    </div>
                  )}
                  {myEmail&&(
                    <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:9,background:T.surface2,border:`1px solid ${T.border}`}}>
                      <Avatar email={myEmail} size={24}/>
                      <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:700,color:T.text}}>You</div><div style={{fontSize:9,color:T.textMuted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{myEmail}</div></div>
                    </div>
                  )}
                  {assignees.map(em=>(
                    <div key={em} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:9,background:T.surface2,border:`1px solid ${T.border}`}}>
                      <Avatar email={em} size={24}/>
                      <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:700,color:T.text}}>{nickOf(em).split("@")[0]}</div><div style={{fontSize:9,color:T.textMuted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{em}</div></div>
                      <span style={{fontSize:8,fontWeight:700,color:T.textMuted,background:T.surface3,padding:"2px 7px",borderRadius:8}}>ASSIGNED</span>
                    </div>
                  ))}
                </div>
                <div style={{fontSize:9,color:T.textMuted,marginTop:10,lineHeight:1.5}}>Shown: the owner, you, and anyone assigned to a task here. Only the owner can see the full invite list.</div>
              </div>
            </div>
          );
        })()}
        {view==="myday"&&carriedCount>0&&(
          <button onClick={onUndoCarry} style={{display:"flex",alignItems:"center",gap:7,width:"100%",marginBottom:12,padding:"9px 12px",borderRadius:11,border:`1px solid ${T.border}`,background:T.surface2,color:T.textMuted,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>
            <Ico n="repeat" s={14} c={T.textMuted}/> Carried {carriedCount} unfinished {carriedCount===1?"task":"tasks"} forward · tap to undo
          </button>
        )}
        {view==="myday"&&mydayHabits.length>0&&(()=>{ const hd=mydayHabits.filter(h=>(h.log||[]).includes(todStr)).length; return (
          <div style={{marginBottom:14,padding:"9px 12px",border:`1px solid ${T.border}`,borderRadius:11,background:T.surface}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:7}}>
              <span style={{fontSize:11,fontWeight:700,fontFamily:"'Sora',sans-serif"}}>🎯 Today's habits</span>
              <span style={{fontSize:10,color:hd===mydayHabits.length?"#22c55e":T.textMuted,fontWeight:hd===mydayHabits.length?700:500}}>{hd}/{mydayHabits.length}{hd===mydayHabits.length?" — all done 🎉":""}</span>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {mydayHabits.map(h=>{ const done=(h.log||[]).includes(todStr); return (
                <button key={h.id} onClick={()=>onHabitToggle?.(h.id)} title={done?"Tap to undo today's check-in":"Tap to check in"} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 11px",borderRadius:20,border:`1.5px solid ${done?h.color:T.border}`,background:done?h.color+"26":"transparent",color:done?h.color:T.textMuted,cursor:"pointer",fontSize:11,fontWeight:done?700:500,fontFamily:"'DM Sans',sans-serif",transition:"all .15s"}}>
                  <span>{done?"✓":h.icon}</span>{h.name}
                </button>
              );})}
            </div>
          </div>
        );})()}
        {!readOnly&&(
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            <div style={{flex:1,display:"flex",alignItems:"center",gap:9,background:T.surface,border:`1px solid ${T.border}`,borderRadius:11,padding:"0 12px"}}>
              <Ico n="plus" s={15} c={T.textMuted}/>
              <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTask()} placeholder={view==="myday"?'Add to My Day… "Meet client May 26 at 4pm"':'Add task… "Call dentist tomorrow"'} style={{flex:1,background:"none",border:"none",outline:"none",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:13,padding:"12px 0"}}/>
            </div>
            <button onClick={addTask} style={{padding:"0 18px",borderRadius:11,border:"none",cursor:"pointer",background:T.grad,color:"#fff",fontWeight:700,fontSize:13,fontFamily:"'DM Sans',sans-serif",boxShadow:"0 3px 12px rgba(192,132,252,.35)"}}>Add</button>
          </div>
        )}
        {(
          <div style={{fontSize:10,color:T.textMuted,opacity:.55,marginBottom:view==="upcoming"?4:10,marginTop:-4,lineHeight:1.5}}>💡 Swipe ← to delete · → to add to My Day ☀️ · {canReorder?dragHint():"pick “My order” above to drag tasks around"} {onHelp&&<button onClick={onHelp} style={{background:"none",border:"none",padding:0,margin:0,color:T.accent,cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"'DM Sans',sans-serif",textDecoration:"underline"}}>How it all works</button>}</div>
        )}
        {view==="upcoming"&&(
          <div style={{fontSize:10,color:T.textMuted,opacity:.55,marginBottom:10,lineHeight:1.5}}>📅 Type a date ("friday", "july 30", "next tue") to schedule — no date means it's filed as <b>Date TBD</b> until you decide. "tbd" / "tba" / "unknown" work too.</div>
        )}
        {view==="assigned"&&(
          <div style={{fontSize:10,color:T.textMuted,opacity:.55,marginBottom:10,lineHeight:1.5}}>🤝 Work other people handed to you. Open a task to see who assigned it — ticking it off updates their copy too.</div>
        )}
        {view==="flagged"&&(
          <div style={{fontSize:10,color:T.textMuted,opacity:.55,marginBottom:10,lineHeight:1.5}}>🚩 Your shortlist. Open any task and tap the flag to add or remove it here.</div>
        )}
        {view==="myday"&&(
          <div style={{fontSize:10,color:T.textMuted,opacity:.55,marginBottom:10,lineHeight:1.5}}>☀️ Today only. Anything left unfinished is carried over tomorrow — and suggestions for what to pull in are at the bottom.</div>
        )}
        {(
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
          {(()=>{
            const open=sortList(show.filter(t=>!t.done));
            const isLate=t=>t.due&&!isTbd(t.due)&&t.due<todStr;
            // A missed deadline floats to the top of Upcoming instead of getting buried (or looking lost).
            const late=view==="upcoming"?open.filter(isLate):[];
            const rest=late.length?open.filter(t=>!isLate(t)):open;
            // The drop marker is drawn ON the card it points at, not inserted between cards.
            // Inserting it used to push every card below it down by its own height, which moved
            // the card under your finger, which moved the marker — the list jittered as you held it.
            const card=task=>(
              <TCard key={task.id} task={task} T={T} cats={cats} onToggle={toggleTask} onDelete={deleteTask} onSel={selectCard} sel={selTask?.id===task.id} entering={newAnim===task.id} dragging={dragId===task.id}
                dropEdge={drop?.id===String(task.id)?(drop.before?"top":"bottom"):null} canReorder={canReorder}
                onDown={onCardDown} onGrip={gripDown} swipeX={swipeId===task.id?swipeX:0} canDelete={canDeleteFn?canDeleteFn(task):true} canEdit={canEditFn?canEditFn(task):true} inMyDay={isInMyDay?.(task)} onToggleMyDay={onToggleMyDay} myEmail={myEmail}/>
            );
            return (<>
              {late.length>0&&<>
                <div style={{fontSize:10,color:T.danger,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",padding:"2px 2px 4px",display:"flex",alignItems:"center",gap:5}}>
                  ⚠ Overdue · {late.length}
                  <button onClick={()=>{ late.forEach(t=>updateTask(t.id,{due:todStr})); }} style={{marginLeft:"auto",background:"none",border:`1px solid ${T.danger}44`,borderRadius:7,padding:"2px 9px",cursor:"pointer",color:T.danger,fontSize:10,fontWeight:700,fontFamily:"'DM Sans',sans-serif",textTransform:"none",letterSpacing:0}}>Move to today</button>
                </div>
                {late.map(card)}
                <div style={{height:1,background:T.border,margin:"8px 2px 4px"}}/>
              </>}
              {rest.map(card)}
            </>);
          })()}
          {show.filter(t=>t.done).length>0&&<>
            <div style={{fontSize:10,color:T.textMuted,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",padding:"10px 2px 4px",display:"flex",alignItems:"center",gap:5}}>
              <Ico n="check" s={11} c={T.textMuted}/> Completed · {show.filter(t=>t.done).length}
              <button onClick={()=>onClearDone?.(show.filter(t=>t.done).map(t=>t.id))} style={{marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:T.danger,fontSize:10,fontWeight:700,letterSpacing:".3px",fontFamily:"'DM Sans',sans-serif",textTransform:"none"}}>Clear all</button>
            </div>
            {show.filter(t=>t.done).map(task=>(
              <TCard key={task.id} task={task} T={T} cats={cats} onToggle={toggleTask} onDelete={deleteTask} onSel={selectCard} sel={selTask?.id===task.id} canDelete={canDeleteFn?canDeleteFn(task):true} inMyDay={isInMyDay?.(task)} onToggleMyDay={onToggleMyDay}/>
            ))}
          </>}
          {show.length===0&&(
            <div style={{textAlign:"center",padding:"50px 20px",color:T.textMuted}}>
              <div style={{fontSize:36,marginBottom:10}}>✨</div>
              <div style={{fontWeight:600}}>All clear!</div>
              <div style={{fontSize:12,marginTop:4}}>Add a task to get started</div>
            </div>
          )}
        </div>
        {/* Suggestions live BELOW the day's tasks and start folded away. Opened at the top of the
            screen they filled a phone entirely, hiding the very list they're meant to feed. */}
        {view==="myday"&&suggestions&&suggestions.length>0&&(
          <div style={{marginTop:16,border:`1px solid ${T.border}`,borderRadius:11,background:T.surface,overflow:"hidden"}}>
            <button onClick={()=>setShowSugg(s=>!s)} style={{width:"100%",display:"flex",alignItems:"center",gap:7,padding:"9px 12px",background:"none",border:"none",cursor:"pointer",color:T.text,fontFamily:"'DM Sans',sans-serif"}}>
              <Ico n="sparkles" s={14} c={T.accent}/>
              <span style={{fontSize:12,fontWeight:700,flex:1,textAlign:"left",minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>Suggestions for My Day</span>
              <span style={{fontSize:10,color:T.textMuted,flexShrink:0}}>{showSugg?"Hide":`Show ${suggestions.length}`}</span>
            </button>
            {showSugg&&(
              <div style={{padding:"0 8px 8px",display:"flex",flexDirection:"column",gap:3,maxHeight:220,overflowY:"auto"}}>
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
      </div>
      {selTask&&((canEditFn&&!canEditFn(selTask))?<TaskReadOnly task={selTask} T={T} cats={cats} onClose={()=>setSelTask(null)} ownerNick={sharedInfo?.nick}/>:<TDetail task={selTask} T={T} cats={cats} onUpdate={updateTask} onDelete={deleteTask} onDuplicate={duplicateTask} onAttach={onAttach} onRemoveAttach={onRemoveAttach} onSetReminder={onSetReminder} canDelete={canDeleteFn?canDeleteFn(selTask):true} onViewImage={onViewImage} onClose={()=>setSelTask(null)} onFocus={onFocusTask} myEmail={myEmail} people={people} onAssign={onAssign} peopleGroups={peopleGroups} listPeople={listPeople}/>)}
      {manageMode&&catKey&&listManage&&(
        <SidebarManage T={T} target={{type:"list",id:"c:"+catKey,name:catKey}} isGroup={false} childLists={[catKey]}
          shares={(listManage.ownedShares||[]).filter(s=>s.folder===catKey)} meta={cats[catKey]||{}}
          onClose={()=>setManageMode(null)}
          onRename={v=>{ const ok=onRenameList?.(catKey,v)!==false; if(ok) setManageMode(null); return ok; }}
          onShare={(em,cd)=>listManage.onShare?.(catKey,em,cd)}
          onUnshare={listManage.onUnshare}
          onDelete={()=>{ setManageMode(null); listManage.onDelete?.(catKey); }}
          onSetIcon={ic=>listManage.setCats?.(c=>({...c,[catKey]:{...c[catKey],icon:ic}}))}
          onSetColor={col=>listManage.setCats?.(c=>({...c,[catKey]:{...c[catKey],color:col}}))}
          onAssignAll={listManage.onAssignAll?emails=>listManage.onAssignAll([catKey],emails):null}
          assignGroups={listManage.assignGroups||[]}
          onUploadIcon={listManage.onUploadIcon}
          mode={manageMode}
          autoFocusName={manageMode==="edit"}/>
      )}
    </div>
  );
}

// What a view-only collaborator gets instead of the editor: the whole task, readable, nothing to break.
function TaskReadOnly({task,T,cats,onClose,ownerNick}) {
  const narrow=useNarrow();
  const catMeta=cats[task.tag];
  const qc=QUAD[task.quadrant];
  const H=({children})=><div style={{fontSize:9,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",color:T.textMuted,marginBottom:4}}>{children}</div>;
  const chip=(key,txt,bg,fg,bold)=><span key={key} style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:bg,color:fg,fontWeight:bold?700:500}}>{txt}</span>;
  return (
    <div style={{width:narrow?"100%":280,flexGrow:narrow?1:0,minWidth:0,borderLeft:narrow?"none":`1px solid ${T.border}`,background:T.surface,overflowY:"auto",padding:"12px 14px 16px",display:"flex",flexDirection:"column",gap:12,animation:"slideIn .2s ease",flexShrink:0,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
        <div style={{flex:1,minWidth:0,fontFamily:"'Sora',sans-serif",fontSize:14,fontWeight:700,lineHeight:1.4,textDecoration:task.done?"line-through":"none",color:task.done?T.textMuted:T.text}}>{task.title}</div>
        <button onClick={onClose} style={{width:24,height:24,borderRadius:6,border:"none",cursor:"pointer",background:T.surface2,color:T.textMuted,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico n="x" s={13}/></button>
      </div>
      <div style={{fontSize:10,color:T.textMuted,padding:"7px 10px",borderRadius:9,background:T.surface2,border:`1px solid ${T.border}`,lineHeight:1.5}}>👀 View only — {ownerNick||"the owner"} shared this list without editing rights. Ask them for edit access to change anything here.</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
        {catMeta&&<span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:(catMeta.color||"#6b7280")+"22",color:catMeta.color||"#6b7280",fontWeight:600,textTransform:"capitalize",display:"inline-flex",alignItems:"center",gap:3}}><CatIcon icon={catMeta.icon} size={10}/>{task.tag}</span>}
        {task.due&&chip("due","📅 "+fmtDate(task.due),T.surface3,T.text)}
        {task.remindAt&&fmtClock(task.remindAt)&&chip("time","⏰ "+fmtClock(task.remindAt)+(task.endTime?` – ${fmtClock(task.endTime)}`:""),T.surface3,T.text)}
        {qc&&chip("q",qc.icon+" "+qc.label,qc.color+"22",qc.color,true)}
        {task.recurring&&chip("rec","🔁 "+(task.recurring.startsWith("custom:")?"repeats":task.recurring),T.surface3,T.text)}
        {assigneesOf(task).map(em=>chip(em,"👤 "+nickOf(em).split("@")[0],T.accentGlow,T.accent,true))}
      </div>
      {task.notes&&task.notes.trim()&&<div><H>Notes</H><div style={{fontSize:12,color:T.text,lineHeight:1.55,whiteSpace:"pre-wrap"}}>{task.notes}</div></div>}
      {task.subtasks?.length>0&&<div><H>Steps · {task.subtasks.filter(s=>s.done).length}/{task.subtasks.length}</H>
        {task.subtasks.map(s=><div key={s.id} style={{display:"flex",alignItems:"center",gap:7,padding:"4px 0",fontSize:12,color:s.done?T.textMuted:T.text,textDecoration:s.done?"line-through":"none"}}><span style={{width:14,height:14,borderRadius:4,border:`1.5px solid ${s.done?T.success:T.border}`,background:s.done?T.success:"transparent",flexShrink:0}}/>{s.title}</div>)}</div>}
      {task.attachments?.length>0&&<div><H>Attachments</H>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{task.attachments.map(att=><a key={att.path||att.url} href={att.url} target="_blank" rel="noreferrer" title={att.name} style={{width:50,height:50,borderRadius:8,overflow:"hidden",border:`1px solid ${T.border}`,background:T.surface2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,textDecoration:"none"}}>{(att.type||"").startsWith("image/")?<img src={att.url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"📄"}</a>)}</div></div>}
    </div>
  );
}

function TCard({task,T,cats,onToggle,onDelete,onSel,sel,entering,dragging,dropTarget,dropEdge=null,canReorder=true,onDown,onGrip,swipeX=0,canDelete=true,canEdit=true,inMyDay=false,onToggleMyDay,myEmail}) {
  const assignees=assigneesOf(task);
  const assignedToMe=assignees.includes(myEmail);
  const [hov,setHov]=useState(false);
  const ov=task.due&&task.due<tod()&&!task.done;
  const catMeta=cats[task.tag];
  const catColor=catMeta?.color||"#6b7280";
  const qColor=QUAD[task.quadrant]?.color;
  return (
    <div style={{position:"relative",borderRadius:11,overflow:"hidden"}}>
    {dropEdge&&<div style={{position:"absolute",left:4,right:4,[dropEdge]:0,height:3,borderRadius:2,background:T.accent,boxShadow:`0 0 8px ${T.accent}`,zIndex:6,pointerEvents:"none"}}/>}
    {swipeX>0&&(
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",gap:6,paddingLeft:16,background:`linear-gradient(90deg,${T.warning}44,transparent)`,color:T.warning,fontWeight:700,fontSize:12,pointerEvents:"none"}}>
        <Ico n="sun" s={16} c={T.warning}/>{swipeX>=95?"Release for My Day ☀️ · move ↕ too to drag":swipeX>60?"Release for My Day ☀️":"My Day"}
      </div>
    )}
    {swipeX<0&&(
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"flex-end",gap:6,paddingRight:16,background:`linear-gradient(270deg,${T.danger}44,transparent)`,color:T.danger,fontWeight:700,fontSize:12,pointerEvents:"none"}}>
        {swipeX<=-95?"Release to delete 🗑 · move ↕ too to drag":swipeX<-60?"Release to delete 🗑":"Delete"}<Ico n="trash" s={16} c={T.danger}/>
      </div>
    )}
    <div className={entering?"te":""} data-task-id={task.id}
      onPointerDown={onDown?e=>onDown(e,task.id):undefined}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={()=>onSel(task)}
      style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",borderRadius:11,background:swipeX!==0?T.bg:(sel?T.accentGlow:dragging?"rgba(192,132,252,.06)":hov?"rgba(255,255,255,0.04)":"transparent"),border:`1px solid ${dropTarget?T.accent:sel?T.accent+"44":T.border}`,cursor:"pointer",transition:swipeX!==0?"none":"all .12s",position:"relative",opacity:task.done?.5:dragging?.4:1,transform:swipeX!==0?`translateX(${swipeX}px)`:dragging?"scale(.98)":"scale(1)",userSelect:"none",WebkitUserSelect:"none",WebkitTouchCallout:"none",touchAction:"pan-y"}}>
      {task.color&&<div style={{position:"absolute",left:0,top:8,bottom:8,width:3,borderRadius:2,background:task.color}}/>}
      {onGrip&&<div data-grip onPointerDown={e=>onGrip(e,task.id)} onClick={e=>e.stopPropagation()} title={canReorder?"Drag to reorder":"Switch the sort to “My order” to drag tasks around"} style={{color:T.textMuted,opacity:canReorder?(hov?.7:.35):.12,transition:"opacity .15s",flexShrink:0,alignSelf:"center",cursor:"grab",padding:"6px 2px",margin:"-6px 0",paddingLeft:task.color?4:2,touchAction:"none"}}><Ico n="grip" s={16} c={T.textMuted}/></div>}
      <button onClick={e=>{e.stopPropagation();if(canEdit)onToggle(task.id);}} title={canEdit?undefined:"View only"} style={{width:19,height:19,borderRadius:5,opacity:canEdit?1:.45,border:`2px solid ${task.done?T.success:qColor||T.border}`,background:task.done?T.success:"transparent",cursor:"pointer",flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
        {task.done&&<Ico n="check" s={10} c="#fff" st={{animation:"checkB .25s ease"}}/>}
      </button>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          <span style={{fontSize:13,fontWeight:500,color:task.done?T.textMuted:T.text,textDecoration:task.done?"line-through":"none"}}>{task.title}</span>
          {inMyDay&&<Ico n="sun" s={11} c="#f59e0b" st={{flexShrink:0}}/>}
          {task.starred&&<Ico n="flag" s={11} c="#f59e0b" st={{fill:"#f59e0b",flexShrink:0}}/>}
          {task.recurring&&<Ico n="repeat" s={11} c={T.textMuted} st={{flexShrink:0}}/>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5,marginTop:3,flexWrap:"wrap"}}>
          {task.tag&&<span style={{fontSize:10,padding:"1px 7px",borderRadius:20,background:catColor+"22",color:catColor,fontWeight:600,display:"inline-flex",alignItems:"center",gap:3,textTransform:"capitalize"}}>{catMeta?.icon&&<CatIcon icon={catMeta.icon} size={10}/>}{task.tag}</span>}
          {task.due&&<span style={{fontSize:11,color:ov?T.danger:T.textMuted,fontWeight:ov?700:400}}>{fmtDate(task.due)}</span>}
          {task.remindAt&&fmtClock(task.remindAt)&&<span style={{fontSize:10,color:T.accent,fontWeight:600,display:"inline-flex",alignItems:"center",gap:2}}>⏰ {fmtClock(task.remindAt)}{task.endTime?` – ${fmtClock(task.endTime)}`:""}</span>}
          {task.subtasks?.length>0&&<span style={{fontSize:10,color:T.textMuted}}>{task.subtasks.filter(s=>s.done).length}/{task.subtasks.length}</span>}
          {task.assignPrivate&&<span title="Private — only the people it is assigned to can see this task" style={{fontSize:10}}>🔒</span>}
          {task.attachments?.length>0&&<span title={`${task.attachments.length} attachment${task.attachments.length===1?"":"s"}`} style={{fontSize:10,color:T.textMuted,display:"inline-flex",alignItems:"center",gap:2}}>📎{task.attachments.length>1?` ${task.attachments.length}`:""}</span>}
          {assignees.length>0&&<span title={`Assigned to ${assignees.map(a=>a===myEmail?"you":nickOf(a)).join(", ")}`} style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:9,fontWeight:700,padding:"1px 7px 1px 2px",borderRadius:20,background:assignedToMe?T.accentGlow:T.surface3,color:assignedToMe?T.accent:T.textMuted}}>
            <span style={{display:"inline-flex"}}>{assignees.slice(0,3).map((a,i)=><span key={a} style={{width:14,height:14,borderRadius:"50%",background:avatarColor(a),color:"#fff",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:8,marginLeft:i?-5:0,border:`1px solid ${T.bg}`}}>{initialOf(a)}</span>)}</span>
            {assignees.length===1?(assignedToMe?"You":nickOf(assignees[0]).split("@")[0]):`${assignees.length}`}
          </span>}
        </div>
        {task.notes&&task.notes.trim()&&<div style={{fontSize:11,color:T.textMuted,marginTop:3,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",opacity:.85,display:"flex",alignItems:"center",gap:4}}><Ico n="note" s={10} c={T.textMuted}/>{task.notes.trim().split("\n")[0].slice(0,70)}</div>}
        {task.subtasks?.length>0&&!task.done&&(
          <div style={{height:3,background:T.surface3,borderRadius:2,overflow:"hidden",marginTop:5,maxWidth:180}}>
            <div style={{height:"100%",width:`${Math.round(task.subtasks.filter(s=>s.done).length/task.subtasks.length*100)}%`,background:`linear-gradient(90deg,${T.accent},${T.accentAlt})`,borderRadius:2,transition:"width .3s ease"}}/>
          </div>
        )}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:2,flexShrink:0,marginTop:1}}>
        {qColor&&<div title={QUAD[task.quadrant]?.label} style={{width:6,height:6,borderRadius:"50%",background:qColor,marginRight:3}}/>}
        {canEdit&&<button onClick={e=>{e.stopPropagation();onToggleMyDay?.(task.id);}} title={inMyDay?"Remove from My Day":"Add to My Day"} style={{width:22,height:22,borderRadius:6,border:"none",cursor:"pointer",background:inMyDay?"#f59e0b22":"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="sun" s={12} c={inMyDay?"#f59e0b":T.textMuted}/></button>}
        {canDelete&&<button onClick={e=>{e.stopPropagation();onDelete(task.id);}} title="Delete" style={{width:22,height:22,borderRadius:6,border:"none",cursor:"pointer",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="trash" s={11} c={T.textMuted}/></button>}
      </div>
    </div>
    </div>
  );
}

function TDetail({task,T,cats,onUpdate,onDelete,onDuplicate,onAttach,onRemoveAttach,onSetReminder,canDelete=true,onViewImage,onClose,onFocus,myEmail,people=[],onAssign,peopleGroups=[],listPeople=null}) {
  const [assignInput,setAssignInput]=useState("");
  const [uploading,setUploading]=useState(false);
  const fileRef=useRef(null);
  const doAttach=async files=>{
    const ok=[...(files||[])].filter(f=>{ if(f.size>50*1024*1024){ alert(`"${f.name}" is over the 50 MB per-file limit — try a smaller file.`); return false; } return true; });
    if(!ok.length) return;
    setUploading(true);
    try{ await onAttach?.(task,ok); }catch(e){ alert("Upload failed: "+(e.message||e)); }
    finally{ setUploading(false); }
  };
  const [nts,setNts]=useState(task.notes||"");
  const [ttl,setTtl]=useState(task.title||"");
  const [ns,setNs]=useState("");
  // Steps can carry their own due date/time: typed right into the text ("outline Jul 12 3pm"),
  // set via the 📅 chip, or dragged onto a day in the Calendar view.
  const addSub=()=>{ const raw=ns.trim(); if(!raw)return; const p=parseNL(raw); const title=(p.title||raw).trim(); onUpdate(task.id,{subtasks:[...(task.subtasks||[]),{id:Date.now(),title,done:false,due:p.due||null,time:p.time||null}]}); setNs(""); };
  const patchSub=(subId,p)=>onUpdate(task.id,{subtasks:task.subtasks.map(s=>s.id===subId?{...s,...p}:s)});
  const [subDateId,setSubDateId]=useState(null);

  // Notes save a moment after you stop typing, and at once when you leave the box or the panel —
  // not on every keystroke, which was a database write per letter.
  const notesTimer=useRef(null), pendingNotes=useRef(null);
  const flushNotes=()=>{ clearTimeout(notesTimer.current); const p=pendingNotes.current; pendingNotes.current=null; if(p) onUpdate(p.id,{notes:p.v}); };
  const saveNotesSoon=v=>{ pendingNotes.current={id:task.id,v}; clearTimeout(notesTimer.current); notesTimer.current=setTimeout(flushNotes,700); };

  // Live parsing while you type. The date, time, repeat and list update within a third of a second; the
  // words themselves leave the text only when you finish, so nothing vanishes under your cursor, and
  // deleting the date words again puts the task back as it was. What you're typing is remembered WITH
  // its task, so switching tasks or closing the panel (the drag handle closes it without a blur) still
  // finishes the edit — on the right task.
  const editRef=useRef(null);   // {id, raw, orig:{due,remindAt,endTime,tag,recurring}, task}
  if(editRef.current&&editRef.current.id===task.id) editRef.current.task=task;
  const beginEdit=()=>{
    if(!editRef.current||editRef.current.id!==task.id) editRef.current={id:task.id,raw:null,task,orig:{due:task.due,remindAt:task.remindAt,endTime:task.endTime,tag:task.tag,recurring:task.recurring}};
    return editRef.current;
  };
  const liveTimer=useRef(null);
  const liveParse=(raw,{title})=>{
    const e=beginEdit(); if(title) e.raw=raw;
    clearTimeout(liveTimer.current);
    liveTimer.current=setTimeout(()=>{
      const cur=editRef.current; if(!cur||cur.id!==e.id) return;
      const t=cur.task, o=cur.orig, p=parseNL(raw), patch={};
      let due=p.due||o.due||null;
      if(p.time&&!due) due=tod();                                        // a time with no day means today
      if((due||null)!==(t.due||null)) patch.due=due;
      const d=due&&!isTbd(due)?due:null;
      // With no time typed, the original reminder stays — moved to the new day if the day changed.
      const moved=due!==(o.due||null)?moveDuePatch({remindAt:o.remindAt,endTime:o.endTime},due):{};
      const ra=p.time?(d?`${d}T${p.time}`:null):("remindAt" in moved?moved.remindAt:o.remindAt);
      if((ra||null)!==(t.remindAt||null)) patch.remindAt=ra||null;
      const et=p.time?(p.endTime||null):("endTime" in moved?moved.endTime:(o.endTime||null));
      if((et||null)!==(t.endTime||null)) patch.endTime=et;
      if(title){   // only the TITLE files a task into a list or makes it repeat — "discuss work" in the notes must not move it to Work
        const rec=p.recurring||o.recurring||null; if((rec||null)!==(t.recurring||null)) patch.recurring=rec;
        const tag=matchListName(p.title||raw,cats||{})||o.tag; if(tag&&tag!==t.tag) patch.tag=tag;
      }
      if(Object.keys(patch).length) onUpdate(cur.id,patch);
    },300);
  };
  const finishTitle=()=>{
    clearTimeout(liveTimer.current);
    const e=editRef.current; editRef.current=null;
    if(!e||e.raw==null) return;
    const t=e.task, raw=e.raw.trim();
    if(!raw){ if(t.id===task.id) setTtl(t.title||""); return; }
    if(raw===(t.title||"")) return;   // unchanged → don't re-parse (avoids stripping a legit word on a no-op blur)
    // Judge the list-name strip against where the task WAS, not where live parsing already moved it.
    const base={...t,tag:e.orig.tag};
    const patch=titleEditPatch(base,raw,cats);
    if(Object.keys(patch).length) onUpdate(t.id,patch);
    // Even when the cleaned title equals the old one (you only appended a date), the box must not keep
    // showing date words the task no longer has.
    if(t.id===task.id) setTtl(patch.title||cleanTitle(raw,cats,base.tag));
  };
  const liveNotes=raw=>{
    const v=raw.trim();
    if(!v||v.includes("\n")||v.length>80) return;   // only short single-line quick notes are read for dates
    liveParse(v,{title:false});
  };
  const parseNotesBlur=()=>{
    const raw=nts.trim();
    if(!raw||raw.includes("\n")||raw.length>80) return;
    const p=parseNL(raw);
    if(!p.due&&!p.time) return;
    const patch=whenPatch(task,p);
    const words=p.title===raw?"":p.title;   // nothing but a date → the note empties; the task now carries the date
    patch.notes=words; setNts(words); pendingNotes.current=null; clearTimeout(notesTimer.current);
    onUpdate(task.id,patch);
  };
  const flushRef=useRef(null); flushRef.current=()=>{ flushNotes(); finishTitle(); };
  useEffect(()=>{ setNts(task.notes||""); setTtl(task.title||""); return ()=>flushRef.current(); },[task.id]);
  const COLS=[null,"#ef4444","#f97316","#f59e0b","#22c55e","#3b82f6","#a855f7"];
  const [closeX,setCloseX]=useState(0);
  const narrow=useNarrow();   // phone: the panel takes the screen instead of squeezing the list into a sliver
  const panelDown=e=>{
    if(e.target.closest("input,textarea,select,button,a")) return;
    const sx=e.clientX,sy=e.clientY; let decided=false,lastDx=0;
    const cleanup=()=>{ window.removeEventListener("pointermove",mv);window.removeEventListener("pointerup",up);window.removeEventListener("pointercancel",up); };
    const mv=ev=>{ const dx=ev.clientX-sx,dy=ev.clientY-sy; if(!decided){ if(Math.abs(dx)<8&&Math.abs(dy)<8)return; decided=true; if(Math.abs(dx)<=Math.abs(dy)){cleanup();return;} } lastDx=dx; if(dx>0)setCloseX(Math.min(dx,320)); };
    const up=ev=>{ cleanup(); if(ev.type!=="pointercancel"&&lastDx>60)onClose(); else setCloseX(0); };
    window.addEventListener("pointermove",mv);window.addEventListener("pointerup",up);window.addEventListener("pointercancel",up);
  };
  // The panel is dense with inputs/buttons, so give it an always-grabbable handle that tracks instantly.
  const closeHandleDown=e=>{
    e.stopPropagation(); e.preventDefault();
    const sx=e.clientX; let lastDx=0;
    const mv=ev=>{ lastDx=ev.clientX-sx; setCloseX(Math.max(0,Math.min(lastDx,320))); };
    const up=ev=>{ window.removeEventListener("pointermove",mv);window.removeEventListener("pointerup",up);window.removeEventListener("pointercancel",up); if(ev.type!=="pointercancel"&&lastDx>60)onClose(); else setCloseX(0); };
    window.addEventListener("pointermove",mv);window.addEventListener("pointerup",up);window.addEventListener("pointercancel",up);
  };
  return (
    <div onPointerDown={panelDown} style={{width:narrow?"100%":280,flexGrow:narrow?1:0,minWidth:0,borderLeft:narrow?"none":`1px solid ${T.border}`,background:T.surface,overflowY:"auto",padding:"6px 14px 12px",display:"flex",flexDirection:"column",gap:9,animation:closeX?"none":"slideIn .2s ease",flexShrink:0,transform:closeX?`translateX(${closeX}px)`:"none",transition:closeX?"none":"transform .2s ease"}}>
      <div onPointerDown={closeHandleDown} title="Drag right to close" style={{display:"flex",justifyContent:"center",padding:"3px 0 1px",cursor:"grab",touchAction:"none"}}>
        <div style={{width:42,height:4,borderRadius:2,background:T.surface3}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <input value={ttl} onChange={e=>{setTtl(e.target.value);liveParse(e.target.value,{title:true});}} onBlur={finishTitle} onKeyDown={e=>{if(e.key==="Enter")e.currentTarget.blur();}} placeholder="Task name" title="Tap to rename — retype a date/time or a list name and it re-files itself" style={{fontFamily:"'Sora',sans-serif",fontSize:13,fontWeight:600,flex:1,lineHeight:1.4,background:"transparent",border:"none",borderBottom:`1px dashed ${T.border}`,outline:"none",color:T.text,minWidth:0,padding:"1px 0"}}/>
        <button onClick={onClose} style={{width:24,height:24,borderRadius:6,border:"none",cursor:"pointer",background:T.surface2,color:T.textMuted,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginLeft:6}}><Ico n="x" s={13}/></button>
      </div>
      <DL label="Notes" T={T}>
        <textarea value={nts} onChange={e=>{setNts(e.target.value);saveNotesSoon(e.target.value);liveNotes(e.target.value);}} onBlur={()=>{ if(editRef.current?.raw==null){ clearTimeout(liveTimer.current); editRef.current=null; } parseNotesBlur(); flushNotes(); }} placeholder="Notes, links… a date/time here also sets the reminder" style={{marginTop:4,width:"100%",minHeight:52,padding:"6px 9px",borderRadius:7,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none",resize:"vertical",lineHeight:1.5}}/>
        {nts&&<button onClick={()=>{setNts("");pendingNotes.current=null;onUpdate(task.id,{notes:""});}} style={{marginTop:4,padding:"3px 10px",borderRadius:6,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,cursor:"pointer",fontSize:10,fontWeight:600,fontFamily:"'DM Sans',sans-serif",display:"inline-flex",alignItems:"center",gap:4}}><Ico n="trash" s={10} c={T.textMuted}/> Clear notes</button>}
      </DL>
      <DL label="Attachments 📎" T={T}>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:5}}>
          {(task.attachments||[]).map(att=>(
            <div key={att.path} style={{position:"relative",width:50,height:50,borderRadius:8,overflow:"hidden",border:`1px solid ${T.border}`,background:T.surface2}}>
              {(att.type||"").startsWith("image/")
                ? <img src={att.url} alt={att.name} onClick={()=>onViewImage?.(att.url)} style={{width:"100%",height:"100%",objectFit:"cover",cursor:"pointer"}}/>
                : <a href={att.url} target="_blank" rel="noreferrer" title={att.name} style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,textDecoration:"none"}}>📄</a>}
              <button onClick={()=>onRemoveAttach?.(task,att)} style={{position:"absolute",top:2,right:2,width:16,height:16,borderRadius:"50%",border:"none",cursor:"pointer",background:"rgba(0,0,0,.6)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" s={9} c="#fff"/></button>
              <button onClick={()=>downloadFile(att.url,att.name)} title="Download" style={{position:"absolute",bottom:2,right:2,width:16,height:16,borderRadius:"50%",border:"none",cursor:"pointer",background:"rgba(0,0,0,.6)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,lineHeight:1,padding:0}}>⬇</button>
            </div>
          ))}
        </div>
        <input ref={fileRef} type="file" accept="image/*,.pdf,.doc,.docx,.txt,.md,.csv,.xls,.xlsx,.ppt,.pptx,.zip" multiple style={{display:"none"}} onChange={e=>{doAttach([...e.target.files]); e.target.value="";}}/>
        <button onClick={()=>fileRef.current?.click()} disabled={uploading} style={{marginTop:7,width:"100%",padding:"7px",borderRadius:8,border:`1px dashed ${T.border}`,background:"transparent",color:T.textMuted,cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{uploading?"Uploading…":"+ Add photo / PDF / doc (max 50 MB)"}</button>
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
          {[["Today",tod()],["Tmrw",addDays(1)],["+1wk",addDays(7)],["TBD 🤷",DUE_TBD],["Clear",""]].map(([lbl,val])=>(
            <button key={lbl} onClick={()=>onUpdate(task.id,moveDuePatch(task,val||null))} style={{padding:"3px 9px",borderRadius:7,border:`1px solid ${task.due===val&&val?T.accent:T.border}`,background:task.due===val&&val?T.accentGlow:"transparent",color:task.due===val&&val?T.accent:T.textMuted,cursor:"pointer",fontSize:10,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{lbl}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:6,marginBottom:6}}>
          <input type="date" value={isTbd(task.due)?"":(task.due||"")} onChange={e=>onUpdate(task.id,moveDuePatch(task,e.target.value||null))} style={{flex:1,minWidth:0,padding:"6px 8px",borderRadius:7,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none"}}/>
          <input type="time" title="Set a time (also sets a reminder)" value={task.remindAt&&task.remindAt.includes("T")?task.remindAt.split("T")[1].slice(0,5):""} onChange={e=>{ const t=e.target.value, dated=task.due&&!isTbd(task.due); if(t){ const d=dated?task.due:tod(); onUpdate(task.id,{remindAt:`${d}T${t}`,...(dated?{}:{due:d})}); } else onUpdate(task.id,{remindAt:null,endTime:null}); }} style={{flex:1,minWidth:0,padding:"6px 8px",borderRadius:7,border:`1px solid ${task.remindAt?T.accent:T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none"}}/>
        </div>
        <div style={{display:"flex",gap:6}}>
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
            <button key={tag} onClick={()=>onUpdate(task.id,{tag})} style={{padding:"3px 9px",borderRadius:20,border:`1px solid ${task.tag===tag?meta.color:T.border}`,background:task.tag===tag?meta.color+"22":"transparent",color:task.tag===tag?meta.color:T.textMuted,cursor:"pointer",fontSize:10,fontWeight:task.tag===tag?700:400,fontFamily:"'DM Sans',sans-serif",display:"inline-flex",alignItems:"center",gap:3,textTransform:"capitalize"}}><CatIcon icon={meta.icon} size={10}/> {tag}</button>
          ))}
        </div>
      </DL>
      {onAssign&&(()=>{
        const cur=assigneesOf(task);
        const toggle=em=>{ em=em.toLowerCase(); onAssign(task.id, cur.includes(em)?cur.filter(x=>x!==em):[...cur,em]); };
        const addGroup=g=>{ const merged=[...new Set([...cur,...g.members.map(m=>m.toLowerCase())])]; onAssign(task.id,merged); };
        const quick=[...new Set([...(myEmail?[myEmail]:[]),...people])];
        const mates=(listPeople?listPeople(task.tag):[]).filter(Boolean);
        const allMates=mates.length>0&&mates.every(m=>cur.includes(m));
        return (
        <DL label="Assigned to 🤝" T={T}>
          {cur.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:5,marginBottom:7}}>
            {cur.map(em=>(
              <span key={em} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 6px 3px 3px",borderRadius:20,background:em===myEmail?T.accentGlow:T.surface2,border:`1px solid ${T.border}`,fontSize:11,fontWeight:600,color:T.text}}>
                <Avatar email={em} size={16}/>
                {em===myEmail?"You":nickOf(em).split("@")[0]}
                <button onClick={()=>toggle(em)} title="Remove" style={{background:"none",border:"none",cursor:"pointer",color:T.textMuted,display:"flex",padding:0}}><Ico n="x" s={10}/></button>
              </span>
            ))}
          </div>}
          {mates.length>0&&(
            <button onClick={()=>onAssign(task.id, allMates?cur.filter(x=>!mates.includes(x)):[...new Set([...cur,...mates])])}
              title={mates.map(m=>nickOf(m)).join(", ")}
              style={{width:"100%",marginBottom:7,padding:"6px 10px",borderRadius:9,border:`1px solid ${allMates?T.accent:T.border}`,background:allMates?T.accentGlow:"transparent",color:allMates?T.accent:T.textMuted,cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
              <Ico n="users" s={11} c={allMates?T.accent:T.textMuted}/>{allMates?"✓ ":""}Everyone on this list ({mates.length})
            </button>
          )}
          <div style={{fontSize:8,fontWeight:700,letterSpacing:".4px",textTransform:"uppercase",color:T.textMuted,marginBottom:4}}>Add people</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {quick.map(em=>{ const on=cur.includes(em); return (
              <button key={em} onClick={()=>toggle(em)} style={{padding:"4px 10px",borderRadius:20,border:`1px solid ${on?T.accent:T.border}`,background:on?T.accentGlow:"transparent",color:on?T.accent:T.textMuted,cursor:"pointer",fontSize:11,fontWeight:on?700:600,fontFamily:"'DM Sans',sans-serif"}}>{on?"✓ ":""}{em===myEmail?"Me":nickOf(em).split("@")[0]}</button>
            );})}
          </div>
          {peopleGroups.length>0&&<>
            <div style={{fontSize:8,fontWeight:700,letterSpacing:".4px",textTransform:"uppercase",color:T.textMuted,margin:"8px 0 4px"}}>Add a group</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {peopleGroups.filter(g=>g.members.length).map(g=>(
                <button key={g.id} onClick={()=>addGroup(g)} title={g.members.map(m=>nickOf(m)).join(", ")} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:20,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}><Ico n="users" s={10} c={T.textMuted}/> {g.name} ({g.members.length})</button>
              ))}
            </div>
          </>}
          <div style={{display:"flex",gap:5,marginTop:7}}>
            <input value={assignInput} onChange={e=>setAssignInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){const em=assignInput.trim().toLowerCase();if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){toggle(em);setAssignInput("");}else alert("Enter a valid email.");}}} placeholder="add by email…" style={{flex:1,minWidth:0,padding:"5px 8px",borderRadius:7,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:11,outline:"none"}}/>
          </div>
          {cur.length>0&&(
            <button onClick={()=>onUpdate(task.id,{assignPrivate:!task.assignPrivate})}
              title="Private work is hidden from the rest of the list — only the people it's assigned to can open it"
              style={{width:"100%",marginTop:7,padding:"7px 10px",borderRadius:9,border:`1px solid ${task.assignPrivate?T.accent:T.border}`,background:task.assignPrivate?T.accentGlow:"transparent",color:task.assignPrivate?T.accent:T.textMuted,cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:6,textAlign:"left"}}>
              <span style={{fontSize:13}}>{task.assignPrivate?"🔒":"👁"}</span>
              {task.assignPrivate?"Private — only the assignee sees this task":"Visible to everyone on this list"}
            </button>
          )}
          <div style={{fontSize:9,color:T.textMuted,marginTop:4,lineHeight:1.5}}>Assigned work shows up under “Assigned to me” for each person, even if the list itself isn’t shared with them. Create teams in Settings › Teams.</div>
        </DL>
        );
      })()}
      <DL label="Subtasks" T={T}>
        <div style={{display:"flex",flexDirection:"column",gap:4,marginTop:5}}>
          {(task.subtasks||[]).map(sub=>(
            <div key={sub.id}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <button onClick={()=>patchSub(sub.id,{done:!sub.done})} style={{width:15,height:15,borderRadius:4,border:`1.5px solid ${sub.done?T.success:T.border}`,background:sub.done?T.success:"transparent",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {sub.done&&<Ico n="check" s={8} c="#fff"/>}
                </button>
                <span style={{flex:1,minWidth:0,fontSize:12,color:sub.done?T.textMuted:T.text,textDecoration:sub.done?"line-through":"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sub.title}</span>
                <button onClick={()=>setSubDateId(subDateId===sub.id?null:sub.id)} title={sub.due?"Change this step's date":"Give this step its own due date"} style={{border:"none",cursor:"pointer",flexShrink:0,borderRadius:6,padding:"2px 6px",fontSize:9,fontWeight:700,fontFamily:"'DM Sans',sans-serif",background:sub.due?T.accentGlow:"transparent",color:sub.due?T.accent:T.textMuted}}>
                  {sub.due?`📅 ${fmtDate(sub.due)}${sub.time?" "+fmtClock(sub.time):""}`:"📅"}
                </button>
                <button onClick={()=>onUpdate(task.id,{subtasks:task.subtasks.filter(s=>s.id!==sub.id)})} title="Delete step" style={{width:16,height:16,border:"none",borderRadius:5,cursor:"pointer",background:"transparent",color:T.textMuted,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,padding:0}}><Ico n="x" s={9}/></button>
              </div>
              {subDateId===sub.id&&(
                <div style={{display:"flex",gap:5,margin:"4px 0 2px 22px",alignItems:"center"}}>
                  <input type="date" value={sub.due||""} onChange={e=>patchSub(sub.id,{due:e.target.value||null})} style={{flex:1,minWidth:0,padding:"4px 6px",borderRadius:6,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:11,outline:"none"}}/>
                  <input type="time" value={sub.time||""} onChange={e=>patchSub(sub.id,{time:e.target.value||null})} style={{width:88,flexShrink:0,padding:"4px 6px",borderRadius:6,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:11,outline:"none"}}/>
                  {sub.due&&<button onClick={()=>{patchSub(sub.id,{due:null,time:null});setSubDateId(null);}} title="Clear step date" style={{width:20,height:20,borderRadius:6,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",padding:0}}><Ico n="x" s={9}/></button>}
                </div>
              )}
            </div>
          ))}
          <div style={{display:"flex",gap:5,marginTop:3}}>
            <input value={ns} onChange={e=>setNs(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addSub()} placeholder='Add step… try "outline Jul 12 3pm"' style={{flex:1,padding:"5px 7px",borderRadius:6,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:11,outline:"none"}}/>
            <button onClick={addSub} style={{padding:"5px 9px",borderRadius:6,border:"none",cursor:"pointer",background:T.accentGlow,color:T.accent,fontSize:12,fontWeight:700}}>+</button>
          </div>
          {(task.subtasks||[]).some(s=>s.due)&&<div style={{fontSize:9,color:T.textMuted,marginTop:2}}>Dated steps show on the Calendar — you can drag them between days there.</div>}
        </div>
      </DL>
      {onFocus&&!task.done&&(
        <button onClick={()=>onFocus(task)} style={{width:"100%",padding:"9px",borderRadius:9,border:"none",cursor:"pointer",background:T.grad,color:"#fff",fontSize:12,fontWeight:700,fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6,boxShadow:"0 3px 12px rgba(192,132,252,.3)"}}>
          🍅 Focus on this task <span style={{opacity:.8,fontWeight:500}}>· starts the Pomodoro</span>
        </button>
      )}
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

function MatrixView({T,tasks,cats,updateTask,deleteTask,addMatrixTask,toggleMyDay,isInMyDay,canvasNotes,setCanvasNotes,onCanvasToTask,requestLink,onCanvasToNote,onOpenTask,selId}) {
  const [tab,setTab]=useState("matrix");
  const narrow=useNarrow();   // 157px-wide quadrants are unreadable — a phone stacks them instead
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:narrow?"12px 13px 0":"14px 22px 0",borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:8,flexWrap:"wrap"}}>
          <div style={{minWidth:0,flexGrow:1}}>
            <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:19,fontWeight:700,letterSpacing:"-.4px"}}>{tab==="matrix"?"Priority Matrix":"Freeform Canvas"}</h1>
            <p style={{fontSize:11,color:T.textMuted,marginTop:1}}>{tab==="matrix"?("Tap a card for details · "+dragHint("matrix")+" · swipe ← delete, → My Day"):"Tap empty space to jot an idea · drag to move it · 🔗 link it to a task · ➔ turn it into a task"}</p>
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
        ?<EisenhowerMatrix T={T} tasks={tasks} cats={cats} updateTask={updateTask} deleteTask={deleteTask} addMatrixTask={addMatrixTask} toggleMyDay={toggleMyDay} isInMyDay={isInMyDay} onOpenTask={onOpenTask} selId={selId}/>
        :<FreeformCanvas T={T} notes={canvasNotes} setNotes={setCanvasNotes} onCanvasToTask={onCanvasToTask} requestLink={requestLink} onCanvasToNote={onCanvasToNote}/>}
    </div>
  );
}

function EisenhowerMatrix({T,tasks,cats,updateTask,deleteTask,addMatrixTask,toggleMyDay,isInMyDay,onOpenTask,selId}) {
  const narrow=useNarrow();   // four 157px columns are unreadable on a phone — stack them instead
  const [addingIn,setAddingIn]=useState(null);
  const [newText,setNewText]=useState("");
  const [dragOver,setDragOver]=useState(null);
  const [dragId,setDragId]=useState(null);
  const [editId,setEditId]=useState(null);
  const [dropCard,setDropCard]=useState(null); // {id,before} — insertion slot for the dragged card
  const [bigQ,setBigQ]=useState(null);         // a quadrant id → that quadrant fills the whole board
  const dragOverRef=useRef(null);
  const dropCardRef=useRef(null);
  useEffect(()=>{
    const fn=e=>{if(e.key==="n"&&!e.metaKey&&!e.ctrlKey&&document.activeElement.tagName!=="INPUT"&&document.activeElement.tagName!=="TEXTAREA")setAddingIn("q1");};
    window.addEventListener("keydown",fn); return ()=>window.removeEventListener("keydown",fn);
  },[]);
  const addNote=qid=>{const txt=newText.trim();if(!txt)return;addMatrixTask(qid,txt);setNewText("");setAddingIn(null);};
  const didDragNote=useRef(false);
  const justClosedRef=useRef(0); // blur-discarding the empty editor must not let the same click instantly reopen it
  const [swipeId,setSwipeId]=useState(null);
  const [swipeX,setSwipeX]=useState(0);
  // Quick horizontal flick = swipe (left delete / right My Day). Press-and-hold = drag between quadrants. Both coexist.
  const onNoteDown=(e,task)=>{
    if(e.target.closest("button")||e.target.tagName==="TEXTAREA") return;
    didDragNote.current=false;
    const sx=e.clientX,sy=e.clientY,type=e.pointerType; let mode=null,hold=null,moved=0,lastDx=0;
    const cleanup=()=>{ clearTimeout(hold); window.removeEventListener("pointermove",mv); window.removeEventListener("pointerup",up); window.removeEventListener("pointercancel",up); };
    const startDrag=()=>{ if(mode)return; mode="drag"; clearTimeout(hold); setDragId(task.id); navigator.vibrate?.(20);
      const ghost=makeDragGhost(task.title,QUAD[task.quadrant]?.color||T.accent,T);
      runDrag(
        ev=>{ didDragNote.current=true; ghost.move(ev.clientX,ev.clientY);
          const el=document.elementFromPoint(ev.clientX,ev.clientY);
          const qd=el&&el.closest("[data-quadrant]"); const card=el&&el.closest("[data-mnote-id]");
          dragOverRef.current=qd?qd.getAttribute("data-quadrant"):null;
          let hit=null;
          if(card&&card.getAttribute("data-mnote-id")!==String(task.id)){
            const cid=card.getAttribute("data-mnote-id"), r=card.getBoundingClientRect(), mid=r.left+r.width/2;
            const band=Math.min(14,r.width*0.2), prev=dropCardRef.current;   // dead band: stops the marker twitching between two slots
            const before=(prev&&prev.id===cid)
              ? (ev.clientX<mid-band ? true : ev.clientX>mid+band ? false : prev.before)
              : ev.clientX<mid;
            hit={id:cid,before};
          } else if(qd){
            // Over a quadrant's empty space → find the reading-order slot nearest the pointer,
            // so a cross-quadrant drop lands exactly where you point (not just at the end).
            const els=[...qd.querySelectorAll("[data-mnote-id]")].filter(n=>n.getAttribute("data-mnote-id")!==String(task.id));
            for(const n of els){ const r=n.getBoundingClientRect();
              if(ev.clientY<r.top-2||(ev.clientY<=r.bottom+2&&ev.clientX<r.left+r.width/2)){ hit={id:n.getAttribute("data-mnote-id"),before:true}; break; } }
            if(!hit&&els.length){ const lastEl=els[els.length-1]; hit={id:lastEl.getAttribute("data-mnote-id"),before:false}; }
          }
          dropCardRef.current=hit; setDropCard(hit); setDragOver(dragOverRef.current); },
        ()=>{ ghost.remove(); const q=dragOverRef.current, hit=dropCardRef.current; dragOverRef.current=null; dropCardRef.current=null; setDragId(null); setDragOver(null); setDropCard(null);
          if(hit){ // land exactly at the pointed slot (works across quadrants too)
            const tgt=tasks.find(t=>String(t.id)===hit.id); if(tgt){ const quad=tgt.quadrant;
              const cards=tasks.filter(t=>t.quadrant===quad&&!t.done&&t.id!==task.id).sort((a,b)=>(b.position||0)-(a.position||0));
              const ti=cards.findIndex(t=>String(t.id)===hit.id); let newPos;
              if(hit.before){ const above=cards[ti-1]; newPos=above?((above.position||0)+(tgt.position||0))/2:(tgt.position||0)+1; }
              else { const below=cards[ti+1]; newPos=below?((tgt.position||0)+(below.position||0))/2:(tgt.position||0)-1; }
              updateTask(task.id,{position:newPos,...(quad!==task.quadrant?{quadrant:quad}:{})}); }
          } else if(q&&q!==task.quadrant){ updateTask(task.id,{quadrant:q}); }
        }
      );
    };
    const mv=ev=>{
      const dx=ev.clientX-sx,dy=ev.clientY-sy; lastDx=dx;
      moved=Math.max(moved,Math.hypot(dx,dy));
      if(mode==="swipe"){ didDragNote.current=true; setSwipeX(Math.max(-95,Math.min(dx,95))); return; }
      if(mode) return;
      // Moving at all cancels the long-press: from here the gesture can only be a swipe (or a scroll).
      if(moved>8) clearTimeout(hold);
      if(Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)){ mode="swipe"; setSwipeId(task.id); setSwipeX(dx); } // across → My Day / delete
      else if(type==="mouse"&&Math.abs(dy)>8&&Math.abs(dy)>=Math.abs(dx)){ startDrag(); }               // down/up → pick it up
      // touch vertical: the card is pan-y, so the quadrant just scrolls
    };
    const up=ev=>{
      if(mode==="swipe"){ const dx=ev.type==="pointercancel"?0:lastDx; cleanup(); setSwipeId(null); setSwipeX(0);   // a cancelled touch never counts as a swipe
        if(dx<-60){ navigator.vibrate?.(25); deleteTask(task.id); }
        else if(dx>60){ navigator.vibrate?.(20); toggleMyDay(task.id); }
        return;
      }
      cleanup();
    };
    // Hold still (any pointer, finger or mouse) → drag. Once you've moved 8px it can never become a drag,
    // so a swipe — however long or slanted — always stays a swipe.
    hold=setTimeout(()=>{ if(!mode&&moved<=8) startDrag(); },300);
    window.addEventListener("pointermove",mv); window.addEventListener("pointerup",up); window.addEventListener("pointercancel",up);
  };
  const openNote=task=>{ if(didDragNote.current){ didDragNote.current=false; return; } onOpenTask?.(task); };
  return (
    <div style={{flex:1,display:"grid",gridTemplateColumns:(bigQ||narrow)?"1fr":"1fr 1fr",gridTemplateRows:bigQ?"1fr":(narrow?"repeat(4, minmax(190px, auto))":"1fr 1fr"),gap:1,background:T.border,overflow:narrow&&!bigQ?"auto":"hidden"}}>
      {QUAD_ORDER.filter(qid=>!bigQ||bigQ===qid).map(qid=>{const q=QUAD[qid];return(
        <div key={qid} data-quadrant={qid}
          style={{background:dragOver===qid?q.color+"12":T.bg,transition:"background .15s",display:"flex",flexDirection:"column",overflow:"hidden",outline:dragOver===qid?`2px dashed ${q.color}66`:"none",outlineOffset:"-2px"}}>
          <div style={{padding:narrow?"8px 10px 7px":"9px 14px 7px",borderBottom:`1px solid ${T.border}`,background:q.color+"12",display:"flex",justifyContent:"space-between",alignItems:"center",gap:6,flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:6,minWidth:0,flexGrow:1}}>
              <span style={{fontSize:11,fontWeight:700,color:q.color,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{q.icon} {q.label}</span>
              <span style={{fontSize:9,color:T.textMuted,background:T.surface2,padding:"1px 6px",borderRadius:20,border:`1px solid ${T.border}`}}>{q.short}</span>
            </div>
            <div style={{display:"flex",gap:4,flexShrink:0}}>
              <button onClick={()=>setBigQ(bigQ===qid?null:qid)} title={bigQ===qid?"Back to all four quadrants":"Enlarge this quadrant"} style={{width:22,height:22,borderRadius:5,border:"none",cursor:"pointer",background:bigQ===qid?q.color:q.color+"22",color:bigQ===qid?"#fff":q.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,lineHeight:1}}>{bigQ===qid?"🗗":"⛶"}</button>
              <button onClick={()=>{setAddingIn(qid);setNewText("");}} style={{width:22,height:22,borderRadius:5,border:"none",cursor:"pointer",background:q.color+"22",color:q.color,display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="plus" s={12} c={q.color}/></button>
            </div>
          </div>
          <div onClick={e=>{
            if(didDragNote.current){ didDragNote.current=false; return; }        // a swipe/drag release is not a request for a new task
            if(Date.now()-justClosedRef.current<400) return;                      // the click that closed the empty editor shouldn't reopen it
            if(e.target===e.currentTarget&&addingIn!==qid){setAddingIn(qid);setNewText("");}
          }} style={{flex:1,padding:10,overflowY:"auto",display:"flex",flexWrap:"wrap",gap:7,alignContent:"flex-start",cursor:"text"}}>
            {tasks.filter(t=>t.quadrant===qid&&!t.done).sort((a,b)=>(b.position||0)-(a.position||0)).map(task=>(
              <Fragment key={task.id}>
                <MNote dropEdge={dropCard?.id===String(task.id)?(dropCard.before?"left":"right"):null} task={task} qColor={q.color} catMeta={cats[task.tag]} T={T} onDown={onNoteDown} onClickNote={()=>openNote(task)} dragging={dragId===task.id} sel={selId===task.id} swipeX={swipeId===task.id?swipeX:0} inMyDay={!!isInMyDay?.(task)} onRemove={()=>updateTask(task.id,{quadrant:null})} editing={editId===task.id} onSave={txt=>{const t=txt.trim();if(t&&t!==task.title){const patch=titleEditPatch(task,t,cats);if(Object.keys(patch).length)updateTask(task.id,patch);}setEditId(null);}}/>
              </Fragment>
            ))}
            {addingIn===qid&&(
              <div style={{width:"100%",animation:"slideIn .2s ease"}}>
                <textarea autoFocus value={newText} onChange={e=>setNewText(e.target.value)} onBlur={()=>{if(!newText.trim()){justClosedRef.current=Date.now();setAddingIn(null);}}} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();addNote(qid);}if(e.key==="Escape"){justClosedRef.current=Date.now();setAddingIn(null);}}} placeholder="New task… Enter to save" style={{width:"100%",minHeight:58,padding:"7px",borderRadius:7,border:`1px solid ${q.color}88`,background:q.color+"11",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none",resize:"none"}}/>
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

function MNote({task,qColor,catMeta,T,onRemove,editing,onSave,onDown,onClickNote,dragging,inMyDay,sel,swipeX=0,dropEdge=null}) {
  const [hov,setHov]=useState(false);
  const [et,setEt]=useState(task.title);
  if (editing) return (
    <div style={{width:"100%"}}>
      <textarea autoFocus value={et} onChange={e=>setEt(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();onSave(et);}if(e.key==="Escape")onSave(task.title);}} onBlur={()=>onSave(et)} style={{width:"100%",minHeight:58,padding:"7px",borderRadius:7,border:`1px solid ${qColor}88`,background:qColor+"11",color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none",resize:"none"}}/>
    </div>
  );
  return (
    <div style={{position:"relative",minWidth:88,maxWidth:160}}>
      {dropEdge&&<div style={{position:"absolute",top:0,bottom:0,[dropEdge]:-5,width:3,borderRadius:2,background:T.accent,boxShadow:`0 0 8px ${T.accent}`,zIndex:6,pointerEvents:"none"}}/>}
      {/* Same swipe reveal UI as the task list, so the gesture reads the same everywhere. */}
      {swipeX<0&&(
        <div style={{position:"absolute",inset:0,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"flex-end",gap:4,paddingRight:8,background:`linear-gradient(270deg,${T.danger}44,transparent)`,color:T.danger,fontWeight:700,fontSize:10,pointerEvents:"none"}}>
          {swipeX<-60?"Release to delete 🗑":"Delete"}<Ico n="trash" s={12} c={T.danger}/>
        </div>
      )}
      {swipeX>0&&(
        <div style={{position:"absolute",inset:0,borderRadius:8,display:"flex",alignItems:"center",gap:4,paddingLeft:8,background:`linear-gradient(90deg,${T.warning}44,transparent)`,color:T.warning,fontWeight:700,fontSize:10,pointerEvents:"none"}}>
          <Ico n="sun" s={12} c={T.warning}/>{swipeX>60?"Release for My Day ☀️":"My Day"}
        </div>
      )}
      <div data-mnote-id={task.id} onPointerDown={e=>onDown?.(e,task)} onClick={()=>onClickNote?.()}
        onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
        style={{padding:"7px 9px",borderRadius:8,background:swipeX!==0?T.surface:qColor+"1a",border:`1px solid ${swipeX<-30?T.danger:swipeX>30?"#f59e0b":sel?qColor:qColor+"44"}`,boxShadow:sel?`0 0 0 2px ${qColor}55`:dragging?`0 10px 22px ${qColor}55`:hov?`0 6px 14px ${qColor}33`:"none",fontSize:12,color:T.text,lineHeight:1.5,position:"relative",cursor:"grab",transition:swipeX?"none":"transform .15s,box-shadow .15s",transform:swipeX?`translateX(${swipeX}px)`:dragging?"scale(1.05) rotate(1deg)":hov?"translateY(-2px) rotate(.4deg)":"none",opacity:dragging?.85:1,userSelect:"none",WebkitUserSelect:"none",touchAction:"pan-y"}}>
        <div style={{borderLeft:`3px solid ${qColor}`,paddingLeft:6}}>{task.title}</div>
        {task.notes&&task.notes.trim()&&<div style={{marginTop:4,fontSize:9.5,color:T.textMuted,lineHeight:1.4,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>📝 {task.notes.trim().split("\n")[0].slice(0,90)}</div>}
        {(task.due||task.subtasks?.length>0||task.attachments?.length>0)&&<div style={{marginTop:3,fontSize:8.5,color:T.textMuted,display:"flex",gap:6,flexWrap:"wrap"}}>
          {task.due&&<span style={{color:(!isTbd(task.due)&&task.due<tod()&&!task.done)?T.danger:T.textMuted,fontWeight:(!isTbd(task.due)&&task.due<tod()&&!task.done)?700:500}}>📅 {fmtDate(task.due)}</span>}
          {task.subtasks?.length>0&&<span>☑ {task.subtasks.filter(s=>s.done).length}/{task.subtasks.length}</span>}
          {task.attachments?.length>0&&<span>📎 {task.attachments.length}</span>}
        </div>}
        {catMeta&&<div style={{marginTop:4,fontSize:9,color:catMeta.color,fontWeight:600,textTransform:"capitalize",display:"flex",alignItems:"center",gap:3}}><CatIcon icon={catMeta.icon} size={9}/> {task.tag}</div>}
        {inMyDay&&swipeX===0&&<div style={{position:"absolute",top:-7,left:-4,width:16,height:16,borderRadius:"50%",background:"#f59e0b",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 5px rgba(0,0,0,.3)"}}><Ico n="sun" s={9} c="#fff"/></div>}
        {hov&&!editing&&swipeX===0&&<button title="Remove from board (keep task)" onClick={e=>{e.stopPropagation();onRemove();}} style={{position:"absolute",top:-8,right:-6,width:18,height:18,borderRadius:4,border:"none",cursor:"pointer",background:T.surface,color:T.textMuted,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 6px rgba(0,0,0,.3)",zIndex:10}}><Ico n="x" s={9}/></button>}
      </div>
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
    const newNote = { id: crypto.randomUUID(), text: "", x, y, color: NOTE_COLS[notes.length % NOTE_COLS.length] }; // stays empty — vanishes on blur if you don't type
    setNotes(ns => [...ns, newNote]);
    setEditingId(newNote.id);
  }, [notes.length, setNotes]);
  const convertToTask = (note, myDay) => { onCanvasToTask?.(note.text, myDay); setNotes(ns => ns.filter(n => n.id !== note.id)); };
  const linkToTask = (note) => { requestLink?.(t=>{ onCanvasToNote?.(note.text, t.id); setNotes(ns => ns.filter(n => n.id !== note.id)); }); };
  const [cleared,setCleared]=useState(null);
  const clearTimer=useRef(null);
  const clearAll=()=>{ if(!notes.length)return; setCleared(notes); setNotes([]); setEditingId(null); navigator.vibrate?.(20); clearTimeout(clearTimer.current); clearTimer.current=setTimeout(()=>setCleared(null),8000); };
  const undoClear=()=>{ if(cleared){ setNotes(cleared); setCleared(null); clearTimeout(clearTimer.current); } };
  return (
    <div ref={canvasRef} style={{flex:1,position:"relative",background:T.canvas,overflow:"hidden",cursor:"crosshair"}}
      onPointerMove={onPointerMove} onPointerUp={onPointerUp} onClick={onCanvasClick}>
      {notes.length>0&&(
        <button onClick={e=>{e.stopPropagation();clearAll();}} title="Clear all freeform notes" style={{position:"absolute",top:12,right:16,zIndex:20,display:"flex",alignItems:"center",gap:6,padding:"7px 12px",borderRadius:9,border:`1px solid ${T.border}`,background:T.surface,color:T.danger,cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"'DM Sans',sans-serif",boxShadow:"0 2px 8px rgba(0,0,0,.15)"}}><Ico n="trash" s={12} c={T.danger}/> Clear all</button>
      )}
      {cleared&&(
        <div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:12,left:"50%",transform:"translateX(-50%)",zIndex:21,display:"flex",alignItems:"center",gap:10,padding:"8px 14px",borderRadius:10,background:T.text,color:T.bg,fontSize:12,fontWeight:600,fontFamily:"'DM Sans',sans-serif",boxShadow:"0 4px 16px rgba(0,0,0,.3)"}}>
          Cleared {cleared.length} {cleared.length===1?"note":"notes"}
          <button onClick={undoClear} style={{background:T.accent,color:"#fff",border:"none",borderRadius:7,padding:"4px 12px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>Undo</button>
        </div>
      )}
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
          onPointerDown={e=>onPointerDown(e,note)}
          onSave={txt=>{
            const t=(txt||"").trim();
            if(!t){ // nothing typed → a brand-new note simply disappears; an old note keeps its text
              if(!(note.text||"").trim()||note.text==="New idea…") setNotes(ns=>ns.filter(n=>n.id!==note.id));
              setEditingId(null); return;
            }
            setNotes(ns=>ns.map(n=>n.id===note.id?{...n,text:t}:n)); setEditingId(null);
          }}
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

function FreeNote({note,T,editing,onPointerDown,onSave,onDelete,onToMyDay,onConvert,onLink,onColorChange}) {
  const [hov,setHov]=useState(false);
  const [txt,setTxt]=useState(note.text);
  useEffect(()=>setTxt(note.text),[note.text]);
  return (
    <div style={{position:"absolute",left:note.x,top:note.y,zIndex:hov||editing?20:10,transition:"box-shadow .15s,z-index 0s"}}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      {editing ? (
        <div style={{minWidth:130,padding:2}}>
          <textarea autoFocus value={txt} onChange={e=>setTxt(e.target.value)} placeholder="New idea…"
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

// Reusable swipe-left-to-delete row (red "Release to delete" reveal). Buttons inside are excluded from the swipe.
function SwipeRow({T,onDelete,onTap,children}) {
  const [sx,setSx]=useState(0);
  const didSwipe=useRef(false);
  const down=e=>{
    if(e.target.closest("button,[data-nodrag]")) return;
    didSwipe.current=false;
    const startX=e.clientX,startY=e.clientY; let mode=null;
    const cleanup=()=>{window.removeEventListener("pointermove",mv);window.removeEventListener("pointerup",up);window.removeEventListener("pointercancel",up);};
    const mv=ev=>{ const dx=ev.clientX-startX,dy=ev.clientY-startY;
      if(mode==="swipe"){ didSwipe.current=true; setSx(Math.min(0,Math.max(dx,-140))); return; }
      if(Math.abs(dx)>10&&Math.abs(dx)>Math.abs(dy)&&dx<0){ mode="swipe"; setSx(dx); }
      else if(Math.abs(dy)>10){ cleanup(); } };
    const up=ev=>{ cleanup(); if(mode==="swipe"){ const dx=ev.type==="pointercancel"?0:(ev.clientX-startX); if(dx<-70){ navigator.vibrate?.(20); onDelete?.(); } setSx(0); } };
    window.addEventListener("pointermove",mv);window.addEventListener("pointerup",up);window.addEventListener("pointercancel",up);
  };
  return (
    <div style={{position:"relative",borderRadius:8,overflow:"hidden",marginBottom:2}}>
      {sx<0&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:14,gap:5,background:`linear-gradient(270deg,${T.danger}55,transparent)`,color:T.danger,fontWeight:700,fontSize:11,pointerEvents:"none"}}>{sx<-70?"Release to delete":"Delete"}<Ico n="trash" s={13} c={T.danger}/></div>}
      <div onPointerDown={down} onClick={()=>{ if(didSwipe.current){didSwipe.current=false;return;} onTap?.(); }} style={{transform:sx?`translateX(${sx}px)`:"none",transition:sx?"none":"transform .12s",background:sx?T.bg:"transparent",cursor:onTap?"pointer":"default",touchAction:"pan-y"}}>
        {children}
      </div>
    </div>
  );
}
function NotesView({T,notes,setNotes,tasks,onGoToTask,requestLink,onLinkNote,onClearTaskNotes}) {
  const [sel,setSel]=useState(null);
  const [nt,setNt]=useState("");
  const [mode,setMode]=useState("text");
  // On a phone the list and the editor cannot share the screen — you see one at a time,
  // exactly like the task list and its details panel.
  const narrow=useNarrow();
  const [listOpen,setListOpen]=useState(true);
  const linkedNotes=(notes||[]).map(n=>({note:n,task:n.taskId!=null?(tasks||[]).find(t=>t.id===n.taskId):null})).filter(x=>x.task);
  const linkedTaskIds=new Set(linkedNotes.map(x=>x.task.id));
  // A linked note lives only in the "Notes on tasks" section — keep it out of the main list, and out of the task-notes rows (no dupes).
  const plainNotes=(notes||[]).filter(n=>n.taskId==null);
  const taskNotes=(tasks||[]).filter(t=>t.notes&&t.notes.trim()&&!linkedTaskIds.has(t.id));
  const selTask=sel&&sel.taskId!=null?(tasks||[]).find(t=>t.id===sel.taskId):null;
  const onEditorDown=e=>{
    if(e.target.closest("input,textarea,select,button,a,canvas")) return;
    const sx=e.clientX,sy=e.clientY; let decided=false;
    const cleanup=()=>{window.removeEventListener("pointermove",mv);window.removeEventListener("pointerup",up);window.removeEventListener("pointercancel",up);};
    const mv=ev=>{ if(decided)return; const dx=ev.clientX-sx,dy=ev.clientY-sy; if(Math.abs(dx)<14&&Math.abs(dy)<14)return; decided=true; cleanup(); if(Math.abs(dx)>Math.abs(dy)) setListOpen(dx>0); };
    const up=()=>cleanup();
    window.addEventListener("pointermove",mv);window.addEventListener("pointerup",up);window.addEventListener("pointercancel",up);
  };
  const ACC=["#3b82f6","#22c55e","#f59e0b","#ef4444","#a855f7","#ec4899","#14b8a6"];
  const addNote=()=>{if(!nt.trim())return;const n={id:crypto.randomUUID(),title:nt.trim(),body:"",pinned:false,color:ACC[notes.length%ACC.length],created:tod()};setNotes(ns=>[n,...ns]);setSel(n);if(narrow)setListOpen(false);setNt("");};
  const upNote=(id,patch)=>{setNotes(ns=>ns.map(n=>n.id===id?{...n,...patch}:n));if(sel?.id===id)setSel(s=>({...s,...patch}));};
  const delNote=id=>{setNotes(ns=>ns.filter(n=>n.id!==id));if(sel?.id===id)setSel(null);};
  return (
    <div style={{flex:1,display:"flex",overflow:"hidden"}}>
      <div style={{width:listOpen?(narrow?"100%":248):0,flexGrow:(narrow&&listOpen)?1:0,minWidth:0,opacity:listOpen?1:0,borderRight:listOpen?`1px solid ${T.border}`:"none",display:"flex",flexDirection:"column",overflowY:"auto",overflowX:"hidden",background:T.sidebar,transition:"width .2s ease,opacity .15s ease",flexShrink:0}}>
        <div style={{padding:"16px 12px 10px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:16,fontWeight:700}}>Notes</h2>
            <span style={{fontSize:11,color:T.textMuted}}>Standalone editor</span>
          </div>
          <div style={{fontSize:11,color:T.textMuted,marginBottom:10,lineHeight:1.5,padding:"7px 9px",background:T.surface2,borderRadius:8,border:`1px solid ${T.border}`}}>
            💡 Notes are for <strong>freeform writing</strong> — meeting notes, ideas, journals, references. <span style={{opacity:.8}}>Swipe a note ← left to delete.</span>
          </div>
          <div style={{display:"flex",gap:6}}>
            <input value={nt} onChange={e=>setNt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addNote()} placeholder="New note title…" style={{flex:1,padding:"7px 9px",borderRadius:8,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none"}}/>
            <button onClick={addNote} style={{width:30,height:30,borderRadius:8,border:"none",cursor:"pointer",background:T.grad,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="plus" s={14} c="#fff"/></button>
          </div>
        </div>
        {plainNotes.filter(n=>n.pinned).length>0&&<>
          <div style={{padding:"0 12px 2px",fontSize:9,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",color:T.textMuted}}>📌 Pinned</div>
          <div style={{padding:"0 8px"}}>{plainNotes.filter(n=>n.pinned).map(n=><NRow key={n.id} note={n} T={T} sel={sel} onSel={setSel} onUp={upNote} onDel={delNote}/>)}</div>
        </>}
        <div style={{padding:"0 8px 10px"}}>
          {plainNotes.filter(n=>n.pinned).length>0&&<div style={{padding:"6px 4px 2px",fontSize:9,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",color:T.textMuted}}>All Notes</div>}
          {plainNotes.filter(n=>!n.pinned).map(n=><NRow key={n.id} note={n} T={T} sel={sel} onSel={setSel} onUp={upNote} onDel={delNote}/>)}
        </div>
        {(taskNotes.length>0||linkedNotes.length>0)&&(
          <div style={{padding:"4px 8px 16px",borderTop:`1px solid ${T.border}`}}>
            <div style={{padding:"10px 4px 4px",fontSize:9,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",color:T.textMuted}}>📋 Notes on tasks</div>
            {linkedNotes.map(({note,task})=>(
              <SwipeRow key={"ln"+note.id} T={T} onDelete={()=>delNote(note.id)} onTap={()=>{setSel(note); if(narrow) setListOpen(false);}}>
                <div title="Tap to edit · swipe ← to delete" style={{display:"flex",alignItems:"center",gap:5,padding:"6px 8px"}}>
                  <span style={{fontSize:11}}>🔗</span>
                  <span style={{fontSize:12,fontWeight:600,color:T.text,flex:1,minWidth:0,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{note.title||"Untitled"}</span>
                  <button onClick={e=>{e.stopPropagation();onGoToTask?.(task);}} data-nodrag title={"Go to task: "+task.title} style={{background:"none",border:"none",cursor:"pointer",color:T.accent,fontWeight:700,fontSize:9,whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif",padding:"2px 4px",flexShrink:0}}>{task.title.slice(0,10)} →</button>
                </div>
              </SwipeRow>
            ))}
            {taskNotes.map(t=>(
              <SwipeRow key={t.id} T={T} onDelete={()=>onClearTaskNotes?.(t.id)} onTap={()=>onGoToTask?.(t)}>
                <div title="Tap to open task · swipe ← to clear this note" style={{padding:"8px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <Ico n="check" s={11} c={T.textMuted}/>
                    <span style={{fontSize:12,fontWeight:600,color:T.text,flex:1,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{t.title}</span>
                    <button onClick={e=>{e.stopPropagation();onGoToTask?.(t);}} data-nodrag style={{background:"none",border:"none",cursor:"pointer",color:T.accent,fontWeight:700,fontSize:9,whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>Go →</button>
                  </div>
                  <div style={{fontSize:11,color:T.textMuted,marginTop:2,marginLeft:16,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{t.notes.slice(0,46)}</div>
                </div>
              </SwipeRow>
            ))}
          </div>
        )}
      </div>
      <div style={{flex:1,minWidth:0,display:(narrow&&listOpen)?"none":"flex",flexDirection:"column",overflow:"hidden"}} onPointerDown={onEditorDown}>
      <div style={{padding:"8px 14px",borderBottom:`1px solid ${T.border}`,flexShrink:0,display:"flex",alignItems:"center",gap:8}}>
        <button onClick={()=>setListOpen(o=>!o)} title={listOpen?"Hide list for more room":"Show list"} style={{width:28,height:28,borderRadius:7,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico n="menu" s={15}/></button>
        <span style={{fontSize:11,color:T.textMuted,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{narrow?(listOpen?"Tap to open the editor":"← Back to your notes"):(listOpen?"Swipe left (or tap) to hide the list":"Swipe right (or tap) to show the list")}</span>
      </div>
      {sel?(
        <div style={{flex:1,display:"flex",flexDirection:"column",padding:narrow?"14px 13px 20px":"18px 26px 22px",overflowY:"auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
            <input value={sel.title} onChange={e=>upNote(sel.id,{title:e.target.value})} onBlur={()=>{ if(sel.taskId!=null){ const t=(tasks||[]).find(x=>x.id===sel.taskId); if(t) onLinkNote?.(sel,t); } }} style={{flex:1,minWidth:0,fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:700,background:"transparent",border:"none",outline:"none",color:T.text,letterSpacing:"-.3px"}}/>
            <div style={{display:"flex",gap:5,flexShrink:0}}>
              {ACC.slice(0,5).map(c=><div key={c} onClick={()=>upNote(sel.id,{color:c})} style={{width:14,height:14,borderRadius:"50%",background:c,cursor:"pointer",border:`2px solid ${sel.color===c?T.text:"transparent"}`,transition:"border-color .15s"}}/>)}
            </div>
          </div>
          <div style={{height:3,width:36,borderRadius:2,background:sel.color,marginBottom:14}}/>
          <div style={{marginBottom:14}}>
            {selTask?(
              <div style={{display:"inline-flex",alignItems:"center",gap:7,padding:"6px 10px",borderRadius:9,background:T.accentGlow,border:`1px solid ${T.accent}44`}}>
                <span style={{fontSize:12}}>🔗</span>
                <span style={{fontSize:12,color:T.textMuted}}>Linked to task:</span>
                <button onClick={()=>onGoToTask?.(selTask)} style={{background:"none",border:"none",cursor:"pointer",color:T.accent,fontWeight:700,fontSize:12,fontFamily:"'DM Sans',sans-serif",padding:0}}>{selTask.title} →</button>
                <button onClick={()=>upNote(sel.id,{taskId:null})} title="Unlink" style={{width:18,height:18,borderRadius:5,border:"none",cursor:"pointer",background:T.surface2,color:T.textMuted,display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" s={10}/></button>
              </div>
            ):(
              <button onClick={()=>requestLink?.(t=>{upNote(sel.id,{taskId:t.id});onLinkNote?.(sel,t);})} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:9,border:`1px dashed ${T.border}`,background:"transparent",color:T.textMuted,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>🔗 Link this note to a task</button>
            )}
          </div>
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
  const [sx,setSx]=useState(0);
  const didSwipe=useRef(false);
  const down=e=>{
    if(e.target.closest("button")) return;
    didSwipe.current=false;
    const startX=e.clientX,startY=e.clientY; let mode=null;
    const cleanup=()=>{ window.removeEventListener("pointermove",mv); window.removeEventListener("pointerup",up); window.removeEventListener("pointercancel",up); };
    const mv=ev=>{ const dx=ev.clientX-startX,dy=ev.clientY-startY;
      if(mode==="swipe"){ didSwipe.current=true; setSx(Math.min(0,Math.max(dx,-140))); return; }
      if(Math.abs(dx)>10&&Math.abs(dx)>Math.abs(dy)&&dx<0){ mode="swipe"; setSx(dx); }
      else if(Math.abs(dy)>10){ cleanup(); } };
    const up=ev=>{ cleanup(); if(mode==="swipe"){ const dx=ev.type==="pointercancel"?0:(ev.clientX-startX); if(dx<-70){ navigator.vibrate?.(20); onDel(note.id); } setSx(0); } };
    window.addEventListener("pointermove",mv); window.addEventListener("pointerup",up); window.addEventListener("pointercancel",up);
  };
  return (
    <div style={{position:"relative",borderRadius:8,overflow:"hidden",marginBottom:2}}>
      {sx<0&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:14,gap:5,background:`linear-gradient(270deg,${T.danger}55,transparent)`,color:T.danger,fontWeight:700,fontSize:11,pointerEvents:"none"}}>{sx<-70?"Release to delete":"Delete"}<Ico n="trash" s={13} c={T.danger}/></div>}
      <div onPointerDown={down} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={()=>{ if(didSwipe.current){didSwipe.current=false;return;} onSel(note); }} style={{padding:"8px",borderRadius:8,background:sx?T.bg:(sel?.id===note.id?T.accentGlow:hov?T.surface2:"transparent"),border:`1px solid ${sel?.id===note.id?T.accent+"44":"transparent"}`,cursor:"pointer",position:"relative",transform:sx?`translateX(${sx}px)`:"none",transition:sx?"none":"all .12s",touchAction:"pan-y"}}>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:note.color,flexShrink:0}}/>
          <span style={{fontSize:12,fontWeight:600,color:T.text,flex:1,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{note.title||"Untitled"}</span>
        </div>
        <div style={{fontSize:11,color:T.textMuted,marginTop:2,marginLeft:12,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{note.body?note.body.slice(0,38)+"…":"Empty"}</div>
        {hov&&sx===0&&<div style={{position:"absolute",right:5,top:"50%",transform:"translateY(-50%)",display:"flex",gap:2}}>
          <button onClick={e=>{e.stopPropagation();onUp(note.id,{pinned:!note.pinned});}} style={{width:20,height:20,borderRadius:4,border:"none",cursor:"pointer",background:T.surface3,color:note.pinned?"#f59e0b":T.textMuted,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center"}}>📌</button>
          <button onClick={e=>{e.stopPropagation();onDel(note.id);}} style={{width:20,height:20,borderRadius:4,border:"none",cursor:"pointer",background:T.surface3,color:T.danger,display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" s={10}/></button>
        </div>}
      </div>
    </div>
  );
}

const HABIT_EMOJI=["💧","📖","🏃","🧘","😴","🥗","💪","🚶","📝","☀️","🦷","💊","🎯","🧹","💰","🚭","🎸","🌱"];
const HABIT_COLORS=["#22c55e","#3b82f6","#f59e0b","#ef4444","#a855f7","#ec4899","#14b8a6","#eab308"];
const HABIT_SUGGEST=[["Drink water","💧"],["Read","📖"],["Exercise","🏃"],["Meditate","🧘"],["Sleep early","😴"],["Eat healthy","🥗"]];
const WD_SHORT=["Su","Mo","Tu","We","Th","Fr","Sa"];
const WD_ORDER=[1,2,3,4,5,6,0]; // Monday-first chips
function HabitsView({T,habits,setHabits,todStr,onCheckin,showToast}) {
  const [name,setName]=useState("");
  const [icon,setIcon]=useState("✨");
  const [iconPicked,setIconPicked]=useState(false);
  const [color,setColor]=useState(HABIT_COLORS[0]);
  const [cadence,setCadence]=useState(7);
  const [days,setDays]=useState(null); // specific weekdays for the new habit (null = count-based goal)
  const [pick,setPick]=useState(false);
  const [editId,setEditId]=useState(null);
  const [editPicked,setEditPicked]=useState(false); // manually chose an icon while editing → stop auto-guessing
  const has=(h,d)=>(h.log||[]).includes(d);
  // Day scheduling: habits with a `days` list only "count" on those weekdays; the rest are every-day.
  const todWd=new Date(todStr+"T12:00:00").getDay();
  const schedToday=h=>!h.days||h.days.length===0||h.days.includes(todWd);
  const schedOn=(h,d)=>!h.days||h.days.length===0||h.days.includes(new Date(d+"T12:00:00").getDay());
  const daysLabel=h=>(!h.days||h.days.length===0)?null:(h.days.length===7?"Every day":WD_ORDER.filter(d=>h.days.includes(d)).map(d=>WD_SHORT[d]).join(" "));
  // Today's scheduled habits first, ordered by their priority number (1 = top); ties keep manual drag order.
  const todayHabits=habits.filter(schedToday).slice().sort((a,b)=>(a.prio??999)-(b.prio??999));
  const extraHabits=habits.filter(h=>!schedToday(h));
  // Same smart icon system as the sidebar folders: the icon picks itself from the name as you type.
  const onNameChange=v=>{ const g=guessIcon(v,null), was=guessIcon(name,null); setName(v); if(!iconPicked) setIcon(g||"✨"); else if(g&&g!==was){ setIcon(g); setIconPicked(false); } };
  const add=(nm,ic)=>{ const n=(nm??name).trim(); if(!n)return; const finalIc=ic||(iconPicked?icon:guessIcon(n,"✨")); const hDays=days&&days.length?days:null; setHabits(hs=>{ const id=Math.max(Date.now(),hs.reduce((m,h)=>Math.max(m,h.id||0),0)+1); return [...hs,{id,name:n,icon:finalIc,color,cadence:hDays?hDays.length:cadence,days:hDays,prio:null,log:[],created:todStr}]; }); setName(""); setIcon("✨"); setIconPicked(false); setDays(null); };
  const patch=(id,p)=>setHabits(hs=>hs.map(x=>x.id===id?{...x,...p}:x));
  const toggle=h=>{ const done=has(h,todStr); setHabits(hs=>hs.map(x=>x.id===h.id?{...x,log:done?(x.log||[]).filter(d=>d!==todStr):[...(x.log||[]),todStr]}:x));
    if(!done){ onCheckin?.(h.id); if(habits.filter(schedToday).every(x=>x.id===h.id||has(x,todStr))) fireConfetti(); } // last scheduled habit of the day → celebrate
    else navigator.vibrate?.(8); };
  const del=id=>{ const h=habits.find(x=>x.id===id); if(!h)return; const idx=habits.findIndex(x=>x.id===id); setHabits(hs=>hs.filter(x=>x.id!==id)); navigator.vibrate?.(15); showToast?.(`Habit "${h.name}" deleted`,()=>{ setHabits(hs=>{ const arr=[...hs]; arr.splice(Math.min(idx,arr.length),0,h); return arr; }); showToast?.("Habit restored ✓"); }); };
  const [dragId,setDragId]=useState(null);
  const [dropH,setDropH]=useState(null); // {id,before} — insertion slot while dragging
  const dropRef=useRef(null);
  const beginHabitDrag=id=>{ setDragId(id); navigator.vibrate?.(15);
    const hb=habits.find(x=>String(x.id)===String(id));
    const ghost=makeDragGhost((hb?.icon?hb.icon+" ":"")+(hb?.name||"Habit"),hb?.color||T.accent,T);
    runDrag(
      ev=>{ ghost.move(ev.clientX,ev.clientY);
        const el=document.elementFromPoint(ev.clientX,ev.clientY); const c=el&&el.closest("[data-habit-id]");
        let hit=null;
        if(c&&c.getAttribute("data-habit-id")!==String(id)){ const r=c.getBoundingClientRect();
          // Multi-column grid (desktop) → cards sit side by side, so before/after reads left/right; single column reads top/bottom.
          const horiz=(c.parentElement?.clientWidth||0)>r.width*1.6;
          hit={id:c.getAttribute("data-habit-id"),before:horiz?(ev.clientX<r.left+r.width/2):(ev.clientY<r.top+r.height/2),horiz}; }
        dropRef.current=hit; setDropH(hit); },
      ()=>{ ghost.remove(); const hit=dropRef.current; dropRef.current=null; setDragId(null); setDropH(null);
        if(!hit||String(hit.id)===String(id)) return;
        const todayIds=todayHabits.map(x=>String(x.id));
        if(todayIds.includes(String(id))&&todayIds.includes(String(hit.id))){
          // Today's list displays in priority order — so a drag here rewrites the 1-2-3 numbers to
          // match the new visual order. That's why dragging "sticks" even when priorities are set.
          const seq=todayHabits.filter(x=>String(x.id)!==String(id));
          const ti=seq.findIndex(x=>String(x.id)===String(hit.id));
          seq.splice(hit.before?ti:ti+1,0,todayHabits.find(x=>String(x.id)===String(id)));
          const anyPrio=todayHabits.some(x=>x.prio!=null);
          const prioOf=Object.fromEntries(seq.map((x,i)=>[String(x.id),i+1]));
          setHabits(hs=>{
            const inSeq=new Set(seq.map(x=>String(x.id)));
            const reordered=[...seq.map(x=>hs.find(h=>h.id===x.id)||x),...hs.filter(x=>!inSeq.has(String(x.id)))];
            return anyPrio ? reordered.map(x=>prioOf[String(x.id)]?{...x,prio:prioOf[String(x.id)]}:x) : reordered;
          });
        } else {
          // "Wanna do more?" section (or mixed) — plain manual order.
          setHabits(hs=>{ const arr=[...hs]; const fi=arr.findIndex(x=>String(x.id)===String(id)); if(fi<0)return hs;
            const [m]=arr.splice(fi,1); let ti=arr.findIndex(x=>String(x.id)===String(hit.id)); if(ti<0){ arr.splice(fi,0,m); return arr; }
            if(!hit.before) ti++; arr.splice(ti,0,m); return arr; });
        }
      }
    );
  };
  const gripDown=(e,id)=>{ e.stopPropagation(); e.preventDefault(); beginHabitDrag(id); };
  const [swipe,setSwipe]=useState(null); // {id,x} while a card is being swiped left toward delete
  const runSwipe=(id,sx)=>{ runDrag(
    ev=>{ const dx=Math.min(0,ev.clientX-sx); setSwipe({id,x:Math.max(dx,-150)}); },
    ev=>{ const dx=ev.clientX-sx; setSwipe(null); if(dx<-90) del(id); }
  ); };
  // Card body gestures: swipe ← to delete; hold (the same short 120ms as everywhere else) or mouse-drag vertically to reorder.
  const bodyDown=(e,id)=>{
    if(e.target.closest("button,input,[data-grip],[data-trail],[data-edit]")) return;
    const type=e.pointerType, sx=e.clientX, sy=e.clientY; let decided=false, timer=null, lastDx=0, lastDy=0;
    const teardown=()=>{ clearTimeout(timer); window.removeEventListener("pointermove",probe); window.removeEventListener("pointerup",end); window.removeEventListener("pointercancel",end); };
    const startR=()=>{ decided=true; teardown(); beginHabitDrag(id); };
    const probe=ev=>{ if(decided)return; const dx=ev.clientX-sx,dy=ev.clientY-sy; lastDx=dx; lastDy=dy; if(Math.abs(dx)<6&&Math.abs(dy)<6)return;
      if(Math.abs(dx)>Math.abs(dy)&&dx<0){ decided=true; teardown(); runSwipe(id,sx); } // leftward = swipe-to-delete
      else if(type==="mouse") startR();                                                 // desktop vertical drag = reorder
      else { decided=true; teardown(); }                                                // touch vertical = let the page scroll
    };
    const end=()=>teardown();
    // Touch hold-STILL → reorder; any leftward pull at fire time means swipe-to-delete.
    if(type!=="mouse") timer=setTimeout(()=>{ if(!decided){
      if(Math.abs(lastDx)>Math.abs(lastDy)&&lastDx<-2){ decided=true; teardown(); runSwipe(id,sx); }
      else startR();
    } },250);
    window.addEventListener("pointermove",probe); window.addEventListener("pointerup",end); window.addEventListener("pointercancel",end);
  };
  // Streak only counts scheduled days: a Mon/Wed/Fri habit doesn't lose its fire over the weekend.
  const streakOf=h=>{ const set=new Set(h.log||[]); let s=0;
    if(schedOn(h,todStr)&&set.has(todStr)) s++;
    for(let i=1;i<400;i++){ const d=addDays(-i); if(!schedOn(h,d)) continue; if(set.has(d)) s++; else break; }
    return s; };
  const weekCount=h=>{ const set=new Set(h.log||[]); let c=0; for(let i=0;i<7;i++) if(set.has(addDays(-i))) c++; return c; };
  const last=n=>[...Array(n)].map((_,i)=>addDays(-(n-1-i)));
  const doneToday=todayHabits.filter(h=>has(h,todStr)).length;
  const allDone=todayHabits.length>0&&doneToday===todayHabits.length;
  const msg=habits.length===0?"Build a habit — small, daily, unstoppable.":allDone?"🎉 Every habit scheduled today is done. Incredible consistency!":doneToday===0?"A fresh day. Check off your first habit 👇":`${doneToday}/${todayHabits.length} done today — keep the momentum!`;
  return (
    <div style={{flex:1,overflowY:"auto",padding:"22px 26px"}}>
      <div style={{marginBottom:16}}>
        <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:700,letterSpacing:"-.5px",display:"flex",alignItems:"center",gap:8}}>Habits {todayHabits.length>0&&<span style={{fontSize:12,fontWeight:600,color:T.textMuted,background:T.surface2,border:`1px solid ${T.border}`,borderRadius:20,padding:"2px 10px"}}>{doneToday}/{todayHabits.length} today</span>}</h1>
        <p style={{fontSize:13,color:allDone?"#22c55e":T.textMuted,marginTop:3,fontWeight:allDone?600:400}}>{msg}</p>
      </div>

      {/* Add habit */}
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:"12px 14px",marginBottom:16}}>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>setPick(p=>!p)} title="The icon picks itself as you type — tap to choose your own" style={{width:40,height:40,borderRadius:10,border:`1px solid ${T.border}`,background:color+"18",cursor:"pointer",fontSize:20,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>{icon}</button>
          <input value={name} onChange={e=>onNameChange(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="New habit… e.g. Drink water" style={{flex:1,minWidth:0,padding:"10px 12px",borderRadius:10,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none"}}/>
          <button onClick={()=>add()} disabled={!name.trim()} style={{padding:"10px 16px",borderRadius:10,border:"none",cursor:name.trim()?"pointer":"default",background:name.trim()?T.grad:T.surface3,color:"#fff",fontWeight:700,fontSize:13,fontFamily:"'DM Sans',sans-serif",flexShrink:0,opacity:name.trim()?1:.5}}>Add</button>
        </div>
        {pick&&(
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:10}}>
            {HABIT_EMOJI.map(e=><button key={e} onClick={()=>{setIcon(e);setIconPicked(true);setPick(false);}} style={{width:34,height:34,borderRadius:8,border:`1px solid ${icon===e?T.accent:T.border}`,background:icon===e?T.accentGlow:"transparent",cursor:"pointer",fontSize:17}}>{e}</button>)}
          </div>
        )}
        <div style={{display:"flex",alignItems:"center",gap:10,marginTop:10,flexWrap:"wrap"}}>
          <div style={{display:"flex",gap:5}}>
            {HABIT_COLORS.map(c=><div key={c} onClick={()=>setColor(c)} style={{width:18,height:18,borderRadius:"50%",background:c,cursor:"pointer",border:`2px solid ${color===c?T.text:"transparent"}`}}/>)}
          </div>
          <div style={{marginLeft:"auto",display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}>
            <span style={{fontSize:11,color:T.textMuted}}>Goal:</span>
            {[[7,"Daily"],[5,"5×/wk"],[3,"3×/wk"]].map(([v,l])=>{ const on=!days?.length&&cadence===v; return (
              <button key={v} onClick={()=>{setCadence(v);setDays(null);}} style={{padding:"4px 10px",borderRadius:20,border:`1px solid ${on?T.accent:T.border}`,background:on?T.accentGlow:"transparent",color:on?T.accent:T.textMuted,cursor:"pointer",fontSize:11,fontWeight:on?700:500,fontFamily:"'DM Sans',sans-serif"}}>{l}</button>
            );})}
            <span style={{fontSize:11,color:T.textMuted,marginLeft:4}}>or days:</span>
            {WD_ORDER.map(d=>{ const on=(days||[]).includes(d); return (
              <button key={d} onClick={()=>setDays(cur=>{ const c=cur||[]; const nd=c.includes(d)?c.filter(x=>x!==d):[...c,d]; return nd.length?nd:null; })} title="Only count this habit on chosen weekdays" style={{width:26,height:26,borderRadius:"50%",border:`1px solid ${on?T.accent:T.border}`,background:on?T.accentGlow:"transparent",color:on?T.accent:T.textMuted,cursor:"pointer",fontSize:9,fontWeight:on?800:500,fontFamily:"'DM Sans',sans-serif",padding:0}}>{WD_SHORT[d]}</button>
            );})}
          </div>
        </div>
      </div>

      {habits.length===0&&(
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          <div style={{width:"100%",fontSize:12,color:T.textMuted,marginBottom:2}}>Quick start:</div>
          {HABIT_SUGGEST.map(([nm,ic])=>(
            <button key={nm} onClick={()=>add(nm,ic)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 13px",borderRadius:20,border:`1px solid ${T.border}`,background:T.surface,color:T.text,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{ic} {nm}</button>
          ))}
        </div>
      )}

      {habits.length>0&&<div style={{fontSize:10,color:T.textMuted,opacity:.6,marginBottom:8}}>💡 Tap the circle to check in · ✎ to edit, pick days & priority · swipe ← to delete · hold & drag to reorder · tap the trail bars to fix past days</div>}
      {(()=>{ const renderCard=h=>{ const done=has(h,todStr); const st=streakOf(h); const wc=weekCount(h); const sw=swipe?.id===h.id?swipe.x:0; const dl=daysLabel(h);
        return (
          <div key={h.id} data-habit-id={h.id} style={{position:"relative",borderRadius:14}}>
            {dropH?.id===String(h.id)&&(dropH.horiz
              ? <div style={{position:"absolute",top:8,bottom:8,[dropH.before?"left":"right"]:-4,width:3,borderRadius:2,background:T.accent,boxShadow:`0 0 8px ${T.accent}`,zIndex:5,pointerEvents:"none"}}/>
              : <div style={{position:"absolute",left:8,right:8,[dropH.before?"top":"bottom"]:-4,height:3,borderRadius:2,background:T.accent,boxShadow:`0 0 8px ${T.accent}`,zIndex:5,pointerEvents:"none"}}/>)}
            {sw!==0&&<div style={{position:"absolute",inset:0,background:T.danger,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"flex-end",padding:"0 16px",color:"#fff",fontSize:12,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>{sw<-90?"Release to delete":"Keep pulling ←"} 🗑</div>}
            <div onPointerDown={e=>bodyDown(e,h.id)} style={{background:T.surface,border:`1px solid ${dragId===h.id?T.accent:done?h.color+"66":T.border}`,borderRadius:14,padding:14,position:"relative",transform:sw!==0?`translateX(${sw}px)`:"none",transition:sw!==0?"border-color .2s":"border-color .2s, transform .15s ease",opacity:dragId===h.id?.5:1,touchAction:"pan-y",userSelect:"none",WebkitUserSelect:"none",WebkitTouchCallout:"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div data-grip onPointerDown={e=>gripDown(e,h.id)} title="Drag to reorder" style={{cursor:"grab",color:T.textMuted,opacity:.4,flexShrink:0,touchAction:"none",padding:"8px 2px",margin:"-8px 0"}}><Ico n="grip" s={16} c={T.textMuted}/></div>
              <button onClick={()=>toggle(h)} title={done?"Undo today":"Mark done today"} style={{width:46,height:46,borderRadius:"50%",flexShrink:0,cursor:"pointer",border:`2px solid ${h.color}`,background:done?h.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,transition:"all .18s",transform:done?"scale(1)":"scale(1)"}}>
                <span style={{filter:done?"grayscale(0)":"grayscale(.1)",opacity:done?1:.85}}>{done?"✓":h.icon}</span>
              </button>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:5,minWidth:0}}>
                  {h.prio!=null&&<span title="Priority — on its scheduled days this habit sorts to the top (set in ✎ edit)" style={{width:16,height:16,borderRadius:"50%",background:T.accentGlow,color:T.accent,fontSize:9,fontWeight:800,display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{h.prio}</span>}
                  <div style={{fontWeight:700,fontSize:15,fontFamily:"'Sora',sans-serif",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",minWidth:0}}>{h.icon} {h.name}</div>
                </div>
                <div style={{fontSize:12,color:T.textMuted,marginTop:2,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  <span style={{color:st>0?"#f59e0b":T.textMuted,fontWeight:st>0?700:400}}>{st>0?`🔥 ${st} day${st>1?"s":""}`:"No streak yet"}</span>
                  <span>· {wc}/{h.cadence} this wk</span>
                  {dl&&<span style={{color:T.accent,fontWeight:600}}>· {dl}</span>}
                </div>
              </div>
              <button onClick={()=>{setEditId(editId===h.id?null:h.id);setEditPicked(false);}} title="Edit habit — rename, icon, color, days & priority" style={{width:24,height:24,borderRadius:6,border:"none",background:editId===h.id?T.accentGlow:"transparent",color:editId===h.id?T.accent:T.textMuted,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="edit" s={12} c={editId===h.id?T.accent:T.textMuted}/></button>
              <button onClick={()=>del(h.id)} title="Delete habit (undo available)" style={{width:24,height:24,borderRadius:6,border:"none",background:"transparent",color:T.textMuted,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="trash" s={12} c={T.textMuted}/></button>
            </div>
            {editId===h.id&&(
              <div data-edit style={{marginTop:10,padding:10,borderRadius:10,background:T.surface2,display:"flex",flexDirection:"column",gap:8}}>
                <input value={h.name} onChange={e=>{ const v=e.target.value; patch(h.id,{name:v,...(!editPicked?{icon:guessIcon(v,h.icon)}:{})}); }} placeholder="Habit name" style={{width:"100%",boxSizing:"border-box",padding:"7px 10px",borderRadius:8,border:`1px solid ${T.border}`,background:T.surface,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:13,outline:"none"}}/>
                <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                  {HABIT_EMOJI.map(em=><button key={em} onClick={()=>{patch(h.id,{icon:em});setEditPicked(true);}} style={{width:28,height:28,borderRadius:7,border:`1px solid ${h.icon===em?T.accent:T.border}`,background:h.icon===em?T.accentGlow:"transparent",cursor:"pointer",fontSize:14,padding:0}}>{em}</button>)}
                </div>
                <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
                  {HABIT_COLORS.map(c=><div key={c} onClick={()=>patch(h.id,{color:c})} style={{width:16,height:16,borderRadius:"50%",background:c,cursor:"pointer",border:`2px solid ${h.color===c?T.text:"transparent"}`}}/>)}
                </div>
                <div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}>
                  <span style={{fontSize:10,color:T.textMuted,fontWeight:700}}>Repeat:</span>
                  {[[7,"Daily"],[5,"5×/wk"],[3,"3×/wk"]].map(([v,l])=>{ const on=!h.days?.length&&h.cadence===v; return (
                    <button key={v} onClick={()=>patch(h.id,{cadence:v,days:null})} style={{padding:"3px 9px",borderRadius:20,border:`1px solid ${on?T.accent:T.border}`,background:on?T.accentGlow:"transparent",color:on?T.accent:T.textMuted,cursor:"pointer",fontSize:10,fontWeight:on?700:500,fontFamily:"'DM Sans',sans-serif"}}>{l}</button>
                  );})}
                  <span style={{fontSize:10,color:T.textMuted}}>or days:</span>
                  {WD_ORDER.map(d=>{ const on=(h.days||[]).includes(d); return (
                    <button key={d} onClick={()=>setHabits(hs=>hs.map(x=>{ if(x.id!==h.id) return x; const c=x.days||[]; const nd=c.includes(d)?c.filter(y=>y!==d):[...c,d]; return {...x,days:nd.length?nd:null,cadence:nd.length?nd.length:7}; }))} title="Only expect this habit on chosen weekdays" style={{width:24,height:24,borderRadius:"50%",border:`1px solid ${on?T.accent:T.border}`,background:on?T.accentGlow:"transparent",color:on?T.accent:T.textMuted,cursor:"pointer",fontSize:9,fontWeight:on?800:500,fontFamily:"'DM Sans',sans-serif",padding:0}}>{WD_SHORT[d]}</button>
                  );})}
                </div>
                <div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}>
                  <span title="On days it's scheduled, this habit sorts by this number — 1 shows first" style={{fontSize:10,color:T.textMuted,fontWeight:700}}>Show first:</span>
                  {[...Array(Math.min(habits.length,9))].map((_,i)=>{ const on=h.prio===i+1; return (
                    <button key={i} onClick={()=>patch(h.id,{prio:i+1})} style={{width:24,height:24,borderRadius:"50%",border:`1px solid ${on?T.accent:T.border}`,background:on?T.accentGlow:"transparent",color:on?T.accent:T.textMuted,cursor:"pointer",fontSize:10,fontWeight:on?800:600,fontFamily:"'DM Sans',sans-serif",padding:0}}>{i+1}</button>
                  );})}
                  <button onClick={()=>patch(h.id,{prio:null})} style={{padding:"3px 9px",borderRadius:20,border:`1px solid ${h.prio==null?T.accent:T.border}`,background:h.prio==null?T.accentGlow:"transparent",color:h.prio==null?T.accent:T.textMuted,cursor:"pointer",fontSize:10,fontFamily:"'DM Sans',sans-serif"}}>none</button>
                </div>
                <button onClick={()=>setEditId(null)} style={{alignSelf:"flex-end",padding:"5px 14px",borderRadius:8,border:"none",cursor:"pointer",background:T.grad,color:"#fff",fontSize:11,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>Done ✓</button>
              </div>
            )}
            {/* 14-day trail */}
            <div data-trail style={{display:"flex",gap:3,marginTop:12,alignItems:"flex-end"}}>
              {last(14).map(d=>{ const on=has(h,d); const isToday=d===todStr;
                return <div key={d} title={d+(schedOn(h,d)?"":" (not scheduled)")} onClick={()=>{ setHabits(hs=>hs.map(x=>x.id===h.id?{...x,log:on?(x.log||[]).filter(z=>z!==d):[...(x.log||[]),d]}:x)); }} style={{flex:1,height:on?18:10,borderRadius:3,background:on?h.color:T.surface3,border:isToday?`1.5px solid ${h.color}`:"none",opacity:schedOn(h,d)?1:.35,cursor:"pointer",transition:"height .15s,background .15s"}}/>;
              })}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:T.textMuted,marginTop:4}}><span>2 weeks ago</span><span>Today</span></div>
            </div>
          </div>
        );};
        return (<>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
            {todayHabits.map(renderCard)}
          </div>
          {extraHabits.length>0&&(<>
            <div style={{margin:"18px 0 8px",display:"flex",alignItems:"baseline",gap:8,flexWrap:"wrap"}}>
              <span style={{fontSize:14,fontWeight:700,fontFamily:"'Sora',sans-serif"}}>Wanna do more? ✨</span>
              <span style={{fontSize:10,color:T.textMuted}}>Not scheduled today — check one off anyway for bonus momentum</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12,opacity:.85}}>
              {extraHabits.map(renderCard)}
            </div>
          </>)}
        </>);
      })()}
    </div>
  );
}

// Month calendar: tasks land on their due dates, tap a day to see & add. No hover needed — fully touch-first.
function CalendarView({T,tasks,cats,todStr,onToggle,onToggleStep,onQuickAdd,onOpenTask,onMoveTask,onMoveStep}) {
  const today=new Date(todStr+"T12:00:00");
  const [ym,setYm]=useState({y:today.getFullYear(),m:today.getMonth()});
  const [selDay,setSelDay]=useState(todStr);
  const [qa,setQa]=useState("");
  const [zoom,setZoom]=useState(()=>{try{return localStorage.getItem("fs_calzoom")==="1";}catch{return false;}});
  const [expandId,setExpandId]=useState(null); // task whose steps are unfolded in the day panel
  const [drag,setDrag]=useState(null);         // {label,color,x,y} — floating chip while dragging an entry
  const [hoverDay,setHoverDay]=useState(null); // day cell currently under the dragged entry
  const [src,setSrc]=useState("unscheduled");  // which tasks the drag-in tray shows
  const didDragRef=useRef(false);
  const setZoomP=v=>{ setZoom(v); try{localStorage.setItem("fs_calzoom",v?"1":"0");}catch{} };
  const first=new Date(ym.y,ym.m,1);
  const offset=(first.getDay()+6)%7; // Monday-first grid
  const dim=new Date(ym.y,ym.m+1,0).getDate();
  const cells=[...Array(offset)].map(()=>null).concat([...Array(dim)].map((_,i)=>ymd(new Date(ym.y,ym.m,i+1))));
  while(cells.length%7) cells.push(null);
  const byDay={}; tasks.forEach(t=>{ if(t.due){ (byDay[t.due]=byDay[t.due]||[]).push(t); } });
  // Steps (subtasks) with their own due date get their own spot on the calendar.
  const stepsByDay={}; tasks.forEach(t=>(t.subtasks||[]).forEach(s=>{ if(s.due){ (stepsByDay[s.due]=stepsByDay[s.due]||[]).push({t,s}); } }));
  // Drag-in tray: existing tasks you can pull onto a day. Source = Unscheduled / My Day / All / a folder.
  const srcTasks=tasks.filter(t=>{ if(t.done) return false;
    if(src==="unscheduled") return !t.due||isTbd(t.due); // "Date TBD" counts as unscheduled — drag it onto a day to decide

    if(src==="myday") return t.mydayDate===todStr;
    if(src==="all") return true;
    if(src.startsWith("cat:")) return t.tag===src.slice(4);
    return false;
  }).slice(0,40);
  const nav=d=>setYm(({y,m})=>{ const n=new Date(y,m+d,1); return {y:n.getFullYear(),m:n.getMonth()}; });
  const monthName=new Date(ym.y,ym.m,1).toLocaleDateString("en-US",{month:"long",year:"numeric"});
  const dayTasks=(byDay[selDay]||[]).slice().sort((a,b)=>{ if(a.done!==b.done)return a.done?1:-1; return (a.remindAt||"~").localeCompare(b.remindAt||"~"); });
  const daySteps=(stepsByDay[selDay]||[]).slice().sort((a,b)=>{ if(a.s.done!==b.s.done)return a.s.done?1:-1; return (a.s.time||"~").localeCompare(b.s.time||"~"); });
  const add=()=>{ const v=qa.trim(); if(!v)return; onQuickAdd(selDay,v); setQa(""); };
  const selLabel=new Date(selDay+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
  // Hold & drag any task/step and drop it on a day cell to reschedule it. A chip follows the pointer,
  // the day under it lights up, and elementFromPoint→[data-calday] resolves the drop target.
  const dragEntry=(e,label,color,onDropDay,fromCell)=>{
    if(!fromCell&&e.target.closest("button,input,a")) return;
    const move=ev=>{
      setDrag({label,color,x:ev.clientX,y:ev.clientY});
      const el=document.elementFromPoint(ev.clientX,ev.clientY);
      setHoverDay(el?.closest?.("[data-calday]")?.getAttribute("data-calday")||null);
    };
    startPressDrag(e,()=>{
      didDragRef.current=true;
      navigator.vibrate?.(10);
      setDrag({label,color,x:e.clientX,y:e.clientY});
      runDrag(move,ev=>{
        const el=document.elementFromPoint(ev.clientX,ev.clientY);
        const day=el?.closest?.("[data-calday]")?.getAttribute("data-calday")||null;
        setDrag(null); setHoverDay(null);
        if(day) onDropDay(day);
        setTimeout(()=>{didDragRef.current=false;},0);
      });
    });
  };
  return (
    <div style={{flex:1,overflowY:"auto",padding:"18px 22px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,gap:8,flexWrap:"wrap"}}>
        <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:21,fontWeight:700,letterSpacing:"-.5px"}}>{monthName}</h1>
        <div style={{display:"flex",gap:5}}>
          <button onClick={()=>setZoomP(!zoom)} title={zoom?"Back to compact dots":"Zoom in — see every day's tasks & steps spelled out"} style={{padding:"0 11px",height:30,borderRadius:8,border:`1px solid ${zoom?T.accent:T.border}`,background:zoom?T.accentGlow:T.surface,color:zoom?T.accent:T.text,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>{zoom?"▦ Dots":"🔍 Zoom"}</button>
          <button onClick={()=>nav(-1)} style={{width:30,height:30,borderRadius:8,border:`1px solid ${T.border}`,background:T.surface,color:T.text,cursor:"pointer",fontSize:15}}>‹</button>
          <button onClick={()=>{setYm({y:today.getFullYear(),m:today.getMonth()});setSelDay(todStr);}} style={{padding:"0 12px",height:30,borderRadius:8,border:`1px solid ${T.accent}`,background:T.accentGlow,color:T.accent,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>Today</button>
          <button onClick={()=>nav(1)} style={{width:30,height:30,borderRadius:8,border:`1px solid ${T.border}`,background:T.surface,color:T.text,cursor:"pointer",fontSize:15}}>›</button>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:4}}>
        {["Mo","Tu","We","Th","Fr","Sa","Su"].map(d=><div key={d} style={{textAlign:"center",fontSize:10,fontWeight:700,color:T.textMuted,letterSpacing:".5px"}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:6}}>
        {cells.map((d,i)=>{ if(!d) return <div key={"e"+i}/>;
          const dts=byDay[d]||[], stps=stepsByDay[d]||[], undone=dts.filter(t=>!t.done);
          const isToday=d===todStr, isSel=d===selDay, isHov=d===hoverDay;
          const isPastDue=d<todStr&&(undone.length>0||stps.some(x=>!x.s.done));
          const cellBorder=isHov?`2px dashed ${T.accent}`:`1.5px solid ${isSel?T.accent:isToday?T.accent+"66":T.border}`;
          if(!zoom) return (
            <button key={d} data-calday={d} onClick={()=>setSelDay(d)} style={{minHeight:52,padding:"5px 4px 4px",borderRadius:10,border:cellBorder,background:isHov||isSel?T.accentGlow:T.surface,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,transition:"all .12s"}}>
              <span style={{fontSize:12,fontWeight:isToday?800:500,color:isToday?T.accent:isPastDue?T.danger:T.text,fontFamily:"'DM Sans',sans-serif"}}>{parseInt(d.slice(8),10)}</span>
              {(dts.length>0||stps.length>0)&&(
                <div style={{display:"flex",gap:2,flexWrap:"wrap",justifyContent:"center",alignItems:"center",maxWidth:34}}>
                  {dts.slice(0,3).map(t=><span key={t.id} style={{width:5,height:5,borderRadius:"50%",background:t.done?T.textMuted:(cats[t.tag]?.color||T.accent),opacity:t.done?.45:1}}/>)}
                  {stps.slice(0,Math.max(0,3-Math.min(dts.length,3))).map(({t,s})=><span key={"s"+t.id+"-"+s.id} style={{width:5,height:5,borderRadius:"50%",border:`1.5px solid ${s.done?T.textMuted:(cats[t.tag]?.color||T.accent)}`,opacity:s.done?.45:1}}/>)}
                  {(dts.length+stps.length)>3&&<span style={{fontSize:8,color:T.textMuted,lineHeight:"5px"}}>+{dts.length+stps.length-3}</span>}
                </div>
              )}
            </button>
          );
          // Zoomed cells spell out the day's actual work: task titles + "↳" step texts, color-coded by category.
          const entries=[
            ...dts.map(t=>({key:"t"+t.id,txt:t.title,color:cats[t.tag]?.color||T.accent,done:t.done,step:false,t,time:t.remindAt&&t.remindAt.includes("T")?t.remindAt.split("T")[1]:null,drop:day=>{if(day!==t.due)onMoveTask?.(t.id,day);}})),
            ...stps.map(({t,s})=>({key:"s"+t.id+"-"+s.id,txt:s.title,color:cats[t.tag]?.color||T.accent,done:s.done,step:true,t,time:s.time||null,tt:`Step of "${t.title}" — drag to another day to reschedule`,drop:day=>{if(day!==s.due)onMoveStep?.(t.id,s.id,day);}})),
          ].sort((a,b)=>{ if(a.done!==b.done)return a.done?1:-1; return (a.time||"~").localeCompare(b.time||"~"); });
          return (
            <button key={d} data-calday={d} onClick={()=>setSelDay(d)} style={{minHeight:86,padding:"3px 3px 5px",borderRadius:10,border:cellBorder,background:isHov||isSel?T.accentGlow:T.surface,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"stretch",gap:2,transition:"all .12s",overflow:"hidden",textAlign:"left"}}>
              <span style={{fontSize:11,fontWeight:isToday?800:600,color:isToday?T.accent:isPastDue?T.danger:T.textMuted,fontFamily:"'DM Sans',sans-serif",alignSelf:"center"}}>{parseInt(d.slice(8),10)}</span>
              {entries.slice(0,4).map(en=>(
                <div key={en.key} title={en.tt||`${en.txt} — drag to another day to reschedule`}
                  onPointerDown={ev=>{ev.stopPropagation();dragEntry(ev,en.txt,en.color,en.drop,true);}}
                  onClick={ev=>{ev.stopPropagation();if(didDragRef.current)return;onOpenTask?.(en.t);}}
                  style={{fontSize:9,lineHeight:"13px",padding:"1px 4px",borderRadius:4,background:en.color+(en.step?"14":"26"),color:en.done?T.textMuted:T.text,borderLeft:`2px solid ${en.color}`,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",textDecoration:en.done?"line-through":"none",opacity:en.done?.55:1,cursor:"grab",fontFamily:"'DM Sans',sans-serif"}}>
                  {en.step?"↳ ":""}{en.txt}
                </div>
              ))}
              {entries.length>4&&<span style={{fontSize:8,color:T.textMuted,alignSelf:"center"}}>+{entries.length-4} more</span>}
            </button>
          );
        })}
      </div>
      <div style={{fontSize:10,color:T.textMuted,textAlign:"center",marginBottom:12}}>Tip: hold & drag any task or step onto a day to reschedule it{zoom?"":" · 🔍 Zoom spells out each day's work"}</div>
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:"11px 13px",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:srcTasks.length?8:0,flexWrap:"wrap"}}>
          <span style={{fontSize:12,fontWeight:700,fontFamily:"'Sora',sans-serif"}}>📌 Drag a task onto a day</span>
          <select value={src} onChange={e=>setSrc(e.target.value)} style={{marginLeft:"auto",padding:"4px 9px",borderRadius:8,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontSize:11,outline:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textTransform:"capitalize"}}>
            <option value="unscheduled">Unscheduled</option>
            <option value="myday">My Day</option>
            <option value="all">All tasks</option>
            {Object.keys(cats).map(c=><option key={c} value={"cat:"+c}>{c}</option>)}
          </select>
        </div>
        {srcTasks.length===0
          ? <div style={{fontSize:11,color:T.textMuted}}>{src==="unscheduled"?"No unscheduled tasks — everything has a date! 🎉":"Nothing here — try another source above."}</div>
          : <div style={{display:"flex",gap:6,flexWrap:"wrap",maxHeight:132,overflowY:"auto"}}>
              {srcTasks.map(t=>{ const col=cats[t.tag]?.color||T.accent; return (
                <div key={t.id} onPointerDown={e=>dragEntry(e,t.title,col,day=>{ if(day!==t.due) onMoveTask?.(t.id,day); })} onClick={()=>{ if(didDragRef.current)return; onOpenTask?.(t); }} title="Hold & drag onto a day to schedule it · tap to open" style={{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:20,border:`1px solid ${col}55`,background:col+"18",color:T.text,fontSize:11,fontWeight:600,cursor:"grab",maxWidth:190,fontFamily:"'DM Sans',sans-serif",userSelect:"none",WebkitUserSelect:"none",touchAction:"none"}}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:col,flexShrink:0}}/>
                  <span style={{overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{t.title}</span>
                  {t.due&&<span style={{fontSize:9,color:T.textMuted,flexShrink:0}}>· {fmtDate(t.due)}</span>}
                </div>
              );})}
            </div>}
      </div>
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:14}}>
        <div style={{fontSize:13,fontWeight:700,fontFamily:"'Sora',sans-serif",marginBottom:10}}>{selLabel}{selDay===todStr?" · Today":""}</div>
        <div style={{display:"flex",gap:6,marginBottom:(dayTasks.length||daySteps.length)?12:0}}>
          <input value={qa} onChange={e=>setQa(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder={`Add a task on ${selLabel.split(",")[1]?.trim()||selDay}… "dentist 3pm"`} style={{flex:1,minWidth:0,padding:"9px 12px",borderRadius:9,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:13,outline:"none"}}/>
          <button onClick={add} style={{padding:"0 16px",borderRadius:9,border:"none",cursor:"pointer",background:T.grad,color:"#fff",fontWeight:700,fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>Add</button>
        </div>
        {dayTasks.length===0&&daySteps.length===0&&<div style={{fontSize:12,color:T.textMuted,padding:"4px 2px"}}>Nothing scheduled — enjoy the free day ✨</div>}
        {dayTasks.map(t=>{
          const tColor=cats[t.tag]?.color||T.accent;
          return (
          <div key={t.id}>
            <div onClick={()=>{if(didDragRef.current)return;onOpenTask?.(t);}} onPointerDown={e=>dragEntry(e,t.title,tColor,day=>{if(day!==t.due)onMoveTask?.(t.id,day);})} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:9,cursor:"pointer",marginBottom:2,background:"transparent",transition:"background .12s"}} onMouseEnter={e=>e.currentTarget.style.background=T.surface2} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <button onClick={e=>{e.stopPropagation();onToggle(t.id);}} style={{width:17,height:17,borderRadius:5,border:`2px solid ${t.done?T.success:(cats[t.tag]?.color||T.border)}`,background:t.done?T.success:"transparent",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>{t.done&&<Ico n="check" s={9} c="#fff"/>}</button>
              <span style={{flex:1,minWidth:0,fontSize:13,color:t.done?T.textMuted:T.text,textDecoration:t.done?"line-through":"none",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{t.title}</span>
              {t.subtasks?.length>0&&<button onClick={e=>{e.stopPropagation();setExpandId(expandId===t.id?null:t.id);}} title="Show this task's steps — drag any step onto a day above" style={{border:"none",cursor:"pointer",flexShrink:0,borderRadius:6,padding:"2px 7px",fontSize:9,fontWeight:700,fontFamily:"'DM Sans',sans-serif",background:expandId===t.id?T.accentGlow:T.surface2,color:expandId===t.id?T.accent:T.textMuted}}>{expandId===t.id?"▾":"▸"} {t.subtasks.filter(s=>s.done).length}/{t.subtasks.length} steps</button>}
              {t.remindAt&&fmtClock(t.remindAt)&&<span style={{fontSize:10,color:T.accent,fontWeight:700,flexShrink:0}}>⏰ {fmtClock(t.remindAt)}{t.endTime?` – ${fmtClock(t.endTime)}`:""}</span>}
              {t.tag&&<span style={{fontSize:9,padding:"1px 7px",borderRadius:20,background:(cats[t.tag]?.color||T.accent)+"22",color:cats[t.tag]?.color||T.accent,fontWeight:700,flexShrink:0,textTransform:"capitalize"}}>{t.tag}</span>}
            </div>
            {expandId===t.id&&(t.subtasks||[]).map(s=>(
              <div key={s.id} onPointerDown={e=>dragEntry(e,s.title,tColor,day=>{if(day!==s.due)onMoveStep?.(t.id,s.id,day);})} title="Hold & drag onto a day above to schedule this step" style={{display:"flex",alignItems:"center",gap:8,padding:"5px 10px 5px 36px",borderRadius:8,cursor:"grab",marginBottom:1}}>
                <button onClick={()=>onToggleStep?.(t.id,s.id)} style={{width:14,height:14,borderRadius:4,border:`1.5px solid ${s.done?T.success:T.border}`,background:s.done?T.success:"transparent",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>{s.done&&<Ico n="check" s={8} c="#fff"/>}</button>
                <span style={{flex:1,minWidth:0,fontSize:12,color:s.done?T.textMuted:T.text,textDecoration:s.done?"line-through":"none",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{s.title}</span>
                <span style={{fontSize:9,fontWeight:700,flexShrink:0,color:s.due?T.accent:T.textMuted,background:s.due?T.accentGlow:"transparent",borderRadius:6,padding:"1px 6px"}}>{s.due?`📅 ${fmtDate(s.due)}${s.time?" "+fmtClock(s.time):""}`:"no date — drag onto a day ↑"}</span>
              </div>
            ))}
          </div>
        );})}
        {daySteps.length>0&&(
          <div style={{marginTop:dayTasks.length?10:0}}>
            <div style={{fontSize:10,fontWeight:700,color:T.textMuted,letterSpacing:".5px",margin:"0 2px 4px"}}>STEPS DUE THIS DAY</div>
            {daySteps.map(({t,s})=>(
              <div key={t.id+"-"+s.id} onClick={()=>{if(didDragRef.current)return;onOpenTask?.(t);}} onPointerDown={e=>dragEntry(e,s.title,cats[t.tag]?.color||T.accent,day=>{if(day!==s.due)onMoveStep?.(t.id,s.id,day);})} style={{display:"flex",alignItems:"center",gap:9,padding:"7px 10px",borderRadius:9,cursor:"pointer",marginBottom:2,background:"transparent",transition:"background .12s"}} onMouseEnter={e=>e.currentTarget.style.background=T.surface2} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <button onClick={e=>{e.stopPropagation();onToggleStep?.(t.id,s.id);}} style={{width:15,height:15,borderRadius:4,border:`1.5px solid ${s.done?T.success:(cats[t.tag]?.color||T.border)}`,background:s.done?T.success:"transparent",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>{s.done&&<Ico n="check" s={8} c="#fff"/>}</button>
                <span style={{flex:1,minWidth:0,fontSize:12,color:s.done?T.textMuted:T.text,textDecoration:s.done?"line-through":"none",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>↳ {s.title}</span>
                {s.time&&<span style={{fontSize:10,color:T.accent,fontWeight:700,flexShrink:0}}>⏰ {fmtClock(s.time)}</span>}
                <span title={`Step of "${t.title}"`} style={{fontSize:9,padding:"1px 7px",borderRadius:20,background:(cats[t.tag]?.color||T.accent)+"22",color:cats[t.tag]?.color||T.accent,fontWeight:700,flexShrink:0,maxWidth:90,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{t.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {drag&&<div style={{position:"fixed",left:drag.x+12,top:drag.y-14,zIndex:999,pointerEvents:"none",padding:"4px 10px",borderRadius:8,background:T.surface,border:`1.5px solid ${drag.color}`,color:T.text,fontSize:11,fontWeight:600,fontFamily:"'DM Sans',sans-serif",boxShadow:"0 6px 20px rgba(0,0,0,.25)",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>📅 {drag.label}</div>}
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
function AnalyticsView({T,tasks,xp,level,streak,habits=[],dayStats={},todStr}) {
  const narrow=useNarrow();   // four stat cards and two side-by-side panels do not fit a phone
  const [aiLoad,setAiLoad]=useState(false);
  const [aiMsg,setAiMsg]=useState("");
  const [achSel,setAchSel]=useState(null);
  // Real data: completions per day come from dayStats (tracked every time a task is checked off).
  const monOffset=(new Date().getDay()+6)%7; // days since Monday
  const wk=[...Array(7)].map((_,i)=>dayStats[addDays(i-monOffset)]||0);
  const maxW=Math.max(...wk,1);
  const total=tasks.length, done=tasks.filter(t=>t.done).length;
  const rate=total>0?Math.round((done/total)*100):0;
  const ov=tasks.filter(t=>t.due&&t.due<tod()&&!t.done).length;
  const byTag={};tasks.forEach(t=>{byTag[t.tag]=(byTag[t.tag]||0)+1;});
  const heat=[...Array(35)].map((_,i)=>{ const d=addDays(i-34); return {v:Math.min(dayStats[d]||0,5),d,n:dayStats[d]||0}; });
  const weekTotal=wk.reduce((a,b)=>a+b,0);
  const habitsDoneToday=habits.filter(h=>(h.log||[]).includes(todStr)).length;
  const bestHabitStreak=habits.reduce((best,h)=>{ const set=new Set(h.log||[]); let i=set.has(todStr)?0:1,s=0; for(;;){ if(set.has(addDays(-i))){s++;i++;} else break; if(s>999)break; } return Math.max(best,s); },0);
  const topTag=Object.entries(byTag).sort((a,b)=>b[1]-a[1])[0];
  // "Share my week" — draws a brag-card PNG on a canvas, then native-shares it (or downloads on desktop).
  const shareCard=async()=>{
    const W=1080,H=1350,c=document.createElement("canvas"); c.width=W; c.height=H; const x=c.getContext("2d");
    const rr=(x0,y0,w,h,r)=>{ x.beginPath(); x.moveTo(x0+r,y0); x.arcTo(x0+w,y0,x0+w,y0+h,r); x.arcTo(x0+w,y0+h,x0,y0+h,r); x.arcTo(x0,y0+h,x0,y0,r); x.arcTo(x0,y0,x0+w,y0,r); x.closePath(); };
    const g=x.createLinearGradient(0,0,W,H); g.addColorStop(0,"#0c0e16"); g.addColorStop(1,"#1b1038"); x.fillStyle=g; x.fillRect(0,0,W,H);
    const g2=x.createRadialGradient(W/2,180,50,W/2,180,600); g2.addColorStop(0,"rgba(192,132,252,.25)"); g2.addColorStop(1,"rgba(192,132,252,0)"); x.fillStyle=g2; x.fillRect(0,0,W,900);
    x.textAlign="center"; x.fillStyle="#c084fc"; x.font="700 44px Sora,Arial"; x.fillText("⚡ Freely",W/2,110);
    x.fillStyle="#eef0fa"; x.font="800 92px Sora,Arial"; x.fillText("My Week",W/2,230);
    const end=new Date((todStr||tod())+"T12:00:00"); const start=new Date(end); start.setDate(start.getDate()-6);
    const fd=d=>d.toLocaleDateString("en-US",{month:"short",day:"numeric"});
    x.fillStyle="#7a85a3"; x.font="500 34px Arial"; x.fillText(`${fd(start)} – ${fd(end)}`,W/2,290);
    x.fillStyle="#eef0fa"; x.font="800 200px Sora,Arial"; x.fillText(String(weekTotal),W/2,540);
    x.fillStyle="#7a85a3"; x.font="600 36px Arial"; x.fillText(`task${weekTotal===1?"":"s"} completed this week`,W/2,600);
    const bx=140,bw=(W-280)/7,maxB=Math.max(...wk,1),base=930,bh=220,DL=["M","T","W","T","F","S","S"];
    wk.forEach((v,i)=>{ const h=Math.max((v/maxB)*bh,10),cx=bx+i*bw;
      const bg=x.createLinearGradient(0,base-h,0,base); bg.addColorStop(0,"#c084fc"); bg.addColorStop(1,"#818cf8");
      x.fillStyle=i===monOffset?bg:(v>0?"rgba(192,132,252,.45)":"rgba(255,255,255,.08)"); rr(cx+14,base-h,bw-28,h,10); x.fill();
      x.fillStyle="#7a85a3"; x.font="600 28px Arial"; x.fillText(DL[i],cx+bw/2,base+44);
      if(v>0){ x.fillStyle="#eef0fa"; x.font="700 30px Arial"; x.fillText(String(v),cx+bw/2,base-h-14); }
    });
    const stats=[[`🔥 ${streak}`,"day streak"],[`LVL ${level}`,`${xp} XP`],habits.length?[`🎯 ${habitsDoneToday}/${habits.length}`,"habits today"]:[`${rate}%`,"completion rate"]];
    const cw=(W-200)/3;
    stats.forEach(([big,small],i)=>{ const sx=100+i*cw+10,sw=cw-20,sy=1030;
      x.fillStyle="rgba(255,255,255,.05)"; rr(sx,sy,sw,180,24); x.fill(); x.strokeStyle="rgba(255,255,255,.1)"; x.stroke();
      x.fillStyle="#eef0fa"; x.font="800 52px Sora,Arial"; x.fillText(big,sx+sw/2,sy+82);
      x.fillStyle="#7a85a3"; x.font="500 28px Arial"; x.fillText(small,sx+sw/2,sy+134);
    });
    x.fillStyle="rgba(122,133,163,.7)"; x.font="500 28px Arial"; x.fillText("made with Freely ⚡",W/2,1300);
    const blob=await new Promise(r=>c.toBlob(r,"image/png"));
    const file=new File([blob],"freely-week.png",{type:"image/png"});
    if(navigator.canShare?.({files:[file]})){ try{ await navigator.share({files:[file],title:"My week in Freely"}); return; }catch{} }
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="freely-week.png"; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),4000);
  };
  const runAI=()=>{setAiLoad(true);setAiMsg("");setTimeout(()=>{setAiLoad(false);setAiMsg(`🧠 You completed ${weekTotal} task${weekTotal===1?"":"s"} this week${weekTotal>0?" — nice momentum":""}. Overall completion rate: ${rate}%. ${topTag?`Most of your work lives in "${topTag[0]}" (${topTag[1]} tasks). `:""}${ov>0?`${ov} overdue — pull one into My Day and knock it out first. `:"No overdue tasks — inbox zero energy! "}${habits.length?`Habits: ${habitsDoneToday}/${habits.length} done today, best streak ${bestHabitStreak} day${bestHabitStreak===1?"":"s"} 🔥`:`Try adding a daily habit to build momentum.`}`);},1400);};
  return (
    <div style={{flex:1,overflowY:"auto",padding:narrow?"16px 13px":"22px 26px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:18,flexWrap:"wrap"}}>
        <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:21,fontWeight:700,letterSpacing:"-.5px"}}>Analytics</h1>
        <button onClick={shareCard} title="Creates a picture of your week — share it or save it" style={{padding:"8px 16px",borderRadius:10,border:"none",cursor:"pointer",background:T.grad,color:"#fff",fontSize:12,fontWeight:700,fontFamily:"'DM Sans',sans-serif",boxShadow:"0 3px 12px rgba(192,132,252,.3)"}}>📸 Share my week</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:narrow?"repeat(2,1fr)":"repeat(4,1fr)",gap:10,marginBottom:14}}>
        {[{l:"Total",v:total,i:"layers",c:T.accent},{l:"Done",v:done,i:"check",c:T.success},{l:"Rate",v:`${rate}%`,i:"target",c:T.info},{l:"Overdue",v:ov,i:"clock",c:T.danger}].map(s=>(
          <div key={s.l} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"13px 15px"}}>
            <div style={{width:27,height:27,borderRadius:7,background:s.c+"22",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:8}}><Ico n={s.i} s={13} c={s.c}/></div>
            <div style={{fontFamily:"'Sora',sans-serif",fontSize:24,fontWeight:700,letterSpacing:"-1px"}}>{s.v}</div>
            <div style={{fontSize:11,color:T.textMuted,marginTop:1}}>{s.l}</div>
          </div>
        ))}
      </div>
      {habits.length>0&&(
        <div style={{display:"flex",alignItems:"center",gap:14,background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"10px 15px",marginBottom:14,flexWrap:"wrap"}}>
          <span style={{fontSize:12,fontWeight:700,fontFamily:"'Sora',sans-serif"}}>🎯 Habits</span>
          <span style={{fontSize:12,color:T.textMuted}}>{habitsDoneToday}/{habits.length} done today</span>
          <div style={{flex:1,minWidth:80,height:5,background:T.surface3,borderRadius:3,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${habits.length?Math.round(habitsDoneToday/habits.length*100):0}%`,background:"linear-gradient(90deg,#22c55e,#14b8a6)",borderRadius:3,transition:"width .5s ease"}}/>
          </div>
          <span style={{fontSize:12,color:"#f59e0b",fontWeight:700}}>🔥 best streak: {bestHabitStreak}d</span>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:narrow?"1fr":"1.4fr 1fr",gap:12,marginBottom:12}}>
        <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:16}}>
          <div style={{fontSize:12,fontWeight:600,marginBottom:12,display:"flex",alignItems:"center",gap:5}}><Ico n="bar" s={13} c={T.accent}/>Weekly Completions</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:6,height:80}}>
            {["M","T","W","T","F","S","S"].map((d,i)=>(
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <div title={`${wk[i]} done`} style={{width:"100%",borderRadius:"3px 3px 0 0",background:i===monOffset?`linear-gradient(180deg,${T.accent},${T.accentAlt})`:wk[i]>0?T.accent+"55":T.surface3,height:`${Math.max((wk[i]/maxW)*68,3)}px`,transition:"height .6s ease"}}/>
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
      <div style={{display:"grid",gridTemplateColumns:narrow?"1fr":"1fr 1.3fr",gap:12,marginBottom:12}}>
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
            {heat.map((c,i)=><div key={i} title={`${c.d}: ${c.n} task${c.n===1?"":"s"} done`} style={{aspectRatio:"1",borderRadius:2,background:c.v===0?T.surface2:`rgba(192,132,252,${c.v/5*.9+.1})`,cursor:"default",transition:"transform .1s"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.3)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}/>)}
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

// Unified sidebar tree: views + folders + shared, all reorderable and nestable into groups. Persists in localStorage (fs_navorg).
function SidebarTree({T,sideOpen,items,view,onOpen,org,setOrg,onAddList,onRenameList,onShareFolder,onUnshare,ownedShares=[],onDeleteList,setCats,cats={},onAssignAll,assignGroups=[],onUploadIcon,onLeaveShare}) {
  const [dragId,setDragId]=useState(null);
  const [drop,setDrop]=useState(null);
  const dropRef=useRef(null);
  const didDrag=useRef(false);
  const [renaming,setRenaming]=useState(null);
  const [hov,setHov]=useState(null);
  const [manage,setManage]=useState(null); // {type:"list"|"group", id, name}
  const [creating,setCreating]=useState(null); // "list" | "group"

  // Lists shared WITH you are part of the same draggable tree — they just start out inside a
  // "Shared with me" folder. sidebarLayout() is the single source of truth for the arrangement.
  const {groups,gmap,byId:itemMap,allIds,parentRaw,order,parentOf,childrenOf}=sidebarLayout(items,org);
  const isGroup=id=>!!gmap[id];
  const isDesc=(id,anc)=>{ let p=parentOf(id),n=0; while(p&&n++<60){ if(p===anc)return true; p=parentOf(p); } return false; };
  // Every list (cat) name nested anywhere under a group — used to share a whole folder at once.
  const listNamesUnder=gid=>{ const out=[]; const walk=pid=>childrenOf(pid).forEach(id=>{ if(isGroup(id))walk(id); else { const it=itemMap[id]; if(it&&it.id.startsWith("c:"))out.push(it.label); } }); walk(gid); return out; };
  const write=(o,p,g)=>setOrg({order:o||order,parent:p||parentRaw,groups:g||groups});

  const applyDrop=(id,d)=>{
    if(!d) return;
    let targetParent,beforeId=null;
    if(d.item){ if(d.item===id)return; targetParent=parentOf(d.item); beforeId=d.item; }
    else if("group" in d){ targetParent=d.group; }
    else return;
    if(isGroup(id)&&(targetParent===id||isDesc(targetParent,id))) return; // no cycles
    const np={...parentRaw}; if(targetParent)np[id]=targetParent; else if(id.startsWith("s:"))np[id]=null; else delete np[id];   // a shared list dragged to the root stays there (null = on purpose)
    let no=order.filter(x=>x!==id);
    // Land above or below the target depending on which half the pointer was over — so first/last slots work.
    if(beforeId){ const i=no.indexOf(beforeId); no.splice(i<0?no.length:(d.before===false?i+1:i),0,id); } else no.push(id);
    write(no,np,groups); navigator.vibrate?.(12);
  };
  const startDrag=(e,id)=>{
    if(e.target.closest("[data-nodrag]")) return;
    didDrag.current=false; // reset each press so a tap right after a drag still navigates
    startPressDrag(e,()=>{
      didDrag.current=true; setDragId(id); navigator.vibrate?.(15);
      const label=itemMap[id]?.label||gmap[id]?.name||"Item";
      const ghost=makeDragGhost(label,T.accent,T);
      runDrag(
        ev=>{ ghost.move(ev.clientX,ev.clientY);
          const el=document.elementFromPoint(ev.clientX,ev.clientY);
          const it=el&&el.closest("[data-item]"); const gd=el&&el.closest("[data-groupdrop]"); const rd=el&&el.closest("[data-rootdrop]");
          if(it&&it.getAttribute("data-item")!==id){ const r=it.getBoundingClientRect(); dropRef.current={item:it.getAttribute("data-item"),before:ev.clientY<r.top+r.height/2}; }
          else if(gd) dropRef.current={group:gd.getAttribute("data-groupdrop")};
          else if(rd) dropRef.current={group:null};
          else dropRef.current=null;
          setDrop(dropRef.current);
        },
        ()=>{ ghost.remove(); const d=dropRef.current; dropRef.current=null; setDrop(null); setDragId(null); applyDrop(id,d); }
      );
    });
  };
  const addGroup=(name,icon)=>{ const n=(name||"").trim(); if(!n) return null; const gid="g"+Date.now(); write([...order,gid],parentRaw,[...groups,{id:gid,name:n,icon:icon||null,collapsed:false}]); return gid; };
  const renGroup=(id,n)=>write(order,parentRaw,groups.map(g=>{ if(g.id!==id) return g; const nm=n||g.name;
    // Re-guess the icon on rename when it was auto (null = live-auto, or equals the old name's guess); keep hand-picked ones.
    const icon=(!g.icon||g.icon===guessIcon(g.name))?guessIcon(nm):g.icon;
    return {...g,name:nm,icon:g.icon?icon:null}; }));
  const setGroupIcon=(id,icon)=>write(order,parentRaw,groups.map(g=>g.id===id?{...g,icon}:g));
  const delGroup=id=>{ const pg=parentOf(id); const np={...parentRaw}; order.forEach(x=>{ if(parentOf(x)===id){ if(pg)np[x]=pg; else if(x.startsWith("s:"))np[x]=null; else delete np[x]; } }); delete np[id]; write(order.filter(x=>x!==id),np,groups.filter(g=>g.id!==id)); };
  const toggle=id=>write(order,parentRaw,groups.map(g=>g.id===id?{...g,collapsed:!g.collapsed}:g));

  const Leaf=(it,depth)=>{ const active=view===it.view,isDrag=dragId===it.id,isTarget=drop?.item===it.id,canRen=!!onRenameList&&it.id.startsWith("c:"),isShared=it.id.startsWith("s:");
    return (
      <div key={it.id} data-item={it.id} onPointerDown={e=>startDrag(e,it.id)} onMouseEnter={()=>setHov(it.id)} onMouseLeave={()=>setHov(null)}
        style={{opacity:isDrag?.4:1,position:"relative",borderRadius:9,touchAction:"pan-y",display:"flex",alignItems:"center"}}>
        {isTarget&&<div style={{position:"absolute",left:6,right:6,[drop?.before===false?"bottom":"top"]:-1,height:3,borderRadius:2,background:T.accent,boxShadow:`0 0 8px ${T.accent}`,zIndex:5,pointerEvents:"none"}}/>}
        <button onClick={()=>{ if(didDrag.current){didDrag.current=false;return;} onOpen(it.view); }} style={{flex:1,minWidth:0,display:"flex",alignItems:"center",gap:8,padding:`7px ${(canRen||isShared)?4:10}px 7px ${10+depth*14}px`,borderRadius:9,border:"none",cursor:"grab",marginBottom:1,background:active?T.accentGlow:"transparent",color:active?T.accent:T.textMuted,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:active?600:400}}>
          <Ico n="grip" s={11} c={T.textMuted} st={{opacity:hov===it.id?.5:.16,flexShrink:0}}/>
          {it.iconType==="ico"?<Ico n={it.icon} s={16} c={it.tint||(active?T.accent:T.textMuted)}/>:<span style={{width:16,textAlign:"center",flexShrink:0,display:"inline-flex",justifyContent:"center"}}><CatIcon icon={it.icon} size={14}/></span>}
          <span style={{flex:1,minWidth:0,textAlign:"left"}}>
            <span style={{display:"block",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",textTransform:it.cap?"capitalize":"none"}}>{it.label}</span>
            {it.sub&&<span style={{display:"block",fontSize:9,color:T.textMuted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{it.sub}</span>}
          </span>
          {it.badge>0&&<span style={{background:it.tint||(active?T.accent:T.surface3),color:(it.tint||active)?"#fff":T.textMuted,fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:10}}>{it.badge}</span>}
        </button>
        {isShared&&onLeaveShare&&<button onClick={()=>{ if(window.confirm(`Leave "${it.label}"? You'll stop seeing its tasks.`)) onLeaveShare(it.owner,it.folder); }} data-nodrag title="Leave this shared list" style={{background:"none",border:"none",cursor:"pointer",color:T.textMuted,display:"flex",flexShrink:0,padding:"4px 6px",opacity:hov===it.id?.8:.3}}><Ico n="x" s={11}/></button>}
        {canRen&&<button onClick={()=>setManage({type:"list",id:it.id,name:it.label})} data-nodrag title="Manage this list — rename, share, icon, delete" style={{background:"none",border:"none",cursor:"pointer",color:T.textMuted,display:"flex",flexShrink:0,padding:"6px 8px 6px 2px",opacity:hov===it.id?.9:.4,fontSize:15,fontWeight:800,lineHeight:1}}>⋯</button>}
      </div>
    );
  };
  const renderLevel=(pid,depth)=> childrenOf(pid).map(id=>{
    if(isGroup(id)){ const g=gmap[id]; const isZone=drop?.group===id,isDrag=dragId===id,isTarget=drop?.item===id,cnt=childrenOf(id).length;
      if(id===SHARED_GID&&cnt===0&&drop?.group!==id) return <div key={id} style={{margin:"10px 10px 4px",paddingTop:10,borderTop:`1px solid ${T.border}`,fontSize:9,color:T.textMuted,opacity:.6,lineHeight:1.5}}>🤝 Lists other people share with you appear here — drag them anywhere you like.</div>;
      return (
        <div key={id} style={{marginTop:2}}>
          <div data-item={id} onPointerDown={e=>startDrag(e,id)} onMouseEnter={()=>setHov(id)} onMouseLeave={()=>setHov(null)}
            style={{display:"flex",alignItems:"center",gap:4,padding:`6px 8px 5px ${8+depth*14}px`,opacity:isDrag?.4:1,position:"relative",borderRadius:8,touchAction:"pan-y"}}>
            {isTarget&&<div style={{position:"absolute",left:6,right:6,[drop?.before===false?"bottom":"top"]:-1,height:3,borderRadius:2,background:T.accent,boxShadow:`0 0 8px ${T.accent}`,zIndex:5,pointerEvents:"none"}}/>}
            <button onClick={()=>toggle(id)} data-nodrag style={{background:"none",border:"none",cursor:"pointer",color:T.textMuted,display:"flex",flexShrink:0}}><Ico n="chevron" s={11} c={T.textMuted} st={{transform:g.collapsed?"none":"rotate(90deg)",transition:"transform .15s"}}/></button>
            <span style={{fontSize:14,display:"inline-flex",alignItems:"center"}}><CatIcon icon={g.icon||guessIcon(g.name)} size={13}/></span>
            {renaming===id
              ? <input autoFocus defaultValue={g.name} onKeyDown={e=>{if(e.key==="Enter"){renGroup(id,e.target.value.trim());setRenaming(null);}if(e.key==="Escape")setRenaming(null);}} onBlur={e=>{renGroup(id,e.target.value.trim());setRenaming(null);}} data-nodrag style={{flex:1,minWidth:0,padding:"2px 6px",borderRadius:6,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontSize:12,fontWeight:700,outline:"none",fontFamily:"'DM Sans',sans-serif"}}/>
              : <button onClick={()=>toggle(id)} onDoubleClick={()=>setRenaming(id)} data-nodrag style={{flex:1,minWidth:0,textAlign:"left",background:"none",border:"none",cursor:"pointer",color:T.text,fontSize:11,fontWeight:700,letterSpacing:".3px",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.name} {cnt>0&&<span style={{color:T.textMuted,fontWeight:600}}>({cnt})</span>}</button>}
            {id!==SHARED_GID&&<button onClick={()=>setManage({type:"group",id,name:g.name})} data-nodrag title="Manage folder — rename, share all its lists, delete" style={{background:"none",border:"none",cursor:"pointer",color:T.textMuted,display:"flex",padding:"4px 4px",opacity:hov===id?.9:.45,fontSize:15,fontWeight:800,lineHeight:1}}>⋯</button>}
          </div>
          {!g.collapsed&&<div data-groupdrop={id} style={{background:isZone?T.accentGlow:"transparent",borderRadius:8}}>
            {renderLevel(id,depth+1)}
            {cnt===0&&<div style={{padding:`3px 10px 6px ${30+depth*14}px`,fontSize:10,color:T.textMuted,opacity:.5}}>Drag items here</div>}
          </div>}
        </div>
      );
    }
    const it=itemMap[id]; return it?Leaf(it,depth):null;
  });

  if(!sideOpen){
    // Collapsed rail shows the SAME custom order as the open sidebar (groups flattened in place).
    const railIds=[]; const walkRail=pid=>childrenOf(pid).forEach(id=>{ if(isGroup(id)) walkRail(id); else railIds.push(id); });
    walkRail(null);
    const railItems=railIds.map(id=>itemMap[id]).filter(Boolean);
    return <>{railItems.map(it=>(
      <button key={it.id} onClick={()=>onOpen(it.view)} title={it.label+(it.sub?` · ${it.sub}`:"")} style={{position:"relative",width:"100%",display:"flex",alignItems:"center",justifyContent:"center",padding:"8px 0",borderRadius:9,border:"none",cursor:"pointer",marginBottom:1,background:view===it.view?T.accentGlow:"transparent"}}>
        {it.iconType==="ico"?<Ico n={it.icon} s={16} c={it.tint||(view===it.view?T.accent:T.textMuted)}/>:<CatIcon icon={it.icon} size={15}/>}
        {it.badge>0&&<span style={{position:"absolute",top:4,right:9,minWidth:14,height:14,borderRadius:7,background:it.tint||T.accent,color:"#fff",fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px"}}>{it.badge}</span>}
      </button>
    ))}</>;
  }

  return (
    <div data-rootdrop>
      {renderLevel(null,0)}
      <div style={{display:"flex",gap:6,padding:"10px 10px 4px"}}>
        <button onClick={()=>setCreating("list")} data-nodrag style={{flex:1,padding:"8px 9px",borderRadius:9,border:`1px dashed ${T.border}`,background:T.surface2,cursor:"pointer",color:T.text,display:"flex",alignItems:"center",justifyContent:"center",gap:5,fontSize:11,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}><Ico n="plus" s={12}/> New list</button>
        <button onClick={()=>setCreating("group")} data-nodrag style={{flex:1,padding:"8px 9px",borderRadius:9,border:`1px dashed ${T.border}`,background:T.surface2,cursor:"pointer",color:T.text,display:"flex",alignItems:"center",justifyContent:"center",gap:5,fontSize:11,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>📁 New folder</button>
      </div>
      <div style={{fontSize:9,color:T.textMuted,opacity:.6,padding:"4px 10px 12px",lineHeight:1.5}}>💡 Hold & drag to reorder · drop a list onto a folder to tuck it inside · ⋯ to rename, share or delete</div>


      {creating&&<SidebarCreate T={T} mode={creating} onClose={()=>setCreating(null)} onUploadIcon={onUploadIcon}
        onCreateList={(name,icon,color)=>{ const ok=onAddList?.((name||"").trim(),icon,color)!==false; if(!ok) return false; setCreating(null); return true; }}
        onCreateGroup={(name,icon)=>{ addGroup(name,icon); setCreating(null); }}/>}
      {manage&&(()=>{
        const isG=manage.type==="group";
        const childLists=isG?listNamesUnder(manage.id):[manage.name];
        const shares=(ownedShares||[]).filter(s=>childLists.includes(s.folder));
        const meta=isG?{icon:gmap[manage.id]?.icon||guessIcon(manage.name)}:(cats[manage.name]||{});
        return <SidebarManage T={T} target={manage} isGroup={isG} childLists={childLists} shares={shares} meta={meta} onUploadIcon={onUploadIcon}
          onAssignAll={onAssignAll?emails=>onAssignAll(childLists,emails):null} assignGroups={assignGroups}
          onClose={()=>setManage(null)}
          onRename={v=>{ if(isG){ renGroup(manage.id,v); return true; } return onRenameList?.(manage.name,v)!==false; }}
          onShare={(email,canDel)=>{ childLists.forEach(n=>onShareFolder?.(n,email,canDel)); }}
          onUnshare={id=>onUnshare?.(id)}
          onDelete={()=>{ if(isG){ delGroup(manage.id); } else { onDeleteList?.(manage.name); } setManage(null); }}
          onSetIcon={ic=>{ if(isG) setGroupIcon(manage.id,ic); else setCats?.(c=>({...c,[manage.name]:{...c[manage.name],icon:ic}})); }}
          onSetColor={col=>!isG&&setCats?.(c=>({...c,[manage.name]:{...c[manage.name],color:col}}))}/>;
      })()}
    </div>
  );
}

// Popup to create a new list (name + auto/pick icon + color) or a new folder — opened from the sidebar's New buttons.
function SidebarCreate({T,mode,onClose,onCreateList,onCreateGroup,onUploadIcon}) {
  const isGroup=mode==="group";
  const [name,setName]=useState("");
  const [icon,setIcon]=useState("📁");
  const [iconPicked,setIconPicked]=useState(false);
  const [color,setColor]=useState(CAT_COLORS[0]);
  const iconFileRef=useRef(null);
  const onName=v=>{ const g=guessIcon(v,null), was=guessIcon(name,null); setName(v); if(!iconPicked) setIcon(g||"📁"); else if(g&&g!==was){ setIcon(g); setIconPicked(false); } };
  const create=()=>{ const v=name.trim(); if(!v) return; if(isGroup){ onCreateGroup(v,icon); } else { if(onCreateList(v,icon,color)===false){ alert(`A list called "${v}" already exists.`); return; } } };
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:2600,background:"rgba(5,6,12,.6)",display:"flex",alignItems:"center",justifyContent:"center",padding:18}}>
      <div onClick={e=>e.stopPropagation()} data-nodrag style={{width:360,maxWidth:"94vw",maxHeight:"86vh",overflowY:"auto",background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,padding:18,boxShadow:"0 24px 80px rgba(0,0,0,.5)",fontFamily:"'DM Sans',sans-serif"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
          <CatIcon icon={icon} size={20}/>
          <div style={{flex:1,fontSize:15,fontWeight:800,fontFamily:"'Sora',sans-serif"}}>{isGroup?"New folder":"New list"}</div>
          <button onClick={onClose} style={{width:26,height:26,borderRadius:7,border:"none",cursor:"pointer",background:T.surface2,color:T.textMuted,display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" s={13}/></button>
        </div>
        <div style={{fontSize:9,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",color:T.textMuted,marginBottom:6}}>Name</div>
        <input autoFocus value={name} onChange={e=>onName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")create();}} placeholder={isGroup?"e.g. Work stuff":"e.g. Groceries"} style={{width:"100%",boxSizing:"border-box",padding:"9px 11px",borderRadius:9,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontSize:13,outline:"none",marginBottom:14,fontFamily:"'DM Sans',sans-serif"}}/>
        <div style={{fontSize:9,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",color:T.textMuted,marginBottom:6}}>Icon <span style={{fontWeight:500,textTransform:"none"}}>· picks itself from the name</span></div>
        {onUploadIcon&&<>
          <input ref={iconFileRef} type="file" accept="image/*" style={{display:"none"}} onChange={async e=>{const f=e.target.files[0]; e.target.value=""; if(f){const url=await onUploadIcon(f); if(url){setIcon(url);setIconPicked(true);}}}}/>
          <button onClick={()=>iconFileRef.current?.click()} style={{marginBottom:6,padding:"5px 10px",borderRadius:7,border:`1px dashed ${T.accent}`,background:T.accentGlow,color:T.accent,cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>🖼️ Upload image</button>
        </>}
        <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:isGroup?16:12,maxHeight:126,overflowY:"auto"}}>
          {CAT_ICONS.map(em=><button key={em} onClick={()=>{setIcon(em);setIconPicked(true);}} style={{width:30,height:30,borderRadius:8,border:`1px solid ${icon===em?T.accent:T.border}`,background:icon===em?T.accentGlow:"transparent",cursor:"pointer",fontSize:15,padding:0}}>{em}</button>)}
        </div>
        {!isGroup&&(<>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",color:T.textMuted,marginBottom:6}}>Color</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>
            {CAT_COLORS.map(col=><div key={col} onClick={()=>setColor(col)} style={{width:20,height:20,borderRadius:"50%",background:col,cursor:"pointer",border:`2px solid ${color===col?T.text:"transparent"}`}}/>)}
          </div>
        </>)}
        <button onClick={create} disabled={!name.trim()} style={{width:"100%",padding:"10px",borderRadius:10,border:"none",cursor:name.trim()?"pointer":"default",background:name.trim()?T.grad:T.surface3,color:"#fff",fontSize:13,fontWeight:700,fontFamily:"'DM Sans',sans-serif",opacity:name.trim()?1:.5}}>{isGroup?"Create folder":"Create list"}</button>
      </div>
    </div>
  );
}

// Popup to manage a list or folder right from the sidebar: rename, recolor/re-icon, share (a folder shares all its lists), delete.
// mode: "full" (sidebar ⋯) · "edit" (name/icon/color/delete only) · "share" (share + assign only).
// One panel, two tabs — never both at once, so it fits a phone screen exactly like it fits a laptop.
// `mode` only picks which tab opens first ("edit" from the ✎, "share" from the 🤝 button).
function SidebarManage({T,target,isGroup,childLists,shares,meta,onClose,onRename,onShare,onUnshare,onDelete,onSetIcon,onSetColor,onAssignAll,assignGroups=[],onUploadIcon,autoFocusName=false,mode="edit"}) {
  const [tab,setTab]=useState(mode==="share"?"share":"edit");
  const showEdit=tab==="edit", showShare=tab==="share";
  const [name,setName]=useState(target.name);
  const [email,setEmail]=useState("");
  const [perm,setPerm]=useState("edit");
  const [assignEmail,setAssignEmail]=useState("");
  const iconFileRef=useRef(null);
  const nameRef=useRef(null);
  // Opened via the list title's ✎ → jump straight into rename mode (focused, text selected).
  useEffect(()=>{ if(autoFocusName) setTimeout(()=>{ nameRef.current?.focus(); nameRef.current?.select(); },60); // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  // Nickname/contact book — same localStorage store as Settings, so nicknames work in both places.
  const [contacts,setContacts]=useState(()=>{try{return JSON.parse(localStorage.getItem("fs_contacts")||"{}");}catch{return{};}});
  useEffect(()=>{try{localStorage.setItem("fs_contacts",JSON.stringify(contacts));}catch{}},[contacts]);
  const setNick=(em,nm)=>setContacts(c=>({...c,[em]:nm}));
  const knownEmails=[...new Set([...(shares||[]).map(s=>s.shared_with_email),...Object.keys(contacts)])].filter(Boolean);
  const saveName=()=>{ const v=name.trim(); if(v&&v!==target.name){ if(onRename(v)===false) return; } onClose(); };
  const doShare=()=>{
    const raw=email.trim(); if(!raw) return;
    const isEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw);
    let em=raw.toLowerCase();
    if(!isEmail){ // typed a nickname → resolve it to that person's saved email
      const match=Object.entries(contacts).find(([mail,nick])=>nick&&nick.trim().toLowerCase()===raw.toLowerCase());
      if(match) em=match[0];
      else { alert(`"${raw}" isn't a valid email or a saved nickname. Enter an email like name@example.com.`); return; }
    }
    if(isGroup&&childLists.length===0){ alert("This folder has no lists inside it yet — drag a list in first."); return; }
    onShare(em,perm);
    setContacts(c=>em in c?c:{...c,[em]:""});
    setEmail("");
  };
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:2600,background:"rgba(5,6,12,.6)",display:"flex",alignItems:"center",justifyContent:"center",padding:18}}>
      <div onClick={e=>e.stopPropagation()} data-nodrag style={{width:360,maxWidth:"94vw",maxHeight:"86vh",overflowY:"auto",background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,padding:18,boxShadow:"0 24px 80px rgba(0,0,0,.5)",fontFamily:"'DM Sans',sans-serif"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
          <CatIcon icon={meta.icon||"📁"} size={20}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:15,fontWeight:800,fontFamily:"'Sora',sans-serif",textTransform:"capitalize",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{target.name}</div>
            <div style={{fontSize:10,color:T.textMuted}}>{isGroup?`Folder · ${childLists.length} list${childLists.length===1?"":"s"} inside`:"List"}</div>
          </div>
          <button onClick={onClose} style={{width:26,height:26,borderRadius:7,border:"none",cursor:"pointer",background:T.surface2,color:T.textMuted,display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="x" s={13}/></button>
        </div>

        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {[["edit","✎ Edit"],["share","🤝 Share & assign"]].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"7px 0",borderRadius:9,border:`1px solid ${tab===id?T.accent:T.border}`,background:tab===id?T.accentGlow:"transparent",color:tab===id?T.accent:T.textMuted,cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>{label}</button>
          ))}
        </div>

        {showEdit&&<>
        <div style={{fontSize:9,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",color:T.textMuted,marginBottom:6}}>Name</div>
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          <input ref={nameRef} value={name} onChange={e=>{ const v=e.target.value, g=guessIcon(v,null), was=guessIcon(name,null); setName(v); if(g&&g!==was&&g!==meta.icon) onSetIcon?.(g); }} onKeyDown={e=>{if(e.key==="Enter")saveName();}} style={{flex:1,minWidth:0,padding:"8px 10px",borderRadius:9,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontSize:13,outline:"none",fontFamily:"'DM Sans',sans-serif"}}/>
          <button onClick={saveName} style={{padding:"8px 14px",borderRadius:9,border:"none",cursor:"pointer",background:T.grad,color:"#fff",fontSize:12,fontWeight:700}}>Save</button>
        </div>

        <div style={{fontSize:9,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",color:T.textMuted,marginBottom:6}}>Icon</div>
        {onUploadIcon&&<>
          <input ref={iconFileRef} type="file" accept="image/*" style={{display:"none"}} onChange={async e=>{const f=e.target.files[0]; e.target.value=""; if(f){const url=await onUploadIcon(f); if(url)onSetIcon(url);}}}/>
          <button onClick={()=>iconFileRef.current?.click()} style={{marginBottom:6,padding:"5px 10px",borderRadius:7,border:`1px dashed ${T.accent}`,background:T.accentGlow,color:T.accent,cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>🖼️ Upload image{isImgIcon(meta.icon)?" · using your image ✓":""}</button>
        </>}
        <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:isGroup?14:12,maxHeight:126,overflowY:"auto"}}>
          {CAT_ICONS.map(em=><button key={em} onClick={()=>onSetIcon(em)} style={{width:30,height:30,borderRadius:8,border:`1px solid ${meta.icon===em?T.accent:T.border}`,background:meta.icon===em?T.accentGlow:"transparent",cursor:"pointer",fontSize:15,padding:0}}>{em}</button>)}
        </div>
        {!isGroup&&(<>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",color:T.textMuted,marginBottom:6}}>Color</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
            {CAT_COLORS.map(col=><div key={col} onClick={()=>onSetColor(col)} style={{width:20,height:20,borderRadius:"50%",background:col,cursor:"pointer",border:`2px solid ${meta.color===col?T.text:"transparent"}`}}/>)}
          </div>
        </>)}
        </>}

        {showShare&&<>
        <div style={{fontSize:9,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",color:T.textMuted,marginBottom:4}}>Share 🤝</div>
        <div style={{fontSize:10,color:T.textMuted,marginBottom:8,lineHeight:1.5}}>{isGroup?"Invites the person to every list inside this folder.":"Invite another Freely user by the email they signed up with — or a saved nickname."}</div>
        <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
          <input value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")doShare();}} placeholder="their@email.com or nickname" style={{flex:1,minWidth:120,padding:"8px 10px",borderRadius:9,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontSize:12,outline:"none",fontFamily:"'DM Sans',sans-serif"}}/>
          <select value={perm} onChange={e=>setPerm(e.target.value)} style={{padding:"8px 8px",borderRadius:9,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontSize:12,outline:"none",cursor:"pointer"}}>
            <option value="view">View only</option>
            <option value="edit">Edit & add</option>
            <option value="delete">+ delete</option>
          </select>
          <button onClick={doShare} style={{padding:"8px 14px",borderRadius:9,border:"none",cursor:"pointer",background:T.grad,color:"#fff",fontSize:12,fontWeight:700}}>Share</button>
        </div>
        {knownEmails.length>0&&<div style={{marginBottom:8}}>
          <div style={{fontSize:8,fontWeight:700,letterSpacing:".4px",textTransform:"uppercase",color:T.textMuted,marginBottom:4}}>Saved people — nickname them, tap Use</div>
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            {knownEmails.map(em=>(
              <div key={em} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 8px",borderRadius:8,background:T.surface2,border:`1px solid ${email.trim().toLowerCase()===em?T.accent:T.border}`}}>
                <span style={{fontSize:13}}>{contacts[em]?"⭐":"👤"}</span>
                <div style={{flex:1,minWidth:0}}>
                  <input value={contacts[em]||""} onChange={e=>setNick(em,e.target.value)} placeholder="Add a nickname…" style={{width:"100%",padding:"1px 0",border:"none",borderBottom:`1px dashed ${T.border}`,background:"transparent",color:T.text,fontSize:11,fontWeight:600,outline:"none",fontFamily:"'DM Sans',sans-serif"}}/>
                  <div style={{fontSize:9,color:T.textMuted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{em}</div>
                </div>
                <button onClick={()=>setEmail(em)} style={{padding:"3px 10px",borderRadius:6,border:`1px solid ${T.accent}`,background:T.accentGlow,color:T.accent,cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>Use</button>
                <button onClick={()=>setContacts(c=>{const n={...c};delete n[em];return n;})} title="Forget this person" style={{background:"none",border:"none",cursor:"pointer",color:T.textMuted,display:"flex"}}><Ico n="x" s={10}/></button>
              </div>
            ))}
          </div>
        </div>}
        {shares.length>0&&<div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:6}}>
          {shares.map(s=>(
            <div key={s.id} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 9px",borderRadius:8,background:T.surface2,border:`1px solid ${T.border}`}}>
              {isGroup&&<span style={{fontSize:9,color:T.textMuted,fontWeight:700,textTransform:"capitalize"}}>{s.folder}</span>}
              <span style={{fontSize:11,color:T.text,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>→ {s.shared_with_email}</span>
              <span style={{fontSize:8,fontWeight:700,color:s.can_delete?T.danger:T.textMuted,background:(s.can_delete?T.danger:T.textMuted)+"22",padding:"1px 5px",borderRadius:8}}>{s.can_edit===false?"view only":s.can_delete?"can delete":"edit"}</span>
              <button onClick={()=>onUnshare(s.id)} style={{background:"none",border:"none",cursor:"pointer",color:T.danger,fontSize:10,fontWeight:700}}>✕</button>
            </div>
          ))}
        </div>}

        {onAssignAll&&(<>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",color:T.textMuted,margin:"12px 0 4px"}}>Assign every task 📌</div>
          <div style={{fontSize:10,color:T.textMuted,marginBottom:8,lineHeight:1.5}}>{isGroup?"Adds them to every open task in every list inside this folder.":"Adds them to every open task in this list."}</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:6}}>
            {assignGroups.filter(g=>(g.members||[]).length).map(g=>(
              <button key={g.id} onClick={()=>onAssignAll(g.members)} title={(g.members||[]).map(m=>nickOf(m)).join(", ")} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:20,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}><Ico n="users" s={10} c={T.textMuted}/> {g.name} ({(g.members||[]).length})</button>
            ))}
          </div>
          <div style={{display:"flex",gap:5}}>
            <input value={assignEmail} onChange={e=>setAssignEmail(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){const em=assignEmail.trim().toLowerCase();if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){onAssignAll([em]);setAssignEmail("");}else alert("Enter a valid email.");}}} placeholder="or assign everyone to an email…" style={{flex:1,minWidth:0,padding:"6px 9px",borderRadius:8,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontSize:11,outline:"none",fontFamily:"'DM Sans',sans-serif"}}/>
          </div>
        </>)}
        </>}
        {showEdit&&<button onClick={onDelete} style={{width:"100%",marginTop:12,padding:"9px",borderRadius:9,border:`1px solid ${T.danger}44`,background:T.danger+"11",color:T.danger,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <Ico n="trash" s={13} c={T.danger}/>{isGroup?"Delete folder (keeps its lists)":"Delete this list"}
        </button>}
      </div>
    </div>
  );
}

// Messages: 1:1 DMs (message anyone with an account — one intro message until they accept/reply) + team chats.
function MessagesView({T,myEmail,messages,people=[],groups=[],reqs=[],trusted=[],peer,onOpenPeer,onSend,onAnswerReq,onStartChat,onOpenTeams}) {
  const [text,setText]=useState("");
  const [newChat,setNewChat]=useState("");
  const endRef=useRef(null);
  const isG=typeof peer==="string"&&peer.startsWith("g:");
  const gid=isG?parseInt(peer.slice(2),10):null;
  const group=isG?groups.find(g=>g.id===gid):null;
  const dms=messages.filter(m=>!m.group_id);
  const partners=[...new Set([...dms.map(m=>m.sender_email===myEmail?m.recipient_email:m.sender_email),...people])].filter(e=>e&&e!==myEmail);
  const lastDm=em=>{ const ms=dms.filter(m=>m.sender_email===em||m.recipient_email===em); return ms[ms.length-1]; };
  const lastG=g=>{ const ms=messages.filter(m=>m.group_id===g.id); return ms[ms.length-1]; };
  partners.sort((a,b)=>((lastDm(b)?.created_at)||"").localeCompare((lastDm(a)?.created_at)||""));
  const unreadFrom=em=>dms.filter(m=>m.sender_email===em&&m.recipient_email===myEmail&&!m.read).length;
  const acceptedWith=em=>trusted.includes(em)
    ||reqs.some(r=>r.status==="accepted"&&((r.from_email===em&&r.to_email===myEmail)||(r.to_email===em&&r.from_email===myEmail)))
    ||dms.some(m=>m.sender_email===em&&m.recipient_email===myEmail);
  const thread=isG
    ? messages.filter(m=>m.group_id===gid)
    : (peer?dms.filter(m=>(m.sender_email===peer&&m.recipient_email===myEmail)||(m.sender_email===myEmail&&m.recipient_email===peer)):[]);
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[thread.length,peer]);
  const iSentAny=peer&&!isG?dms.some(m=>m.sender_email===myEmail&&m.recipient_email===peer):false;
  const canSend=!peer||isG||acceptedWith(peer)||!iSentAny;
  const pendingIn=peer&&!isG?reqs.find(r=>r.from_email===peer&&r.to_email===myEmail&&r.status==="pending"):null;
  const send=()=>{ const t=text.trim(); if(!t||!peer||!canSend) return; onSend(peer,t); setText(""); };
  if(peer) return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"14px 20px",borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
        <button onClick={()=>onOpenPeer(null)} title="Back to chats" style={{background:T.surface2,border:"none",cursor:"pointer",color:T.text,borderRadius:8,width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:16}}>‹</button>
        {isG
          ? <span style={{width:32,height:32,borderRadius:"50%",background:T.accentGlow,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{group?.icon||"👥"}</span>
          : <Avatar email={peer} size={32}/>}
        <div style={{minWidth:0}}>
          <div style={{fontFamily:"'Sora',sans-serif",fontSize:15,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{isG?(group?.name||"Team"):nickOf(peer)}</div>
          <div style={{fontSize:10,color:T.textMuted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{isG?`Team chat · ${(group?.members||[]).length} members`:peer}</div>
        </div>
      </div>
      {pendingIn&&(
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 20px",background:T.accentGlow,borderBottom:`1px solid ${T.border}`,flexShrink:0,flexWrap:"wrap"}}>
          <span style={{fontSize:12,color:T.text,flex:1,minWidth:140}}>🤝 <b>{nickOf(peer)}</b> wants to chat with you</span>
          <button onClick={()=>onAnswerReq(pendingIn.id,"accepted")} style={{padding:"5px 14px",borderRadius:8,border:"none",cursor:"pointer",background:T.grad,color:"#fff",fontSize:11,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>Accept</button>
          <button onClick={()=>onAnswerReq(pendingIn.id,"declined")} style={{padding:"5px 12px",borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>Decline</button>
        </div>
      )}
      <div style={{flex:1,overflowY:"auto",padding:"16px 20px",display:"flex",flexDirection:"column",gap:8}}>
        {thread.length===0&&<div style={{margin:"auto",fontSize:12,color:T.textMuted,textAlign:"center"}}>No messages yet — say hi 👋</div>}
        {thread.map(m=>{
          if((m.body||"").startsWith(SYS_MARK)) return (
            <div key={m.id} style={{alignSelf:"center",fontSize:10,color:T.textMuted,background:T.surface2,borderRadius:20,padding:"3px 12px",margin:"2px 0"}}>{m.body.slice(SYS_MARK.length)}</div>
          );
          const mine=m.sender_email===myEmail; return (
          <div key={m.id} style={{alignSelf:mine?"flex-end":"flex-start",maxWidth:"78%",display:"flex",flexDirection:"column",gap:2}}>
            {isG&&!mine&&<div style={{display:"flex",alignItems:"center",gap:4,fontSize:9,color:T.textMuted,paddingLeft:2}}><Avatar email={m.sender_email} size={14}/>{nickOf(m.sender_email).split("@")[0]}</div>}
            <div style={{padding:"8px 12px",borderRadius:14,borderBottomRightRadius:mine?4:14,borderBottomLeftRadius:mine?14:4,background:mine?T.grad:T.surface2,color:mine?"#fff":T.text,fontSize:13,lineHeight:1.45,wordBreak:"break-word"}}>{m.body}</div>
          </div>
        );})}
        <div ref={endRef}/>
      </div>
      {canSend?(
        <div style={{display:"flex",gap:8,padding:"12px 20px",borderTop:`1px solid ${T.border}`,flexShrink:0}}>
          <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")send();}} placeholder="Message…" style={{flex:1,minWidth:0,padding:"10px 14px",borderRadius:22,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:13,outline:"none"}}/>
          <button onClick={send} disabled={!text.trim()} style={{width:42,height:42,borderRadius:"50%",border:"none",cursor:text.trim()?"pointer":"default",background:text.trim()?T.grad:T.surface3,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,opacity:text.trim()?1:.5}}><Ico n="send" s={16} c="#fff"/></button>
        </div>
      ):(
        <div style={{padding:"12px 20px",borderTop:`1px solid ${T.border}`,flexShrink:0,fontSize:11,color:T.textMuted,textAlign:"center",lineHeight:1.5}}>⏳ Request sent — you can send more messages once {nickOf(peer).split("@")[0]} replies or accepts.</div>
      )}
    </div>
  );
  return (
    <div style={{flex:1,overflowY:"auto",padding:"22px 26px"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
        <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:21,fontWeight:700,letterSpacing:"-.5px"}}>Messages</h1>
        {onOpenTeams&&<button onClick={onOpenTeams} style={{marginLeft:"auto",display:"inline-flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:20,border:`1px solid ${T.accent}55`,background:T.accentGlow,color:T.accent,cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}><Ico n="users" s={12} c={T.accent}/> Teams</button>}
      </div>
      <p style={{fontSize:12,color:T.textMuted,marginBottom:12}}>Chat with teammates and collaborators — or message any Freely user by email (they get a request; you can send one message until they accept or reply).</p>
      <div style={{display:"flex",gap:6,marginBottom:16}}>
        <input value={newChat} onChange={e=>setNewChat(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newChat.trim()){onStartChat(newChat);setNewChat("");}}} placeholder="Start a chat — type any Freely user's email…" style={{flex:1,minWidth:0,padding:"9px 12px",borderRadius:10,border:`1px dashed ${T.border}`,background:T.surface2,color:T.text,fontFamily:"'DM Sans',sans-serif",fontSize:12,outline:"none"}}/>
        <button onClick={()=>{ if(newChat.trim()){onStartChat(newChat);setNewChat("");} }} disabled={!newChat.trim()} style={{padding:"0 16px",borderRadius:10,border:"none",cursor:newChat.trim()?"pointer":"default",background:newChat.trim()?T.grad:T.surface3,color:"#fff",fontSize:12,fontWeight:700,fontFamily:"'DM Sans',sans-serif",opacity:newChat.trim()?1:.5}}>Chat</button>
      </div>
      {(()=>{ const incoming=reqs.filter(r=>r.to_email===myEmail&&r.status==="pending"); if(!incoming.length) return null;
        const firstFrom=em=>{ const m=dms.filter(x=>x.sender_email===em&&x.recipient_email===myEmail)[0]; return m?.body||""; };
        return (
        <div style={{marginBottom:16}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",color:"#ef4444",marginBottom:6}}>🤝 New friend requests</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {incoming.map(r=>(
              <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:12,border:`1px solid #ef444455`,background:"#ef44440d"}}>
                <Avatar email={r.from_email} size={36}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:700,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{nickOf(r.from_email)} <span style={{fontWeight:500,color:T.textMuted,fontSize:11}}>wants to connect</span></div>
                  <div style={{fontSize:11,color:T.textMuted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{firstFrom(r.from_email)||"New chat request"}</div>
                </div>
                <button onClick={()=>onAnswerReq(r.id,"accepted")} style={{padding:"6px 13px",borderRadius:8,border:"none",cursor:"pointer",background:T.grad,color:"#fff",fontSize:11,fontWeight:700,fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>Accept</button>
                <button onClick={()=>onOpenPeer(r.from_email)} title="Open" style={{padding:"6px 10px",borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>View</button>
              </div>
            ))}
          </div>
        </div>
        );
      })()}
      {groups.length>0&&(<>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",color:T.textMuted,marginBottom:6}}>Team chats</div>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
          {groups.map(g=>{ const lm=lastG(g); return (
            <button key={g.id} onClick={()=>onOpenPeer("g:"+g.id)} style={{display:"flex",alignItems:"center",gap:11,padding:"11px 13px",borderRadius:12,border:`1px solid ${T.border}`,background:T.surface,cursor:"pointer",textAlign:"left"}}>
              <span style={{width:38,height:38,borderRadius:"50%",background:T.accentGlow,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{g.icon||"👥"}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.name} <span style={{fontWeight:500,color:T.textMuted,fontSize:11}}>· {(g.members||[]).length} members</span></div>
                <div style={{fontSize:11,color:T.textMuted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lm?`${lm.sender_email===myEmail?"You":nickOf(lm.sender_email).split("@")[0]}: ${lm.body}`:"Say hi to the team 👋"}</div>
              </div>
            </button>
          );})}
        </div>
      </>)}
      {partners.length>0&&<div style={{fontSize:10,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",color:T.textMuted,marginBottom:6}}>People</div>}
      {partners.length===0&&groups.length===0
        ? <div style={{fontSize:13,color:T.textMuted,background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"20px",textAlign:"center",lineHeight:1.6}}>💬 No chats yet.<br/>Type someone's email above, create a team in Settings, or share a list with a friend.</div>
        : <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {partners.map(em=>{ const lm=lastDm(em); const u=unreadFrom(em); return (
              <button key={em} onClick={()=>onOpenPeer(em)} style={{display:"flex",alignItems:"center",gap:11,padding:"11px 13px",borderRadius:12,border:`1px solid ${u?T.accent+"66":T.border}`,background:T.surface,cursor:"pointer",textAlign:"left"}}>
                <Avatar email={em} size={38}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:700,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{nickOf(em)}</div>
                  <div style={{fontSize:11,color:T.textMuted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lm?`${lm.sender_email===myEmail?"You: ":""}${lm.body}`:"Tap to start chatting"}</div>
                </div>
                {u>0&&<span style={{background:"#ef4444",color:"#fff",fontSize:10,fontWeight:700,minWidth:18,height:18,borderRadius:9,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"0 5px",flexShrink:0}}>{u}</span>}
              </button>
            );})}
          </div>}
    </div>
  );
}

// Teams are shared with everyone in them: teammates see the team, chat in its team chat,
// pull in other members, and assign tasks to the whole team. (Server-side, RLS-protected.)
function TeamsSettings({T,teams=[],myEmail,myId,knownPeople=[],onCreate,onAddMember,onRemoveMember,onDelete}) {
  const [name,setName]=useState("");
  const [openId,setOpenId]=useState(null);
  const [addEmail,setAddEmail]=useState("");
  const [addRole,setAddRole]=useState("member");   // "member" = full teammate · "assigner" = guest who may only assign work
  const create=()=>{ const n=name.trim(); if(!n) return; onCreate(n); setName(""); };
  return (
    <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 16px 14px",marginBottom:14}}>
      <div style={{fontSize:10,fontWeight:700,letterSpacing:".6px",textTransform:"uppercase",color:T.textMuted,marginBottom:4}}>Teams 👥</div>
      <div style={{fontSize:11,color:T.textMuted,marginBottom:10,lineHeight:1.5}}>A team is private — people see it only once you invite them. Full members chat in the team chat, pull in others, and get work assigned to them. Guests can assign work to the team but can’t read its chat. Everyone needs a Freely account.</div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {teams.map(g=>{ const isCreator=g.created_by===myId; return (
          <div key={g.id} style={{border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 10px"}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:14}}>{g.icon||"👥"}</span>
              <span style={{flex:1,minWidth:0,fontSize:13,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.name}</span>
              <span style={{fontSize:10,color:T.textMuted,flexShrink:0}}>{(g.members||[]).length} member{(g.members||[]).length===1?"":"s"}</span>
              <button onClick={()=>setOpenId(openId===g.id?null:g.id)} style={{background:"none",border:"none",cursor:"pointer",color:T.accent,fontSize:11,fontWeight:700,flexShrink:0}}>{openId===g.id?"Done":"Manage"}</button>
              {isCreator&&<button onClick={()=>{if(window.confirm(`Delete team "${g.name}" for everyone?`))onDelete(g.id);}} title="Delete team (creator only)" style={{background:"none",border:"none",cursor:"pointer",color:T.danger,display:"flex",flexShrink:0}}><Ico n="x" s={12}/></button>}
            </div>
            {openId===g.id&&(
              <div style={{marginTop:8}}>
                <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:7}}>
                  {(g.members||[]).map(em=>(
                    <div key={em} style={{display:"flex",alignItems:"center",gap:7,padding:"3px 6px",borderRadius:7,background:T.surface2}}>
                      <Avatar email={em} size={18}/>
                      <span style={{flex:1,minWidth:0,fontSize:11,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{em===myEmail?"You":nickOf(em)}</span>
                      {(isCreator||em===myEmail)&&<button onClick={()=>onRemoveMember(g.id,em)} title={em===myEmail?"Leave team":"Remove"} style={{background:"none",border:"none",cursor:"pointer",color:T.danger,fontSize:9,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>{em===myEmail?"Leave":"✕"}</button>}
                    </div>
                  ))}
                </div>
                {(g.guests||[]).length>0&&<div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:7}}>
                  <div style={{fontSize:8,fontWeight:700,letterSpacing:".4px",textTransform:"uppercase",color:T.textMuted}}>Guests · can assign work only</div>
                  {(g.guests||[]).map(em=>(
                    <div key={em} style={{display:"flex",alignItems:"center",gap:7,padding:"3px 6px",borderRadius:7,background:T.surface2,opacity:.85}}>
                      <Avatar email={em} size={18}/>
                      <span style={{flex:1,minWidth:0,fontSize:11,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{em===myEmail?"You":nickOf(em)}</span>
                      {(isCreator||em===myEmail)&&<button onClick={()=>onRemoveMember(g.id,em)} title={em===myEmail?"Leave":"Remove guest"} style={{background:"none",border:"none",cursor:"pointer",color:T.danger,fontSize:9,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>{em===myEmail?"Leave":"✕"}</button>}
                    </div>
                  ))}
                </div>}
                {knownPeople.filter(em=>!(g.members||[]).includes(em)).length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:6}}>
                  {knownPeople.filter(em=>!(g.members||[]).includes(em)).map(em=>(
                    <button key={em} onClick={()=>onAddMember(g.id,em,addRole)} style={{padding:"3px 10px",borderRadius:20,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>+ {nickOf(em).split("@")[0]}</button>
                  ))}
                </div>}
                <div style={{display:"flex",gap:5}}>
                  <input value={addEmail} onChange={e=>setAddEmail(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&addEmail.trim()){onAddMember(g.id,addEmail,addRole);setAddEmail("");}}} placeholder={addRole==="member"?"add teammate by email…":"invite a guest by email…"} style={{flex:1,minWidth:0,padding:"5px 8px",borderRadius:7,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontSize:11,outline:"none",fontFamily:"'DM Sans',sans-serif"}}/>
                  <button onClick={()=>{if(addEmail.trim()){onAddMember(g.id,addEmail,addRole);setAddEmail("");}}} style={{padding:"5px 12px",borderRadius:7,border:"none",cursor:"pointer",background:T.accentGlow,color:T.accent,fontSize:11,fontWeight:700}}>Add</button>
                </div>
                <div style={{display:"flex",gap:5,marginTop:5}}>
                  {[["member","👥 Full member"],["assigner","📌 Guest · assign only"]].map(([id,lbl])=>(
                    <button key={id} onClick={()=>setAddRole(id)} style={{flex:1,padding:"4px 0",borderRadius:7,border:`1px solid ${addRole===id?T.accent:T.border}`,background:addRole===id?T.accentGlow:"transparent",color:addRole===id?T.accent:T.textMuted,cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>{lbl}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );})}
      </div>
      <div style={{display:"flex",gap:6,marginTop:teams.length?10:0}}>
        <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")create();}} placeholder="New team name… e.g. Design" style={{flex:1,minWidth:0,padding:"7px 10px",borderRadius:9,border:`1px dashed ${T.border}`,background:T.surface2,color:T.text,fontSize:12,outline:"none",fontFamily:"'DM Sans',sans-serif"}}/>
        <button onClick={create} disabled={!name.trim()} style={{padding:"7px 14px",borderRadius:9,border:"none",cursor:name.trim()?"pointer":"default",background:name.trim()?T.grad:T.surface3,color:"#fff",fontSize:12,fontWeight:700,opacity:name.trim()?1:.5}}>Create</button>
      </div>
    </div>
  );
}

// ── The guide ────────────────────────────────────────────────────────────────
// One place that explains every part of the app, reachable forever from Settings,
// the ⓘ button and the hint under any task list. Written as short answers to
// "how do I…", not as a feature list, and sized for a phone first: full screen
// under 640px, a centred sheet above it.
const GUIDE = [
  ["✅","The basics","A task is a card. Tap it to open the details, where you can add steps, a date, a time, notes, photos, a colour, a priority and who it's for.\n• Tap the circle to finish it.\n• Tap the title in the details to rename it — type a date or a list name in there and Freely picks it up as you type.\n• Everything saves by itself, on every device you sign in on."],
  ["✨","Type it the way you'd say it","No date pickers. Type the whole thing into any add box:\n• “Call the dentist tomorrow 3pm”\n• “Essay draft friday”\n• “Team sync sept 30 4:00 pm - 5:30 pm”\n• “Pay rent every month”\n• “Groceries this weekend”\nFreely pulls out the date, the time, the repeat and the list, and leaves the title clean. Typos are forgiven — “tommorow”, “wensday”, “julky” and “fridya” all land where you meant.\nNo date yet? Type “tbd” or “unknown” and it waits under Date TBD instead of guessing."],
  ["👆","Gestures","• Swipe a task ← to delete it, → to add it to My Day.\n• To reorder: hold a task for a moment, or (with a mouse) just pull it along the list. A line shows exactly where it lands. This only works in “My order” — in the other sorts the list arranges itself.\n• On the Priority Matrix, hold a note and drop it in any box."],
  ["☀️","My Day","Your shortlist for today, wiped clean each morning. Anything unfinished is carried forward — the banner at the top undoes that in one tap.\nSuggestions for what to pull in sit at the bottom of the list."],
  ["📅","Upcoming & Calendar","Upcoming is everything with a date, soonest first. Anything overdue is pinned to the top in red, with a one-tap “Move to today”. Undated work waits under Date TBD.\nCalendar is the same tasks on a month. Drag a task — or a single step inside one — onto a day to move it."],
  ["🎯","Priority Matrix","Four boxes, by urgency and importance:\n• Top-left — urgent AND important: do it now.\n• Top-right — important, not urgent: schedule it.\n• Bottom-left — urgent, not important: hand it off.\n• Bottom-right — neither: drop it.\nTap ⤢ on a box to give it the whole screen. The matrix and your lists are the same tasks."],
  ["📁","Lists, folders & your home screen","Make a list for anything — Groceries, Work, Side project. Your capitals are kept.\n• Drag one list onto another to nest them in a folder.\n• Tap a list's name at the top of the screen to rename it or change its icon and colour.\n• Type a list's name into a task and it's filed there: “work call the bank” goes to Work as “call the bank”.\n• Whatever is at the very top of your sidebar is the screen Freely opens on."],
  ["🤝","Sharing & assigning","Tap 🤝 Share next to a list's name and invite someone by email — they see it the moment they sign in.\n• Assign a task to one person, or to everyone on the list at once.\n• Everyone on the list sees who a task is for — unless you mark it 🔒 private, and then only that person sees it.\n• Work assigned to you appears under “Assigned to me”, even from lists that were never shared with you.\n• Leave any list you were invited to with Leave ✕."],
  ["👥","Teams & messages","Settings → Teams makes a team. Teammates can message each other straight away, no request needed.\n• Outside a team, your first message to someone is a request; they accept before you can chat freely.\n• A team is private — nobody sees it unless they were invited.\n• You can assign a whole list to a team in one go."],
  ["🔁","Habits","Things you do repeatedly, not once. Pick the weekdays, give it a priority, check in with a tap. The streak counts consecutive days kept. Today's habits also sit at the top of My Day."],
  ["🍅","Focus","Open a task and hit Focus to start a timer on it. Finishing one earns +25 XP. Minimise it and it keeps running while you work."],
  ["📝","Notes & Canvas","Notes are for writing that isn't a task. The Canvas is a freeform board — sticky notes you drag anywhere, and link to a task so its date follows along. An empty note removes itself."],
  ["📊","Progress","Analytics shows what you actually finished — a weekly chart, a heatmap, your streak and XP — counted across all your devices."],
  ["⚙️","Settings worth knowing","• Sort order, new tasks to the bottom or top, and your theme — all remembered on every device.\n• Hide any tab you don't use; reorder the rest by dragging in the sidebar.\n• Export a backup of everything, or import one back."],
];
function HelpGuide({T,onClose,onReplayTour,onSamples}) {
  const narrow = useNarrow();
  const [open,setOpen] = useState(0);
  const [q,setQ] = useState("");
  const ql = q.trim().toLowerCase();
  const rows = ql ? GUIDE.filter(([,t,b])=>(t+" "+b).toLowerCase().includes(ql)) : GUIDE;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:2700,background:"rgba(5,6,12,.7)",display:"flex",alignItems:narrow?"stretch":"center",justifyContent:"center",padding:narrow?0:20}}>
      <div onClick={e=>e.stopPropagation()} style={{width:narrow?"100%":480,maxWidth:"100%",height:narrow?"100%":"auto",maxHeight:narrow?"100%":"88vh",display:"flex",flexDirection:"column",background:T.surface,border:narrow?"none":`1px solid ${T.border}`,borderRadius:narrow?0:18,boxShadow:"0 24px 80px rgba(0,0,0,.5)",fontFamily:"'DM Sans',sans-serif",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",gap:9,padding:"14px 16px",borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
          <span style={{fontSize:19}}>📖</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:"'Sora',sans-serif",fontSize:15,fontWeight:800}}>How Freely works</div>
            <div style={{fontSize:10,color:T.textMuted}}>Every part of the app, in plain language</div>
          </div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:9,border:"none",cursor:"pointer",background:T.surface2,color:T.textMuted,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico n="x" s={14}/></button>
        </div>
        <div style={{padding:"10px 14px 0",flexShrink:0}}>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search the guide…  try “assign”, “streak”, “tbd”" style={{width:"100%",boxSizing:"border-box",padding:"9px 11px",borderRadius:10,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,fontSize:12,outline:"none",fontFamily:"'DM Sans',sans-serif"}}/>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"10px 14px 16px",display:"flex",flexDirection:"column",gap:6,WebkitOverflowScrolling:"touch"}}>
          {rows.length===0&&<div style={{textAlign:"center",padding:"36px 10px",color:T.textMuted,fontSize:12}}>Nothing in the guide matches “{q}”.</div>}
          {rows.map(([em,title,body])=>{ const i=GUIDE.findIndex(g=>g[1]===title); const isOpen=ql?true:open===i; return (
            <div key={title} style={{border:`1px solid ${T.border}`,borderRadius:12,background:isOpen?T.surface2:"transparent",overflow:"hidden",flexShrink:0}}>
              <button onClick={()=>setOpen(o=>o===i?-1:i)} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"11px 12px",background:"none",border:"none",cursor:"pointer",color:T.text,fontFamily:"'DM Sans',sans-serif",textAlign:"left"}}>
                <span style={{fontSize:16,flexShrink:0}}>{em}</span>
                <span style={{flex:1,minWidth:0,fontSize:13,fontWeight:700}}>{title}</span>
                <span style={{fontSize:11,color:T.textMuted,flexShrink:0,transform:isOpen?"rotate(90deg)":"none",transition:"transform .15s"}}>›</span>
              </button>
              {isOpen&&<div style={{padding:"0 12px 12px",fontSize:12,color:T.textMuted,lineHeight:1.65,whiteSpace:"pre-line"}}>{body}</div>}
            </div>
          );})}
          <div style={{display:"flex",gap:8,marginTop:6,flexWrap:"wrap"}}>
            {onReplayTour&&<button onClick={onReplayTour} style={{flexGrow:1,flexBasis:140,padding:"10px",borderRadius:10,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>▶ Replay the tour</button>}
            {onSamples&&<button onClick={onSamples} style={{flexGrow:1,flexBasis:140,padding:"10px",borderRadius:10,border:`1px solid ${T.border}`,background:T.surface2,color:T.text,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>↺ Starter tasks again</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsView({T,dark,setDark,scheme,setScheme,sound,setSound,onExport,onImport,onClearCompleted,ownedShares,onUnshare,deletedCats,onRestoreCat,onPurgeCat,pomLen,onPomLen,navTabs=[],hiddenTabs=[],setHiddenTabs,knownPeople=[],teams=[],myEmail,myId,onTeamCreate,onTeamAddMember,onTeamRemoveMember,onTeamDelete,myAvatar,onPickAvatar,newAtBottom,setNewAtBottom,onHelp}) {
  const narrow=useNarrow();
  const importRef=useRef(null);
  const soundFileRef=useRef(null);
  const onSoundFile=file=>{
    if(!file) return;
    if(file.size>900000){ alert("That audio file is a bit large (keep it under ~0.9 MB / a 1–2 second clip). Try a shorter sound."); return; }
    const r=new FileReader();
    r.onload=()=>{ try{ localStorage.setItem("fs_sound_custom",r.result); setSound("custom"); playComplete("custom"); }catch{ alert("Couldn't save that sound — try a smaller clip."); } };
    r.readAsDataURL(file);
  };
  // Nicknames for the people you work with — the same store the share panel reads, so a nickname works in both.
  const [contacts,setContacts]=useState(()=>{try{return JSON.parse(localStorage.getItem("fs_contacts")||"{}");}catch{return{};}});
  useEffect(()=>{try{localStorage.setItem("fs_contacts",JSON.stringify(contacts));}catch{}},[contacts]);
  const people=[...new Set([...(ownedShares||[]).map(s=>s.shared_with_email),...Object.keys(contacts)])].filter(Boolean);
  // Reminder notifications are the browser's permission, so this shows the real state and asks for it.
  const canNotify=typeof window!=="undefined"&&"Notification" in window;
  const [notifPerm,setNotifPerm]=useState(()=>canNotify?Notification.permission:"unsupported");
  const askNotify=()=>{ if(canNotify) Notification.requestPermission().then(setNotifPerm).catch(()=>{}); };
  const Toggle=({val,onChange})=>(
    <div onClick={()=>onChange(!val)} style={{width:36,height:20,borderRadius:10,background:val?T.accent:T.surface3,cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}>
      <div style={{width:16,height:16,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:val?18:2,transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.3)"}}/>
    </div>
  );
  const Row=({label,desc,children})=>(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${T.border}`}}>
      <div style={{flex:1,minWidth:0,paddingRight:10}}><div style={{fontSize:13,fontWeight:500}}>{label}</div>{desc&&<div style={{fontSize:11,color:T.textMuted,marginTop:1,lineHeight:1.45}}>{desc}</div>}</div>
      {children}
    </div>
  );
  return (
    <div style={{flex:1,overflowY:"auto",padding:narrow?"16px 13px":"22px 26px",maxWidth:580}}>
      <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:21,fontWeight:700,letterSpacing:"-.5px",marginBottom:18}}>Settings</h1>

      {/* The guide, first thing on the page — it is what a stuck user comes here looking for. */}
      {onHelp&&(
        <button onClick={onHelp} style={{width:"100%",display:"flex",alignItems:"center",gap:11,padding:"13px 15px",marginBottom:14,borderRadius:12,border:`1px solid ${T.accent}55`,background:T.accentGlow,color:T.text,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textAlign:"left"}}>
          <span style={{fontSize:20,flexShrink:0}}>📖</span>
          <span style={{flex:1,minWidth:0}}>
            <span style={{display:"block",fontSize:13,fontWeight:800,color:T.accent}}>How Freely works</span>
            <span style={{display:"block",fontSize:11,color:T.textMuted,marginTop:1}}>Every feature explained · replay the tour · starter tasks</span>
          </span>
          <span style={{fontSize:14,color:T.accent,flexShrink:0}}>›</span>
        </button>
      )}

      {/* Teams (shared groups) */}
      <TeamsSettings T={T} teams={teams} myEmail={myEmail} myId={myId} knownPeople={knownPeople} onCreate={onTeamCreate} onAddMember={onTeamAddMember} onRemoveMember={onTeamRemoveMember} onDelete={onTeamDelete}/>


      {/* Show/hide sidebar tabs */}
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 16px 14px",marginBottom:14}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".6px",textTransform:"uppercase",color:T.textMuted,marginBottom:4}}>Sidebar tabs</div>
        <div style={{fontSize:11,color:T.textMuted,marginBottom:10}}>Tap a tab to show or hide it in the sidebar. Hidden tabs stay here so you can bring them back anytime.</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {navTabs.map(t=>{ const hidden=hiddenTabs.includes(t.id); return (
            <button key={t.id} onClick={()=>setHiddenTabs?.(h=>hidden?h.filter(x=>x!==t.id):[...h,t.id])} style={{padding:"5px 12px",borderRadius:20,border:`1px solid ${hidden?T.border:T.accent}`,background:hidden?"transparent":T.accentGlow,color:hidden?T.textMuted:T.accent,cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'DM Sans',sans-serif",textDecoration:hidden?"line-through":"none",opacity:hidden?.6:1}}>{hidden?"":"✓ "}{t.label}</button>
          );})}
        </div>
      </div>

      {/* Where a newly typed task lands */}
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"4px 16px 6px",marginBottom:14}}>
        <Row label="Add new tasks to the bottom" desc={newAtBottom?"New tasks join the end of the list.":"New tasks appear at the top of the list."}>
          <Toggle val={newAtBottom} onChange={setNewAtBottom}/>
        </Row>
      </div>

      {/* My avatar — shown to teammates on chats and assigned tasks */}
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 16px 14px",marginBottom:14}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".6px",textTransform:"uppercase",color:T.textMuted,marginBottom:4}}>My avatar</div>
        <div style={{fontSize:11,color:T.textMuted,marginBottom:10}}>Pick the face teammates see next to your messages and assigned tasks.</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,alignItems:"center"}}>
          {AVATAR_EMOJI.map(em=><button key={em} onClick={()=>onPickAvatar?.(em)} style={{width:34,height:34,borderRadius:"50%",border:`2px solid ${myAvatar===em?T.accent:T.border}`,background:myAvatar===em?T.accentGlow:"transparent",cursor:"pointer",fontSize:17,padding:0}}>{em}</button>)}
        </div>
      </div>

      {/* Lists are created, renamed, shared and deleted from the sidebar (⋯ next to a list). What's left here
          is what has no other home: restoring a deleted list, and one overview of everything you share. */}
      {deletedCats&&deletedCats.length>0&&(
        <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 16px 14px",marginBottom:14}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:".6px",textTransform:"uppercase",color:T.textMuted,marginBottom:8}}>Recently deleted lists</div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {deletedCats.map(d=>(
              <div key={d.name} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 9px",borderRadius:8,background:T.surface2,border:`1px solid ${T.border}`}}>
                <CatIcon icon={d.icon} size={14}/>
                <span style={{fontSize:12,fontWeight:600,color:T.textMuted,flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.name}</span>
                <button onClick={()=>onRestoreCat(d.name)} style={{padding:"3px 10px",borderRadius:6,border:`1px solid ${T.accent}`,background:T.accentGlow,color:T.accent,cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>Restore</button>
                <button onClick={()=>onPurgeCat(d.name)} title="Forget it" style={{background:"none",border:"none",cursor:"pointer",color:T.textMuted,display:"flex",flexShrink:0}}><Ico n="x" s={12}/></button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 16px 14px",marginBottom:14}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:".6px",textTransform:"uppercase",color:T.textMuted,marginBottom:4}}>Sharing 🤝</div>
        <div style={{fontSize:11,color:T.textMuted,marginBottom:10,lineHeight:1.5}}>To share a list, tap 🤝 Share next to its name. Everything you share is listed here.</div>
        {(!ownedShares||ownedShares.length===0)
          ? <div style={{fontSize:11,color:T.textMuted,opacity:.7}}>You aren't sharing any lists yet.</div>
          : <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {ownedShares.map(s=>(
                <div key={s.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",borderRadius:8,background:T.surface2,border:`1px solid ${T.border}`}}>
                  <span style={{fontSize:12,fontWeight:600,flexShrink:0,maxWidth:"35%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.folder}</span>
                  <span style={{fontSize:11,color:T.textMuted,flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>→ {contacts[s.shared_with_email]||s.shared_with_email}</span>
                  <span style={{fontSize:9,fontWeight:700,flexShrink:0,color:s.can_delete?T.danger:T.textMuted,background:(s.can_delete?T.danger:T.textMuted)+"22",padding:"1px 6px",borderRadius:10}}>{s.can_edit===false?"view only":s.can_delete?"can delete":"edit"}</span>
                  <button onClick={()=>onUnshare(s.id)} style={{background:"none",border:"none",cursor:"pointer",color:T.danger,fontSize:11,fontWeight:600,fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>Remove</button>
                </div>
              ))}
            </div>}
        {people.length>0&&(
          <div style={{marginTop:12}}>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:".5px",textTransform:"uppercase",color:T.textMuted,marginBottom:6}}>Nicknames — shown instead of the email everywhere</div>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {people.map(em=>(
                <div key={em} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 8px",borderRadius:8,background:T.surface2,border:`1px solid ${T.border}`}}>
                  <span style={{fontSize:14}}>{contacts[em]?"⭐":"👤"}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <input value={contacts[em]||""} onChange={e=>setContacts(c=>({...c,[em]:e.target.value}))} placeholder="Add a nickname…" style={{width:"100%",padding:"2px 0",border:"none",borderBottom:`1px dashed ${T.border}`,background:"transparent",color:T.text,fontSize:12,fontWeight:600,outline:"none",fontFamily:"'DM Sans',sans-serif"}}/>
                    <div style={{fontSize:10,color:T.textMuted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{em}</div>
                  </div>
                  <button onClick={()=>setContacts(c=>{const n={...c};delete n[em];return n;})} title="Forget this nickname" style={{background:"none",border:"none",cursor:"pointer",color:T.textMuted,display:"flex",flexShrink:0}}><Ico n="x" s={12}/></button>
                </div>
              ))}
            </div>
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
        {title:"Sounds",rows:[
          {label:"Complete sound",desc:"Plays when you check off a task. Tap one to preview.",el:(
            <div style={{display:"flex",flexWrap:"wrap",gap:5,justifyContent:"flex-end",maxWidth:250}}>
              <input ref={soundFileRef} type="file" accept="audio/*" style={{display:"none"}} onChange={e=>{if(e.target.files[0])onSoundFile(e.target.files[0]);e.target.value="";}}/>
              {SOUND_OPTIONS.map(o=>(
                <button key={o.id} title={o.hint} onClick={()=>{ if(o.id==="custom"){ if(localStorage.getItem("fs_sound_custom")){ setSound("custom"); playComplete("custom"); } else soundFileRef.current?.click(); } else { setSound(o.id); playComplete(o.id); } }} style={{padding:"5px 10px",borderRadius:8,border:`1px solid ${sound===o.id?T.accent:T.border}`,background:sound===o.id?T.accentGlow:"transparent",color:sound===o.id?T.accent:T.textMuted,cursor:"pointer",fontSize:11,fontWeight:sound===o.id?700:500,fontFamily:"'DM Sans',sans-serif"}}>{o.label}</button>
              ))}
              {localStorage.getItem("fs_sound_custom")&&<button onClick={()=>soundFileRef.current?.click()} style={{padding:"5px 10px",borderRadius:8,border:`1px dashed ${T.border}`,background:"transparent",color:T.textMuted,cursor:"pointer",fontSize:11,fontWeight:500,fontFamily:"'DM Sans',sans-serif"}}>Replace file</button>}
            </div>
          )},
        ]},
        {title:"Reminders",rows:[
          {label:"Notifications",desc:notifPerm==="granted"?"On — reminders pop up even when Freely is in the background.":notifPerm==="denied"?"Blocked in your browser settings. Reminders still show inside the app.":notifPerm==="unsupported"?"This browser can't show notifications. Reminders show inside the app.":"Off — reminders only show while Freely is open.",
            el:notifPerm==="default"?<button onClick={askNotify} style={{padding:"5px 11px",borderRadius:7,border:`1px solid ${T.accent}`,background:T.accentGlow,color:T.accent,cursor:"pointer",fontSize:12,fontWeight:700,flexShrink:0}}>Turn on</button>:<span style={{fontSize:11,fontWeight:700,flexShrink:0,color:notifPerm==="granted"?T.success:T.textMuted}}>{notifPerm==="granted"?"On":"—"}</span>},
        ]},
        {title:"Focus timer",rows:[{label:"Session length",desc:"Minutes per focus session",el:(
          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
            <button onClick={()=>onPomLen(Math.max(5,pomLen-5))} style={{width:24,height:24,borderRadius:5,border:`1px solid ${T.border}`,background:"transparent",color:T.text,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
            <span style={{fontWeight:700,fontSize:14,minWidth:24,textAlign:"center"}}>{pomLen}</span>
            <button onClick={()=>onPomLen(Math.min(90,pomLen+5))} style={{width:24,height:24,borderRadius:5,border:`1px solid ${T.border}`,background:"transparent",color:T.text,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
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
