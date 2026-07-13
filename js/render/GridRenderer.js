// Draws a GridModel onto a <canvas>, mapping 0/1 to the ColorTheme colors.
// Sizes cells to fill the available stage area at an integer pixel size while
// preserving the grid's aspect ratio, and is DPR-aware for crisp cells.
export class GridRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.showGridLines = true;
    this.gridLineColor = 'rgba(128,128,128,0.28)';
    this._grid = null;
    this._theme = null;
  }

  render(grid, theme) {
    this._grid = grid;
    this._theme = theme;

    const host = this.canvas.parentElement;
    const rect = host.getBoundingClientRect();
    const pad = 24;
    const availW = Math.max(1, rect.width - pad);
    const availH = Math.max(1, rect.height - pad);

    const cell = Math.max(1, Math.floor(Math.min(availW / grid.width, availH / grid.height)));
    const gw = cell * grid.width;
    const gh = cell * grid.height;

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(gw * dpr);
    this.canvas.height = Math.round(gh * dpr);
    this.canvas.style.width = `${gw}px`;
    this.canvas.style.height = `${gh}px`;

    const ctx = this.ctx;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, gw, gh);

    const { width, height, data } = grid;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        ctx.fillStyle = theme.colorFor(data[y * width + x]);
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }

    if (this.showGridLines && cell >= 5) {
      ctx.strokeStyle = this.gridLineColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= width; x++) {
        ctx.moveTo(x * cell + 0.5, 0);
        ctx.lineTo(x * cell + 0.5, gh);
      }
      for (let y = 0; y <= height; y++) {
        ctx.moveTo(0, y * cell + 0.5);
        ctx.lineTo(gw, y * cell + 0.5);
      }
      ctx.stroke();
    }
  }

  setGridLines(on) {
    this.showGridLines = on;
    if (this._grid && this._theme) this.render(this._grid, this._theme);
  }
}
