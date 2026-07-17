import { Punchkort, BROTHER, kortMm, kortPx, hallPx, hallFranPx, hallRadPx, hallMm, dukMm } from './modell.js';

const TAU = Math.PI * 2;
const FARG_MARK = '#e2ff52';
const DUK_MIN_KOL = 36;
const DUK_MIN_RAD = 48;

export function nod(tag, props = {}, barn = []) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null) continue;
    if (k === 'class') n.className = v;
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2).toLowerCase(), v);
    else n.setAttribute(k, v);
  }
  for (const c of [].concat(barn)) {
    if (c != null) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return n;
}

export const ljud = { pip() {}, laddaNer() {}, bytLage() {} };

export function motivFranKort(rutnat, motivBredd, motivHojd) {
  const bw = Math.min(Math.max(1, motivBredd | 0), rutnat.bredd);
  const bh = Math.min(Math.max(1, motivHojd | 0), rutnat.hojd);
  const data = new Uint8Array(bw * bh);
  for (let y = 0; y < bh; y++) {
    for (let x = 0; x < bw; x++) data[y * bw + x] = rutnat.data[y * rutnat.bredd + x];
  }
  return { bredd: bw, hojd: bh, data };
}

export function dukStorlek(motivBredd, motivHojd) {
  const bw = Math.max(1, motivBredd | 0);
  const bh = Math.max(1, motivHojd | 0);
  return {
    kol: bw * Math.max(2, Math.ceil(DUK_MIN_KOL / bw)),
    rad: bh * Math.max(2, Math.ceil(DUK_MIN_RAD / bh)),
  };
}

function ritaLinje(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function ritaHall(ctx, x, y, r, fyll) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  if (fyll) ctx.fill();
  else ctx.stroke();
}

function ritaMaska(ctx, x, y, b, h) {
  const r = Math.min(b, h) * 0.22;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + b, y, x + b, y + h, r);
  ctx.arcTo(x + b, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + b, y, r);
  ctx.closePath();
  ctx.fill();
}

