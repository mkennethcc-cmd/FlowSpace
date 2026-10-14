// Task changes made without a connection wait here — saved on the device, so a reload or a closed app
// loses nothing — and go out in order the moment the server can be reached again.
//
// The folding rules (an edit after an insert becomes part of the insert, a task made and deleted offline
// sends nothing…) are queueOp in logic.js, covered by `npm run check`. This file only keeps the queue on
// the device and works through it.
import { queueOp, isNetworkError } from "./logic";

export const outboxKey = uid => "fs_outbox_" + uid;
export const readOutbox = uid => {
  try { const v = JSON.parse(localStorage.getItem(outboxKey(uid)) || "[]"); return Array.isArray(v) ? v : []; }
  catch { return []; }
};

// send(op) performs one change against the server and throws if it couldn't.
// onRejected(op, error): the server refused it outright — waiting won't help, so it's dropped and reported.
// onChange(count): how many changes are still waiting (for the "offline · 3 waiting" pill).
export function createOutbox(uid, send, { onRejected, onChange } = {}) {
  let queue = readOutbox(uid), busy = false, timer = null, stopped = false;
  const save = () => { try { localStorage.setItem(outboxKey(uid), JSON.stringify(queue)); } catch {} onChange?.(queue.length); };
  const retryLater = () => { clearTimeout(timer); if (!stopped) timer = setTimeout(flush, 15000); };

  async function flush() {
    if (busy || stopped || !queue.length) return;
    busy = true;
    try {
      while (queue.length && !stopped) {
        const op = queue[0];
        try { await send(op); }
        catch (e) {
          if (isNetworkError(e) || (typeof navigator !== "undefined" && navigator.onLine === false)) {
            op.retried = true; save(); retryLater(); break;          // still no connection — keep it, try again soon
          }
          onRejected?.(op, e);                                       // a real "no" from the server
        }
        // Done with it (sent, or refused for good). Compare by identity: a change queued while this one
        // was in flight never merges into it (see add), so the head is still exactly this op.
        queue = queue.filter(o => o !== op);
        save();
      }
    } finally { busy = false; }
  }

  return {
    add(op) {
      // While the first change is on its way to the server it is frozen — folding a later edit into an
      // insert that's already half-sent would send that insert twice.
      queue = busy && queue.length ? [queue[0], ...queueOp(queue.slice(1), op)] : queueOp(queue, op);
      save(); flush();
    },
    flush,
    pending: () => queue,
    stop() { stopped = true; clearTimeout(timer); },
  };
}
