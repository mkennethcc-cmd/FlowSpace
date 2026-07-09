import { supabase } from "./supabase";

export const fromDbTask = r => ({
  id: r.id, title: r.title, done: r.done, priority: r.priority,
  tag: r.tag, due: r.due, starred: r.starred, notes: r.notes || "",
  color: r.color, subtasks: r.subtasks || [], recurring: r.recurring,
  quadrant: r.quadrant || null, remindAt: r.remind_at || null, endTime: r.time_end || null,
  assignedTo: r.assigned_to || null,
  attachments: r.attachments || [], owner: r.user_id,
  position: r.position != null ? r.position : (r.created_at ? new Date(r.created_at).getTime() : Date.now()),
  mydayDate: r.myday_date || null,
});

// Canonical icons for the built-in folders. Used to heal old accounts whose rows
// predate the icon feature (they were stamped with a placeholder). Keep in sync with App's DEFAULT_CATS.
const DEFAULT_CAT_ICON = { work: "💼", school: "📚", health: "🏃", personal: "🌟", finance: "💰" };
const healIcon = (name, icon) => (!icon || icon === "📌") ? (DEFAULT_CAT_ICON[name] || "📌") : icon;

const fromDbCanvas = r => ({ id: r.id, text: r.text, x: r.x, y: r.y, color: r.color });
const fromDbNote = r => ({ id: r.id, title: r.title, body: r.body || "", pinned: r.pinned, color: r.color, drawing: r.drawing || null, taskId: r.task_id != null ? r.task_id : null, created: r.created_at?.split("T")[0] || "" });
const fromDbHabit = r => ({ id: r.id, name: r.name || "", icon: r.icon || "✅", color: r.color || "#22c55e", cadence: r.cadence != null ? r.cadence : 7, log: Array.isArray(r.log) ? r.log : [], days: Array.isArray(r.days) && r.days.length ? r.days : null, prio: r.prio != null ? r.prio : null, created: r.created_at?.split("T")[0] || "" });

