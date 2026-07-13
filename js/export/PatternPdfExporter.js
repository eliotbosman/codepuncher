// Exports the pattern exactly as shown on screen: same cells, same A/B colors,
// scaled to fit one page. It reads the GridModel and ColorTheme directly, so the
// PDF is a faithful vector copy of the preview (not a screenshot).
import { PdfDocumentBuilder } from './PdfDocumentBuilder.js';
import { hexToRgb } from '../utils/color.js';

export class PatternPdfExporter {
  constructor(builder = new PdfDocumentBuilder()) {
    this.builder = builder;
  }

  export(grid, theme, { filename = 'codepuncher-pattern.pdf', title = 'Codepuncher Pattern' } = {}) {
    const doc = this.builder.create({
      orientation: grid.width > grid.height ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 12;
    const headerH = 10;
    const availW = pageW - margin * 2;
    const availH = pageH - margin * 2 - headerH;

    const cell = Math.min(availW / grid.width, availH / grid.height);
    const gw = cell * grid.width;
    const gh = cell * grid.height;
    const ox = (pageW - gw) / 2;
    const oy = margin + headerH + (availH - gh) / 2;

    // Header
    doc.setTextColor(20);
    doc.setFontSize(11);
    doc.text(title, margin, margin + 4);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(`${grid.width} × ${grid.height}`, pageW - margin, margin + 4, { align: 'right' });

    const a = hexToRgb(theme.colorA);
    const b = hexToRgb(theme.colorB);

    // Background = state-0 color (so "0" cells match the screen exactly).
    doc.setFillColor(a.r, a.g, a.b);
    doc.rect(ox, oy, gw, gh, 'F');

    // State-1 cells on top.
    doc.setFillColor(b.r, b.g, b.b);
    const { width, height, data } = grid;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (data[y * width + x]) doc.rect(ox + x * cell, oy + y * cell, cell, cell, 'F');
      }
    }

    doc.setDrawColor(120);
    doc.setLineWidth(0.2);
    doc.rect(ox, oy, gw, gh);

    doc.save(filename);
    return doc;
  }
}
