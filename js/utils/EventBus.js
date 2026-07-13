// Tiny pub/sub. Backs AppState's change notifications; no external deps.
export class EventBus {
  constructor() {
    this._listeners = new Map();
  }

  /** Subscribe. Returns an unsubscribe function. */
  on(event, fn) {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set());
    this._listeners.get(event).add(fn);
    return () => this.off(event, fn);
  }

  off(event, fn) {
    const set = this._listeners.get(event);
    if (set) set.delete(fn);
  }

  emit(event, payload) {
    const set = this._listeners.get(event);
    if (!set) return;
    // copy so handlers can (un)subscribe during dispatch
    for (const fn of [...set]) fn(payload);
  }
}
