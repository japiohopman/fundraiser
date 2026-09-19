import { openQRModal } from '../../ui/qr-modal.js';

/**
 * Handles sharing-specific markup and logic:
 * Web Share API, WhatsApp URL/text, email share, copy link, and QR code modal trigger.
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
export function createShareSectionHTML(shareContent, lang, shareUrl, titleText, purposeText) {
  const waText = encodeURIComponent(
    lang === 'en'
      ? `Check out this specific fundraiser for ${titleText} (${purposeText}): ${shareUrl}`
      : `Bekijk deze specifieke inzamelingsactie voor ${titleText} (${purposeText}): ${shareUrl}`
  );
  const emailSubject = encodeURIComponent(
    lang === 'en'
      ? `Fundraiser: ${titleText}`
      : `Inzamelingsactie: ${titleText}`
  );
  const emailBody = encodeURIComponent(
    lang === 'en'
      ? `Check out this specific fundraiser for ${titleText}.\n\nPurpose: ${purposeText}\n\nLink: ${shareUrl}`
      : `Bekijk deze specifieke inzamelingsactie voor ${titleText}.\n\nDoel: ${purposeText}\n\nLink: ${shareUrl}`
  );

  return `
    <div class="card-share-section">
      <button type="button" class="share-toggle-btn" aria-expanded="false">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="share-icon"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
        <span>${shareContent?.shareAction?.[lang] || 'Delen'}</span>
      </button>

      <div class="card-share-container" hidden>
        ${navigator.share ? `
          <button type="button" class="share-btn native-share-btn">
            ${shareContent?.webShare?.[lang] || 'Delen...'}
          </button>
        ` : ''}
        <a href="https://wa.me/?text=${waText}" target="_blank" rel="noopener noreferrer" class="share-btn whatsapp-btn">
          ${shareContent?.whatsapp?.[lang] || 'WhatsApp'}
        </a>
        <a href="mailto:?subject=${emailSubject}&body=${emailBody}" class="share-btn email-btn">
          ${shareContent?.email?.[lang] || 'E-mail'}
        </a>
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
 */
export function attachShareListeners(card, state, shareContent, lang, shareUrl, titleText, purposeText) {
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
      if (navigator.share) {
        navigator.share({
          title: titleText,
          text: purposeText,
          url: shareUrl
        }).catch(err => console.log('Native share cancelled:', err));
      }
    });
  }

  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(shareUrl).then(() => {
        const origText = copyLinkBtn.textContent;
        copyLinkBtn.textContent = shareContent?.copiedFeedback?.[lang] || 'Link gekopieerd!';
        copyLinkBtn.classList.add('copied');
        setTimeout(() => {
          copyLinkBtn.textContent = origText;
          copyLinkBtn.classList.remove('copied');
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy link:', err);
      });
    });
  }

  if (qrCodeBtn) {
    qrCodeBtn.addEventListener('click', (e) => {
      openQRModal(state, titleText, shareUrl, e.currentTarget);
    });
  }
}
