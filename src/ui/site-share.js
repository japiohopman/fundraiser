import { copyToClipboard } from './share-actions.js';
import { QRCodeGen } from './qr-code.js';

export const SITE_SHARE_URL = 'https://japiohopman.github.io/fundraiser';

let siteShareFocusTimeout = null;

/**
 * Generates and renders the SVG QR code for the site-wide URL.
 */
export function renderSiteQR() {
  const container = document.getElementById('site-qr-code-svg-container');
  if (!container) return;
  try {
    container.innerHTML = QRCodeGen.createSVG(SITE_SHARE_URL);
  } catch (err) {
    console.error('Failed to generate Site QR Code:', err);
    container.textContent = SITE_SHARE_URL;
  }
}

/**
 * Initializes listeners for the fixed site-wide share button and popover panel.
 * @param {Object} state
 */
export function setupSiteShare(state) {
  const toggleBtn = document.getElementById('site-share-btn');
  const panel = document.getElementById('site-share-panel');
  const copyBtn = document.getElementById('site-copy-link-btn');

  if (!toggleBtn || !panel) return;

  renderSiteQR();

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSiteSharePanel(state);
  });

  panel.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  document.addEventListener('click', (e) => {
    if (state.isSiteShareOpen && !e.target.closest('.site-share-widget')) {
      toggleSiteSharePanel(state, false);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.isSiteShareOpen) {
      toggleSiteSharePanel(state, false);
      toggleBtn.focus();
    }
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const content = state.contentData;
      const lang = state.currentLang;
      const feedbackText = content?.share?.linkCopied?.[lang];
      copyToClipboard(SITE_SHARE_URL, copyBtn, feedbackText);
    });
  }
}

/**
 * Toggles or explicitly sets the site share popover panel open state.
 * @param {Object} state
 * @param {boolean} [forceState]
 */
export function toggleSiteSharePanel(state, forceState) {
  const toggleBtn = document.getElementById('site-share-btn');
  const panel = document.getElementById('site-share-panel');
  if (!toggleBtn || !panel) return;

  state.isSiteShareOpen = forceState !== undefined ? forceState : !state.isSiteShareOpen;

  toggleBtn.setAttribute('aria-expanded', state.isSiteShareOpen ? 'true' : 'false');
  panel.hidden = !state.isSiteShareOpen;
  panel.classList.toggle('open', state.isSiteShareOpen);

  if (siteShareFocusTimeout) {
    clearTimeout(siteShareFocusTimeout);
    siteShareFocusTimeout = null;
  }

  if (state.isSiteShareOpen) {
    renderSiteQR();
    const firstAction = panel.querySelector('.site-share-action-btn');
    if (firstAction) {
      siteShareFocusTimeout = setTimeout(() => {
        siteShareFocusTimeout = null;
        if (state.isSiteShareOpen && !panel.hidden) {
          firstAction.focus();
        }
      }, 50);
    }
  }
}

/**
 * Updates dynamic localized links, labels, and text for the site-wide share widget.
 * @param {Object} state
 * @param {Object} content
 */
export function updateSiteShareUI(state, content) {
  renderSiteQR();
  const urlText = document.getElementById('site-share-url-text');
  if (urlText) {
    urlText.textContent = SITE_SHARE_URL;
  }
}
