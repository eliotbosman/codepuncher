// Regular mode: build ONE seeded repeat unit, then tile it across the canvas
// (repeat-x, repeat-y). The tile's seed folds in its own dimensions but not the
// density threshold, so nudging density reveals/hides cells within the *same*
// underlying random field rather than reshuffling the whole tile.
import { PatternGenerator } from './PatternGenerator.js';
import { SeededRandom } from '../utils/SeededRandom.js';

export class RegularModeGenerator extends PatternGenerator {
  constructor() {
    super('regular');
  }

  /** Deterministic repeat unit -> { tile: Uint8Array, tw, th }. */
  buildTile(params) {
    const tw = Math.max(1, Math.floor(params.repeatWidth));
    const th = Math.max(1, Math.floor(params.repeatHeight));
    const p = params.density / 100;
    const rng = new SeededRandom(`${params.seed}|regular|${tw}x${th}`);
    const tile = new Uint8Array(tw * th);
    for (let i = 0; i < tile.length; i++) tile[i] = rng.next() < p ? 1 : 0;
    return { tile, tw, th };
  }

  generate(grid, params) {
    const { tile, tw, th } = this.buildTile(params);
    const { width, height, data } = grid;
    for (let y = 0; y < height; y++) {
      const ty = y % th;
      for (let x = 0; x < width; x++) {
        data[y * width + x] = tile[ty * tw + (x % tw)];
      }
    }
    return grid;
  }
}
