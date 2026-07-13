// Holds the two cell-state colors and the 0/1 -> color mapping. Kept separate
// from the renderer so PDF export can consult the same mapping.
export class ColorTheme {
  constructor(colorA, colorB) {
    this.colorA = colorA; // state 0
    this.colorB = colorB; // state 1
  }

  set(colorA, colorB) {
    this.colorA = colorA;
    this.colorB = colorB;
    return this;
  }

  swap() {
    [this.colorA, this.colorB] = [this.colorB, this.colorA];
    return this;
  }

  colorFor(value) {
    return value ? this.colorB : this.colorA;
  }
}
