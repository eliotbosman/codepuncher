// Abstract base for every pattern mode. A generator's whole contract is:
// take a GridModel + params, mutate the grid's cells in place, return the grid.
// Adding a mode = one new subclass + one GeneratorRegistry entry. Nothing else
// in the app needs to know the mode exists, because everyone plots from GridModel.
export class PatternGenerator {
  constructor(name) {
    this.name = name;
  }

  /**
   * @param {import('../models/GridModel.js').GridModel} grid
   * @param {object} params  snapshot from AppState.getAll()
   * @returns {import('../models/GridModel.js').GridModel}
   */
  generate(grid, params) {
    throw new Error(`${this.constructor.name} must implement generate(grid, params)`);
  }
}
