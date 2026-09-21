import { encodeQR } from '../vendor/qr.js';

/**
 * Standards-compliant QR Code Generator wrapper using paulmillr/qr encoder.
 */
export class QRCodeGen {
  /**
   * Generates a standards-compliant SVG string for any URL with explicit 220x220 production dimensions.
   * @param {string} text
   * @returns {string}
   */
  static createSVG(text) {
    const svg = encodeQR(text, 'svg');
    return svg.replace('<svg ', '<svg width="220" height="220" role="img" aria-label="QR Code" ');
  }
}
