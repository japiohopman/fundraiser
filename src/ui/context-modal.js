import { trapModalFocus } from './qr-modal.js';
import { createRooieJaapEquipmentHTML } from '../features/rooie-jaap/equipment.js';

/**
 * Handles context overlay modal setup, opening, closing, focus restoration, focus trapping, and Escape key.
 */

let contextModalFocusTimeout = null;

/**
 * Initializes Context Modal listeners.
 * @param {Object} state
 */
export function setupContextModal(state) {
  const modal = document.getElementById('context-modal');
  const closeBtn = document.getElementById('context-modal-close-btn');
  const bodyEl = document.getElementById('context-modal-body');

  if (!modal || !closeBtn) return;

  closeBtn.addEventListener('click', () => closeContextModal(state));

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeContextModal(state);
    }
  });

  if (bodyEl) {
    bodyEl.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#fundraiser-"]');
      if (link) {
        e.preventDefault();
        const href = link.getAttribute('href');
        const targetId = href.substring(1);
        closeContextModal(state);
        window.location.hash = href;
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
          if (typeof targetEl.focus === 'function') {
            targetEl.focus();
          }
        }
      }
    });
  }

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
    const formattedNote = formatInternalModalLinks(noteText, item?.id);
    html += `<p class="provenance-note">${formattedNote}</p>`;
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
    const formattedMainText = formatInternalModalLinks(mainText, item?.id);
    html += `<p class="context-modal-text">${formattedMainText}</p>`;
  }

  if (contextData.paragraphs && Array.isArray(contextData.paragraphs)) {
    contextData.paragraphs.forEach(pObj => {
      const pText = pObj[lang] || pObj.nl;
      const formattedPText = formatInternalModalLinks(pText, item?.id);
      html += `<p class="context-modal-text">${formattedPText}</p>`;
    });
  }

  if (contextData.sections && Array.isArray(contextData.sections)) {
    contextData.sections.forEach(sec => {
      if (sec.heading) {
        const headingText = sec.heading[lang] || sec.heading.nl;
        html += `<h4 class="context-modal-section-title">${headingText}</h4>`;
      }
      if (sec.text) {
        const secText = sec.text[lang] || sec.text.nl;
        html += `<p class="context-modal-text">${secText}</p>`;
      }
      if (sec.paragraphs && Array.isArray(sec.paragraphs)) {
        sec.paragraphs.forEach(pObj => {
          const pText = pObj[lang] || pObj.nl;
          html += `<p class="context-modal-text">${pText}</p>`;
        });
      }
      if (sec.bullets && Array.isArray(sec.bullets)) {
        html += `<ul class="context-modal-list">`;
        sec.bullets.forEach(bObj => {
          const bText = typeof bObj === 'object' && bObj ? (bObj[lang] || bObj.nl) : bObj;
          html += `<li>${bText}</li>`;
        });
        html += `</ul>`;
      }
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

  const donateUrl = item?.donateUrl || contextData?.donateUrl;
  const contextDonateBtnLabel = state.contentData?.fundraisersSection?.labels?.contextDonateBtn?.[lang] ||
    (lang === 'en' ? 'Donate on WhyDonate' : 'Doneer op WhyDonate');

  const hasLink = contextData.link && contextData.link.url;

  if (donateUrl || hasLink) {
    html += `<div class="context-modal-actions">`;

    if (donateUrl) {
      html += `
        <a href="${donateUrl}" target="_blank" rel="noopener noreferrer" class="donate-btn context-modal-donate-btn">
          <svg class="donate-btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" aria-hidden="true" width="16" height="16">
            <path d="M298.9 24.31c-14.9.3-25.6 3.2-32.7 8.4l-97.3 52.1-54.1 73.59c-11.4 17.6-3.3 51.6 32.3 29.8l39-51.4c49.5-42.69 150.5-23.1 102.6 62.6-23.5 49.6-12.5 73.8 17.8 84l13.8-46.4c23.9-53.8 68.5-63.5 66.7-106.9l107.2 7.7-1-112.09-194.3-1.4zM244.8 127.7c-17.4-.3-34.5 6.9-46.9 17.3l-39.1 51.4c10.7 8.5 21.5 3.9 32.2-6.4 12.6 6.4 22.4-3.5 30.4-23.3 3.3-13.5 8.2-23 23.4-39zm-79.6 96c-.4 0-.9 0-1.3.1-3.3.7-7.2 4.2-9.8 12.2-2.7 8-3.3 19.4-.9 31.6 2.4 12.1 7.4 22.4 13 28.8 5.4 6.3 10.4 8.1 13.7 7.4 3.4-.6 7.2-4.2 9.8-12.1 2.7-8 3.4-19.5 1-31.6-2.5-12.2-7.5-22.5-13-28.8-4.8-5.6-9.2-7.6-12.5-7.6zm82.6 106.8c-7.9.1-17.8 2.6-27.5 7.3-11.1 5.5-19.8 13.1-24.5 20.1-4.7 6.9-5.1 12.1-3.6 15.2 1.5 3 5.9 5.9 14.3 6.3 8.4.5 19.7-1.8 30.8-7.3 11.1-5.5 19.8-13 24.5-20 4.7-6.9 5.1-12.2 3.6-15.2-1.5-3.1-5.9-5.9-14.3-6.3-1.1-.1-2.1-.1-3.3-.1zm-97.6 95.6c-4.7.1-9 .8-12.8 1.9-8.5 2.5-13.4 7-15 12.3-1.7 5.4 0 11.8 5.7 18.7 5.8 6.8 15.5 13.3 27.5 16.9 11.9 3.6 23.5 3.5 32.1.9 8.6-2.5 13.5-7 15.1-12.3 1.6-5.4 0-11.8-5.8-18.7-5.7-6.8-15.4-13.3-27.4-16.9-6.8-2-13.4-2.9-19.4-2.8z"></path>
          </svg>
          <span>${contextDonateBtnLabel}</span>
        </a>
      `;
    }

    if (hasLink) {
      const linkLabel = contextData.link.label ? (contextData.link.label[lang] || contextData.link.label.nl) : contextData.link.url;
      html += `
        <a href="${contextData.link.url}" target="_blank" rel="noopener noreferrer" class="context-modal-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          <span>${linkLabel}</span>
        </a>
      `;
    }

    html += `</div>`;
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

  if (contextModalFocusTimeout) {
    clearTimeout(contextModalFocusTimeout);
    contextModalFocusTimeout = null;
  }

  if (closeBtn) {
    contextModalFocusTimeout = setTimeout(() => {
      contextModalFocusTimeout = null;
      if (state.isContextModalOpen && !modal.hidden && (document.body?.contains ? document.body.contains(closeBtn) : true)) {
        closeBtn.focus();
      }
    }, 50);
  }
}

/**
 * Scoped data-driven campaign cross-reference definitions.
 */
const CAMPAIGN_CROSS_REFERENCES = [
  {
    sourceCampaignId: 'rooie-jaap-knives',
    targetCampaignId: 'suzy-creamcheese-kitchenware',
    pattern: /Suzy Creamcheese/g,
    label: 'Suzy Creamcheese'
  },
  {
    sourceCampaignId: 'suzy-creamcheese-kitchenware',
    targetCampaignId: 'rooie-jaap-knives',
    pattern: /Jaap Hopman/g,
    label: 'Jaap Hopman'
  }
];

/**
 * Helper to dynamically convert explicit campaign cross-references into internal modal links.
 * @param {string} text
 * @param {string} [sourceCampaignId]
 * @returns {string}
 */
function formatInternalModalLinks(text, sourceCampaignId) {
  if (!text || !sourceCampaignId) return text || '';

  let formatted = text;

  CAMPAIGN_CROSS_REFERENCES.forEach(({ sourceCampaignId: refSource, targetCampaignId, pattern, label }) => {
    if (sourceCampaignId === refSource && pattern.test(formatted)) {
      formatted = formatted.replace(
        pattern,
        `<a href="#fundraiser-${targetCampaignId}" class="modal-internal-link">${label}</a>`
      );
    }
  });

  return formatted;
}

/**
 * Closes the Context Modal and restores focus to the triggering button.
 * @param {Object} state
 */
export function closeContextModal(state) {
  const modal = document.getElementById('context-modal');
  if (!modal) return;

  if (contextModalFocusTimeout) {
    clearTimeout(contextModalFocusTimeout);
    contextModalFocusTimeout = null;
  }

  modal.classList.remove('open');
  modal.setAttribute('hidden', '');
  state.isContextModalOpen = false;

  if (state.lastFocusedElement && typeof state.lastFocusedElement.focus === 'function') {
    state.lastFocusedElement.focus();
    state.lastFocusedElement = null;
  }
}
