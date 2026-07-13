// The single seam between the app and jsPDF. If the PDF library ever changes,
// this is the only file that touches it — the two exporters go through here.
export class PdfDocumentBuilder {
  constructor() {
    const ctor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
    if (!ctor) {
      throw new Error('jsPDF not loaded — check the <script src="vendor/jspdf.min.js"> tag in index.html');
    }
    this._ctor = ctor;
  }

  create({ orientation = 'portrait', unit = 'mm', format = 'a4' } = {}) {
    return new this._ctor({ orientation, unit, format });
  }
}
