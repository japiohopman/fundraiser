import { createFundraiserCard } from './card.js';
import { renderCampaignStats } from './stats.js';

/**
 * Renders the campaign statistics strip and unified fundraiser card grid.
 * @param {Array} fundraisers
 * @param {Object} content
 * @param {string} lang
 * @param {Object} state
 */
export function renderFundraisers(fundraisers, content, lang, state) {
  const statsContainer = document.getElementById('campaign-stats-strip');
  const unifiedContainer = document.getElementById('unified-fundraisers-list') ||
    document.getElementById('collective-fundraisers-list') ||
    document.getElementById('personal-fundraisers-list');

  if (statsContainer) {
    renderCampaignStats(statsContainer, fundraisers, content, lang);
  }

  if (!unifiedContainer) return;

  // Clear container
  unifiedContainer.innerHTML = '';

  // Legacy fallback containers if still present
  const collectiveContainer = document.getElementById('collective-fundraisers-list');
  const personalContainer = document.getElementById('personal-fundraisers-list');
  if (collectiveContainer && collectiveContainer !== unifiedContainer) collectiveContainer.innerHTML = '';
  if (personalContainer && personalContainer !== unifiedContainer) personalContainer.innerHTML = '';

  const labels = content.fundraisersSection.labels;

  fundraisers.forEach(item => {
    const card = createFundraiserCard(item, labels, content.share, lang, content, state);
    if (unifiedContainer && unifiedContainer.id === 'unified-fundraisers-list') {
      unifiedContainer.appendChild(card);
    } else if (item.category === 'collective' && collectiveContainer) {
      collectiveContainer.appendChild(card);
    } else if (personalContainer) {
      personalContainer.appendChild(card);
    }
  });
}
