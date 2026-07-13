// Entry point. Builds the single AppState, wires the UI + renderer, and re-runs
// the generator whenever any param changes. AppState is the only source of truth;
// this file just orchestrates the read -> generate -> render loop.
import { AppState } from './state/AppState.js';
import { GridModel } from './models/GridModel.js';
import { GeneratorRegistry } from './generators/GeneratorRegistry.js';
import { GridRenderer } from './render/GridRenderer.js';
import { ColorTheme } from './render/ColorTheme.js';
import { ControlsPanel } from './ui/ControlsPanel.js';
import { PatternPdfExporter } from './export/PatternPdfExporter.js';
import { PunchcardPdfExporter } from './export/PunchcardPdfExporter.js';
import { SoundBus } from './utils/SoundBus.js';

function boot() {
  const state = new AppState();
  const sound = new SoundBus();
  const registry = new GeneratorRegistry();
  const grid = new GridModel(state.get('width'), state.get('height'));
  const theme = new ColorTheme(state.get('colorA'), state.get('colorB'));

  const canvas = document.getElementById('cp-canvas');
  const renderer = new GridRenderer(canvas);

  // Exporters are constructed lazily so a missing jsPDF only errors on export,
  // not on page load.
  let patternExporter = null;
  let punchExporter = null;

  function regenerate() {
    const p = state.getAll();
    grid.resize(p.width, p.height);
    registry.get(p.mode).generate(grid, p);
    theme.set(p.colorA, p.colorB);
    renderer.render(grid, theme);
    sound.onGenerate();
  }

  function exportPattern() {
    try {
      if (!patternExporter) patternExporter = new PatternPdfExporter();
      patternExporter.export(grid, theme);
      sound.onExport();
    } catch (err) {
      alert(err.message);
    }
  }

  function exportPunchcard() {
    try {
      if (!punchExporter) punchExporter = new PunchcardPdfExporter();
      punchExporter.export(grid);
      sound.onExport();
    } catch (err) {
      alert(err.message);
    }
  }

  new ControlsPanel({
    mount: document.getElementById('cp-sidebar'),
    state,
    sound,
    exportHandlers: { onPattern: exportPattern, onPunchcard: exportPunchcard },
  });

  state.on('change', regenerate);
  window.addEventListener('resize', () => {
    if (grid.width) renderer.render(grid, theme);
  });

  regenerate();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
