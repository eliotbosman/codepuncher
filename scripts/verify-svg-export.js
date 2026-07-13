import { Rutnat, BROTHER, dukMm, kortMm } from '../js/modell.js';
import { SvgExport } from '../js/app.js';

const rutnat = new Rutnat(24, 60);
rutnat.satt(0, 0, 1);
rutnat.satt(12, 30, 1);

const exportor = new SvgExport();
const lay = exportor.spec.layout(24, 60);
const svg = exportor.arkTillSvg(rutnat, lay, lay.ark[0]);

const duk = dukMm(BROTHER);
const kort = kortMm(BROTHER);
const bredd = svg.match(/width="([^"]+)"/);
const hojd = svg.match(/height="([^"]+)"/);
const skala = svg.match(/scale check: ([\d.]+)mm/);
const hallar = (svg.match(/<circle/g) || []).length;
const skalaMm = BROTHER.stegX * 10;
const fel = [];

if (!bredd || bredd[1] !== `${duk.b}mm`) fel.push(`bredd: ${bredd?.[1]} ≠ ${duk.b}mm`);
if (!hojd || hojd[1] !== `${duk.h}mm`) fel.push(`höjd: ${hojd?.[1]} ≠ ${duk.h}mm`);
if (!skala || Number(skala[1]) !== skalaMm) fel.push(`skala: saknas eller fel`);
if (hallar !== 2) fel.push(`hål: ${hallar} ≠ 2`);

if (fel.length) {
  console.error('verify-svg-export: FAIL');
  for (const f of fel) console.error(' -', f);
  process.exit(1);
}

console.log('verify-svg-export: PASS');
console.log(` duk ${duk.b}×${duk.h} mm · kort ${kort.b.toFixed(2)}×${kort.h.toFixed(2)} mm · skala ${skalaMm} mm`);
