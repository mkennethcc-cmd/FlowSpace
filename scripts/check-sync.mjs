// Sync checks for `npm run check`. src/db.js runs unchanged except that it talks to an in-memory
// stand-in (mock-supabase.mjs) instead of the real Supabase client.
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));

export async function run(report, section) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "freely-check-"));
  fs.copyFileSync(path.join(here, "mock-supabase.mjs"), path.join(tmp, "mock-supabase.mjs"));
  const src = fs.readFileSync(path.join(here, "../src/db.js"), "utf8").replace('from "./supabase"', 'from "./mock-supabase.mjs"');
  fs.writeFileSync(path.join(tmp, "db.mjs"), src);
  const { db } = await import(pathToFileURL(path.join(tmp, "db.mjs")).href);
  const store = (await import(pathToFileURL(path.join(tmp, "mock-supabase.mjs")).href)).store;
  const failNextAfter = n => { store.failAt = store.requests + n; };
  const { mergeGami, gamiRowDiffers, moveDuePatch, whenPatch } = await import("../src/logic.js");

  const U = "user-1";
  const note = (id, title, body = "") => ({ id, title, body, pinned: false, color: "#3b82f6", drawing: null, taskId: null, created: "2026-09-16" });
  const seed = rows => { store.tables = { notes: rows.map(r => ({ id: r.id, title: r.title, body: r.body, pinned: false, color: r.color, drawing: null, task_id: null, user_id: U })) }; store.failAt = null; };
  const titles = () => store.tables.notes.map(n => n.title).sort().join(", ");

  section("Sync — notes, lists, habits");
  seed([note("a", "Groceries"), note("b", "Ideas")]);
  {
    const loaded = await db.loadNotes(U);
    await db.syncNotes(loaded, [note("c", "Trip plan"), ...loaded], U);                     // laptop adds a note
    await db.syncNotes(loaded, loaded.map(n => n.id === "a" ? { ...n, body: "milk" } : n), U); // phone, older copy, edits another
    report(store.tables.notes.some(n => n.title === "Trip plan"), `a device with an older copy deleted another device's new note (${titles()})`);
    report(store.tables.notes.find(n => n.id === "a")?.body === "milk", "the older device's own edit was not saved");
  }
  seed([note("a", "A"), note("b", "B"), note("c", "C")]);
  {
    const loaded = await db.loadNotes(U);
    failNextAfter(0);
    let threw = false; try { await db.syncNotes(loaded, loaded.map(n => ({ ...n, body: "x" })), U); } catch { threw = true; }
    report(threw, "a failed save was not reported, so it would never be retried");
    report(store.tables.notes.length === 3, `a failed save lost notes (${store.tables.notes.length} of 3 left)`);
    const before = store.requests;
    await db.syncNotes(loaded, loaded.map(n => ({ ...n })), U);
    report(store.requests === before, `saving an unchanged list still sent ${store.requests - before} request(s)`);
  }
  store.tables = { categories: [] };
  {
    await db.syncCats({}, { work: { color: "#1", icon: "💼" }, GoDo: { color: "#3", icon: "📁" } }, U);
    const loaded = await db.loadCats(U);
    await db.syncCats(loaded, { work: loaded.work, "Go Do": loaded.GoDo }, U);
    report(store.tables.categories.map(c => c.name).sort().join(",") === "Go Do,work", `list rename/defaults wrong: ${store.tables.categories.map(c => c.name).join(", ")}`);
  }
  store.tables = { habits: [] };
  {
    const h = (id, name) => ({ id, name, icon: "✅", color: "#2", cadence: 7, log: [], days: null, prio: null });
    await db.syncHabits([], [h(1, "Water"), h(2, "Read"), h(3, "Walk")], U);
    const loaded = await db.loadHabits(U);
    await db.syncHabits(loaded, [loaded[2], loaded[0], loaded[1]], U);
    const order = [...store.tables.habits].sort((a, b) => a.position - b.position).map(x => x.name).join(" → ");
    report(order === "Walk → Water → Read", `habit order not stored: ${order}`);
  }

  section("Sync — sharing");
  {
    // Simulate a database that hasn't run the view-only SQL yet.
    const { supabase } = await import(pathToFileURL(path.join(tmp, "mock-supabase.mjs")).href);
    const orig = supabase.from;
    supabase.from = t => { const b = orig(t); const up = b.upsert; b.upsert = (r, o) => (r.can_edit !== undefined ? { then: res => res({ error: { message: "column folder_shares.can_edit does not exist" } }) } : up.call(b, r, o)); return b; };
    store.tables = { folder_shares: [] };
    let msg = ""; try { await db.addShare(U, "Econ", "b@x.com", "view"); } catch (e) { msg = e.message; }
    report(/setup\.sql/.test(msg) && store.tables.folder_shares.length === 0, "a view-only share was created with edit rights on an old database");
    await db.addShare(U, "Econ", "b@x.com", "edit");
    report(store.tables.folder_shares.length === 1, "an editable share failed on an old database");
    supabase.from = orig;
  }

  section("Sync — XP, streak, preferences between devices");
  {
    const today = "2026-09-16";
    const lay = over => ({ navOrg: null, hiddenTabs: [], sort: "due", newAtBottom: true, dark: true, scheme: "lavender", ...over });
    // Both devices loaded XP 100. Phone earns 20, laptop earns 10 → both must count.
    let row = { xp: 100, streak: 3, last_active: "2026-09-15", awarded: ["a"], prefs: { at: 5, ...lay() } };
    const phone = mergeGami(row, { xp: 120, streak: 4, lastActive: today, awarded: ["a", "p"], layout: lay(), at: 5, dayStats: {}, device: "P" }, 100, today);
    row = { ...row, ...phone };
    const laptop = mergeGami(row, { xp: 110, streak: 3, lastActive: "2026-09-15", awarded: ["a", "l"], layout: lay(), at: 5, dayStats: {}, device: "L" }, 100, today);
    report(laptop.xp === 130, `XP earned on two devices at once: expected 130, got ${laptop.xp}`);
    report(laptop.awarded.sort().join() === "a,l,p", `awards lost: ${laptop.awarded.join()}`);
    report(laptop.streak === 4 && laptop.last_active === today, `streak should follow the most recent activity: ${laptop.streak} / ${laptop.last_active}`);

    // Laptop reorders the sidebar (at 200). A phone left open since earlier (layout at 100) ticks a task.
    const server = { xp: 0, prefs: { at: 200, ...lay({ navOrg: { order: ["n:upcoming"] } }) } };
    const stale = mergeGami(server, { xp: 0, layout: lay({ navOrg: { order: ["n:myday"] } }), at: 100, dayStats: { [today]: 1 }, device: "P" }, 0, today);
    report(stale.serverLayoutNewer && stale.prefs.navOrg.order[0] === "n:upcoming", "a stale device overwrote a newer sidebar order just by completing a task");
    report(stale.prefs.stats.P?.[today] === 1, "the stale device's completion count was lost");

    // Nicknames and each list's sort travel with the rest of the preferences (they used to sit on one device).
    const named = mergeGami({ xp: 0, prefs: { at: 300, ...lay({ contacts: { "a@b.c": "Sam" }, sorts: { upcoming: "az" } }) } },
      { xp: 0, layout: lay({ contacts: {}, sorts: {} }), at: 100, dayStats: {}, device: "P" }, 0, today);
    report(named.prefs.contacts?.["a@b.c"] === "Sam", "a nickname from another device did not arrive");
    report(named.prefs.sorts?.upcoming === "az", "a list's sort from another device did not arrive");
    const mine = mergeGami({ xp: 0, prefs: { at: 100, ...lay({ contacts: { "a@b.c": "old" } }) } },
      { xp: 0, layout: lay({ contacts: { "a@b.c": "Sam" } }), at: 300, dayStats: {}, device: "P" }, 0, today);
    report(mine.prefs.contacts?.["a@b.c"] === "Sam", "my newer nickname was overwritten by an older one");

    const merged = mergeGami({ prefs: { at: 1, stats: { OLD: { "2026-01-01": 4, [today]: 2 }, P: { [today]: 9 } } } }, { layout: lay(), at: 1, dayStats: { [today]: 1 }, device: "P" }, 0, today);
    report(!merged.prefs.stats.OLD["2026-01-01"] && merged.prefs.stats.OLD[today] === 2, "old per-day counts were not trimmed, or another device's counts were dropped");
    report(merged.prefs.stats.P[today] === 1, "this device's own count must win (an un-tick has to stick)");

    const again = mergeGami(merged, { xp: merged.xp, awarded: merged.awarded, streak: merged.streak, lastActive: merged.last_active, layout: lay(), at: merged.prefs.at, dayStats: { [today]: 1 }, device: "P" }, merged.xp, today);
    const asStored = { ...merged, prefs: Object.fromEntries(Object.entries(merged.prefs).reverse()) };   // jsonb reorders keys
    report(!gamiRowDiffers(asStored, again), "an unchanged row is reported as changed (would rewrite on every sync)");
  }

  section("Task date helpers");
  {
    const t = { due: "2026-09-10", remindAt: "2026-09-10T15:00", endTime: "16:00" };
    report(JSON.stringify(moveDuePatch(t, "2026-09-17")) === JSON.stringify({ due: "2026-09-17", remindAt: "2026-09-17T15:00" }), "moving a task's day left its reminder on the old day");
    const tbd = moveDuePatch(t, "9999-12-31");
    report(tbd.remindAt === null && tbd.endTime === null, "Date TBD kept a dated reminder");
    report(JSON.stringify(whenPatch({ due: null, remindAt: null }, { due: null, time: "09:00" })) === JSON.stringify({ remindAt: "2026-09-16T09:00", due: "2026-09-16" }), "a time with no date should land today");
    const typedDay = whenPatch({ due: "2026-09-17", remindAt: "2026-09-17T15:00" }, { due: "2026-09-18", time: null });
    report(typedDay.remindAt === "2026-09-18T15:00", `typing a new day (no time) left the reminder behind: ${JSON.stringify(typedDay)}`);
    const { titleEditPatch } = await import("../src/logic.js");
    const retitled = titleEditPatch({ title: "Soccer", tag: "personal", due: "2026-09-17", remindAt: "2026-09-17T15:00" }, "Soccer friday", {});
    report(retitled.due === "2026-09-18" && retitled.remindAt === "2026-09-18T15:00" && !("title" in retitled), `renaming with a new day: ${JSON.stringify(retitled)}`);
  }
  fs.rmSync(tmp, { recursive: true, force: true });
}
