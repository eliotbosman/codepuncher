// Noise mode: draw every cell independently in row-major order from one seeded
// stream — no repeat unit, so the field never tiles. The stream is independent
// of grid size and density (both are applied as a threshold), so growing the
// grid extends the same field and changing density doesn't reshuffle it.
import { PatternGenerator } from './PatternGenerator.js';
import { SeededRandom } from '../utils/SeededRandom.js';

export class NoiseModeGenerator extends PatternGenerator {
  constructor() {
    super('noise');
  }

  generate(grid, params) {
    const p = params.density / 100;
    const rng = new SeededRandom(`${params.seed}|noise`);
    const d = grid.data;
    for (let i = 0; i < d.length; i++) d[i] = rng.next() < p ? 1 : 0;
    return grid;
  }
}
