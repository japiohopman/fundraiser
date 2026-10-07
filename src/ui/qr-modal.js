import { QRCodeGen } from './qr-code.js';
import { copyToClipboard, triggerNativeShare } from './share-actions.js';

/**
 * Handles QR/Share modal setup, opening, closing, focus restoration, focus trapping, and Escape key handling.
 */

let qrModalFocusTimeout = null;
let currentShareTargetUrl = '';
let currentTitleText = '';
let currentShareText = '';

/**
 * Initializes QR modal event listeners (close button, overlay click, escape, focus trapping, action buttons).
 * @param {Object} state
 */
export function setupQRModal(state) {
  const modal = document.getElementById('qr-modal');
  const closeBtn = document.getElementById('qr-modal-close-btn');
  const copyBtn = document.getElementById('qr-modal-copy-link-btn');
  const nativeBtn = document.getElementById('qr-modal-native-share-btn');

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

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const content = state.contentData;
      const lang = state.currentLang;
      const feedbackText = content?.share?.linkCopied?.[lang] || 'Link gekopieerd!';
      copyToClipboard(currentShareTargetUrl, copyBtn, feedbackText);
    });
  }

  if (nativeBtn) {
    nativeBtn.addEventListener('click', () => {
      triggerNativeShare({
        title: currentTitleText,
        text: currentShareText,
        url: currentShareTargetUrl
      });
    });
  }
}

/**
 * Traps Tab and Shift+Tab focus inside the modal dialog.
 * @param {KeyboardEvent} e
 * @param {HTMLElement} modal
 */
export function trapModalFocus(e, modal) {
  const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const visibleFocusables = Array.from(focusables).filter(el => !el.hidden && (el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement));

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
 * Opens the QR code / share modal and renders the SVG QR code and action controls for the given share target.
 * @param {Object} state
 * @param {string} titleText
 * @param {string} qrUrl
 * @param {HTMLElement} [triggerEl]
 * @param {Object} [options]
 * @param {string} [options.shareUrl] - URL to copy or share via Web Share API
 * @param {string} [options.modalTitle] - Title string for the modal header
 * @param {string} [options.campaignName] - Subtitle / campaign name text
 * @param {string} [options.thankYouText] - Custom thank-you message text
 * @param {string} [options.descText] - Custom description text above QR
 * @param {string} [options.shareText] - Purpose or summary text for Native Share API
 */
export function openQRModal(state, titleText, qrUrl, triggerEl, options = {}) {
  const modal = document.getElementById('qr-modal');
  const modalTitleEl = document.getElementById('qr-modal-title');
  const campaignNameEl = document.getElementById('qr-modal-campaign-name');
  const thankYouEl = document.getElementById('qr-modal-thank-you');
  const descEl = document.getElementById('qr-modal-desc');
  const svgContainer = document.getElementById('qr-code-svg-container');
  const urlEl = document.getElementById('qr-modal-url-text');
  const closeBtn = document.getElementById('qr-modal-close-btn');
  const nativeBtn = document.getElementById('qr-modal-native-share-btn');

  if (!modal || !svgContainer) return;

  const lang = state.currentLang || 'nl';
  const content = state.contentData || {};

  state.lastFocusedElement = triggerEl || document.activeElement;

  currentShareTargetUrl = options.shareUrl || qrUrl;
  currentTitleText = titleText;
  currentShareText = options.shareText || '';

  if (modalTitleEl) {
    modalTitleEl.textContent = options.modalTitle || content?.share?.qrModalTitle?.[lang] || 'QR-code voor donatiepagina';
  }

  if (campaignNameEl) {
    campaignNameEl.textContent = options.campaignName !== undefined ? options.campaignName : titleText;
    if (campaignNameEl.style) campaignNameEl.style.display = campaignNameEl.textContent ? 'block' : 'none';
  }

  if (thankYouEl) {
    thankYouEl.textContent = options.thankYouText || content?.thankYou?.message?.[lang] || '';
    if (thankYouEl.style) thankYouEl.style.display = thankYouEl.textContent ? 'block' : 'none';
  }

  if (descEl) {
    descEl.textContent = options.descText || content?.share?.qrModalDesc?.[lang] || '';
  }

  if (urlEl) {
    urlEl.textContent = qrUrl;
  }

  try {
    svgContainer.innerHTML = QRCodeGen.createSVG(qrUrl);
  } catch (err) {
    console.error('Failed to generate QR Code:', err);
    svgContainer.textContent = qrUrl;
  }

  if (nativeBtn) {
    if (typeof navigator !== 'undefined' && navigator.share) {
      nativeBtn.removeAttribute('hidden');
    } else {
      nativeBtn.setAttribute('hidden', '');
    }
  }

  modal.classList.add('open');
  modal.removeAttribute('hidden');
  state.isQRModalOpen = true;

  if (qrModalFocusTimeout) {
    clearTimeout(qrModalFocusTimeout);
    qrModalFocusTimeout = null;
  }

  if (closeBtn) {
    qrModalFocusTimeout = setTimeout(() => {
      qrModalFocusTimeout = null;
      if (state.isQRModalOpen && !modal.hidden && (document.body?.contains ? document.body.contains(closeBtn) : true)) {
        closeBtn.focus();
      }
    }, 50);
  }
}

/**
 * Closes the QR modal and restores focus to the triggering element.
 * @param {Object} state
 */
export function closeQRModal(state) {
  const modal = document.getElementById('qr-modal');
  if (!modal) return;

  if (qrModalFocusTimeout) {
    clearTimeout(qrModalFocusTimeout);
    qrModalFocusTimeout = null;
  }

  modal.classList.remove('open');
  modal.setAttribute('hidden', '');
  state.isQRModalOpen = false;

  if (state.lastFocusedElement && typeof state.lastFocusedElement.focus === 'function') {
    state.lastFocusedElement.focus();
    state.lastFocusedElement = null;
  }
}
