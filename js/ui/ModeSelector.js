import { el } from '../utils/dom.js';

const MODES = [
  ['regular', 'Regular — tiled repeat'],
  ['noise', 'Noise — non-repeating'],
  ['noise-overlay', 'Noise over pattern'],
];

export class ModeSelector {
  constructor(state, sound) {
    this.state = state;
    this.sound = sound;
    this.el = this._build();
    state.on('change', () => this._sync());
  }

  _build() {
    this.select = el(
      'select',
      {
        class: 'cp-select',
        id: 'cp-mode',
        onChange: (e) => {
          this.state.set('mode', e.target.value);
          this.sound.onModeChange();
        },
      },
      MODES.map(([v, label]) => el('option', { value: v }, label)),
    );
    this.select.value = this.state.get('mode');
    return el('div', { class: 'cp-group' }, [
      el('h3', { class: 'cp-group__title' }, 'Mode'),
      el('div', { class: 'cp-field' }, [this.select]),
    ]);
  }

  _sync() {
    if (this.select.value !== this.state.get('mode')) this.select.value = this.state.get('mode');
  }
}
