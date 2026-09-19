import { createFundraiserCard } from './card.js';

/**
 * Renders collective and personal fundraiser card lists into their respective containers.
 * @param {Array} fundraisers
 * @param {Object} content
 * @param {string} lang
 * @param {Object} state
 */
export function renderFundraisers(fundraisers, content, lang, state) {
  const collectiveContainer = document.getElementById('collective-fundraisers-list');
  const personalContainer = document.getElementById('personal-fundraisers-list');

  if (!collectiveContainer || !personalContainer) return;

  collectiveContainer.innerHTML = '';
  personalContainer.innerHTML = '';

  const labels = content.fundraisersSection.labels;

  fundraisers.forEach(item => {
    const card = createFundraiserCard(item, labels, content.share, lang, content, state);
    if (item.category === 'collective') {
      collectiveContainer.appendChild(card);
    } else {
      personalContainer.appendChild(card);
    }
  });
}
