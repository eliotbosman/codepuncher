// Exports the punchcard layout: one 24×60 sheet per PDF page. Delegates ALL
// tiling/centering/pagination to PunchcardSpec — this file only plots the sheets
// the spec hands back. State-1 cells are drawn as punched holes.
import { PdfDocumentBuilder } from './PdfDocumentBuilder.js';
import { PunchcardSpec } from '../models/PunchcardSpec.js';

export class PunchcardPdfExporter {
  constructor(builder = new PdfDocumentBuilder(), spec = new PunchcardSpec()) {
    this.builder = builder;
    this.spec = spec;
  }

  export(grid, { filename = 'codepuncher-punchcard.pdf' } = {}) {
    const layout = this.spec.layout(grid.width, grid.height);
    const doc = this.builder.create({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    layout.sheets.forEach((sheet, i) => {
      if (i > 0) doc.addPage();
      this._drawSheet(doc, grid, layout, sheet);
    });

    doc.save(filename);
    return doc;
  }

  _drawSheet(doc, grid, layout, sheet) {
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 14;
    const headerH = 14;
    const { cols, rows } = layout;

    const availW = pageW - margin * 2;
    const availH = pageH - margin * 2 - headerH;
    const cell = Math.min(availW / cols, availH / rows);
    const gw = cell * cols;
    const gh = cell * rows;
    const ox = (pageW - gw) / 2;
    const oy = margin + headerH;

    // Header
    doc.setTextColor(20);
    doc.setFontSize(12);
    doc.text('Codepuncher — Punchcard (24 × 60)', margin, margin + 4);
    doc.setFontSize(8);
    doc.setTextColor(110);
    doc.text(
      `Sheet ${sheet.page} of ${layout.pages}  ·  grid ${grid.width}×${grid.height}  ·  ` +
        `cols ${sheet.srcX + 1}–${sheet.srcX + sheet.spanX}, rows ${sheet.srcY + 1}–${sheet.srcY + sheet.spanY}`,
      margin,
      margin + 9,
    );

    // Card outline
    doc.setDrawColor(30);
    doc.setLineWidth(0.4);
    doc.rect(ox, oy, gw, gh);

    // Light cell grid
    doc.setDrawColor(205);
    doc.setLineWidth(0.1);
    for (let c = 1; c < cols; c++) doc.line(ox + c * cell, oy, ox + c * cell, oy + gh);
    for (let r = 1; r < rows; r++) doc.line(ox, oy + r * cell, ox + gw, oy + r * cell);

    // Emphasize every 5th row (punchcard rows are read in bands)
    doc.setDrawColor(150);
    doc.setLineWidth(0.2);
    for (let r = 5; r < rows; r += 5) doc.line(ox, oy + r * cell, ox + gw, oy + r * cell);

    // Holes for state-1 cells within this sheet's source window.
    const hole = cell * 0.34;
    doc.setFillColor(20);
    for (let ry = 0; ry < sheet.spanY; ry++) {
      for (let rx = 0; rx < sheet.spanX; rx++) {
        const gx = sheet.srcX + rx;
        const gy = sheet.srcY + ry;
        if (!grid.data[gy * grid.width + gx]) continue;
        const cx = ox + (sheet.offsetX + rx + 0.5) * cell;
        const cy = oy + (sheet.offsetY + ry + 0.5) * cell;
        doc.circle(cx, cy, hole, 'F');
      }
    }

    // Row numbers down the left edge (every 5, using absolute grid rows).
    doc.setFontSize(6);
    doc.setTextColor(120);
    for (let r = 0; r <= rows; r += 5) {
      const rr = Math.min(r, rows);
      doc.text(String(sheet.srcY + rr), ox - 2.5, oy + rr * cell + 1, { align: 'right' });
    }
  }
}