export class Ritare {
  constructor(canvas, spec = new Punchkort(), fysik = BROTHER) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.spec = spec;
    this.fysik = fysik;
    this.layout = null;
  }

  rita(rutnat, farger, { lage, uBredd, uHojd } = {}) {
    if (lage === 'monster') {
      this.ritaDuk(rutnat, farger, { uBredd, uHojd });
      return;
    }
    this.ritaKort(rutnat, farger);
  }

  ritaKort(rutnat, farger) {
    const host = this.canvas.parentElement.getBoundingClientRect();
    const pad = 8;
    const lay = this.spec.layout(rutnat.bredd, rutnat.hojd);
    const ark = lay.ark[0];
    const paKort = lay.sidor === 1;
    const ramK = paKort ? lay.kol : rutnat.bredd;
    const ramR = paKort ? lay.rad : rutnat.hojd;
    const enhet = kortPx(ramK, ramR, 1, this.fysik);
    const skala = Math.min(Math.max(1, host.width - pad * 2) / enhet.b, Math.max(1, host.height - pad * 2) / enhet.h);
    const rb = enhet.b * skala | 0;
    const rh = enhet.h * skala | 0;
    const hR = hallRadPx(skala, this.fysik);
    const { hallD: d, stegX: sx, stegY: sy } = this.fysik;

    this.layout = {
      skala, offX: paKort ? ark.offX : 0, offY: paKort ? ark.offY : 0,
      spB: paKort ? ark.spB : rutnat.bredd, spH: paKort ? ark.spH : rutnat.hojd,
      kx: paKort ? ark.kx : 0, ky: paKort ? ark.ky : 0,
    };

    const dpr = devicePixelRatio || 1;
    this.canvas.width = rb * dpr | 0;
    this.canvas.height = rh * dpr | 0;
    this.canvas.style.width = `${rb}px`;
    this.canvas.style.height = `${rh}px`;

    const ctx = this.ctx;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rb, rh);
    ctx.fillStyle = farger.fargA;
    ctx.fillRect(0, 0, rb, rh);
    ctx.lineWidth = 1;

    for (let c = 1; c < ramK; c++) {
      ctx.strokeStyle = 'rgba(0,0,0,.14)';
      ritaLinje(ctx, skala * (d / 2 + (c - 0.5) * sx) + 0.5, 0, skala * (d / 2 + (c - 0.5) * sx) + 0.5, rh);
    }
    for (let r = 1; r < ramR; r++) {
      ctx.strokeStyle = r % 5 ? 'rgba(0,0,0,.14)' : 'rgba(0,0,0,.32)';
      ritaLinje(ctx, 0, skala * (d / 2 + (r - 0.5) * sy) + 0.5, rb, skala * (d / 2 + (r - 0.5) * sy) + 0.5);
    }
    ctx.strokeStyle = 'rgba(0,0,0,.55)';
    ctx.strokeRect(0.5, 0.5, rb - 1, rh - 1);

    const { offX, offY, spB, spH, kx, ky } = this.layout;
    ctx.strokeStyle = 'rgba(0,0,0,.12)';
    for (let ry = 0; ry < spH; ry++) {
      for (let rx = 0; rx < spB; rx++) {
        const { x, y } = hallPx(offX + rx, offY + ry, skala, this.fysik);
        ritaHall(ctx, x, y, hR, false);
      }
    }

    ctx.fillStyle = farger.fargB;
    for (let ry = 0; ry < spH; ry++) {
      for (let rx = 0; rx < spB; rx++) {
        if (!rutnat.data[(ky + ry) * rutnat.bredd + (kx + rx)]) continue;
        const { x, y } = hallPx(offX + rx, offY + ry, skala, this.fysik);
        ritaHall(ctx, x, y, hR, true);
      }
    }
  }

  ritaDuk(rutnat, farger, { uBredd, uHojd }) {
    const motiv = motivFranKort(rutnat, uBredd, uHojd);
    const duk = dukStorlek(motiv.bredd, motiv.hojd);
    const host = this.canvas.parentElement.getBoundingClientRect();
    const pad = 8;
    const cell = Math.max(2, Math.min((host.width - pad * 2) / duk.kol, (host.height - pad * 2) / duk.rad));
    const rb = Math.max(1, duk.kol * cell | 0);
    const rh = Math.max(1, duk.rad * cell | 0);
    const lucka = Math.max(0.5, cell * 0.12);
    const maskB = Math.max(1, cell - lucka);
    const maskH = Math.max(1, cell - lucka);

    this.layout = null;

    const dpr = devicePixelRatio || 1;
    this.canvas.width = rb * dpr | 0;
    this.canvas.height = rh * dpr | 0;
    this.canvas.style.width = `${rb}px`;
    this.canvas.style.height = `${rh}px`;

    const ctx = this.ctx;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rb, rh);

    const botten = farger.fargA;
    const garn = farger.fargB;
    ctx.fillStyle = botten;
    ctx.fillRect(0, 0, rb, rh);

    for (let y = 0; y < duk.rad; y++) {
      if (y % 2) {
        ctx.fillStyle = 'rgba(0,0,0,.04)';
        ctx.fillRect(0, y * cell, rb, cell);
      }
      for (let x = 0; x < duk.kol; x++) {
        const mx = x % motiv.bredd;
        const my = y % motiv.hojd;
        if (!motiv.data[my * motiv.bredd + mx]) continue;
        ctx.fillStyle = garn;
        ritaMaska(ctx, x * cell + lucka * 0.5, y * cell + lucka * 0.5, maskB, maskH);
      }
    }

    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = 'rgba(33,33,33,.28)';
    ctx.lineWidth = 1;
    for (let tx = motiv.bredd; tx < duk.kol; tx += motiv.bredd) {
      ritaLinje(ctx, tx * cell + 0.5, 0, tx * cell + 0.5, rh);
    }
    for (let ty = motiv.hojd; ty < duk.rad; ty += motiv.hojd) {
      ritaLinje(ctx, 0, ty * cell + 0.5, rb, ty * cell + 0.5);
    }
    ctx.setLineDash([]);
    ctx.strokeStyle = FARG_MARK;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0.5, 0.5, motiv.bredd * cell - 1, motiv.hojd * cell - 1);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(33,33,33,.45)';
    ctx.strokeRect(0.5, 0.5, rb - 1, rh - 1);
  }
}

