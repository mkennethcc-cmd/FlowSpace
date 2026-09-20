// Freely's plain logic: dates, the natural-language parser, spelling fixes, and the category / icon
// guessers. No React and no browser storage in here — which is what lets `npm run check` test all of
// it in Node, in a second, before anything ships.

export const MONTHS = {jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11};
export const WEEKDAYS = {sun:0,mon:1,tue:2,wed:3,thu:4,fri:5,sat:6};

export const CAT_KEYWORDS = {
  health:["gym","run","running","workout","exercise","exercising","yoga","doctor","dentist","medicine","medical","meds","meditate","meditation","jog","jogging","therapy","health","hydrate","hydration","sleep"],
  personal:["friend","family","birthday","party","parties","dinner","lunch","movie","date","dating","shopping","grocery","groceries","hangout","mom","dad","vacation","trip","brunch","wedding"],
  finance:["budget","invoice","tax","taxes","pay","bill","bills","bank","rent","salary","expense","refund","insurance","mortgage"],
  school:["homework","study","studies","studying","exam","class","classes","assignment","lecture","quiz","quizzes","essay","essays","thesis","school","course","revision"],
  work:["meeting","client","report","email","project","deadline","standup","presentation","interview","proposal","slides","sprint","ticket","work","launch"],
};
// Tiny capped edit-distance so date typos still parse ("julky" → "july", "tommorow" → "tomorrow").
export const editDist=(a,b,max=2)=>{
  if(Math.abs(a.length-b.length)>max) return max+1;
  let prev2=null, prev=[...Array(b.length+1)].map((_,i)=>i);
  for(let i=1;i<=a.length;i++){
    const cur=[i]; let best=cur[0];
    for(let j=1;j<=b.length;j++){
      cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));
      if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1]) cur[j]=Math.min(cur[j],prev2[j-2]+1); // transposition
      if(cur[j]<best)best=cur[j];
    }
    if(best>max) return max+1;
    prev2=prev; prev=cur;
  }
  return prev[b.length];
};
export const DATE_WORDS=["january","february","march","april","june","july","august","september","october","november","december",
  "monday","tuesday","wednesday","thursday","friday","saturday","sunday",
  "tomorrow","today","tonight","yesterday","weekend","morning","afternoon","evening","midnight","unknown"];
// Typos edit-distance can't safely reach: too short to risk fuzzing, or two letters wrong in a
// seven-letter word ("wensday"). Written out so they cost nothing and can never misfire.
export const WORD_FIX={
  tmr:"tomorrow",tmrw:"tomorrow",tomoro:"tomorrow",tomorow:"tomorrow",tommorow:"tomorrow",tommorrow:"tomorrow",
  tomarrow:"tomorrow",tomorro:"tomorrow","2morrow":"tomorrow","2mrw":"tomorrow",
  "2day":"today",todya:"today",tdy:"today",tonite:"tonight",tnite:"tonight",tnght:"tonight",
  yesteday:"yesterday",yestarday:"yesterday",ystrday:"yesterday",yesterdy:"yesterday",
  mondey:"monday",munday:"monday",mnday:"monday",tuseday:"tuesday",teusday:"tuesday",tusday:"tuesday",
  wensday:"wednesday",wendsday:"wednesday",wednsday:"wednesday",wedensday:"wednesday",wenesday:"wednesday",wedneday:"wednesday",
  thurdsay:"thursday",thusday:"thursday",thrusday:"thursday",thursdy:"thursday",thursady:"thursday",
  fryday:"friday",firday:"friday",fridy:"friday",saterday:"saturday",saturaday:"saturday",satrday:"saturday",
  sundy:"sunday",sundey:"sunday",sunay:"sunday",
  janurary:"january",januaray:"january",janaury:"january",jaunary:"january",
  febuary:"february",febraury:"february",febrary:"february",
  marhc:"march",mrach:"march",appril:"april",arpil:"april",aprl:"april",
  jne:"june",jly:"july",juley:"july",juyl:"july",
  augsut:"august",agust:"august",augest:"august",
  septmber:"september",setember:"september",septembr:"september",spetember:"september",
  octobor:"october",ocotber:"october",octber:"october",
  novemebr:"november",novmber:"november",novermber:"november",
  decmber:"december",decemeber:"december",desember:"december",decemebr:"december",
  nxt:"next",wkend:"weekend",wknd:"weekend",weeknd:"weekend",
  mornin:"morning",aftrnoon:"afternoon",evning:"evening",evenin:"evening",
  tbc:"tbd",unkown:"unknown",unkonwn:"unknown",
};
// Real words that sit one typo away from a date word. Without this "the marsh report" would
// silently become a March deadline.
export const NOT_A_TYPO=new Set(["marsh","marshes","match","matches","matched","parch","larch","sundae","sundaes","sundry","sundries","mayday","monkey",
  "juneau","julia","julian","augusta","augustus","maybe","money","toady","toddy","toned","toning","weakened","weekends",
  "mourning","moaning","morphing","adorning","mornings","evenings","leavening","unknowns","aprons"]);
export const fuzzDateWords=(raw,fixes)=>raw.replace(/[A-Za-z0-9]{3,}/g,w=>{
  const lw=w.toLowerCase();
  const fix=to=>{ fixes?.push([w,to]); return to; };
  if(WORD_FIX[lw]) return fix(WORD_FIX[lw]);          // a known misspelling, whatever its length
  if(DATE_WORDS.includes(lw)||NOT_A_TYPO.has(lw)) return w;
  if(lw.length<5||/[^a-z]/.test(lw)) return w;       // too short, or a number/time token — leave it alone
  const max=lw.length>=8?2:1; // long words tolerate 2 typos, short ones just 1 (keeps "money" ≠ "monday")
  for(const d of DATE_WORDS){ if(editDist(lw,d,max)<=max) return fix(d); }
  return w;
});
// A spelling fix only belongs in the result if it became a date. Any corrected word still sitting in the
// title wasn't used, so put back exactly what was typed: "Soccer match", not "Soccer march".
export const unfix=(text,fixes)=>fixes.reduce((acc,[typed,fixed])=>acc.replace(new RegExp("\\b"+fixed+"\\b","i"),typed),text);

