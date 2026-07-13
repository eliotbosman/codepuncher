// Color A (state 0) / Color B (state 1) pickers + a swap button.
import { el } from '../utils/dom.js';

export class ColorPickers {
  constructor(state) {
    this.state = state;
    this.el = this._build();
    state.on('change', () => this._sync());
  }

  _build() {
    this._a = el('input', {
      type: 'color',
      class: 'cp-color',
      id: 'cp-colorA',
      value: this.state.get('colorA'),
      onInput: (e) => this.state.set('colorA', e.target.value),
    });
    this._b = el('input', {
      type: 'color',
      class: 'cp-color',
      id: 'cp-colorB',
      value: this.state.get('colorB'),
      onInput: (e) => this.state.set('colorB', e.target.value),
    });
    const swap = el(
      'button',
      {
        type: 'button',
        class: 'cp-btn cp-btn--ghost',
        title: 'Swap colors',
        onClick: () =>
          this.state.update({ colorA: this.state.get('colorB'), colorB: this.state.get('colorA') }),
      },
      '⇄',
    );
    return el('div', { class: 'cp-group' }, [
      el('h3', { class: 'cp-group__title' }, 'Colors'),
      el('div', { class: 'cp-row cp-row--colors' }, [
        el('label', { class: 'cp-colorfield' }, [this._a, el('span', {}, '0 · A')]),
        swap,
        el('label', { class: 'cp-colorfield' }, [this._b, el('span', {}, '1 · B')]),
      ]),
    ]);
  }

  _sync() {
    this._a.value = this.state.get('colorA');
    this._b.value = this.state.get('colorB');
  }
}
