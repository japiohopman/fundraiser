import { encodeQR } from '../vendor/qr.js';

/**
 * Standards-compliant QR Code Generator wrapper using paulmillr/qr encoder.
 */
export class QRCodeGen {
  /**
   * Generates a standards-compliant SVG string for any URL.
   * @param {string} text
   * @returns {string}
   */
  static createSVG(text) {
    return encodeQR(text, 'svg');
  }
}