// Remove a list's name from a typed task ("writing essay" → "essay" filed under "writing").
export const stripListName=(raw,name)=>{
  const esc=name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  const out=raw.replace(new RegExp("(^|[^a-zA-Z0-9])"+esc+"($|[^a-zA-Z0-9])","i"),"$1$2")
    .replace(/\s{2,}/g," ").replace(/^[\s,\-–—:]+|[\s,\-–—:]+$/g,"").trim();
  return out||raw; // never strip down to nothing
};

// A list's own name typed in the text wins ("ACA essay 4pm" → the "aca" list).
// Longest name first so "aca essays" beats a hypothetical "aca" prefix list. Returns null when nothing matches.
export const matchListName = (text, cats) => {
  const t = (text || "").toLowerCase();
  for (const name of Object.keys(cats).sort((a,b)=>b.length-a.length)) {
    const esc = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (esc && new RegExp("(^|[^a-z0-9])" + esc + "($|[^a-z0-9])", "i").test(t)) return name;
  }
  return null;
};
// Whole words plus ordinary endings ("runs", "taxes", "meetings"), so "brunch" isn't a run, "parents" isn't
// rent, "update" isn't a date, "taxi" isn't tax and "classic" isn't a class.
export const CAT_RX = Object.fromEntries(Object.entries(CAT_KEYWORDS).map(([cat, ks]) => [cat, new RegExp("\\b(?:" + ks.join("|") + ")(?:s|es|ing|ed|er|ers)?\\b", "i")]));
export const guessCat = (title, cats) => {
  const hit = matchListName(title, cats);
  if (hit) return hit;
  for (const cat of ["health","personal","finance","school","work"]) if (cats[cat] && CAT_RX[cat].test(title || "")) return cat;
  return cats.personal ? "personal" : (cats.work ? "work" : Object.keys(cats)[0] || "work");
};

export const ymd = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
export const tod = () => ymd(new Date());
export const addDays = n => { const d=new Date(); d.setDate(d.getDate()+n); return ymd(d); };
// "Date TBD": stored as a real far-future date so it flows through the existing due column,
// sorts to the end of Upcoming, and never counts as overdue.
export const DUE_TBD = "9999-12-31";
export const isTbd = d => d === DUE_TBD;
// Upcoming is everything with a date — open work however overdue (a missed deadline must never make a task
// vanish) and finished work too, which the list shows under "Completed" like every other list does. It used
// to drop anything done and past, so ticking a task off in Upcoming looked like it had been deleted.
export const inUpcoming = t => !!t.due;
// Someone's whole Upcoming is shared as this reserved list name. It covers every task of theirs that has a
// date, from any list: the same rule the database enforces (task_shared_with_me in supabase/setup.sql).
export const UPCOMING_SHARE = "__upcoming__";
export const shareLabel = folder => folder === UPCOMING_SHARE ? "Upcoming" : folder;
// How far a scrolling area should move while something is held near its edge: 0 in the middle, growing to
// EDGE_SCROLL.max right at the edge, negative upwards, and never past the end of the content. Pure geometry
// so it can be tested without a browser — App.jsx only finds the area under the pointer and applies this.
export const EDGE_SCROLL = { edge: 64, max: 18 };
export const edgeScrollStep = (box, x, y, scrollTop, maxScroll) => {
  const { edge, max } = EDGE_SCROLL;
  if (x < box.left - 1 || x > box.right + 1) return 0;          // beside the area, not over it
  if (y < box.top || y > box.bottom) return 0;                  // above or below it entirely
  const fromTop = y - box.top, fromBottom = box.bottom - y;
  const near = fromTop < edge ? -(edge - Math.max(fromTop, 0))
             : fromBottom < edge ? (edge - Math.max(fromBottom, 0)) : 0;
  if (!near) return 0;
  const step = Math.round(near / edge * max);
  return step < 0 ? -Math.min(-step, Math.max(scrollTop, 0))    // don't scroll past the top…
                  : Math.min(step, Math.max(maxScroll - scrollTop, 0));   // …or past the bottom
};

// Where a dragged card lands: `list` is the order actually on screen (top first), so a task's neighbours are
// the ones the person can see. Working this out from every open task instead — which is what it used to do —
// made two cards that happen to be neighbours somewhere else refuse to swap: the last two in My Day, say.
// Returns the new position, or null when the move is a no-op.
export const reorderPosition = (list, fromId, toId, before) => {
  const at = id => list.findIndex(t => String(t.id) === String(id));
  const fromIdx = at(fromId), toIdx = at(toId);
  if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return null;
  const to = list[toIdx], nb = list[before ? toIdx - 1 : toIdx + 1];   // the card on the side you're dropping into
  if (nb && String(nb.id) === String(fromId)) return null;             // it is already exactly there
  const pos = t => (t.position || 0);
  if (!nb) return before ? pos(to) + 1 : pos(to) - 1;                  // dropped past the first/last card
  if (pos(nb) === pos(to)) return before ? pos(to) + 0.5 : pos(to) - 0.5;   // two cards sharing a position
  return (pos(nb) + pos(to)) / 2;
};

// Which sort a view uses: your choice for that particular list if you made one, otherwise My Day is hand-
// arranged (that's what a day plan is) and everything else falls back to your last overall choice.
export const sortFor = (view, sorts, fallback) =>
  (sorts && sorts[view]) || (view === "myday" ? "manual" : (fallback || "due"));

export const shareCovers = (share, t) =>
  share.owner_id === t.owner && (share.folder === t.tag || (share.folder === UPCOMING_SHARE && !!t.due));
// Sort key for "by due date". The date alone is not enough: two things on the same day then
// come out in whatever order they were typed, so a 4pm event can sit above a 10am one.
// Untimed work sorts after timed work on that day.
export const dueKey = t => {
  if (!t.due) return "9999-99-99 99:99";
  const hm = (t.remindAt && t.remindAt.includes("T")) ? t.remindAt.split("T")[1].slice(0,5) : "99:99";
  return t.due + " " + hm;
};
export const fmtDate = s => {
  if (!s) return null;
  if (isTbd(s)) return "Date TBD";
  // Both sides at LOCAL midnight — comparing a noon due-date against midnight today shifted every
  // label a day ("due yesterday" read as "Today"). Whole-day steps also keep this DST-proof.
  const [yy,mo,dd] = s.split("-").map(Number);
  const d = new Date(yy, mo-1, dd), t = new Date(); t.setHours(0,0,0,0);
  const diff = Math.round((d-t)/86400000);
  if (diff<0) return `${Math.abs(diff)}d overdue`;
  if (diff===0) return "Today"; if (diff===1) return "Tomorrow";
  return d.toLocaleDateString("en-US",{month:"short",day:"numeric",...(d.getFullYear()!==t.getFullYear()?{year:"numeric"}:{})});
};

