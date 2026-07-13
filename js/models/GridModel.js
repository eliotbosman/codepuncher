// The one shared data structure: a W×H grid of 0/1 cells backed by a Uint8Array.
// Screen preview and punchcard export both plot from this — through different
// layout rules — so it holds no rendering or color concerns.
export class GridModel {
  constructor(width, height) {
    this.width = 0;
    this.height = 0;
    this.data = new Uint8Array(0);
    this.resize(width, height);
  }

  index(x, y) {
    return y * this.width + x;
  }

  get(x, y) {
    return this.data[y * this.width + x];
  }

  set(x, y, value) {
    this.data[y * this.width + x] = value ? 1 : 0;
  }

  fill(value) {
    this.data.fill(value ? 1 : 0);
    return this;
  }

  /** Reallocate to new dimensions. No-op (returns early) if unchanged. */
  resize(width, height) {
    width = Math.max(1, Math.floor(width));
    height = Math.max(1, Math.floor(height));
    if (width === this.width && height === this.height) return this;
    this.width = width;
    this.height = height;
    this.data = new Uint8Array(width * height);
    return this;
  }

  clone() {
    const g = new GridModel(this.width, this.height);
    g.data.set(this.data);
    return g;
  }

  forEach(cb) {
    const { width, height, data } = this;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) cb(x, y, data[y * width + x]);
    }
  }
}
