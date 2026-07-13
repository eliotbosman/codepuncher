// Punchcard geometry lives here and ONLY here: the fixed 24×60 physical sheet,
// plus the math to map an arbitrary W×H grid onto one or more sheets (tiling
// large grids across pages, centering small grids on a single sheet).
// No canvas, no jsPDF — pure layout that both the screen and PDF sides can read.

export const PUNCHCARD_COLS = 24;
export const PUNCHCARD_ROWS = 60;

export class PunchcardSpec {
  constructor(cols = PUNCHCARD_COLS, rows = PUNCHCARD_ROWS) {
    this.cols = cols;
    this.rows = rows;
  }

  /**
   * Describe how a grid tiles across physical sheets.
   * @returns {{
   *   cols:number, rows:number, sheetsX:number, sheetsY:number, pages:number,
   *   sheets: Array<{
   *     page:number, indexX:number, indexY:number,
   *     srcX:number, srcY:number, spanX:number, spanY:number,
   *     offsetX:number, offsetY:number   // in-sheet placement (nonzero only when centered)
   *   }>
   * }}
   */
  layout(gridWidth, gridHeight) {
    const sheetsX = Math.max(1, Math.ceil(gridWidth / this.cols));
    const sheetsY = Math.max(1, Math.ceil(gridHeight / this.rows));
    const fitsOnOne = sheetsX === 1 && sheetsY === 1;

    // Grids smaller than one card get centered; anything paginated is corner-aligned
    // so the sheets stitch back together seamlessly.
    const centerX = fitsOnOne ? Math.floor((this.cols - gridWidth) / 2) : 0;
    const centerY = fitsOnOne ? Math.floor((this.rows - gridHeight) / 2) : 0;

    const sheets = [];
    for (let sy = 0; sy < sheetsY; sy++) {
      for (let sx = 0; sx < sheetsX; sx++) {
        const srcX = sx * this.cols;
        const srcY = sy * this.rows;
        sheets.push({
          page: sy * sheetsX + sx + 1,
          indexX: sx,
          indexY: sy,
          srcX,
          srcY,
          spanX: Math.min(this.cols, gridWidth - srcX),
          spanY: Math.min(this.rows, gridHeight - srcY),
          offsetX: centerX,
          offsetY: centerY,
        });
      }
    }

    return { cols: this.cols, rows: this.rows, sheetsX, sheetsY, pages: sheets.length, sheets };
  }
}
