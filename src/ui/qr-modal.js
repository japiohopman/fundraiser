import { QRCodeGen } from './qr-code.js';

/**
 * Handles QR modal setup, opening, closing, focus restoration, focus trapping, and Escape key handling.
 */

/**
 * Initializes QR modal event listeners (close button, overlay click, escape, focus trapping).
 * @param {Object} state
 */
export function setupQRModal(state) {
  const modal = document.getElementById('qr-modal');
  const closeBtn = document.getElementById('qr-modal-close-btn');

  if (!modal || !closeBtn) return;

  closeBtn.addEventListener('click', () => closeQRModal(state));

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeQRModal(state);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.isQRModalOpen) {
      closeQRModal(state);
    } else if (e.key === 'Tab' && state.isQRModalOpen) {
      trapModalFocus(e, modal);
    }
  });
}

/**
 * Traps Tab and Shift+Tab focus inside the modal dialog.
 * @param {KeyboardEvent} e
 * @param {HTMLElement} modal
 */
export function trapModalFocus(e, modal) {
  const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const visibleFocusables = Array.from(focusables).filter(el => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement);

  if (visibleFocusables.length === 0) return;

  const firstEl = visibleFocusables[0];
  const lastEl = visibleFocusables[visibleFocusables.length - 1];

  if (!modal.contains(document.activeElement)) {
    e.preventDefault();
    firstEl?.focus();
    return;
  }

  if (e.shiftKey) {
    if (document.activeElement === firstEl) {
      e.preventDefault();
      lastEl.focus();
    }
  } else {
    if (document.activeElement === lastEl) {
      e.preventDefault();
      firstEl.focus();
    }
  }
}

/**
 * Opens the QR code modal and renders the SVG QR code for the given share URL.
 * @param {Object} state
 * @param {string} titleText
 * @param {string} shareUrl
 * @param {HTMLElement} [triggerEl]
 */
export function openQRModal(state, titleText, shareUrl, triggerEl) {
  const modal = document.getElementById('qr-modal');
  const titleEl = document.getElementById('qr-modal-campaign-name');
  const svgContainer = document.getElementById('qr-code-svg-container');
  const urlEl = document.getElementById('qr-modal-url-text');
  const closeBtn = document.getElementById('qr-modal-close-btn');

  if (!modal || !svgContainer) return;

  state.lastFocusedElement = triggerEl || document.activeElement;

  if (titleEl) titleEl.textContent = titleText;
  if (urlEl) urlEl.textContent = shareUrl;

  try {
    svgContainer.innerHTML = QRCodeGen.createSVG(shareUrl);
  } catch (err) {
    console.error('Failed to generate QR Code:', err);
    svgContainer.textContent = shareUrl;
  }

  modal.classList.add('open');
  modal.removeAttribute('hidden');
  state.isQRModalOpen = true;

  if (closeBtn) {
    setTimeout(() => closeBtn.focus(), 50);
  }
}

/**
 * Closes the QR modal and restores focus to the triggering element.
 * @param {Object} state
 */
export function closeQRModal(state) {
  const modal = document.getElementById('qr-modal');
  if (!modal) return;

  modal.classList.remove('open');
  modal.setAttribute('hidden', '');
  state.isQRModalOpen = false;

  if (state.lastFocusedElement && typeof state.lastFocusedElement.focus === 'function') {
    state.lastFocusedElement.focus();
    state.lastFocusedElement = null;
  }
}
