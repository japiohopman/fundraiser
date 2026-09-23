import { openQRModal } from '../../ui/qr-modal.js';

/**
 * Handles sharing-specific markup and logic for individual fundraiser cards:
 * Direct opening of the shared QR/share overlay for the specific campaign.
 */

/**
 * Generates the HTML string for the fundraiser card share section.
 * @param {Object} shareContent
 * @param {string} lang
 * @param {string} shareUrl
 * @param {string} titleText
 * @param {string} purposeText
 * @param {string} [itemId]
 * @returns {string}
 */
export function createShareSectionHTML(shareContent, lang, shareUrl, titleText, purposeText, itemId = '') {
  const label = shareContent?.shareAction?.[lang] || 'Delen';

  return `
    <div class="card-share-section">
      <button type="button" class="share-toggle-btn card-share-btn" aria-haspopup="dialog" aria-label="${label} (${titleText})">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="share-icon" aria-hidden="true"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
        <span>${label}</span>
      </button>
    </div>
  `;
}

/**
 * Attaches event listeners to open the shared QR/share overlay directly upon clicking Share.
 * @param {HTMLElement} card
 * @param {Object} state
 * @param {Object} shareContent
 * @param {string} lang
 * @param {string} shareUrl
 * @param {string} titleText
 * @param {string} purposeText
 * @param {string} [qrUrl] - Specific URL to encode in QR modal (defaults to shareUrl if omitted)
 */
export function attachShareListeners(card, state, shareContent, lang, shareUrl, titleText, purposeText, qrUrl = '') {
  const shareBtn = card.querySelector('.share-toggle-btn');

  if (shareBtn) {
    shareBtn.addEventListener('click', (e) => {
      const targetQrUrl = qrUrl || shareUrl;
      const modalTitle = shareContent?.shareTitle?.[lang] || 'Deel deze specifieke actie';
      const descText = shareContent?.qrModalDesc?.[lang] || '';
      const thankYouText = state?.contentData?.thankYou?.message?.[lang] || '';

      openQRModal(state, titleText, targetQrUrl, e.currentTarget, {
        shareUrl,
        modalTitle,
        campaignName: titleText,
        thankYouText,
        descText,
        shareText: purposeText
      });
    });
  }
}
