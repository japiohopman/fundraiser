import { openQRModal } from './qr-modal.js';

/**
 * Generic sharing utilities for native share, WhatsApp, Email, Clipboard copy, and QR Code modal.
 */

/**
 * Builds a WhatsApp share URL with encoded text.
 * @param {string} text
 * @returns {string}
 */
export function buildWhatsAppUrl(text) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/**
 * Builds a mailto URL with encoded subject and body.
 * @param {string} subject
 * @param {string} body
 * @returns {string}
 */
export function buildEmailUrl(subject, body) {
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Triggers native Web Share API if supported.
 * @param {Object} options
 * @param {string} options.title
 * @param {string} options.text
 * @param {string} options.url
 * @returns {Promise<void>}
 */
export function triggerNativeShare({ title, text, url }) {
  if (navigator.share) {
    return navigator.share({ title, text, url }).catch(err => {
      console.log('Native share cancelled:', err);
    });
  }
  return Promise.reject(new Error('Native share not supported'));
}

/**
 * Copies the given URL to clipboard and temporarily updates button text/class for feedback, preserving SVG icons and child elements.
 * @param {string} url
 * @param {HTMLElement} [buttonEl]
 * @param {string} [feedbackText]
 * @returns {Promise<void>}
 */
export function copyToClipboard(url, buttonEl, feedbackText = 'Link gekopieerd!') {
  if (!navigator.clipboard) {
    return Promise.reject(new Error('Clipboard API not available'));
  }
  return navigator.clipboard.writeText(url).then(() => {
    if (buttonEl) {
      const targetLabelEl = buttonEl.querySelector('[data-i18n]') || buttonEl.querySelector('span') || buttonEl;
      const origText = targetLabelEl.textContent;
      targetLabelEl.textContent = feedbackText;
      buttonEl.classList.add('copied');
      setTimeout(() => {
        targetLabelEl.textContent = origText;
        buttonEl.classList.remove('copied');
      }, 2000);
    }
  }).catch(err => {
    console.error('Failed to copy link:', err);
  });
}

/**
 * Triggers the site's QR code modal for a given URL and title.
 * @param {Object} state
 * @param {string} titleText
 * @param {string} shareUrl
 * @param {HTMLElement} [triggerEl]
 */
export function triggerQRModal(state, titleText, shareUrl, triggerEl) {
  openQRModal(state, titleText, shareUrl, triggerEl);
}
