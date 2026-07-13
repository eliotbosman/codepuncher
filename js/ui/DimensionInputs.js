// Grid width/height, the punchcard-scale lock, and the regular-mode repeat unit.
// Width/height disable (but keep their values) while the lock is engaged; the
// repeat row only shows for modes that use a repeat unit.
import { el } from '../utils/dom.js';

export class DimensionInputs {
  constructor(state) {
    this.state = state;
    this.el = this._build();
    state.on('change', () => this._sync());
  }

  _numField(id, label, key) {
    const input = el('input', {
      type: 'number',
      class: 'cp-input',
      id,
      min: 1,
      max: 2000,
      step: 1,
      value: this.state.get(key),
      onChange: (e) => {
        const v = parseInt(e.target.value, 10);
        if (Number.isFinite(v)) this.state.set(key, v);
      },
    });
    this[`_${key}`] = input;
    return el('div', { class: 'cp-field cp-field--half' }, [
      el('label', { class: 'cp-label', for: id }, label),
      input,
    ]);
  }

  _build() {
    this._dimRow = el('div', { class: 'cp-row' }, [
      this._numField('cp-w', 'Width', 'width'),
      this._numField('cp-h', 'Height', 'height'),
    ]);

    this._lock = el('input', {
      type: 'checkbox',
      id: 'cp-lock',
      class: 'cp-checkbox',
      onChange: (e) => this.state.set('punchcardLock', e.target.checked),
    });
    this._lock.checked = this.state.get('punchcardLock');
    const lockField = el('label', { class: 'cp-toggle' }, [
      this._lock,
      el('span', {}, 'Lock to punchcard (24 × 60)'),
    ]);

    this._repeatRow = el('div', { class: 'cp-row' }, [
      this._numField('cp-rw', 'Repeat W', 'repeatWidth'),
      this._numField('cp-rh', 'Repeat H', 'repeatHeight'),
    ]);

    const root = el('div', { class: 'cp-group' }, [
      el('h3', { class: 'cp-group__title' }, 'Dimensions'),
      this._dimRow,
      lockField,
      this._repeatRow,
    ]);

    this._applyLock();
    this._applyMode();
    return root;
  }

  _applyLock() {
    const locked = this.state.get('punchcardLock');
    this._width.disabled = locked;
    this._height.disabled = locked;
    this._dimRow.classList.toggle('cp-disabled', locked);
  }

  _applyMode() {
    const mode = this.state.get('mode');
    const showRepeat = mode === 'regular' || mode === 'noise-overlay';
    this._repeatRow.style.display = showRepeat ? '' : 'none';
  }

  _sync() {
    this._width.value = this.state.get('width');
    this._height.value = this.state.get('height');
    this._repeatWidth.value = this.state.get('repeatWidth');
    this._repeatHeight.value = this.state.get('repeatHeight');
    this._lock.checked = this.state.get('punchcardLock');
    this._applyLock();
    this._applyMode();
  }
}
