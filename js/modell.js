export const KORT_KOL = 24;
export const KORT_RAD = 60;

export const BROTHER = {
  modell: 'KH830',
  hallD: 4.5,
  stegX: 4.5,
  stegY: 4.5,
  kantV: 5,
  kantT: 5,
  kantH: 5,
  kantB: 5,
};

export class Rutnat {
  constructor(bredd = KORT_KOL, hojd = KORT_RAD, noll = false) {
    this.bredd = bredd;
    this.hojd = hojd;
    this.data = new Uint8Array(bredd * hojd);
    if (noll) this.data.fill(0);
  }

  storlek(b, h, noll = false) {
    this.bredd = b;
    this.hojd = h;
    this.data = new Uint8Array(b * h);
    if (noll) this.data.fill(0);
  }

  satt(x, y, v) {
    if (x < 0 || y < 0 || x >= this.bredd || y >= this.hojd) return;
    this.data[y * this.bredd + x] = v ? 1 : 0;
  }

  hamta(x, y) {
    return x >= 0 && y >= 0 && x < this.bredd && y < this.hojd ? this.data[y * this.bredd + x] : 0;
  }

  klona() {
    const k = new Rutnat(this.bredd, this.hojd);
    k.data.set(this.data);
    return k;
  }
}

export class Monsterruta extends Rutnat {
  constructor(b = 8, h = 8) { super(b, h, true); }
}

export class Punchkort {
  layout(b, h) {
    const kol = Math.min(b, KORT_KOL);
    const rad = Math.min(h, KORT_RAD);
    const sidor = Math.max(1, Math.ceil(b / KORT_KOL));
    const ark = [];
    for (let s = 0; s < sidor; s++) {
      const kx = s * KORT_KOL;
      const spB = Math.min(KORT_KOL, b - kx);
      ark.push({ sida: s + 1, kx, ky: 0, spB, spH: rad, offX: 0, offY: 0 });
    }
    return { sidor, kol, rad, ark };
  }
}

export function kortMm(p = BROTHER) {
  return { b: p.kantV + KORT_KOL * p.stegX + p.kantH, h: p.kantT + KORT_RAD * p.stegY + p.kantB };
}

export function dukMm(p = BROTHER) {
  const k = kortMm(p);
  return { b: k.b + 10, h: k.h + 12 };
}

export function kortPx(kol, rad, skala, p = BROTHER) {
  return { b: (p.kantV + kol * p.stegX + p.kantH) * skala, h: (p.kantT + rad * p.stegY + p.kantB) * skala };
}

export function hallPx(kol, rad, skala, p = BROTHER) {
  return { x: (p.kantV + p.hallD / 2 + kol * p.stegX) * skala, y: (p.kantT + p.hallD / 2 + rad * p.stegY) * skala };
}

export function hallFranPx(px, py, skala, p = BROTHER) {
  return {
    kol: Math.round((px / skala - p.kantV - p.hallD / 2) / p.stegX),
    rad: Math.round((py / skala - p.kantT - p.hallD / 2) / p.stegY),
  };
}

export function hallRadPx(skala, p = BROTHER) { return (p.hallD / 2) * skala; }

export function hallMm(kol, rad, p = BROTHER) {
  return { x: p.kantV + p.hallD / 2 + kol * p.stegX, y: p.kantT + p.hallD / 2 + rad * p.stegY };
}
