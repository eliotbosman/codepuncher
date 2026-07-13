// Two export triggers. The actual export wiring lives in main.js; this control
// just fires the handlers it's given, so it stays free of jsPDF/grid concerns.
import { el } from '../utils/dom.js';

export class ExportButtons {
  constructor({ onPattern, onPunchcard }) {
    this.onPattern = onPattern;
    this.onPunchcard = onPunchcard;
    this.el = this._build();
  }

  _build() {
    return el('div', { class: 'cp-group' }, [
      el('h3', { class: 'cp-group__title' }, 'Export'),
      el(
        'button',
        { type: 'button', class: 'cp-btn cp-btn--primary', onClick: () => this.onPattern() },
        'Export pattern PDF',
      ),
      el(
        'button',
        { type: 'button', class: 'cp-btn cp-btn--primary', onClick: () => this.onPunchcard() },
        'Export punchcard PDF',
      ),
    ]);
  }
}
