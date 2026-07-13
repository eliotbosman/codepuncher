import { Rutnat, Monsterruta, Punchkort } from './modell.js';
import { Tillstand, Historik, Sessionlagring } from './tillstand.js';
import { Ritare, Redigerare, SvgExport, byggPanel, generera, ljud } from './app.js';

const tillstand = new Tillstand();
const rutnat = new Rutnat();
const ruta = new Monsterruta(tillstand.hamta('uBredd'), tillstand.hamta('uHojd'));
const ritare = new Ritare(document.getElementById('cp-canvas'), new Punchkort());
const svgExport = new SvgExport(new Punchkort());
const historik = new Historik({ vidAndring: () => { historikUi.synka(); sparaSession(); } });

let historikUi;

function ogonblick() {
  const p = tillstand.hamtaAllt();
  return p.lage === 'monster'
    ? { typ: 'monster', ruta: [...ruta.data], bw: ruta.bredd, bh: ruta.hojd, uBredd: p.uBredd, uHojd: p.uHojd }
    : { typ: 'frihand', data: [...rutnat.data] };
}

function applicera(o) {
  if (!o) return;
  if (o.typ === 'monster') {
    ruta.storlek(o.bw, o.bh);
    ruta.data.set(o.ruta);
    tillstand.uppdatera({ uBredd: o.uBredd, uHojd: o.uHojd });
    generera('monster', rutnat, tillstand.hamtaAllt(), ruta);
  } else rutnat.data.set(o.data);
  ritaOm();
}

function ritaOm() {
  const p = tillstand.hamtaAllt();
  ritare.rita(rutnat, { fargA: p.fargA, fargB: p.fargB }, { lage: p.lage, uBredd: p.uBredd, uHojd: p.uHojd });
}

function sparaSession() { Sessionlagring.spara({ historik }); }

function nollstallHistorik() {
  historik.nollstall(ogonblick());
  historikUi.synka();
}

function laddaNer() {
  svgExport.exportera(rutnat, { filnamn: 'codepuncher-punchcard.svg' });
  ljud.laddaNer();
}

function angra() {
  const o = historik.angra();
  if (o) { applicera(o); ljud.pip(); }
}

function rensa() {
  rutnat.data.fill(0);
  ruta.storlek(tillstand.hamta('uBredd'), tillstand.hamta('uHojd'), true);
  historik.tryck(ogonblick());
  ritaOm();
  ljud.pip();
}

function vidRedigera(x, y, streck, lage) {
  const p = tillstand.hamtaAllt();
  if (lage === 'monster') {
    const bw = Math.max(1, p.uBredd | 0);
    const bh = Math.max(1, p.uHojd | 0);
    const tx = x % bw;
    const ty = y % bh;
    if (ruta.hamta(tx, ty) === streck) return false;
    ruta.satt(tx, ty, streck);
    generera('monster', rutnat, p, ruta);
  } else {
    if (rutnat.hamta(x, y) === streck) return false;
    rutnat.satt(x, y, streck);
  }
  ritaOm();
  return true;
}

function vidStreckSlut() { historik.tryck(ogonblick()); sparaSession(); }

tillstand.pa('andring', ({ params: p, patch }) => {
  if (patch.lage === 'monster' || (p.lage === 'monster' && (patch.uBredd != null || patch.uHojd != null))) {
    generera('monster', rutnat, p, ruta);
  }
  ritaOm();
});

new Redigerare({ canvas: ritare.canvas, ritare, rutnat, tillstand, vidRedigera, vidStreckSlut });

historikUi = byggPanel({
  mount: document.getElementById('cp-dock'),
  tillstand,
  vidLaddaNer: laddaNer,
  vidAngra: angra,
  vidRensa: rensa,
  hamtaHistorik: () => historik,
});

const sparad = Sessionlagring.las();
if (sparad?.steg?.length) {
  historik.aterstall(sparad);
  if (historik.nuvarande()?.typ === 'frihand') applicera(historik.nuvarande());
  else nollstallHistorik();
} else nollstallHistorik();

window.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); angra(); }
});
window.addEventListener('resize', ritaOm);
window.addEventListener('beforeunload', sparaSession);