export class Redigerare {
  constructor({ canvas, ritare, rutnat, tillstand, vidRedigera, vidStreckSlut }) {
    this.canvas = canvas;
    this.ritare = ritare;
    this.rutnat = rutnat;
    this.tillstand = tillstand;
    this.vidRedigera = vidRedigera;
    this.vidStreckSlut = vidStreckSlut;
    this.fysik = BROTHER;
    this.aktiv = false;
    this.streck = 1;
    this.smutsig = false;

    const pek = { passive: false };
    for (const ev of ['pointerdown', 'pointermove']) canvas.addEventListener(ev, (e) => this.pekare(e), pek);
    for (const ev of ['pointerup', 'pointercancel']) canvas.addEventListener(ev, (e) => this.slutStreck(e), pek);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    tillstand.pa('andring', () => this.synkaLage());
    this.synkaLage();
  }

  synkaLage() {
    const frihand = this.tillstand.hamta('lage') === 'frihand';
    this.canvas.classList.toggle('cp-canvas--freehand', frihand);
    this.canvas.classList.toggle('cp-canvas--duk', !frihand);
    if (!frihand) this.aktiv = false;
  }

  slutStreck(e) {
    if (!this.aktiv) return;
    this.aktiv = false;
    try { if (e?.pointerId != null) this.canvas.releasePointerCapture(e.pointerId); } catch {}
    if (this.smutsig) this.vidStreckSlut?.();
    this.smutsig = false;
  }

  pekare(e) {
    if (this.tillstand.hamta('lage') !== 'frihand') return;
    if (e.pointerType === 'touch' && (e.type === 'pointerdown' || this.aktiv)) e.preventDefault();
    if (e.type === 'pointerdown') {
      this.aktiv = true;
      this.smutsig = false;
      this.canvas.setPointerCapture(e.pointerId);
      this.streck = e.button === 2 || e.altKey ? 0 : 1;
    } else if (!this.aktiv) return;
    const cell = this.traff(e);
    if (cell && this.vidRedigera(cell.x, cell.y, this.streck, 'frihand')) this.smutsig = true;
    ljud.pip();
  }

  traff(e) {
    const L = this.ritare.layout;
    if (!L) return null;
    const r = this.canvas.getBoundingClientRect();
    const { kol, rad } = hallFranPx(e.clientX - r.left, e.clientY - r.top, L.skala, this.fysik);
    const { offX, offY, spB, spH, kx, ky } = L;
    if (kol < offX || kol >= offX + spB || rad < offY || rad >= offY + spH) return null;
    const x = kx + kol - offX;
    const y = ky + rad - offY;
    return x >= 0 && y >= 0 && x < this.rutnat.bredd && y < this.rutnat.hojd ? { x, y } : null;
  }
}