// "…THH:MM" or bare "HH:MM" → "4:00 PM"
export const fmtClock = s => {
  if (!s) return "";
  const t = s.includes("T") ? s.split("T")[1] : s; if (!t) return "";
  let [h,m] = t.split(":"); h = parseInt(h,10); if (isNaN(h)) return "";
  const ap = h>=12 ? "PM" : "AM"; h = h%12 || 12;
  return `${h}:${m||"00"} ${ap}`;
};

export const MO_RE="jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?";
export const WD_RE="sun(?:day)?|mon(?:day)?|tue(?:s|sday)?|wed(?:s|nesday)?|thu(?:r|rs|rsday)?|fri(?:day)?|sat(?:urday)?";
// "sat", "sun" and "mon" are ordinary words too ("sat on the bench", "sun cream", "mon ami"). On their
// own they only count as a weekday when something around them says so — a cue in front, or nothing
// but punctuation after (the time has already been lifted out by then, so "gym sat 10am" qualifies).
export const WD_AMBIG=/^(sat|sun|mon)$/i;
export const pad2=x=>String(x).padStart(2,"0");
// One time token → {h,m}. Handles "4:30", "4 : 30", "4::30" (stray colon), "9.30" (dot, only trusted
// next to am/pm), "1840" (24h compact) and a bare "4".
export const timeTok=tok=>{
  const c=(tok||"").replace(/\s+/g,"");
  let m=c.match(/^(\d{1,2}):{1,2}(\d{2})$/); if(m) return {h:+m[1],m:+m[2],colon:true};
  m=c.match(/^(\d{1,2})\.(\d{2})$/);         if(m) return {h:+m[1],m:+m[2],dot:true};
  m=c.match(/^(\d{3,4})$/);                  if(m) return {h:+m[1].slice(0,-2),m:+m[1].slice(-2),compact:true};
  return {h:+c,m:0,bare:true};
};
export const hhmm=(t,ap)=>{ let h=t.h,m=t.m; ap=(ap||"").toLowerCase().replace(/[.\s]/g,"");
  if(ap[0]==="p"&&h<12)h+=12; if(ap[0]==="a"&&h===12)h=0;
  return (h>=0&&h<24&&m>=0&&m<60)?`${pad2(h)}:${pad2(m)}`:null; };
