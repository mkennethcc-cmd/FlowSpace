// Freely's safety net. Run it before shipping anything:   npm run check
//
// Tests the parts of the app where a bug quietly damages data or reads a sentence wrong: the natural-
// language parser, spelling fixes, category/icon guessers and date labels (src/logic.js), and the
// database sync rules (src/db.js, run against an in-memory stand-in for Supabase — nothing touches
// your real database). Every case here is something a real typing or a real bug once got wrong.

// "Now" is frozen at Wednesday 16 Sep 2026, 10:00, so relative dates ("tomorrow", "fri") never go stale.
const RealDate = Date;
const FIXED = new RealDate(2026, 8, 16, 10, 0, 0).getTime();
globalThis.Date = class extends RealDate { constructor(...a) { a.length ? super(...a) : super(FIXED); } static now() { return FIXED; } };

const L = await import("../src/logic.js");
const { parseNL, guessCat, guessIcon, fmtDate } = L;
let failed = 0, passed = 0;
const report = (ok, what) => { if (ok) passed++; else { failed++; console.log("  ✗ " + what); } };
const section = name => console.log("\n" + name);

section("Natural-language parser — real typings");
// [input, due, time, title, endTime?, recurring?]
const E=[ // [input, due, time, title, endTime?, recurring?]
 ["call mom tues","2026-09-22",null,"call mom"],["gym thurs 6pm","2026-09-17","18:00","gym"],["dentist weds 3pm","2026-09-23","15:00","dentist"],
 ["report due tuesday.","2026-09-22",null,"report"],["standup mon.","2026-09-21",null,"standup"],
 ["pay rent in 2 days","2026-09-18",null,"pay rent"],["dentist in a week","2026-09-23",null,"dentist"],["review in 3 weeks","2026-10-07",null,"review"],
 ["laundry this weekend","2026-09-19",null,"laundry"],["trip next weekend","2026-09-26",null,"trip"],["essay due end of month","2026-09-30",null,"essay"],
 ["report eod","2026-09-16",null,"report"],["wrap up eow","2026-09-18",null,"wrap up"],
 ["party 9/17","2026-09-17",null,"party"],["party 09/17 8pm","2026-09-17","20:00","party"],["party 9/17/26","2026-09-17",null,"party"],["exam 2026-09-30","2026-09-30",null,"exam"],
 ["sep17 meeting","2026-09-17",null,"meeting"],["meeting 17sep","2026-09-17",null,"meeting"],["sept. 17 lunch","2026-09-17",null,"lunch"],
 ["the 17th","2026-09-17",null,"the 17th"],["pay on the 3rd","2026-10-03",null,"pay"],["rent due 30th","2026-09-30",null,"rent"],
 ["dinner @7",null,"19:00","dinner"],["coffee at noon",null,"12:00","coffee"],["meeting 3p",null,"15:00","meeting"],["call 10a",null,"10:00","call"],
 ["sync 9.30am",null,"09:30","sync"],["meet from 4 to 5",null,"16:00","meet","17:00"],["meet 4pm to 5:30pm",null,"16:00","meet","17:30"],
 ["gym tomorrow morning","2026-09-17","09:00","gym"],["call tmrw afternoon","2026-09-17","14:00","call"],["walk this evening",null,"18:00","walk"],
 ["dinner tonight","2026-09-16","20:00","dinner"],["standup tmrw at 10","2026-09-17","10:00","standup"],
 ["gym every monday","2026-09-21",null,"gym",null,"weekly"],["water plants daily","2026-09-16",null,"water plants",null,"daily"],["pay rent monthly","2026-09-16",null,"pay rent",null,"monthly"],
 ["review every 2 weeks","2026-09-23",null,"review",null,"custom:2:weeks"],
 ["dentist (tomorrow 3pm)","2026-09-17","15:00","dentist"],["Tomorrow: dentist 3pm","2026-09-17","15:00","dentist"],
 ["pay bill fridya","2026-09-18",null,"pay bill"],["standup mondya","2026-09-21",null,"standup"],["dentist tomorrwo","2026-09-17",null,"dentist"],
 ["gym sat 10am","2026-09-19","10:00","gym"],["lunch sun","2026-09-20",null,"lunch"],["Fri 9/18 standup","2026-09-18",null,"standup"],
 // must NOT parse
 ["sat on the bench",null,null,"sat on the bench"],["sun cream",null,null,"sun cream"],["mon ami",null,null,"mon ami"],
 ["buy 3 apples",null,null,"buy 3 apples"],["read chapter 4",null,null,"read chapter 4"],["call room 2026",null,null,"call room 2026"],
 ["version 2.10 release",null,null,"version 2.10 release"],["movie night",null,null,"movie night"],["may I go",null,null,"may I go"],["march the band",null,null,"march the band"],
 ["order 12 eggs",null,null,"order 12 eggs"],["the 3 musketeers",null,null,"the 3 musketeers"],["read 3 a day",null,null,"read 3 a day"],
];
const E_AUDIT=[
 ["Soccer match",null,null,"Soccer match"],["tennis match 3pm",null,"15:00","tennis match"],["match 15 players",null,null,"match 15 players"],
 ["dress for mourning",null,null,"dress for mourning"],["sundry items",null,null,"sundry items"],["moaning neighbour",null,null,"moaning neighbour"],
 ["weakened immune system",null,null,"weakened immune system"],["Toady the frog",null,null,"Toady the frog"],
 ["Finish 2nd draft",null,null,"Finish 2nd draft"],["Room on the 3rd floor",null,null,"Room on the 3rd floor"],["1st place trophy",null,null,"1st place trophy"],
 ["5th grade science fair",null,null,"5th grade science fair"],["pay rent on the 1st","2026-10-01",null,"pay rent"],["meet on the 20th at 5pm","2026-09-20","17:00","meet"],
 ["Call the dentist julky 30","2027-07-30",null,"Call the dentist"],["wensday standup","2026-09-23",null,"standup"],["tommorow 3pm gym","2026-09-17","15:00","gym"],
 ["Location check Match point arena",null,null,"Location check Match point arena"],
];
for (const [inp, due, time, title, end, rec] of [...E, ...E_AUDIT]) {
  const r = parseNL(inp);
  const ok = (r.due || null) === due && (r.time || null) === time && r.title === title
    && (end === undefined || (r.endTime || null) === end) && (rec === undefined || (r.recurring || null) === rec);
  report(ok, `${JSON.stringify(inp)} → due=${r.due} time=${r.time}${r.endTime ? "-" + r.endTime : ""} repeat=${r.recurring} title=${JSON.stringify(r.title)}; expected due=${due} time=${time}${end ? "-" + end : ""} repeat=${rec} title=${JSON.stringify(title)}`);
}
console.log(`  ${E.length + E_AUDIT.length} cases`);