export const db = {
  async loadTasks() {
    // No user_id filter — RLS returns the user's own tasks plus tasks in folders shared with them.
    const { data } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
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
      myday_date: t.mydayDate || null,
      // Only send time_end / assigned_to when set — keeps inserts working on databases that haven't run those migrations yet.
      ...(t.endTime ? { time_end: t.endTime } : {}),
      ...(t.assignedTo ? { assigned_to: t.assignedTo } : {}),
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
    if (p.attachments !== undefined) u.attachments = p.attachments;
    if (p.position !== undefined) u.position = p.position;
    if (p.mydayDate !== undefined) u.myday_date = p.mydayDate || null;
    if (Object.keys(u).length) await supabase.from("tasks").update(u).eq("id", id);
  },
  async deleteTask(id) {
    await supabase.from("tasks").delete().eq("id", id);
  },

  async uploadAttachment(file, uid, taskId) {
    const safe = file.name.replace(/[^\w.\-]/g, "_");
    const path = `${uid}/${taskId}/${Date.now()}-${safe}`;
    const { error } = await supabase.storage.from("attachments").upload(path, file, { upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from("attachments").getPublicUrl(path);
    return { name: file.name, path, url: data.publicUrl, type: file.type };
  },
  async deleteAttachment(path) {
    await supabase.storage.from("attachments").remove([path]);
  },

  async loadOwnedShares(uid) {
    const { data } = await supabase.from("folder_shares").select("*").eq("owner_id", uid);
    return data || [];
  },
  async loadSharedWithMe(email) {
    if (!email) return [];
    const { data } = await supabase.from("folder_shares").select("*").eq("shared_with_email", email.toLowerCase());
    return data || [];
  },
  async addShare(ownerId, folder, email, canDelete) {
    const { error } = await supabase.from("folder_shares").upsert(
      { owner_id: ownerId, folder, shared_with_email: email.toLowerCase().trim(), can_delete: !!canDelete },
      { onConflict: "owner_id,folder,shared_with_email" }
    );
    if (error) throw error;
  },
  async removeShare(id) {
    await supabase.from("folder_shares").delete().eq("id", id);
  },

  async loadGami(uid) {
    const { data } = await supabase.from("gamification").select("*").eq("user_id", uid).maybeSingle();
    return data || null;
  },
  async saveGami(uid, g) {
    await supabase.from("gamification").upsert({
      user_id: uid, xp: g.xp || 0, streak: g.streak || 0,
      last_active: g.lastActive || null, awarded: g.awarded || [],
      updated_at: new Date().toISOString(),
    });
  },

  async loadCanvas(uid) {
    const { data } = await supabase.from("canvas_notes").select("*").eq("user_id", uid);
    return (data || []).map(fromDbCanvas);
  },
  async syncCanvas(notes, uid) {
    await supabase.from("canvas_notes").delete().eq("user_id", uid);
    if (notes.length) await supabase.from("canvas_notes").insert(
      notes.map(n => ({ user_id: uid, text: n.text, x: n.x, y: n.y, color: n.color }))
    );
  },

  async loadNotes(uid) {
    const { data } = await supabase.from("notes").select("*").eq("user_id", uid);
    return (data || []).map(fromDbNote);
  },
  async syncNotes(notes, uid) {
    await supabase.from("notes").delete().eq("user_id", uid);
    if (notes.length) await supabase.from("notes").insert(
      notes.map(n => ({ user_id: uid, title: n.title, body: n.body || "", pinned: n.pinned || false, color: n.color, drawing: n.drawing || null, task_id: n.taskId != null ? n.taskId : null, ...(n.created ? { created_at: new Date(n.created + "T12:00:00").toISOString() } : {}) }))
    );
  },

  async loadHabits(uid) {
    const { data } = await supabase.from("habits").select("*").eq("user_id", uid).order("created_at", { ascending: true });
    return (data || []).map(fromDbHabit);
  },
  async syncHabits(habits, uid) {
    await supabase.from("habits").delete().eq("user_id", uid);
    if (!habits.length) return;
    const base = h => ({ id: h.id, user_id: uid, name: h.name, icon: h.icon, color: h.color, cadence: h.cadence != null ? h.cadence : 7, log: h.log || [] });
    const extra = h => ({ ...(h.days && h.days.length ? { days: h.days } : {}), ...(h.prio != null ? { prio: h.prio } : {}) });
    const { error } = await supabase.from("habits").insert(habits.map(h => ({ ...base(h), ...extra(h) })));
    // days/prio columns missing (migration not run yet) → retry without them so habits are never lost.
    if (error) await supabase.from("habits").insert(habits.map(base));
  },

  // Messages (1:1 DMs + team chats). No filter — RLS returns exactly what this user may see.
  async loadMessages() {
    const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: true });
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

  // Profiles: lets the app check that an email belongs to a real account + stores the chosen avatar.
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
  async addGroupMember(gid, email, by) {
    const { error } = await supabase.from("group_members").insert({ group_id: gid, email: email.toLowerCase(), added_by: (by || "").toLowerCase() });
    if (error && !/duplicate/i.test(error.message || "")) throw error;
  },
  async removeGroupMember(gid, email) {
    await supabase.from("group_members").delete().eq("group_id", gid).eq("email", email.toLowerCase());
  },
  async deleteGroup(id) {
    await supabase.from("groups").delete().eq("id", id);
  },

  async loadCats(uid) {
    const { data } = await supabase.from("categories").select("*").eq("user_id", uid);
    if (!data?.length) return null;
    return Object.fromEntries(data.map(r => [r.name, { color: r.color, icon: healIcon(r.name, r.icon) }]));
  },
  async syncCats(cats, uid) {
    await supabase.from("categories").delete().eq("user_id", uid);
    const rows = Object.entries(cats).map(([name, m]) => ({ user_id: uid, name, color: m.color, icon: m.icon || "📌" }));
    if (rows.length) await supabase.from("categories").insert(rows);
  },
};