// A number that may be a time, plus an optional meridiem: "am"/"p.m." with or without a space, or a
// single letter glued on ("3p", "10a"). None of it may run into a word ("2 amazing" isn't 2am).
export const TIME_TOK="(\\d{1,2}\\s*[:.]{1,2}\\s*\\d{2}|\\d{3,4}|\\d{1,2})(\\s*a\\.?m\\.?|\\s*p\\.?m\\.?|[ap])?(?![a-z])";
export const TIME_CUE="(\\bfrom\\s+|\\bat\\s+|\\bby\\s+|@\\s*|\\btimes?\\s*:\\s*|\\bwhen\\s*:\\s*|\\bhours?\\s*:\\s*)?";
// A zone written right after the clock ("9 PM EDT") is swallowed with it instead of littering the title.
export const TIME_TZ="(?:\\s*\\b(?:E[DS]T|C[DS]T|M[DS]T|P[DS]T|AK[DS]T|HST|GMT|UTC|BST|CES?T|IST|JST|AES?T|AEDT|ET|PT|CT|MT)\\b)?";
// A bare small hour is an afternoon/evening hour: "dinner at 7" is 7pm, "from 4 to 5" is 4–5pm.
export const pmGuess=h=>(h>=1&&h<=7)?h+12:h;
// Times written as words. "night" on its own is left alone — "movie night" is a title, not a clock.
export const WORD_TIMES=[
  [/\b(?:at\s+)?(?:noon|midday|12\s*noon)\b/i,"12:00"],
  [/\b(?:in\s+the\s+|this\s+)?morning\b/i,"09:00"],       // "tomorrow" is left for the date pass
  [/\b(?:in\s+the\s+|this\s+)?afternoon\b/i,"14:00"],
  [/\b(?:in\s+the\s+|this\s+)?evening\b/i,"18:00"],
  [/\bat\s+night\b/i,"20:00"],
];
// Pull a time (and an end time) out of `text` → {time,endTime,rest}. Tolerates missing/extra spaces,
// a meridiem on either end or neither, stray colons, dots next to am/pm, and 24-hour "1840".
export function grabTime(text){
  let rest=text||"", m;
  const rangeRe=new RegExp(TIME_CUE+"\\b"+TIME_TOK+"\\s*(?:[-~]|to|until|til{1,2}|through|thru)\\s*"+TIME_TOK+TIME_TZ,"gi");
  while((m=rangeRe.exec(rest))!==null){
    const A=timeTok(m[2]), B=timeTok(m[4]); let apA=(m[3]||"").trim(); const apB=(m[5]||"").trim();
    // A bare "14-17" is a date range, not a time — demand some real time signal.
    if(!(apA||apB||m[1]||A.colon||B.colon||A.compact||B.compact)) continue;
    if((A.dot&&!apA&&!apB)||(B.dot&&!apB&&!apA)) continue;       // "2.10-2.30" with no am/pm is not a clock
    if(A.h>23||B.h>23) continue;
    const inherited=!apA&&!!apB;
    if(inherited) apA=apB;                                        // "4:00 - 5:30 pm" → both pm
    if(!apA&&!apB&&A.bare&&B.bare){ A.h=pmGuess(A.h); B.h=pmGuess(B.h); }   // "from 4 to 5" → 16:00–17:00
    let s=hhmm(A,apA), e=hhmm(B,apB);
    if(s&&e&&s>=e&&inherited){ const alt=hhmm({h:A.h,m:A.m},"am"); if(alt&&alt<e) s=alt; } // "11 - 1 pm"
    if(!s) continue;
    return {time:s,endTime:(e&&e!==s)?e:null,rest:rest.slice(0,m.index)+" "+rest.slice(m.index+m[0].length)};
  }
  const oneRe=new RegExp(TIME_CUE+"\\b"+TIME_TOK+TIME_TZ,"gi");
  while((m=oneRe.exec(rest))!==null){
    const A=timeTok(m[2]), ap=(m[3]||"").trim(), cue=!!m[1];
    let h=A.h, mn=A.m, ok=false;
    if(ap||A.colon) ok=true;                                      // "3pm", "15:30", "4:30"
    else if(A.dot) ok=false;                                      // "v2.10" is a version, not ten past two
    else if(cue&&A.compact) ok=true;                              // "at 1840"
    else if(cue&&A.bare){ h=pmGuess(h); ok=true; }                // "dinner at 7" → 7pm
    if(!ok||h>23) continue;                                       // a bare year like "2026" is left alone
    const v=hhmm({h,m:mn},ap); if(!v) continue;
    return {time:v,endTime:null,rest:rest.slice(0,m.index)+" "+rest.slice(m.index+m[0].length)};
  }
  for(const [re,t] of WORD_TIMES){ const w=rest.match(re); if(w) return {time:t,endTime:null,rest:rest.slice(0,w.index)+" "+rest.slice(w.index+w[0].length)}; }
  return {time:null,endTime:null,rest};
}
export const lastOfMonth=(y,mo)=>new Date(y,mo+1,0);
// Dates written in digits — lifted out FIRST, before the clock, so "2026-09-30" is never read as
// "20:26 to 09:30". US order for slashes (9/17 = September 17), because that is how the app's
// users write them; a four-digit year may lead (ISO) or trail.
export function grabNumericDate(text){
  const rest=text||"";
  let m=rest.match(/(^|[^\d\/])(\d{4})-(\d{1,2})-(\d{1,2})(?![\d\/])/);
  if(m){ const y=+m[2],mo=+m[3]-1,d=+m[4]; if(mo>=0&&mo<12&&d>=1&&d<=31) return {due:ymd(new Date(y,mo,d)),rest:rest.slice(0,m.index+m[1].length)+" "+rest.slice(m.index+m[0].length)}; }
  m=rest.match(/(^|[^\d\/.])(\d{1,2})\/(\d{1,2})(?:\/(\d{2}|\d{4}))?(?![\d\/])/);
  if(m){ const mo=+m[2]-1,d=+m[3]; let y=m[4]?(+m[4]<100?2000+ +m[4]:+m[4]):new Date().getFullYear();
    if(mo>=0&&mo<12&&d>=1&&d<=31){
      if(!m[4]&&new Date(y,mo,d)<new Date(new Date().toDateString())) y++;
      return {due:ymd(new Date(y,mo,d)),rest:rest.slice(0,m.index+m[1].length)+" "+rest.slice(m.index+m[0].length)}; } }
  return {due:null,rest};
}
// Pull one date out of `text` → {due,rest,mon,day,yr}. `allowRelative` off = only explicit calendar dates.
export function grabDate(text,{allowRelative=true}={}){
  let rest=text||"";
  const cut=(s,i,len)=>s.slice(0,i)+" "+s.slice(i+len);
  const now=new Date(), Y=now.getFullYear(), M=now.getMonth();
  if(allowRelative){
    let r=rest.match(/\btomorrow\b/i);    if(r) return {due:addDays(1),rest:cut(rest,r.index,r[0].length)};
    r=rest.match(/\btonight\b/i);         if(r) return {due:tod(),rest:cut(rest,r.index,r[0].length),night:true};
    r=rest.match(/\btoday\b|\beod\b|\bend\s+of\s+(?:the\s+)?day\b/i); if(r) return {due:tod(),rest:cut(rest,r.index,r[0].length)};
    r=rest.match(/\bnext\s+week\b/i);     if(r) return {due:addDays(7),rest:cut(rest,r.index,r[0].length)};
    // "in 2 days", "in a week", "in 3 weeks", "in a month"
    r=rest.match(/\bin\s+(a|an|one|two|three|four|five|six|\d{1,2})\s+(day|week|month)s?\b/i);
    if(r){ const words={a:1,an:1,one:1,two:2,three:3,four:4,five:5,six:6}; const n=words[r[1].toLowerCase()]??+r[1];
      const d=new Date(); if(r[2].toLowerCase()==="day") d.setDate(d.getDate()+n); else if(r[2].toLowerCase()==="week") d.setDate(d.getDate()+7*n); else d.setMonth(d.getMonth()+n);
      return {due:ymd(d),rest:cut(rest,r.index,r[0].length)}; }
    // "this weekend" = the coming Saturday, "next weekend" = the one after
    r=rest.match(/\b(this|next|the)?\s*weekend\b/i);
    if(r){ let delta=(6-now.getDay()+7)%7; if(delta===0&&now.getDay()!==6) delta=7; if((r[1]||"").toLowerCase()==="next") delta+=7;
      const d=new Date(); d.setDate(d.getDate()+delta); return {due:ymd(d),rest:cut(rest,r.index,r[0].length)}; }
    r=rest.match(/\bend\s+of\s+(?:the\s+)?month\b|\beom\b/i);
    if(r) return {due:ymd(lastOfMonth(Y,M)),rest:cut(rest,r.index,r[0].length)};
    r=rest.match(/\bend\s+of\s+(?:the\s+)?week\b|\beow\b/i);
    if(r){ let delta=(5-now.getDay()+7)%7; const d=new Date(); d.setDate(d.getDate()+delta); return {due:ymd(d),rest:cut(rest,r.index,r[0].length)}; }
  }
  // Explicit month-date wins over a bare weekday ("Friday July 24" means July 24). A trailing 4-digit year is
  // used as-is. The space is optional, so "sep17" and "17sep" work.
  let mon=null,day=null;
  let m=rest.match(new RegExp("\\b(?:(?:on|at)\\s+)?("+MO_RE+")\\.?\\s*(\\d{1,2})(?!\\d)(?:st|nd|rd|th)?\\s*,?\\s*(\\d{4})?","i"));
  if(m){ mon=MONTHS[m[1].toLowerCase().substring(0,3)]; day=+m[2]; }
  else { m=rest.match(new RegExp("\\b(?:(?:on|at)\\s+)?(\\d{1,2})(?!\\d)(?:st|nd|rd|th)?\\s*(?:of\\s+)?("+MO_RE+")\\.?\\s*,?\\s*(\\d{4})?","i"));
         if(m){ mon=MONTHS[m[2].toLowerCase().substring(0,3)]; day=+m[1]; } }
  if(m&&mon!=null&&day>=1&&day<=31){
    let yr=m[3]?+m[3]:Y;
    if(!m[3]&&new Date(yr,mon,day)<new Date(now.toDateString())) yr++;
    let out=cut(rest,m.index,m[0].length);
    out=out.replace(new RegExp("\\b(?:this\\s+)?(?:next\\s+)?(?:(?:on|at)\\s+)?(?:"+WD_RE+")\\b,?","i")," "); // drop a redundant weekday
    return {due:ymd(new Date(yr,mon,day)),rest:out,mon,day,yr};
  }
  if(allowRelative){
    // A day of the month on its own: "the 17th", "by the 3rd", "due 30th" — this month if it hasn't passed, else next.
    // …but only after a cue AND with nothing but punctuation after: "2nd draft", "3rd floor", "5th grade" aren't dates.
    const od=rest.match(/(?:\b(?:on|by|due|before|until)\s+(?:the\s+)?|(?:^|\s)the\s+)(\d{1,2})(?:st|nd|rd|th)(?=\s*(?:[,.;:!?)\]]|$))/i);
    if(od){ const d=+od[1]; if(d>=1&&d<=31){ let y=Y,mo=M; if(d<now.getDate()){ mo++; if(mo>11){mo=0;y++;} }
      const dd=Math.min(d,lastOfMonth(y,mo).getDate()); return {due:ymd(new Date(y,mo,dd)),rest:cut(rest,od.index,od[0].length)}; } }
    const wd=rest.match(new RegExp("\\b(this\\s+|next\\s+|on\\s+|at\\s+|by\\s+|every\\s+)?("+WD_RE+")\\b\\.?","i"));
    if(wd){
      const bare=wd[2].toLowerCase();
      if(WD_AMBIG.test(bare)&&!wd[1]){ const after=rest.slice(wd.index+wd[0].length); if(!/^\s*(?:[,.;:!?)\]]|$)/.test(after)) return {due:null,rest}; }
      const key=bare.substring(0,3),target=WEEKDAYS[key],cur=now.getDay();
      let delta=(target-cur+7)%7; if(delta===0)delta=7; if(/^next/i.test(wd[1]||""))delta+=7;
      const d=new Date(); d.setDate(d.getDate()+delta);
      return {due:ymd(d),rest:cut(rest,wd.index,wd[0].length)};
    }
  }
  return {due:null,rest};
}
// Repeat words → the app's recurrence codes. Returns {recurring, rest}. "every monday" leaves the weekday
// in place for grabDate, so the first occurrence lands on the right day.
export function grabRecurring(text){
  let rest=text||"", m;
  const take=(re,val)=>{ m=rest.match(re); if(!m) return null; rest=rest.slice(0,m.index)+" "+rest.slice(m.index+m[0].length); return val; };
  let rec=take(/\b(?:every\s+day|daily|each\s+day|everyday)\b/i,"daily")
    || take(/\b(?:every\s+(?:other|second|2)\s+weeks?|biweekly|fortnightly)\b/i,"custom:2:weeks")
    || take(/\b(?:every\s+week|weekly|each\s+week)\b/i,"weekly")
    || take(/\b(?:every\s+month|monthly|each\s+month)\b/i,"monthly")
    || take(/\b(?:every\s+year|yearly|annually|each\s+year)\b/i,"yearly");
  if(!rec){ m=rest.match(/\bevery\s+(\d{1,2})\s+(day|week|month)s?\b/i); if(m){ rec=`custom:${+m[1]}:${m[2].toLowerCase()}s`; rest=rest.slice(0,m.index)+" "+rest.slice(m.index+m[0].length); } }
  if(!rec){ m=rest.match(new RegExp("\\bevery\\s+(?="+WD_RE+"\\b)","i")); if(m){ rec="weekly"; rest=rest.slice(0,m.index)+" "+rest.slice(m.index+m[0].length); } }
  return {recurring:rec,rest};
}
export const tidyTitle=s=>s.replace(/[•*·]/g," ").replace(/\(\s*\)|\[\s*\]|\{\s*\}/g," ").replace(/\s{2,}/g," ").replace(/\s+([,.;:!?])/g,"$1").replace(/,\s*,/g,",")
  .replace(/\b(on|at|by|from|in|due)\s*([,.]|$)/gi,"$2").replace(/\s{2,}/g," ").replace(/^[\s,;:.\-–—]+|[\s,;:.\-–—]+$/g,"").trim();
