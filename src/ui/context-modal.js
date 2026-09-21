import { trapModalFocus } from './qr-modal.js';
import { createRooieJaapEquipmentHTML } from '../features/rooie-jaap/equipment.js';

/**
 * Handles context overlay modal setup, opening, closing, focus restoration, focus trapping, and Escape key.
 */

/**
 * Initializes Context Modal listeners.
 * @param {Object} state
 */
export function setupContextModal(state) {
  const modal = document.getElementById('context-modal');
  const closeBtn = document.getElementById('context-modal-close-btn');

  if (!modal || !closeBtn) return;

  closeBtn.addEventListener('click', () => closeContextModal(state));

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeContextModal(state);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.isContextModalOpen) {
      closeContextModal(state);
    } else if (e.key === 'Tab' && state.isContextModalOpen) {
      trapModalFocus(e, modal);
    }
  });
}

/**
 * Opens the Context Modal overlay with details information for a specific campaign.
 * @param {Object} state
 * @param {Object} contextData - Data object with title, text, paragraphs, provenance info, link
 * @param {string} lang - 'nl' or 'en'
 * @param {HTMLElement} [triggerEl]
 * @param {Object} [item] - Fundraiser object from data/fundraisers.json
 */
export function openContextModal(state, contextData, lang, triggerEl, item) {
  const modal = document.getElementById('context-modal');
  const titleEl = document.getElementById('context-modal-title');
  const bodyEl = document.getElementById('context-modal-body');
  const closeBtn = document.getElementById('context-modal-close-btn');

  if (!modal || !bodyEl || !contextData) return;

  state.lastFocusedElement = triggerEl || document.activeElement;

  const titleText = contextData.title ? (contextData.title[lang] || contextData.title.nl) : '';
  if (titleEl) {
    titleEl.textContent = titleText;
  }

  let html = '';

  if (contextData.provenanceBadge) {
    const badgeText = contextData.provenanceBadge[lang] || contextData.provenanceBadge.nl;
    html += `<span class="provenance-badge">${badgeText}</span>`;
  }

  if (contextData.provenanceNote) {
    const noteText = contextData.provenanceNote[lang] || contextData.provenanceNote.nl;
    html += `<p class="provenance-note">${noteText}</p>`;
  }

  if (contextData.images && contextData.images.header) {
    const headerUrl = contextData.images.header;
    const headerAltObj = contextData.images.headerAlt;
    const headerAlt = typeof headerAltObj === 'object' && headerAltObj ? (headerAltObj[lang] || headerAltObj.nl || '') : (typeof headerAltObj === 'string' ? headerAltObj : '');
    const headerCaptionObj = contextData.images.headerCaption;
    const headerCaption = typeof headerCaptionObj === 'object' && headerCaptionObj ? (headerCaptionObj[lang] || headerCaptionObj.nl || '') : (typeof headerCaptionObj === 'string' ? headerCaptionObj : '');
    const headerLink = contextData.images.headerLink;

    let imgEl = `<img src="${headerUrl}" alt="${headerAlt}" class="context-modal-header-image" loading="lazy" decoding="async" onerror="this.parentElement ? this.parentElement.style.display='none' : this.style.display='none'">`;
    if (headerLink) {
      imgEl = `<a href="${headerLink}" target="_blank" rel="noopener noreferrer" class="context-modal-image-link" title="${headerAlt}">${imgEl}</a>`;
    }

    const captionHtml = headerCaption ? `
      <figcaption class="context-modal-image-caption">
        ${headerLink ? `<a href="${headerLink}" target="_blank" rel="noopener noreferrer">${headerCaption}</a>` : headerCaption}
      </figcaption>
    ` : '';

    html += `
      <figure class="context-modal-media context-modal-media-header">
        ${imgEl}
        ${captionHtml}
      </figure>
    `;
  }

  if (contextData.text) {
    const mainText = contextData.text[lang] || contextData.text.nl;
    html += `<p class="context-modal-text">${mainText}</p>`;
  }

  if (contextData.paragraphs && Array.isArray(contextData.paragraphs)) {
    contextData.paragraphs.forEach(pObj => {
      const pText = pObj[lang] || pObj.nl;
      html += `<p class="context-modal-text">${pText}</p>`;
    });
  }

  if (contextData.images && Array.isArray(contextData.images.gallery) && contextData.images.gallery.length > 0) {
    const galleryItems = contextData.images.gallery.map((imgUrl, idx) => {
      const altObj = contextData.images.galleryAlts ? contextData.images.galleryAlts[idx] : null;
      const altText = typeof altObj === 'object' && altObj ? (altObj[lang] || altObj.nl || '') : (typeof altObj === 'string' ? altObj : '');
      const captionObj = contextData.images.galleryCaptions ? contextData.images.galleryCaptions[idx] : null;
      const captionText = typeof captionObj === 'object' && captionObj ? (captionObj[lang] || captionObj.nl || '') : (typeof captionObj === 'string' ? captionObj : '');
      const linkUrl = contextData.images.galleryLinks ? contextData.images.galleryLinks[idx] : null;

      let imgEl = `<img src="${imgUrl}" alt="${altText}" class="context-modal-gallery-image" loading="lazy" decoding="async" onerror="this.parentElement ? this.parentElement.style.display='none' : this.style.display='none'">`;
      if (linkUrl) {
        imgEl = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="context-modal-gallery-link" title="${altText}">${imgEl}</a>`;
      }

      const captionHtml = captionText ? `
        <figcaption class="context-modal-gallery-caption">
          ${linkUrl ? `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${captionText}</a>` : captionText}
        </figcaption>
      ` : '';

      return `
        <figure class="context-modal-gallery-item">
          <div class="context-modal-gallery-thumb">${imgEl}</div>
          ${captionHtml}
        </figure>
      `;
    }).join('');

    html += `
      <div class="context-modal-media context-modal-gallery">
        ${galleryItems}
      </div>
    `;
  }

  if (contextData.link && contextData.link.url) {
    const linkLabel = contextData.link.label ? (contextData.link.label[lang] || contextData.link.label.nl) : contextData.link.url;
    html += `
      <div class="context-modal-actions">
        <a href="${contextData.link.url}" target="_blank" rel="noopener noreferrer" class="context-modal-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          <span>${linkLabel}</span>
        </a>
      </div>
    `;
  }

  // If item is Jaap Hopman (rooie-jaap-knives) or equipmentReferences are present, append equipment documentation
  const equipmentRef = item?.equipmentReferences ||
    state.fundraisersData?.fundraisers?.find(f => f.id === 'rooie-jaap-knives')?.equipmentReferences;

  if ((item?.id === 'rooie-jaap-knives' || item?.id === undefined && equipmentRef) && equipmentRef && state.contentData?.rooieJaapEquipment) {
    html += createRooieJaapEquipmentHTML(state.contentData.rooieJaapEquipment, lang, equipmentRef);
  }

  bodyEl.innerHTML = html;

  modal.classList.add('open');
  modal.removeAttribute('hidden');
  state.isContextModalOpen = true;

  if (closeBtn) {
    setTimeout(() => closeBtn.focus(), 50);
  }
}

/**
 * Closes the Context Modal and restores focus to the triggering button.
 * @param {Object} state
 */
export function closeContextModal(state) {
  const modal = document.getElementById('context-modal');
  if (!modal) return;

  modal.classList.remove('open');
  modal.setAttribute('hidden', '');
  state.isContextModalOpen = false;

  if (state.lastFocusedElement && typeof state.lastFocusedElement.focus === 'function') {
    state.lastFocusedElement.focus();
    state.lastFocusedElement = null;
  }
}
