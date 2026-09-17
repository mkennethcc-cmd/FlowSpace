import { supabase } from "./supabase";

// "YYYY-MM-DD" in the device's own time zone. A timestamp's UTC date is a day ahead every evening in New York.
const localDay = ts => { if (!ts) return ""; const d = new Date(ts); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

export const fromDbTask = r => ({
  id: r.id, title: r.title, done: r.done, priority: r.priority,
  // Dates stay plain "YYYY-MM-DD" strings — sliced so a timestamp-typed column can never shift the day by a timezone.
  tag: r.tag, due: r.due ? String(r.due).slice(0, 10) : null, starred: r.starred, notes: r.notes || "",
  color: r.color, subtasks: r.subtasks || [], recurring: r.recurring,
  quadrant: r.quadrant || null, remindAt: r.remind_at || null, endTime: r.time_end || null,
  assignedTo: r.assigned_to || null, assignPrivate: !!r.assign_private,
  attachments: r.attachments || [], owner: r.user_id,
  position: r.position != null ? r.position : (r.created_at ? new Date(r.created_at).getTime() : Date.now()),
  mydayDate: r.myday_date ? String(r.myday_date).slice(0, 10) : null,
});

// Canonical icons for the built-in folders. Used to heal old accounts whose rows
// predate the icon feature (they were stamped with a placeholder). Keep in sync with App's DEFAULT_CATS.
const DEFAULT_CAT_ICON = { work: "💼", school: "📚", health: "🏃", personal: "💜", finance: "💰" };
const healIcon = (name, icon) => {
  if (name === "personal" && (icon === "🌟" || icon === "🌈")) return "💜"; // migrate the older defaults
  return (!icon || icon === "📌") ? (DEFAULT_CAT_ICON[name] || "📌") : icon;
};

const fromDbCanvas = r => ({ id: r.id, text: r.text, x: r.x, y: r.y, color: r.color });
const fromDbNote = r => ({ id: r.id, title: r.title, body: r.body || "", pinned: r.pinned, color: r.color, drawing: r.drawing || null, taskId: r.task_id != null ? r.task_id : null, created: localDay(r.created_at) });
const fromDbHabit = r => ({ id: r.id, name: r.name || "", icon: r.icon || "✅", color: r.color || "#22c55e", cadence: r.cadence != null ? r.cadence : 7, log: Array.isArray(r.log) ? r.log : [], days: Array.isArray(r.days) && r.days.length ? r.days : null, prio: r.prio != null ? r.prio : null });

const toDbNote = (n, isNew) => ({ id: n.id, title: n.title, body: n.body || "", pinned: !!n.pinned, color: n.color, drawing: n.drawing || null, task_id: n.taskId != null ? String(n.taskId) : null, ...(isNew ? { created_at: new Date().toISOString() } : {}) });
const toDbCanvas = n => ({ id: n.id, text: n.text, x: n.x, y: n.y, color: n.color });
const toDbCat = c => ({ name: c.name, color: c.color, icon: c.icon || "📌" });
const toDbHabit = (h, _isNew, i) => ({ id: h.id, name: h.name, icon: h.icon, color: h.color, cadence: h.cadence != null ? h.cadence : 7, log: h.log || [], days: h.days && h.days.length ? h.days : null, prio: h.prio != null ? h.prio : null, position: i });

// Write a collection by DIFF against the copy this device last saved or loaded: upsert only rows that
// changed, delete only rows THIS device removed. Rows another device added in the meantime are never
// touched. (The old "delete every row, re-insert my copy" erased them — and erased everything if the
// connection dropped between the delete and the insert.) Throws on failure so the caller keeps `prev`
// and retries the same diff later.
async function syncRows(table, uid, prev, next, toRow, { key = "id", conflict = "id" } = {}) {
  const sig = (r, i) => JSON.stringify(toRow(r, false, i));
  const before = new Map(prev.map((r, i) => [String(r[key]), sig(r, i)]));
  const keep = new Set(next.map(r => String(r[key])));
  const changed = next.map((r, i) => [r, i]).filter(([r, i]) => before.get(String(r[key])) !== sig(r, i));
  const removed = [...before.keys()].filter(k => !keep.has(k));
  if (changed.length) {
    const rows = changed.map(([r, i]) => ({ user_id: uid, ...toRow(r, !before.has(String(r[key])), i) }));
    const { error } = await supabase.from(table).upsert(rows, { onConflict: conflict });
    if (error) throw error;
  }
  if (removed.length) {
    const { error } = await supabase.from(table).delete().eq("user_id", uid).in(key, removed);
    if (error) throw error;
  }
}

// Set once per session if the database predates habits.position (supabase/setup.sql not run yet).
let habitsHavePosition = true;

export const db = {
  async loadTasks() {
    // No user_id filter — RLS returns the user's own tasks plus tasks in folders shared with them.
    const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(fromDbTask);
  },
  async insertTask(t, uid) {
    const { error } = await supabase.from("tasks").insert({
      id: t.id, user_id: uid, title: t.title, done: t.done,
      priority: t.priority, tag: t.tag, due: t.due || null,
      starred: t.starred, notes: t.notes || "", color: t.color || null,
      subtasks: t.subtasks || [], recurring: t.recurring || null,
      quadrant: t.quadrant || null, remind_at: t.remindAt || null,
      attachments: t.attachments || [], position: t.position != null ? t.position : Date.now(),
      myday_date: t.mydayDate || null, time_end: t.endTime || null,
      assigned_to: t.assignedTo || null, assign_private: !!t.assignPrivate,
    });
    if (error) throw error;
  },
  async updateTask(id, p) {
    const u = {};
    ["title", "done", "priority", "tag", "starred", "notes", "recurring", "quadrant"].forEach(k => { if (p[k] !== undefined) u[k] = p[k]; });
    if (p.due !== undefined) u.due = p.due || null;
    if (p.color !== undefined) u.color = p.color || null;
    if (p.subtasks !== undefined) u.subtasks = p.subtasks;
    if (p.remindAt !== undefined) u.remind_at = p.remindAt || null;
    if (p.endTime !== undefined) u.time_end = p.endTime || null;
    if (p.assignedTo !== undefined) u.assigned_to = p.assignedTo || null;
    if (p.assignPrivate !== undefined) u.assign_private = !!p.assignPrivate;
    if (p.attachments !== undefined) u.attachments = p.attachments;
    if (p.position !== undefined) u.position = p.position;
    if (p.mydayDate !== undefined) u.myday_date = p.mydayDate || null;
    if (!Object.keys(u).length) return { saved: true };
    // A write the database refuses does NOT throw — it simply matches no rows. Ask for the changed
    // row back so a silently-dropped edit can be reported instead of lingering on screen as a lie.
    const { data, error } = await supabase.from("tasks").update(u).eq("id", id).select("id");
    if (error) throw error;
    return { saved: !Array.isArray(data) || data.length > 0 };
  },
  async deleteTask(id) {
    const { data, error } = await supabase.from("tasks").delete().eq("id", id).select("id");
    if (error) throw error;
    return { deleted: !Array.isArray(data) || data.length > 0 };
  },

  async uploadAttachment(file, uid, folder) {
    const safe = file.name.replace(/[^\w.\-]/g, "_");
    const path = `${uid}/${folder}/${Date.now()}-${safe}`;
    const { error } = await supabase.storage.from("attachments").upload(path, file, { upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from("attachments").getPublicUrl(path);
    return { name: file.name, path, url: data.publicUrl, type: file.type };
  },
  // Best effort: storage refuses files under someone else's folder, which is fine — they own them.
  async deleteAttachments(paths) {
    const list = (paths || []).filter(Boolean);
    if (list.length) await supabase.storage.from("attachments").remove(list);
  },

  async loadOwnedShares(uid) {
    const { data, error } = await supabase.from("folder_shares").select("*").eq("owner_id", uid);
    if (error) throw error;
    return data || [];
  },
  async loadSharedWithMe(email) {
    if (!email) return [];
    const { data, error } = await supabase.from("folder_shares").select("*").eq("shared_with_email", email.toLowerCase());
    if (error) throw error;
    return data || [];
  },
  // perm: "view" (look only) · "edit" (edit & add) · "delete" (edit, add & delete).
  async addShare(ownerId, folder, email, perm) {
    const row = { owner_id: ownerId, folder, shared_with_email: email.toLowerCase().trim(), can_delete: perm === "delete", can_edit: perm !== "view" };
    const attempt = r => supabase.from("folder_shares").upsert(r, { onConflict: "owner_id,folder,shared_with_email" });
    let { error } = await attempt(row);
    if (error && /can_edit/.test(error.message || "")) {
      // The database predates view-only sharing. An editable share is still an editable share — but a
      // view-only one must NOT quietly become editable, so that case stops here with a clear message.
      if (perm === "view") throw new Error("View-only sharing needs the latest database setup — run supabase/setup.sql in Supabase, then try again.");
      const { can_edit, ...legacy } = row;
      ({ error } = await attempt(legacy));
    }
    if (error) throw error;
  },
  async removeShare(id) {
    const { error } = await supabase.from("folder_shares").delete().eq("id", id);
    if (error) throw error;
  },
  async removeSharesOfFolder(ownerId, folder) {
    const { error } = await supabase.from("folder_shares").delete().eq("owner_id", ownerId).eq("folder", folder);
    if (error) throw error;
  },

  async loadGami(uid) {
    const { data, error } = await supabase.from("gamification").select("*").eq("user_id", uid).maybeSingle();
    if (error) throw error;
    return data || null;
  },
  async saveGami(uid, g) {
    const { error } = await supabase.from("gamification").upsert({
      user_id: uid, xp: g.xp || 0, streak: g.streak || 0,
      last_active: g.last_active || null, awarded: g.awarded || [], prefs: g.prefs || {},
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  },

  async loadCanvas(uid) {
    const { data, error } = await supabase.from("canvas_notes").select("*").eq("user_id", uid).order("created_at", { ascending: true });
    if (error) throw error;
    return (data || []).map(fromDbCanvas);
  },
  syncCanvas: (prev, next, uid) => syncRows("canvas_notes", uid, prev, next, toDbCanvas),

  async loadNotes(uid) {
    const { data, error } = await supabase.from("notes").select("*").eq("user_id", uid).order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(fromDbNote);
  },
  syncNotes: (prev, next, uid) => syncRows("notes", uid, prev, next, toDbNote),

  async loadHabits(uid) {
    let q = await supabase.from("habits").select("*").eq("user_id", uid).order("position", { ascending: true, nullsFirst: false }).order("created_at", { ascending: true });
    if (q.error && /position/.test(q.error.message || "")) {
      habitsHavePosition = false;
      q = await supabase.from("habits").select("*").eq("user_id", uid).order("created_at", { ascending: true });
    }
    if (q.error) throw q.error;
    return (q.data || []).map(fromDbHabit);
  },
  async syncHabits(prev, next, uid) {
    const toRow = habitsHavePosition ? toDbHabit : (h, isNew, i) => { const { position, ...rest } = toDbHabit(h, isNew, i); return rest; };
    try {
      await syncRows("habits", uid, prev, next, toRow);
    } catch (e) {
      if (!habitsHavePosition || !/position/.test(e.message || "")) throw e;
      habitsHavePosition = false;          // order won't persist until the SQL is run, but nothing is lost
      await db.syncHabits(prev, next, uid);
    }
  },

  // Messages (1:1 DMs + team chats). No filter — RLS returns exactly what this user may see.
  async loadMessages() {
    const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: true });
    if (error) throw error;
    return data || [];
  },
  async sendMessage(senderId, senderEmail, recipientEmail, body, groupId) {
    const { data, error } = await supabase.from("messages").insert({
      sender_id: senderId, sender_email: senderEmail.toLowerCase(),
      recipient_email: recipientEmail ? recipientEmail.toLowerCase() : null, body,
      ...(groupId ? { group_id: groupId } : {}),
    }).select().single();
    if (error) throw error;
    return data;
  },
  async markMessagesRead(ids) {
    if (ids && ids.length) await supabase.from("messages").update({ read: true }).in("id", ids);
  },

  // Profiles (email + chosen avatar). The database only returns people you're connected to — a shared
  // list, a team, or a conversation — never the whole user list (see is_connected_to in setup.sql).
  async upsertProfile(uid, email, avatar) {
    await supabase.from("profiles").upsert({ id: uid, email: email.toLowerCase(), ...(avatar !== undefined ? { avatar } : {}) });
  },
  async findProfile(email) {
    const { data } = await supabase.from("profiles").select("email,avatar").eq("email", email.toLowerCase()).maybeSingle();
    return data;
  },
  async loadProfiles() {
    const { data } = await supabase.from("profiles").select("id,email,avatar");
    return data || [];
  },

  // Chat requests: message anyone once; more messages unlock when they accept or reply.
  async loadChatReqs(email) {
    const e = email.toLowerCase();
    const { data } = await supabase.from("chat_requests").select("*").or(`from_email.eq.${e},to_email.eq.${e}`);
    return data || [];
  },
  async sendChatReq(from, to) {
    const { error } = await supabase.from("chat_requests").upsert(
      { from_email: from.toLowerCase(), to_email: to.toLowerCase(), status: "pending" },
      { onConflict: "from_email,to_email", ignoreDuplicates: true });
    if (error && !/duplicate/i.test(error.message || "")) throw error;
  },
  async answerChatReq(id, status) {
    await supabase.from("chat_requests").update({ status }).eq("id", id);
  },

  // Teams (server-side groups): visible to members, any member may add members, creator may delete.
  async loadGroups() {
    const { data } = await supabase.from("groups").select("*");
    return data || [];
  },
  async loadGroupMembers() {
    const { data } = await supabase.from("group_members").select("*");
    return data || [];
  },
  async createGroup(uid, name, icon, myEmail) {
    const { data, error } = await supabase.from("groups").insert({ name, icon: icon || null, created_by: uid }).select().single();
    if (error) throw error;
    const { error: e2 } = await supabase.from("group_members").insert({ group_id: data.id, email: myEmail.toLowerCase(), added_by: myEmail.toLowerCase() });
    if (e2) throw e2;
    return data;
  },
  // role: "member" (full, reads team chat) or "assigner" (guest who may only assign work to the team)
  async addGroupMember(gid, email, by, role) {
    const { error } = await supabase.from("group_members").insert({ group_id: gid, email: email.toLowerCase(), added_by: (by || "").toLowerCase(), ...(role === "assigner" ? { role } : {}) });
    if (error && !/duplicate/i.test(error.message || "")) throw error;
  },
  // Both return whether anything was actually removed — a refused delete is not an error, just zero rows.
  async removeGroupMember(gid, email) {
    const { data, error } = await supabase.from("group_members").delete().eq("group_id", gid).eq("email", email.toLowerCase()).select("email");
    if (error) throw error;
    return (data || []).length > 0;
  },
  async deleteGroup(id) {
    const { data, error } = await supabase.from("groups").delete().eq("id", id).select("id");
    if (error) throw error;
    return (data || []).length > 0;
  },

  // Lists are keyed by name (unique per user), so a rename is a delete of the old name plus an insert.
  async loadCats(uid) {
    const { data, error } = await supabase.from("categories").select("*").eq("user_id", uid);
    if (error) throw error;
    if (!data?.length) return null;
    return Object.fromEntries(data.map(r => [r.name, { color: r.color, icon: healIcon(r.name, r.icon) }]));
  },
  syncCats: (prev, next, uid) => syncRows("categories", uid, catRows(prev), catRows(next), toDbCat, { key: "name", conflict: "user_id,name" }),
};

const catRows = cats => Object.entries(cats || {}).map(([name, m]) => ({ name, color: m.color, icon: m.icon }));
