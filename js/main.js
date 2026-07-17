import { Rutnat, Punchkort } from './modell.js';
import { Tillstand, Historik, Sessionlagring } from './tillstand.js';
import { Ritare, Redigerare, SvgExport, byggPanel, ljud } from './app.js';

const tillstand = new Tillstand();
const rutnat = new Rutnat();
const ritare = new Ritare(document.getElementById('cp-canvas'), new Punchkort());
const svgExport = new SvgExport(new Punchkort());
const historik = new Historik({ vidAndring: () => { historikUi.synka(); sparaSession(); } });

let historikUi;

function ogonblick() {
  return { typ: 'frihand', data: [...rutnat.data] };
}

function applicera(o) {
  if (!o || o.typ !== 'frihand') return;
  rutnat.data.set(o.data);
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
  historik.tryck(ogonblick());
  ritaOm();
  ljud.pip();
}

function vidRedigera(x, y, streck) {
  if (rutnat.hamta(x, y) === streck) return false;
  rutnat.satt(x, y, streck);
  ritaOm();
  return true;
}

function vidStreckSlut() { historik.tryck(ogonblick()); sparaSession(); }

tillstand.pa('andring', () => ritaOm());

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
  const nu = historik.nuvarande();
  if (nu?.typ === 'frihand') applicera(nu);
  else nollstallHistorik();
} else nollstallHistorik();

window.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); angra(); }
});
window.addEventListener('resize', ritaOm);
window.addEventListener('beforeunload', sparaSession);