// Labelled fields in a pasted blurb ("Club Fest · Dates: … · Time: …"). Pasting into an input flattens
// the newlines, so we split on the labels themselves rather than on line breaks.
export const FIELD_RE=/\s*[•*\-–—]?\s*\b(dates?|time|times|when|hours?|location|where|place|venue|room|cost|price|rsvp|contact|notes?|details?|info)\s*:\s*/gi;

export const parseNL = raw => {
  // Pasted listings carry exotic punctuation: zero-width spaces, and dashes that aren't the plain hyphen
  // ("4 PM − 5 PM"). Normalise both, or a perfectly good time range parses as a lone start time.
  const fixes=[];
  const src = fuzzDateWords(String(raw||"")
    .replace(/[​-‍﻿]/g,"")
    .replace(/[‐-―−⁃﹘﹣－]/g,"-")
    .replace(/[\r\n]+/g," • ").trim(), fixes);

  // ── Structured paste: title first, then "Dates:" / "Time:" / "Location:" fields ──
  const segs=[]; let last=0, lab=null, mm; FIELD_RE.lastIndex=0;
  while((mm=FIELD_RE.exec(src))!==null){ segs.push({lab,text:src.slice(last,mm.index)}); lab=mm[1].toLowerCase(); last=FIELD_RE.lastIndex; }
  segs.push({lab,text:src.slice(last)});
  if(segs.length>1 && segs[0].text.trim()){
    const pick=re=>segs.filter(s=>s.lab&&re.test(s.lab)).map(s=>s.text).join(" ").trim();
    const dateTxt=pick(/^dates?$/), timeTxt=pick(/^(times?|when|hours?)$/);
    let titleTxt=segs[0].text, time=null, endTime=null, due=null, spanEnd=null;
    if(timeTxt){ const r=grabTime(timeTxt); time=r.time; endTime=r.endTime; }
    else { const r=grabTime(titleTxt); time=r.time; endTime=r.endTime; titleTxt=r.rest; }
    if(dateTxt){
      const n1=grabNumericDate(dateTxt); const d1=n1.due?n1:grabDate(dateTxt); due=d1.due;
      if(due){ // "Sept 14 – Sept 17" or "Sept 14–17" → remember the closing day
        const d2=grabDate(d1.rest,{allowRelative:false});
        if(d2.due&&d2.due>due) spanEnd=d2.due;
        else { const dm=d1.rest.match(/^\s*(?:[-–—]|to|through|thru|until)\s*(\d{1,2})(?!\d)/i);
               if(dm&&d1.mon!=null){ const dd=+dm[1]; if(dd>d1.day&&dd<=31) spanEnd=ymd(new Date(d1.yr,d1.mon,dd)); } }
      }
    } else { const n=grabNumericDate(titleTxt); if(n.due){ due=n.due; titleTxt=n.rest; } else { const r=grabDate(titleTxt); due=r.due; titleTxt=r.rest; } }
    const extra=segs.filter(s=>s.lab&&!/^(dates?|times?|when|hours?)$/.test(s.lab)&&s.text.trim())
      .map(s=>`${s.lab.charAt(0).toUpperCase()+s.lab.slice(1)}: ${unfix(tidyTitle(s.text),fixes)}`).join("\n");
    return {title:unfix(tidyTitle(titleTxt),fixes)||String(raw).trim(), due, time, endTime, spanEnd, extra, recurring:null};
  }

  // ── Plain sentence ──
  let title=src, due=null, time=null, endTime=null, noDate=false;
  const nd=title.match(/(^|[^a-z0-9])(tbd|tba|t\.b\.[da]\.?|to be decided|to be determined|to be announced|date unknown|unknown date|unknown|no date yet|no date|someday)($|[^a-z0-9])/i);
  if(nd){ noDate=true; title=title.replace(nd[2],""); }
  const rc=grabRecurring(title); title=rc.rest;
  const n=grabNumericDate(title); if(n.due){ due=n.due; title=n.rest; }
  const t=grabTime(title); time=t.time; endTime=t.endTime; title=t.rest;
  if(!due){ const d=grabDate(title); due=d.due; title=d.rest; if(d.night&&!time) time="20:00"; }
  else { const d=grabDate(title,{allowRelative:false}); if(!d.due) title=title.replace(new RegExp("\\b(?:this\\s+|next\\s+|on\\s+)?(?:"+WD_RE+")\\b,?","i")," "); } // "Fri 9/17" → the weekday is redundant
  if(rc.recurring&&!due) due=rc.recurring==="daily"?tod():rc.recurring==="monthly"?tod():rc.recurring==="yearly"?tod():addDays(7); // a repeat needs a first occurrence
  title=unfix(tidyTitle(title),fixes);
  if(!title) title=String(raw).trim();
  if(noDate) due=DUE_TBD;
  return {title, due, time, endTime, spanEnd:null, extra:"", recurring:rc.recurring};
};

