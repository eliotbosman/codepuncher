// Single source of truth for every user-controlled parameter. Everything else
// reads from here and re-renders on the 'change' event — no param lives in two
// places. The only non-trivial logic is the punchcard-lock invariant, kept here
// so the constraint can't drift out of sync with the inputs.
import { EventBus } from '../utils/EventBus.js';
import { PUNCHCARD_COLS, PUNCHCARD_ROWS } from '../models/PunchcardSpec.js';

export const DEFAULTS = {
  width: PUNCHCARD_COLS,
  height: PUNCHCARD_ROWS,
  mode: 'regular', // 'regular' | 'noise' | 'noise-overlay'
  density: 50, // % chance a cell is "1"
  noiseAmount: 12, // % of cells flipped by the overlay variant
  repeatWidth: 8, // regular-mode repeat unit
  repeatHeight: 8,
  seed: 'codepuncher',
  colorA: '#f4f1e8', // state 0
  colorB: '#1a1a1a', // state 1
  punchcardLock: true, // constrain to 24×60 vs. free dimensions
};

const INT_KEYS = ['width', 'height', 'repeatWidth', 'repeatHeight'];
const PCT_KEYS = ['density', 'noiseAmount'];

export class AppState {
  constructor(initial = {}) {
    this.bus = new EventBus();
    this._params = this._normalize({ ...DEFAULTS, ...initial });
    // Remembers free-form dimensions while the lock is engaged, so toggling the
    // lock off restores them without losing any other param.
    this._freeDims = { width: this._params.width, height: this._params.height };
  }

  get(key) {
    return this._params[key];
  }

  getAll() {
    return { ...this._params };
  }

  on(event, fn) {
    return this.bus.on(event, fn);
  }

  set(key, value) {
    this.update({ [key]: value });
  }

  update(patch) {
    const prev = { ...this._params };
    let next = { ...this._params, ...patch };

    if ('punchcardLock' in patch && patch.punchcardLock !== prev.punchcardLock) {
      if (patch.punchcardLock) {
        // Engaging the lock: stash current dims, snap to the physical card.
        this._freeDims = { width: prev.width, height: prev.height };
        next.width = PUNCHCARD_COLS;
        next.height = PUNCHCARD_ROWS;
      } else {
        // Releasing the lock: restore stashed dims unless the caller set new ones.
        if (!('width' in patch)) next.width = this._freeDims.width;
        if (!('height' in patch)) next.height = this._freeDims.height;
      }
    } else if (next.punchcardLock) {
      // Lock stays on: dimensions are not user-editable.
      next.width = PUNCHCARD_COLS;
      next.height = PUNCHCARD_ROWS;
    }

    this._params = this._normalize(next);
    this.bus.emit('change', { params: this.getAll(), patch, prev });
  }

  _normalize(p) {
    for (const k of INT_KEYS) {
      let v = Math.floor(Number(p[k]));
      if (!Number.isFinite(v) || v < 1) v = 1;
      if (v > 2000) v = 2000;
      p[k] = v;
    }
    for (const k of PCT_KEYS) {
      let v = Number(p[k]);
      if (!Number.isFinite(v)) v = 0;
      p[k] = Math.min(100, Math.max(0, v));
    }
    return p;
  }
}
