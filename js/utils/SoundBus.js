// Sound effects are a v1 nice-to-have. This is a deliberate stub: named hooks
// that currently do nothing, so the real audio system can be dropped in later
// without touching call sites in main.js / the UI.
export class SoundBus {
  constructor({ enabled = false } = {}) {
    this.enabled = enabled;
  }

  onGenerate() {}
  onExport() {}
  onModeChange() {}
}