section("Category guess");
const G=[["brunch with friends","personal"],["call my parents","personal"],["update the report","work"],["fix the syntax error","personal"],["call a taxi","personal"],["classic car show","personal"],["pay rent","finance"],["running late for the gym","health"],["taxes due","finance"],["weekly meetings","work"],["study for quizzes","school"],["billion dollar idea","personal"]];
for (const [t, want] of G) { const got = guessCat(t, { work: 1, school: 1, health: 1, personal: 1, finance: 1 }); report(got === want, `guessCat(${JSON.stringify(t)}) → ${got}, expected ${want}`); }

section("Icon guess");
const I=[["job search","📨"],["side project","🚀"],["work","💼"],["dogs","🐶"],["money","💰"],["night run","🏃"],["morning routine","🌅"],["d&d night","🎲"],["xyzzy","📁"]];
for (const [n, want] of I) { const got = guessIcon(n); report(got === want, `guessIcon(${JSON.stringify(n)}) → ${got}, expected ${want}`); }

section("Due-date labels");
const fd=[["2026-09-16","Today"],["2026-09-17","Tomorrow"],["2026-10-02","Oct 2"],["2027-03-15","Mar 15, 2027"],["2026-09-14","2d overdue"],["9999-12-31","Date TBD"]];
for (const [d, want] of fd) { const got = fmtDate(d); report(got === want, `fmtDate(${d}) → ${got}, expected ${want}`); }

