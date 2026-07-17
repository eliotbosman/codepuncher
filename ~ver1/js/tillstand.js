import { KORT_KOL, KORT_RAD } from './modell.js';

export const STANDARD = { lage: 'frihand', uBredd: 8, uHojd: 8, fargA: '#f4f1e8', fargB: '#1a1a1a' };
const FAST = { bredd: KORT_KOL, hojd: KORT_RAD };
const LAGRING = 'codepuncher-session-v3';

function klamp(n, min, max) {
  n = n | 0;
  return n < min ? min : n > max ? max : n;
}

function normalisera(p) {
  p.uBredd = klamp(p.uBredd, 1, 2000);
  p.uHojd = klamp(p.uHojd, 1, 2000);
  return p;
}

function tillBytes(a) {
  return new Uint8Array(a.map((v) => (v ? 1 : 0)));
}

function pack(s) {
  return s.typ === 'monster'
    ? { typ: 'monster', ruta: [...s.ruta], bw: s.bw, bh: s.bh, uBredd: s.uBredd, uHojd: s.uHojd }
    : { typ: 'frihand', data: [...s.data] };
}

function unpack(s) {
  return s.typ === 'monster'
    ? { typ: 'monster', ruta: tillBytes(s.ruta), bw: s.bw, bh: s.bh, uBredd: s.uBredd, uHojd: s.uHojd }
    : { typ: 'frihand', data: tillBytes(s.data) };
}

export class Tillstand {
  constructor() {
    this._p = normalisera({ ...STANDARD, ...FAST });
    this._ly = new Map();
  }

  hamta(k) { return this._p[k]; }
  hamtaAllt() { return { ...this._p }; }
  pa(n, fn) { (this._ly.get(n) ?? this._ly.set(n, new Set()).get(n)).add(fn); }
  satt(k, v) { this.uppdatera({ [k]: v }); }
  skicka(n, d) { this._ly.get(n)?.forEach((fn) => fn(d)); }

  uppdatera(patch) {
    const fore = { ...this._p };
    this._p = normalisera({ ...this._p, ...patch, ...FAST });
    this.skicka('andring', { params: this.hamtaAllt(), patch, fore });
  }
}

export class Historik {
  constructor({ vidAndring } = {}) {
    this.vidAndring = vidAndring;
    this.steg = [];
    this.index = -1;
  }

  nollstall(o) { this.steg = [o]; this.index = 0; this.vidAndring?.(); }
  tryck(o) {
    this.steg = this.steg.slice(0, this.index + 1);
    this.steg.push(o);
    if (this.steg.length > 80) this.steg.shift();
    this.index = this.steg.length - 1;
    this.vidAndring?.();
  }
  angra() { if (this.index <= 0) return null; this.index--; this.vidAndring?.(); return this.steg[this.index]; }
  nuvarande() { return this.steg[this.index] ?? null; }
  kanAngra() { return this.index > 0; }
  serialisera() { return { steg: this.steg, index: this.index }; }

  aterstall({ steg, index }) {
    if (!steg?.length) return false;
    this.steg = steg;
    this.index = Math.min(Math.max(0, index | 0), steg.length - 1);
    this.vidAndring?.();
    return true;
  }
}

export class Sessionlagring {
  static spara({ historik }) {
    try {
      const { steg, index } = historik.serialisera();
      sessionStorage.setItem(LAGRING, JSON.stringify({ v: 3, steg: steg.map(pack), index }));
    } catch {}
  }

  static las() {
    try {
      const p = JSON.parse(sessionStorage.getItem(LAGRING));
      if (p?.v === 3 && p.steg?.length) {
        return { steg: p.steg.map(unpack), index: Math.min(Math.max(0, p.index ?? 0), p.steg.length - 1) };
      }
    } catch {}
    return null;
  }

  static rensa() {
    try { sessionStorage.removeItem(LAGRING); } catch {}
  }
}
