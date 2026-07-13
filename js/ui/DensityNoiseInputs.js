// Density (all modes) and noise amount (overlay mode only) sliders.
import { el } from '../utils/dom.js';

export class DensityNoiseInputs {
  constructor(state) {
    this.state = state;
    this.el = this._build();
    state.on('change', () => this._sync());
  }

  _slider(id, label, key) {
    const out = el('span', { class: 'cp-slider__val' }, `${this.state.get(key)}%`);
    const input = el('input', {
      type: 'range',
      class: 'cp-range',
      id,
      min: 0,
      max: 100,
      step: 1,
      value: this.state.get(key),
      onInput: (e) => {
        const v = parseInt(e.target.value, 10);
        out.textContent = `${v}%`;
        this.state.set(key, v);
      },
    });
    this[`_${key}`] = input;
    this[`_${key}Out`] = out;
    const field = el('div', { class: 'cp-field' }, [
      el('div', { class: 'cp-slider__head' }, [el('label', { class: 'cp-label', for: id }, label), out]),
      input,
    ]);
    this[`_${key}Field`] = field;
    return field;
  }

  _build() {
    const density = this._slider('cp-density', 'Density', 'density');
    const noise = this._slider('cp-noise', 'Noise amount', 'noiseAmount');
    const root = el('div', { class: 'cp-group' }, [
      el('h3', { class: 'cp-group__title' }, 'Fill'),
      density,
      noise,
    ]);
    this._applyMode();
    return root;
  }

  _applyMode() {
    this._noiseAmountField.style.display = this.state.get('mode') === 'noise-overlay' ? '' : 'none';
  }

  _sync() {
    this._density.value = this.state.get('density');
    this._densityOut.textContent = `${this.state.get('density')}%`;
    this._noiseAmount.value = this.state.get('noiseAmount');
    this._noiseAmountOut.textContent = `${this.state.get('noiseAmount')}%`;
    this._applyMode();
  }
}
