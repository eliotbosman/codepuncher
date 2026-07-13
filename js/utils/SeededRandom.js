// Deterministic PRNG (mulberry32) with string- or number-seeding.
// Same seed always yields the same sequence — the backbone of reproducible grids.

/** Fold a number or string seed into a 32-bit unsigned integer (FNV-1a for strings). */
export function hashSeed(seed) {
  if (typeof seed === 'number' && Number.isFinite(seed)) return seed >>> 0;
  const str = String(seed);
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export class SeededRandom {
  constructor(seed) {
    this.reseed(seed);
  }

  reseed(seed) {
    this._state = hashSeed(seed);
    return this;
  }

  /** Next float in [0, 1). */
  next() {
    let t = (this._state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Convenience: boolean true with probability p (0..1). */
  chance(p) {
    return this.next() < p;
  }
}
