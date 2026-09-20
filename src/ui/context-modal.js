import { trapModalFocus } from './qr-modal.js';

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
 * Opens the Context Modal with context information for a specific campaign.
 * @param {Object} state
 * @param {Object} contextData - Data object from contentData.fundraisersSection.campaignContext[item.id]
 * @param {string} lang - 'nl' or 'en'
 * @param {HTMLElement} [triggerEl]
 */
export function openContextModal(state, contextData, lang, triggerEl) {
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
