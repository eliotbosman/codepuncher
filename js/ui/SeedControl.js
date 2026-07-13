// Seed text field (numeric or string) + a randomize button. The seed drives all
// reproducibility, so this control is intentionally simple: whatever's in the box
// goes straight into AppState.
import { el } from '../utils/dom.js';

export class SeedControl {
  constructor(state) {
    this.state = state;
    this.el = this._build();
    state.on('change', () => this._sync());
  }

  _build() {
    this._input = el('input', {
      type: 'text',
      class: 'cp-input',
      id: 'cp-seed',
      value: this.state.get('seed'),
      onChange: (e) => this.state.set('seed', e.target.value),
    });
    const randomize = el(
      'button',
      {
        type: 'button',
        class: 'cp-btn cp-btn--ghost',
        title: 'Randomize seed',
        onClick: () => this.state.set('seed', this._randomSeed()),
      },
      '⟳',
    );
    return el('div', { class: 'cp-group' }, [
      el('h3', { class: 'cp-group__title' }, 'Seed'),
      el('div', { class: 'cp-row cp-row--seed' }, [this._input, randomize]),
      el('p', { class: 'cp-hint' }, 'Same seed + params → identical grid.'),
    ]);
  }

  _randomSeed() {
    return Math.floor(Math.random() * 1e9).toString(36);
  }

  _sync() {
    // Don't clobber what the user is mid-typing.
    if (document.activeElement !== this._input) this._input.value = this.state.get('seed');
  }
}
