import { supabase } from "./supabase";

export const fromDbTask = r => ({
  id: r.id, title: r.title, done: r.done, priority: r.priority,
  tag: r.tag, due: r.due, starred: r.starred, notes: r.notes || "",
  color: r.color, subtasks: r.subtasks || [], recurring: r.recurring,
  quadrant: r.quadrant || null,
});

const fromDbCanvas = r => ({ id: r.id, text: r.text, x: r.x, y: r.y, color: r.color });
const fromDbNote = r => ({ id: r.id, title: r.title, body: r.body || "", pinned: r.pinned, color: r.color, drawing: r.drawing || null, created: r.created_at?.split("T")[0] || "" });

export const db = {
  async loadTasks(uid) {
    const { data } = await supabase.from("tasks").select("*").eq("user_id", uid).order("created_at", { ascending: false });
    return (data || []).map(fromDbTask);
  },
  async insertTask(t, uid) {
    await supabase.from("tasks").insert({
      id: t.id, user_id: uid, title: t.title, done: t.done,
      priority: t.priority, tag: t.tag, due: t.due || null,
      starred: t.starred, notes: t.notes || "", color: t.color || null,
      subtasks: t.subtasks || [], recurring: t.recurring || null,
      quadrant: t.quadrant || null,
    });
  },
  async updateTask(id, p) {
    const u = {};
    ["title", "done", "priority", "tag", "starred", "notes", "recurring", "quadrant"].forEach(k => { if (p[k] !== undefined) u[k] = p[k]; });
    if (p.due !== undefined) u.due = p.due || null;
    if (p.color !== undefined) u.color = p.color || null;
    if (p.subtasks !== undefined) u.subtasks = p.subtasks;
    if (Object.keys(u).length) await supabase.from("tasks").update(u).eq("id", id);
  },
  async deleteTask(id) {
    await supabase.from("tasks").delete().eq("id", id);
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
      notes.map(n => ({ user_id: uid, title: n.title, body: n.body || "", pinned: n.pinned || false, color: n.color, drawing: n.drawing || null }))
    );
  },

  async loadCats(uid) {
    const { data } = await supabase.from("categories").select("*").eq("user_id", uid);
    if (!data?.length) return null;
    return Object.fromEntries(data.map(r => [r.name, { color: r.color, icon: r.icon || "📌" }]));
  },
  async syncCats(cats, uid) {
    await supabase.from("categories").delete().eq("user_id", uid);
    const rows = Object.entries(cats).map(([name, m]) => ({ user_id: uid, name, color: m.color, icon: m.icon || "📌" }));
    if (rows.length) await supabase.from("categories").insert(rows);
  },
};
