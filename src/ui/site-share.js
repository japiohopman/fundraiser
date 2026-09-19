import {
  buildWhatsAppUrl,
  buildEmailUrl,
  triggerNativeShare,
  copyToClipboard,
  triggerQRModal
} from './share-actions.js';

export const SITE_SHARE_URL = 'https://japiohopman.github.io/fundraiser';

/**
 * Initializes listeners for the fixed site-wide share button and popover panel.
 * @param {Object} state
 */
export function setupSiteShare(state) {
  const toggleBtn = document.getElementById('site-share-btn');
  const panel = document.getElementById('site-share-panel');
  const nativeBtn = document.getElementById('site-native-share-btn');
  const copyBtn = document.getElementById('site-copy-link-btn');
  const qrBtn = document.getElementById('site-qr-code-btn');

  if (!toggleBtn || !panel) return;

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

  if (nativeBtn) {
    nativeBtn.addEventListener('click', () => {
      const content = state.contentData;
      const lang = state.currentLang;
      const title = content?.meta?.title?.[lang] || 'ParkNest Inzamelingsacties Transparantie';
      const text = content?.hero?.subtitle?.[lang] || title;

      triggerNativeShare({
        title,
        text,
        url: SITE_SHARE_URL
      });
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const content = state.contentData;
      const lang = state.currentLang;
      const feedbackText = content?.share?.linkCopied?.[lang] || 'Link gekopieerd!';
      copyToClipboard(SITE_SHARE_URL, copyBtn, feedbackText);
    });
  }

  if (qrBtn) {
    qrBtn.addEventListener('click', (e) => {
      const content = state.contentData;
      const lang = state.currentLang;
      const title = content?.meta?.title?.[lang] || 'ParkNest Inzamelingsacties Transparantie';
      triggerQRModal(state, title, SITE_SHARE_URL, e.currentTarget);
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
}

/**
 * Updates dynamic localized links, labels, and text for the site-wide share widget.
 * @param {Object} state
 * @param {Object} content
 */
export function updateSiteShareUI(state, content) {
  const lang = state.currentLang;

  const waBtn = document.getElementById('site-wa-share-btn');
  const emailBtn = document.getElementById('site-email-share-btn');
  const nativeBtn = document.getElementById('site-native-share-btn');

  const title = content?.meta?.title?.[lang] || 'ParkNest Inzamelingsacties Transparantie';
  const subtitle = content?.hero?.subtitle?.[lang] || title;

  const waText = `${title}: ${SITE_SHARE_URL}`;
  const emailSubject = title;
  const emailBody = `${subtitle}\n\n${SITE_SHARE_URL}`;

  if (waBtn) {
    waBtn.href = buildWhatsAppUrl(waText);
  }

  if (emailBtn) {
    emailBtn.href = buildEmailUrl(emailSubject, emailBody);
  }

  if (nativeBtn) {
    if (navigator.share) {
      nativeBtn.style.display = 'inline-flex';
    } else {
      nativeBtn.style.display = 'none';
    }
  }
}
