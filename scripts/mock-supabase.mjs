// A tiny in-memory stand-in for supabase-js — just enough of the query builder for db.js.
// `failAfter` makes the Nth request from now fail, to simulate a connection dropping mid-save.
export const store = { tables: {}, requests: 0, failAt: null, uniques: { categories: ["user_id", "name"] } };
export const failNextAfter = n => { store.failAt = store.requests + n; };
const tbl = n => (store.tables[n] ||= []);
let uuidN = 0;

function builder(table) {
  const st = { op: "select", filters: [], rows: null, onConflict: null, order: [], single: false, wantRows: false };
  const run = async () => {
    store.requests++;
    if (store.failAt != null && store.requests >= store.failAt) { store.failAt = null; return { data: null, error: { message: "network error (simulated)" } }; }
    const rows = tbl(table);
    const match = r => st.filters.every(([k, op, v]) => op === "eq" ? String(r[k]) === String(v) : op === "in" ? v.map(String).includes(String(r[k])) : true);
    if (st.op === "select") {
      let out = rows.filter(match);
      if (st.single) return { data: out[0] || null, error: null };
      return { data: out.map(r => ({ ...r })), error: null };
    }
    if (st.op === "delete") { const keep = rows.filter(r => !match(r)); const gone = rows.length - keep.length; store.tables[table] = keep; return { data: st.wantRows ? new Array(gone).fill({}) : null, error: null }; }
    if (st.op === "insert") { for (const r of st.rows) rows.push({ id: r.id ?? `gen-${++uuidN}`, created_at: new Date().toISOString(), ...r }); return { data: null, error: null }; }
    if (st.op === "upsert") {
      const keys = (st.onConflict || "id").split(",");
      for (const r of st.rows) {
        const i = rows.findIndex(x => keys.every(k => String(x[k]) === String(r[k])));
        if (i >= 0) rows[i] = { ...rows[i], ...r }; else rows.push({ id: r.id ?? `gen-${++uuidN}`, created_at: new Date().toISOString(), ...r });
      }
      return { data: null, error: null };
    }
    if (st.op === "update") { rows.filter(match).forEach(r => Object.assign(r, st.rows)); return { data: null, error: null }; }
  };
  const b = {
    select() { if (st.op !== "select") st.wantRows = true; return b; },
    insert(r) { st.op = "insert"; st.rows = Array.isArray(r) ? r : [r]; return b; },
    upsert(r, o) { st.op = "upsert"; st.rows = Array.isArray(r) ? r : [r]; st.onConflict = o?.onConflict; return b; },
    update(r) { st.op = "update"; st.rows = r; return b; },
    delete() { st.op = "delete"; return b; },
    eq(k, v) { st.filters.push([k, "eq", v]); return b; },
    in(k, v) { st.filters.push([k, "in", v]); return b; },
    or() { return b; },
    order() { return b; },
    maybeSingle() { st.single = true; return b; },
    single() { st.single = true; return b; },
    then(res, rej) { return run().then(res, rej); },
  };
  return b;
}
export const supabase = { from: builder, storage: { from: () => ({ upload: async () => ({}), remove: async () => ({}), getPublicUrl: () => ({ data: { publicUrl: "" } }) }) } };
