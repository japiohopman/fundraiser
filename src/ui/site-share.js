import { openQRModal, closeQRModal } from './qr-modal.js';

export const SITE_SHARE_URL = 'https://japiohopman.github.io/fundraiser';

/**
 * Initializes listeners for the fixed site-wide share button.
 * @param {Object} state
 */
export function setupSiteShare(state) {
  const toggleBtn = document.getElementById('site-share-btn');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSiteSharePanel(state);
  });
}

/**
 * Opens or closes the shared QR/share overlay for the canonical site URL.
 * @param {Object} state
 * @param {boolean} [forceState]
 */
export function toggleSiteSharePanel(state, forceState) {
  const toggleBtn = document.getElementById('site-share-btn');
  const lang = state.currentLang || 'nl';
  const content = state.contentData || {};

  const shouldOpen = forceState !== undefined ? forceState : !state.isQRModalOpen;

  if (shouldOpen) {
    const siteShareTitle = content?.share?.siteShareTitle?.[lang] || 'Deel deze website';
    const siteShareDesc = content?.share?.siteShareDesc?.[lang] || '';
    const thankYouText = content?.thankYou?.message?.[lang] || '';
    const shareText = (content?.share?.siteShareMessage?.[lang] || '').replace('{url}', SITE_SHARE_URL);

    openQRModal(state, siteShareTitle, SITE_SHARE_URL, toggleBtn, {
      shareUrl: SITE_SHARE_URL,
      modalTitle: siteShareTitle,
      campaignName: '',
      thankYouText,
      descText: siteShareDesc,
      shareText
    });
  } else {
    closeQRModal(state);
  }
}

/**
 * Updates dynamic localized links, labels, and text for the site-wide share widget.
 * @param {Object} state
 * @param {Object} content
 */
export function updateSiteShareUI(state, content) {
  // Site share now leverages openQRModal dynamically when opened.
}