section("Sharing rules");
{
  const { inUpcoming, shareCovers, shareLabel, UPCOMING_SHARE } = L, today = "2026-09-16";
  const U = [[{ due: "2026-09-01", done: false }, true, "an overdue open task stays in Upcoming"],
             [{ due: "2026-09-01", done: true }, true, "a task ticked off in Upcoming stays (under Completed)"],
             [{ due: "2026-09-20", done: true }, true, "a finished task whose day hasn't come stays"],
             [{ due: "9999-12-31", done: false }, true, "Date TBD is in Upcoming"],
             [{ due: null, done: false }, false, "no date, not in Upcoming"]];
  for (const [t, want, what] of U) report(inUpcoming(t, today) === want, `inUpcoming: ${what}`);
  const list = { owner_id: "a", folder: "work" }, up = { owner_id: "a", folder: UPCOMING_SHARE };
  const S = [[list, { owner: "a", tag: "work", due: null }, true, "a list share covers its own list"],
             [list, { owner: "a", tag: "home", due: "2026-09-20" }, false, "a list share doesn't cover another list"],
             [list, { owner: "b", tag: "work", due: null }, false, "a list share doesn't cover someone else's list of the same name"],
             [up, { owner: "a", tag: "home", due: "2026-09-20" }, true, "a shared Upcoming covers a dated task in any list"],
             [up, { owner: "a", tag: null, due: "9999-12-31" }, true, "a shared Upcoming covers Date TBD"],
             [up, { owner: "a", tag: "home", due: null }, false, "a shared Upcoming doesn't cover an undated task"],
             [up, { owner: "b", tag: "home", due: "2026-09-20" }, false, "a shared Upcoming doesn't cover someone else's tasks"]];
  for (const [sh, t, want, what] of S) report(shareCovers(sh, t) === want, `shareCovers: ${what}`);
  report(shareLabel(UPCOMING_SHARE) === "Upcoming" && shareLabel("work") === "work", "shareLabel names a shared Upcoming");
}

section("Auto-scroll while dragging");
{
  const { edgeScrollStep, EDGE_SCROLL } = L, box = { top: 100, bottom: 500, left: 0, right: 300 }, MAX = 1000;
  const step = (x, y, top = 300, max = MAX) => edgeScrollStep(box, x, y, top, max);
  const E = [
    [step(150, 300) === 0, "no scrolling from the middle of the area"],
    [step(150, 499) === EDGE_SCROLL.max, "full speed right at the bottom edge"],
    [step(150, 101) === -EDGE_SCROLL.max, "full speed, upwards, at the top edge"],
    [step(150, 460) > 0 && step(150, 460) < step(150, 495), "nearer the edge scrolls faster"],
    [step(150, 110, 0) === 0, "already at the top → no upward scroll"],
    [step(150, 495, MAX) === 0, "already at the bottom → no downward scroll"],
    [step(150, 495, MAX - 5) === 5, "the last step stops exactly at the end"],
    [step(400, 495) === 0, "a pointer beside the area doesn't scroll it"],
    [step(150, 90) === 0 && step(150, 520) === 0, "a pointer outside the area's top/bottom doesn't scroll it"],
  ];
  for (const [ok, what] of E) report(ok, "edgeScrollStep: " + what);
}

section("Dragging a card to a new place");
{
  const { reorderPosition, sortFor } = L;
  const mk = (id, position) => ({ id, position });
  const list = [mk("a", 400), mk("b", 300), mk("c", 200), mk("d", 100)];   // as shown, top first
  const R = [
    [reorderPosition(list, "d", "c", true) === 250, "the last card moves above the one before it"],
    [reorderPosition(list, "a", "d", false) === 99, "dropping below the last card puts it at the end"],
    [reorderPosition(list, "d", "a", true) === 401, "dropping above the first card puts it at the top"],
    [reorderPosition(list, "b", "c", true) === null, "dropping where it already is does nothing"],
    [reorderPosition(list, "c", "b", false) === null, "…from the other side too"],
    [reorderPosition(list, "b", "b", true) === null, "a card dropped on itself does nothing"],
    [reorderPosition(list, "b", "zz", true) === null, "an unknown target does nothing"],
    [reorderPosition([mk("a", 0), mk("b", 0), mk("c", 0)], "c", "a", true) === 1, "cards sharing a position still move"],
    [reorderPosition([mk("a", 0), mk("b", 0), mk("c", 0)], "a", "b", false) === -0.5, "…in both directions"],
  ];
  for (const [ok, what] of R) report(ok, "reorderPosition: " + what);
  const S = [
    [sortFor("myday", {}, "due") === "manual", "My Day is hand-arranged unless you say otherwise"],
    [sortFor("myday", { myday: "az" }, "due") === "az", "…and your own choice for it wins"],
    [sortFor("cat:Work", {}, "priority") === "priority", "another list falls back to your last overall choice"],
    [sortFor("cat:Work", { "cat:Work": "manual" }, "due") === "manual", "each list remembers its own sort"],
    [sortFor("upcoming", {}, null) === "due", "with no choice at all, by due date"],
  ];
  for (const [ok, what] of S) report(ok, "sortFor: " + what);
}

await import("./check-sync.mjs").then(m => m.run(report, section));
await import("./check-names.mjs").then(m => m.run(report, section));

console.log(failed ? `\n✗ ${failed} failed, ${passed} passed` : `\n✓ all ${passed} checks passed`);
process.exit(failed ? 1 : 0);
