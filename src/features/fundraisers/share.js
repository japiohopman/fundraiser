import {
  triggerNativeShare,
  copyToClipboard,
  triggerQRModal
} from '../../ui/share-actions.js';

/**
 * Handles sharing-specific markup and logic for individual fundraiser cards:
 * Web Share API (native share), Copy Link, and QR code modal trigger.
 */

/**
 * Generates the HTML string for the fundraiser card share section.
 * @param {Object} shareContent
 * @param {string} lang
 * @param {string} shareUrl
 * @param {string} titleText
 * @param {string} purposeText
 * @returns {string}
 */
export function createShareSectionHTML(shareContent, lang, shareUrl, titleText, purposeText, itemId = '') {
  const containerId = itemId ? `share-container-${itemId}` : '';
  const controlsAttr = containerId ? `aria-controls="${containerId}"` : '';

  return `
    <div class="card-share-section">
      <button type="button" class="share-toggle-btn" aria-expanded="false" ${controlsAttr} aria-label="${shareContent?.shareAction?.[lang] || 'Delen'} (${titleText})">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="share-icon" aria-hidden="true"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
        <span>${shareContent?.shareAction?.[lang] || 'Delen'}</span>
      </button>

      <div class="card-share-container" ${containerId ? `id="${containerId}"` : ''} hidden>
        ${typeof navigator !== 'undefined' && navigator.share ? `
          <button type="button" class="share-btn native-share-btn">
            ${shareContent?.webShare?.[lang] || 'Delen...'}
          </button>
        ` : ''}
        <button type="button" class="share-btn copy-link-btn">
          ${shareContent?.copyLink?.[lang] || 'Kopieer link'}
        </button>
        <button type="button" class="share-btn qr-code-btn">
          ${shareContent?.qrCode?.[lang] || 'QR Code'}
        </button>
      </div>
    </div>
  `;
}

/**
 * Attaches event listeners for share toggle, native share, copy link, and QR code modal trigger.
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
  const shareToggleBtn = card.querySelector('.share-toggle-btn');
  const shareContainer = card.querySelector('.card-share-container');
  const nativeShareBtn = card.querySelector('.native-share-btn');
  const copyLinkBtn = card.querySelector('.copy-link-btn');
  const qrCodeBtn = card.querySelector('.qr-code-btn');

  if (shareToggleBtn && shareContainer) {
    shareToggleBtn.addEventListener('click', () => {
      const isExpanded = shareToggleBtn.getAttribute('aria-expanded') === 'true';
      shareToggleBtn.setAttribute('aria-expanded', !isExpanded ? 'true' : 'false');
      shareContainer.hidden = isExpanded;
    });
  }

  if (nativeShareBtn) {
    nativeShareBtn.addEventListener('click', () => {
      triggerNativeShare({
        title: titleText,
        text: purposeText,
        url: shareUrl
      });
    });
  }

  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', () => {
      const feedbackText = shareContent?.copiedFeedback?.[lang] || 'Link gekopieerd!';
      copyToClipboard(shareUrl, copyLinkBtn, feedbackText);
    });
  }

  if (qrCodeBtn) {
    qrCodeBtn.addEventListener('click', (e) => {
      const targetQrUrl = qrUrl || shareUrl;
      triggerQRModal(state, titleText, targetQrUrl, e.currentTarget);
    });
  }
}
