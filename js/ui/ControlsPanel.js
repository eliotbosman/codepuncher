// Mounts the side menu and owns the sub-controls. It does no param logic itself —
// each sub-control reads/writes AppState directly and self-syncs on change.
import { ModeSelector } from './ModeSelector.js';
import { DimensionInputs } from './DimensionInputs.js';
import { DensityNoiseInputs } from './DensityNoiseInputs.js';
import { SeedControl } from './SeedControl.js';
import { ColorPickers } from './ColorPickers.js';
import { ExportButtons } from './ExportButtons.js';
import { el } from '../utils/dom.js';

export class ControlsPanel {
  constructor({ mount, state, sound, exportHandlers }) {
    this.state = state;
    this.mode = new ModeSelector(state, sound);
    this.dims = new DimensionInputs(state);
    this.fill = new DensityNoiseInputs(state);
    this.seed = new SeedControl(state);
    this.colors = new ColorPickers(state);
    this.exports = new ExportButtons(exportHandlers);

    this.el = el('aside', { class: 'cp-panel' }, [
      el('header', { class: 'cp-panel__head' }, [
        el('h1', { class: 'cp-title' }, 'Codepuncher'),
        el('p', { class: 'cp-subtitle' }, 'pattern randomizer → punchcard'),
      ]),
      el('div', { class: 'cp-panel__body' }, [
        this.mode.el,
        this.dims.el,
        this.fill.el,
        this.seed.el,
        this.colors.el,
        this.exports.el,
      ]),
    ]);

    mount.appendChild(this.el);
  }
}
