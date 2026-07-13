// Noise-over-pattern: lay down the deterministic regular-mode grid, then flip a
// user-controlled percentage of cells. The flip decisions come from their own
// seeded stream (independent of the base), so each cell flips with probability
// noiseAmount% — reproducible, and touching ONLY that fraction of the base grid.
import { PatternGenerator } from './PatternGenerator.js';
import { RegularModeGenerator } from './RegularModeGenerator.js';
import { SeededRandom } from '../utils/SeededRandom.js';

export class NoiseOverlayGenerator extends PatternGenerator {
  constructor() {
    super('noise-overlay');
    this._base = new RegularModeGenerator();
  }

  generate(grid, params) {
    this._base.generate(grid, params);

    const amount = params.noiseAmount / 100;
    if (amount <= 0) return grid;

    const rng = new SeededRandom(`${params.seed}|overlay`);
    const d = grid.data;
    for (let i = 0; i < d.length; i++) {
      if (rng.next() < amount) d[i] = d[i] ? 0 : 1;
    }
    return grid;
  }
}