// The title as it will read once the date/time/repeat/list words are lifted out of it.
export const cleanTitle = (raw, cats, tag) => { const p = parseNL(raw); let t = p.title || raw; const hit = matchListName(t, cats || {}); if (hit && hit !== tag) t = stripListName(t, hit); return t; };
// Re-parse an edited task title: a typed date/time reschedules it, a typed list name re-files it.
// Returns only the fields that actually change.
export const titleEditPatch = (task, raw, cats) => {
  const p = parseNL(raw); const patch = {};
  let newTitle = p.title || raw;
  const hit = matchListName(newTitle, cats || {});
  if (hit && hit !== task.tag) { patch.tag = hit; newTitle = stripListName(newTitle, hit); }
  if (newTitle !== task.title) patch.title = newTitle;
  Object.assign(patch, whenPatch(task, p));
  if (p.recurring && p.recurring !== task.recurring) patch.recurring = p.recurring;
  return patch;
};

// Keyword → icon pairs for picking a list's icon from its name (see ICON_RX / guessIcon below).
export const ICON_KEYWORDS = [
  [["cat","cats","kitten","kitty"],"🐱"],[["dog","dogs","puppy","puppies","pup"],"🐶"],
  [["fish","aquarium"],"🐟"],[["bird","birds"],"🐦"],[["pet","pets","animal","animals","vet"],"🐾"],
  [["water","hydrate","hydration"],"💧"],[["walk","walking","steps","stroll"],"🚶"],
  [["gym","workout","lift","weights","exercise","fitness"],"🏋️"],[["run","running","jog","jogging","marathon","cardio"],"🏃"],
  [["swim","swimming","pool"],"🏊"],[["bike","biking","cycle","cycling"],"🚴"],[["hike","hiking","trail"],"🥾"],
  [["yoga","stretch","stretching","pilates","meditate","meditating","meditation","breathe","breathing","mindfulness"],"🧘"],[["soccer","football"],"⚽"],[["basketball","hoops"],"🏀"],[["tennis"],"🎾"],
  [["doctor","appointment","clinic","hospital","checkup"],"🩺"],[["dentist","teeth","tooth","floss","flossing","brush","brushing"],"🦷"],
  [["meds","medicine","pills","prescription","pharmacy","vitamin","vitamins","supplement","supplements"],"💊"],[["mental","therapy","mindful","meditation"],"🧠"],
  [["health","wellness","selfcare","spa"],"💪"],[["sleep","rest","nap"],"🛏️"],
  [["wake","wake up","get up","sunrise","early riser"],"🌅"],[["shower","bathe","bath","cold plunge"],"🚿"],
  [["smoke","smoking","vape","vaping","nicotine","cigarette","cigarettes"],"🚭"],[["alcohol","sober","sobriety"],"🚫"],
  [["sugar","junk food","candy","snacking"],"🍬"],[["screen time","no phone","less phone","scrolling","doomscrolling"],"📵"],
  [["pray","prayer","worship","church","bible","quran","gratitude","grateful"],"🙏"],
  [["work","job","office","career","business"],"💼"],[["meeting","meetings","standup","sync"],"📅"],
  [["client","clients","customer"],"🤝"],[["project","projects"],"📋"],[["email","emails","inbox","mail"],"✉️"],
  [["deadline","urgent"],"⏰"],
  [["school","class","classes","course","courses","study","studies","exam","exams","homework","assignment"],"📚"],
  [["college","university","uni","campus","grad"],"🎓"],[["lecture","lesson","notes"],"📝"],
  [["language","languages","spanish","french","japanese","korean","german","chinese","duolingo","vocab","vocabulary"],"🗣️"],
  [["science","lab","chemistry","biology","physics"],"🔬"],[["math","maths","algebra","calculus"],"🔢"],
  [["money","finance","financial","budget","budgeting"],"💰"],[["bank","banking","savings","saving"],"🏦"],
  [["bill","bills","invoice","invoices","payment"],"🧾"],[["invest","investing","stocks","crypto","portfolio"],"📈"],
  [["tax","taxes"],"🧾"],[["shop","shopping","buy","store","mall"],"🛍️"],[["grocery","groceries","supermarket"],"🛒"],
  [["wishlist","wish"],"⭐"],[["home","house","apartment","household"],"🏠"],
  [["clean","cleaning","chore","chores","laundry","tidy"],"🧹"],[["repair","fix","maintenance","handyman"],"🔧"],
  [["garden","gardening","plant","plants","yard"],"🌱"],[["car","cars","vehicle","auto","drive","driving"],"🚗"],
  [["food","meal","meals","cook","cooking","recipe","recipes","kitchen"],"🍳"],
  [["restaurant","dining","dinner","lunch","brunch"],"🍽️"],[["coffee","cafe"],"☕"],
  [["salad","veggies","vegetable","vegetables","fruit","fruits","healthy","protein"],"🥗"],
  [["sun","sunlight","sunshine","outside","outdoors","nature","fresh air"],"☀️"],
  [["travel","trip","trips","vacation","holiday","tour","journey"],"✈️"],[["flight","flights","airport"],"🛫"],
  [["hotel","booking"],"🏨"],[["beach","ocean","sea"],"🏖️"],[["camp","camping","outdoor"],"⛺"],
  [["movie","movies","film","cinema"],"🎬"],[["music","song","songs","playlist","band"],"🎵"],
  [["guitar","ukulele","bass"],"🎸"],[["piano"],"🎹"],
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
// Extra keyword → icon pairs added to the guesser. Ordered so the more specific words win.
export const ICON_KEYWORDS_MORE = [
  [["internship","internships","intern"],"🏢"],[["job search","job hunt","job hunting","applications","application","apply","applying"],"📨"],
  [["resume","cv","cover letter"],"📄"],[["interview","interviews","interviewing"],"🤝"],[["networking","network","linkedin"],"🤝"],
  [["thesis","dissertation","capstone"],"📜"],[["research","paper","papers"],"🔍"],[["essay","essays","writing assignment"],"✍️"],
  [["reading","readings","textbook","textbooks"],"📖"],[["club","clubs","society","fest","club fest"],"🎪"],
  [["podcast","podcasts","audiobook","audiobooks","listen"],"🎧"],[["youtube","video","videos","content","vlog","streaming","stream"],"🎬"],
  [["side project","side hustle","startup","launch","venture"],"🚀"],[["admin","paperwork","forms","documents","docs"],"🗂️"],
  [["errand","errands","to do","todo","misc","miscellaneous","stuff","random","other"],"📌"],
  [["subscription","subscriptions","renewal","renewals"],"💳"],[["insurance"],"🛡️"],[["legal","lawyer","contract","contracts","visa","passport","immigration"],"⚖️"],
  [["packing","pack","luggage","suitcase"],"🧳"],[["moving","move","relocation","boxes"],"📦"],[["renovation","renovate","diy","build"],"🔨"],
  [["volunteer","volunteering","charity","donate","donation","community"],"🫶"],[["recycle","recycling","eco","sustainability","environment"],"♻️"],
  [["chess"],"♟️"],[["board game","board games","dnd","d&d","tabletop"],"🎲"],[["concert","concerts","gig","gigs","festival"],"🎤"],
  [["theater","theatre","play","musical","show","shows"],"🎭"],[["museum","gallery","exhibition"],"🏛️"],[["golf"],"⛳"],[["ski","skiing","snowboard"],"⛷️"],
  [["surf","surfing"],"🏄"],[["boxing","martial arts","karate","mma","judo"],"🥊"],[["dance","dancing","ballet"],"💃"],
  [["baking","bake","bread","cake"],"🧁"],[["tea","matcha","boba","bubble tea"],"🧋"],[["wine","cocktails","bar","drinks"],"🍷"],
  [["halloween","costume"],"🎃"],[["anniversary","valentine","valentines"],"💍"],[["reminder","reminders","dont forget","don't forget","remember"],"🔔"],
  [["someday","maybe","later","backlog","parking lot","ideas bin"],"🪄"],[["important","priority","priorities","must"],"⚠️"],[["done","completed","archive","archived"],"✅"],
  [["winter","snow"],"❄️"],[["summer"],"☀️"],[["night","evening"],"🌙"],[["morning","routine","routines"],"🌅"],
  [["sewing","knit","knitting","crochet","craft","crafts"],"🧶"],[["car wash","tires","oil change","mechanic"],"🛠️"],
  [["phone","calls","call"],"📞"],[["kids","school run","daycare","pickup"],"👪"],
];

// Accent palettes (#25). "lavender" = the original look; the rest are pastel.
// Built once. Multi-word phrases are tried before single words, so "job search" beats "job" and
// "side project" beats "project"; single words keep their listed order.
export const ICON_RX = (() => {
  const all = [...ICON_KEYWORDS, ...ICON_KEYWORDS_MORE].flatMap(([ks, icon]) => ks.map(k => ({ k, icon })));
  const esc = k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...all.filter(x => /\s/.test(x.k)), ...all.filter(x => !/\s/.test(x.k))]
    .map(({ k, icon }) => ({ rx: new RegExp("(^|[^a-z0-9])" + esc(k) + "($|[^a-z0-9])"), icon }));
})();
export const guessIcon = (name, fallback="📁") => {
  const n = (name||"").toLowerCase().trim();
  if (!n) return fallback;
  for (const { rx, icon } of ICON_RX) if (rx.test(n)) return icon;
  return fallback;
};

