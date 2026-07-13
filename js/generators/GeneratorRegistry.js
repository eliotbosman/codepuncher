// mode name -> generator instance. The one place that knows the full mode list.
// Future modes (draw/spray/stamp, image-insert, camera, write) register here the
// same way; nothing downstream changes because they all emit a GridModel.
import { RegularModeGenerator } from './RegularModeGenerator.js';
import { NoiseModeGenerator } from './NoiseModeGenerator.js';
import { NoiseOverlayGenerator } from './NoiseOverlayGenerator.js';

export class GeneratorRegistry {
  constructor() {
    this._generators = new Map();
    this.register('regular', new RegularModeGenerator());
    this.register('noise', new NoiseModeGenerator());
    this.register('noise-overlay', new NoiseOverlayGenerator());

    // --- Extension points (not built in v1) ---
    // this.register('draw',  new DrawModeGenerator());
    // this.register('image', new ImageInsertGenerator());
    // this.register('write', new WriteModeGenerator());
  }

  register(mode, generator) {
    this._generators.set(mode, generator);
    return this;
  }

  get(mode) {
    const g = this._generators.get(mode);
    if (!g) throw new Error(`Unknown generator mode: ${mode}`);
    return g;
  }

  has(mode) {
    return this._generators.has(mode);
  }

  modes() {
    return [...this._generators.keys()];
  }
}