function laddaNerBlob(innehall, namn, mime = 'application/octet-stream') {
  const url = URL.createObjectURL(innehall instanceof Blob ? innehall : new Blob([innehall], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = namn;
  a.click();
  URL.revokeObjectURL(url);
}

export class SvgExport {
  constructor(spec = new Punchkort(), fysik = BROTHER) {
    this.spec = spec;
    this.fysik = fysik;
  }

  exportera(rutnat, { filnamn = 'codepuncher-punchcard.svg' } = {}) {
    const lay = this.spec.layout(rutnat.bredd, rutnat.hojd);
    lay.ark.forEach((ark) => {
      laddaNerBlob(
        this.arkTillSvg(rutnat, lay, ark),
        lay.sidor > 1 ? filnamn.replace(/\.svg$/i, `-sheet-${String(ark.sida).padStart(2, '0')}.svg`) : filnamn,
        'image/svg+xml',
      );
    });
  }

  arkTillSvg(rutnat, lay, ark) {
    const p = this.fysik;
    const k = kortMm(p);
    const d = dukMm(p);
    const r = p.hallD / 2;
    const skalaLen = p.stegX * 10;
    const sx = p.kantV;
    const sy = p.kantT + k.h + 4.5;
    const rader = [];

    for (let c = 1; c < lay.kol; c++) {
      const x = p.kantV + p.hallD / 2 + c * p.stegX - p.stegX / 2;
      rader.push(`<line x1="${x}" y1="${p.kantT}" x2="${x}" y2="${p.kantT + k.h}" stroke="#e0e0e0" stroke-width="0.08"/>`);
    }
    for (let row = 1; row < lay.rad; row++) {
      const y = p.kantT + p.hallD / 2 + row * p.stegY - p.stegY / 2;
      rader.push(`<line x1="${p.kantV}" y1="${y}" x2="${p.kantV + k.b}" y2="${y}" stroke="${row % 5 ? '#e8e8e8' : '#bbb'}" stroke-width="${row % 5 ? 0.08 : 0.12}"/>`);
    }

    const hallar = [];
    for (let ry = 0; ry < ark.spH; ry++) {
      for (let rx = 0; rx < ark.spB; rx++) {
        const gx = ark.kx + rx;
        const gy = ark.ky + ry;
        if (!rutnat.data[gy * rutnat.bredd + gx]) continue;
        const { x, y } = hallMm(ark.offX + rx, ark.offY + ry, p);
        hallar.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="#000"/>`);
      }
    }

    const mark = [];
    for (let row = 0; row < lay.rad; row += 5) {
      const { y } = hallMm(0, row, p);
      mark.push(`<text x="${p.kantV + k.b + 2}" y="${y + 0.6}" font-family="sans-serif" font-size="2.2" fill="#666">${ark.ky + row + 1}</text>`);
    }

    return [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${d.b}mm" height="${d.h}mm" viewBox="0 0 ${d.b} ${d.h}">`,
      `<title>codepuncher — sida ${ark.sida}/${lay.sidor}</title>`,
      `<rect width="100%" height="100%" fill="white"/>`,
      `<text x="${p.kantV}" y="${p.kantT - 2}" font-family="sans-serif" font-size="2.5" fill="#555">codepuncher · brother ${p.modell} · ${ark.sida}/${lay.sidor} · ${rutnat.bredd}×${rutnat.hojd}</text>`,
      `<g fill="none" stroke="#333"><line x1="${sx}" y1="${sy}" x2="${sx + skalaLen}" y2="${sy}" stroke-width="0.25"/>`,
      `<line x1="${sx}" y1="${sy - 0.8}" x2="${sx}" y2="${sy + 0.8}" stroke-width="0.2"/>`,
      `<line x1="${sx + skalaLen}" y1="${sy - 0.8}" x2="${sx + skalaLen}" y2="${sy + 0.8}" stroke-width="0.2"/></g>`,
      `<text x="${sx}" y="${sy + 2.2}" font-family="sans-serif" font-size="2" fill="#555">scale check: ${skalaLen}mm (= 10 stitches) — measure at 100% print</text>`,
      `<rect x="${p.kantV}" y="${p.kantT}" width="${k.b}" height="${k.h}" fill="none" stroke="#333" stroke-width="0.2"/>`,
      rader.join('\n'), mark.join('\n'), hallar.join('\n'), `</svg>`,
    ].join('\n');
  }
}

const LAGEN = [
  ['frihand', 'draw', 'punch holes on the card — right-click or alt-drag to erase'],
  ['monster', 'cloth preview', 'see how the punched motif repeats as knitted fabric'],
];
const HINT_MONSTER = 'cloth preview: set motif size with [+][-] — top-left of your punchcard tiles across the fabric as it would knit. no punching here.';
const HINT_FRIHAND = 'draw: punch holes with cursor or touch. right-click or alt-drag erases. switch to cloth preview to see the repeat in textile.';

function byggStepper(etikett, nyckel) {
  const vardeEl = nod('span', { class: 'cp-step__varde' }, '8');
  return {
    el: nod('div', { class: 'cp-step cp-pill' }, [
      nod('button', { type: 'button', class: 'cp-step__knapp', 'data-atgard': 'steg/minska', 'data-nyckel': nyckel, 'aria-label': `minska ${etikett}` }, '−'),
      nod('span', { class: 'cp-step__etikett' }, etikett),
      nod('button', { type: 'button', class: 'cp-step__knapp', 'data-atgard': 'steg/oka', 'data-nyckel': nyckel, 'aria-label': `öka ${etikett}` }, '+'),
      vardeEl,
    ]),
    vardeEl,
  };
}

function hanteraAtgard(e, tillstand, vidLaddaNer) {
  const mal = e.target.closest('[data-atgard]');
  if (!mal || mal.disabled) return;
  const atgard = mal.getAttribute('data-atgard');
  if (atgard === 'steg/minska' || atgard === 'steg/oka') {
    if (tillstand.hamta('lage') !== 'monster') return;
    const nyckel = mal.getAttribute('data-nyckel');
    if (!nyckel) return;
    e.preventDefault();
    const nu = tillstand.hamta(nyckel);
    const ny = atgard === 'steg/minska' ? Math.max(1, nu - 1) : Math.min(60, nu + 1);
    if (ny !== nu) tillstand.satt(nyckel, ny);
  } else if (atgard === 'nedladda') {
    e.preventDefault();
    vidLaddaNer();
  }
}

export function byggPanel({ mount, tillstand, vidLaddaNer, vidAngra, vidRensa, hamtaHistorik }) {
  const lageKnappar = new Map();
  const upprepHint = nod('p', { class: 'cp-hint' }, HINT_MONSTER);
  const breddStep = byggStepper('motif across', 'uBredd');
  const hojdStep = byggStepper('motif down', 'uHojd');
  const stegLista = nod('div', { class: 'cp-steg-lista' }, [breddStep.el, hojdStep.el]);
  const app = mount.closest('.cp-app');
  const stage = app?.querySelector('.cp-stage');

  function synkaLage() {
    const aktiv = tillstand.hamta('lage');
    const monster = aktiv === 'monster';
    for (const [v, knapp] of lageKnappar) {
      knapp.classList.toggle('is-active', v === aktiv);
      knapp.setAttribute('aria-pressed', v === aktiv ? 'true' : 'false');
    }
    stegLista.classList.toggle('is-dold', !monster);
    breddStep.el.classList.toggle('is-active', monster);
    hojdStep.el.classList.toggle('is-active', monster);
    upprepHint.textContent = monster ? HINT_MONSTER : HINT_FRIHAND;
    app?.classList.toggle('cp-app--duk', monster);
    stage?.classList.toggle('cp-stage--duk', monster);
  }

  function synkaUpprep() {
    breddStep.vardeEl.textContent = String(tillstand.hamta('uBredd'));
    hojdStep.vardeEl.textContent = String(tillstand.hamta('uHojd'));
    synkaLage();
  }

  const angraKnapp = nod('button', { type: 'button', class: 'cp-verktyg', title: 'undo (⌘Z)', onClick: vidAngra }, 'undo');
  const rensaKnapp = nod('button', { type: 'button', class: 'cp-verktyg', title: 'clear card', onClick: vidRensa }, 'clear');
  const nedladdaKnapp = nod('button', { type: 'button', class: 'cp-nedladda cp-pill is-active', 'data-atgard': 'nedladda' }, 'download');
  const historikUi = {
    synka() { angraKnapp.disabled = !hamtaHistorik().kanAngra(); },
  };

  app.appendChild(nod('div', { class: 'cp-fast cp-fast--vanster' }, [
    nod('p', { class: 'cp-sup' }, `bxyz for de ruis /·\\ workshop with brother ${BROTHER.modell} punch cards`),
  ]));
  app.appendChild(nod('div', { class: 'cp-fast cp-fast--hoger' }, [nedladdaKnapp, angraKnapp, rensaKnapp]));
  app.addEventListener('click', (e) => hanteraAtgard(e, tillstand, vidLaddaNer));

  const lageRad = nod('div', { class: 'cp-dock-lagen' });
  for (const [v, etikett, tips] of LAGEN) {
    const knapp = nod('button', {
      type: 'button', class: 'cp-lage cp-pill', title: tips,
      onClick: () => { tillstand.satt('lage', v); ljud.bytLage(); },
    }, etikett);
    lageKnappar.set(v, knapp);
    lageRad.appendChild(knapp);
  }

  mount.appendChild(nod('div', { class: 'cp-dock-rad' }, [
    nod('div', { class: 'cp-dock-top' }, [nod('h1', { class: 'cp-title' }, 'code puncher'), lageRad]),
    nod('div', { class: 'cp-dock-steg' }, [stegLista]),
    nod('div', { class: 'cp-dock-hint' }, [upprepHint]),
  ]));

  tillstand.pa('andring', synkaUpprep);
  synkaUpprep();
  return historikUi;
}