// Next due date for a recurring task.
export function nextDue(due, rec){
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

// ── Moving a task's day ───────────────────────────────────────────────────────────────────────────
// A task's reminder travels with it at the same clock time. With no day (or Date TBD) there is nothing
// to remind on, so the reminder and its end time go too.
export const moveDuePatch = (task, due) => {
  const day = due || null, patch = { due: day };
  const hm = task.remindAt && task.remindAt.includes("T") ? task.remindAt.split("T")[1] : null;
  if (hm) {
    patch.remindAt = day && !isTbd(day) ? `${day}T${hm}` : null;
    if (!patch.remindAt && task.endTime) patch.endTime = null;
  }
  return patch;
};
// A parsed date/time applied to an existing task — only the fields that change. A new day with no time
// carries the task's reminder along to that day; a time with no date lands on the task's own day, or
// today. Used by title edits, quick notes and linked notes alike.
export const whenPatch = (task, p) => {
  const patch = {};
  if (p.due && p.due !== task.due) Object.assign(patch, moveDuePatch(task, p.due));
  if (p.time) {
    const d = (p.due && !isTbd(p.due) ? p.due : null) || (task.due && !isTbd(task.due) ? task.due : null) || tod();
    const ra = `${d}T${p.time}`;
    if (ra !== task.remindAt) { patch.remindAt = ra; if (!task.due && !p.due) patch.due = d; }
    if (p.endTime && p.endTime !== task.endTime) patch.endTime = p.endTime;
  }
  return patch;
};

// ── Gamification + preferences, merged between devices ────────────────────────────────────────────
// One row per user carries XP, streak and preferences. Every field merges by its own rule, so two
// devices never undo each other:
//   xp       the server's total PLUS what this device earned since it last synced (never overwritten)
//   awarded  union — each award pays out once, wherever it was earned
//   streak   belongs to whichever side was active most recently
//   layout   sidebar order, hidden tabs, sort, new-task position, theme: the newer `at` wins, as a whole
//   stats    completions per device per day; this device's own counts are authoritative, the rest are
//            kept as the server has them; anything older than STATS_DAYS is dropped
//   myday    tasks from other people's lists that you put in My Day — today's newest copy wins
// Everything that travels between your devices as "preferences". `sorts` is the sort each list
// remembers, `contacts` the nicknames you gave people — both used to live only on one device.
export const LAYOUT_KEYS = ["navOrg", "hiddenTabs", "sort", "sorts", "contacts", "newAtBottom", "dark", "scheme"];
export const STATS_DAYS = 70;
export const shiftDay = (day, n) => { const [y, m, d] = day.split("-").map(Number); return ymd(new Date(y, m - 1, d + n)); };
export function mergeGami(server, local, xpBase, today) {
  const s = server || {}, sp = s.prefs && typeof s.prefs === "object" ? s.prefs : {};
  const xp = (s.xp || 0) + Math.max(0, (local.xp || 0) - (xpBase || 0));
  const awarded = [...new Set([...(s.awarded || []), ...(local.awarded || [])])];
  const sLast = s.last_active || "", lLast = local.lastActive || "";
  const last_active = (sLast > lLast ? sLast : lLast) || null;
  const streak = sLast > lLast ? (s.streak || 0) : sLast < lLast ? (local.streak || 0) : Math.max(s.streak || 0, local.streak || 0);
  const serverLayoutNewer = (sp.at || 0) > (local.at || 0);
  const layout = {};
  for (const k of LAYOUT_KEYS) layout[k] = serverLayoutNewer && sp[k] !== undefined ? sp[k] : local.layout?.[k];
  const cutoff = shiftDay(today, -STATS_DAYS);
  const trim = m => Object.fromEntries(Object.entries(m && typeof m === "object" ? m : {}).filter(([d, n]) => d >= cutoff && n > 0));
  const stats = {};
  for (const [dev, m] of Object.entries(sp.stats && typeof sp.stats === "object" ? sp.stats : {})) if (dev !== local.device) stats[dev] = trim(m);
  stats[local.device] = trim(local.dayStats);
  for (const dev of Object.keys(stats)) if (!Object.keys(stats[dev]).length) delete stats[dev];
  const fresh = m => !!(m && m.date === today && Array.isArray(m.ids));
  const myday = fresh(sp.myday) && (!fresh(local.myday) || (sp.myday.at || 0) > (local.myday.at || 0)) ? sp.myday : fresh(local.myday) ? local.myday : null;
  return { xp, awarded, last_active, streak, prefs: { ...layout, at: serverLayoutNewer ? sp.at : (local.at || 0), stats, myday }, serverLayoutNewer };
}
// JSON with sorted keys: the database stores prefs as jsonb, which reorders keys, so a plain
// JSON.stringify comparison would call every row "changed" and rewrite it on every sync.
const stable = v => Array.isArray(v) ? `[${v.map(stable).join(",")}]` : v && typeof v === "object" ? `{${Object.keys(v).sort().map(k => JSON.stringify(k) + ":" + stable(v[k])).join(",")}}` : JSON.stringify(v ?? null);
export const gamiRowDiffers = (server, merged) => !server
  || (server.xp || 0) !== merged.xp || (server.streak || 0) !== merged.streak || (server.last_active || null) !== merged.last_active
  || stable([...(server.awarded || [])].sort()) !== stable([...merged.awarded].sort())
  || stable(server.prefs || {}) !== stable(merged.prefs);
