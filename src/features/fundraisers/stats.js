import { formatCurrency } from '../../utils/currency.js';

/**
 * Formats a donation count string with proper singular/plural wording.
 * e.g., "1 donatie" or "3 donaties" / "1 donation" or "3 donations"
 * @param {number} count
 * @param {Object} statsContent
 * @param {string} lang
 * @returns {string}
 */
export function formatDonationCount(count, statsContent, lang) {
  const singular = statsContent.donationSingular?.[lang] || (lang === 'en' ? 'donation' : 'donatie');
  const plural = statsContent.donationPlural?.[lang] || (lang === 'en' ? 'donations' : 'donaties');
  const word = count === 1 ? singular : plural;
  return `${count} ${word}`;
}

/**
 * Calculates aggregate stats from the canonical fundraisers array.
 * @param {Array} fundraisers
 * @param {string} lastVerifiedAtFallback
 * @returns {Object} { totalCampaigns, totalOnlineDonations, totalRaised, latestVerifiedAt }
 */
export function calculateCampaignStats(fundraisers, lastVerifiedAtFallback = '2026-09-20') {
  let totalOnlineDonations = 0;
  let totalRaised = 0;
  let latestVerifiedAt = lastVerifiedAtFallback;

  fundraisers.forEach(item => {
    if (item.financials) {
      totalOnlineDonations += item.financials.onlineDonationCount || 0;
      totalRaised += item.financials.displayedTotalRaised || 0;
    }
    if (item.dates?.verifiedAt && item.dates.verifiedAt > latestVerifiedAt) {
      latestVerifiedAt = item.dates.verifiedAt;
    }
  });

  return {
    totalCampaigns: fundraisers.length,
    totalOnlineDonations,
    totalRaised,
    latestVerifiedAt
  };
}

/**
 * Renders the statistics strip element.
 * @param {HTMLElement} container
 * @param {Array} fundraisers
 * @param {Object} content
 * @param {string} lang
 */
export function renderCampaignStats(container, fundraisers, content, lang) {
  if (!container) return;

  const statsContent = content.fundraisersSection?.stats || {};
  const { totalCampaigns, totalOnlineDonations, totalRaised, latestVerifiedAt } = calculateCampaignStats(fundraisers);

  const totalCampaignsLabel = statsContent.totalCampaigns?.[lang] || (lang === 'en' ? 'Fundraising campaigns' : 'Inzamelingsacties');
  const totalDonationsLabel = statsContent.totalDonations?.[lang] || (lang === 'en' ? 'Online donations' : 'Online donaties');
  const totalRaisedLabel = statsContent.totalRaised?.[lang] || (lang === 'en' ? 'Total raised' : 'Totaal opgehaald');

  const formattedTotalRaised = formatCurrency(totalRaised, lang);

  const snapshotNoteTemplate = statsContent.snapshotNote?.[lang] || (lang === 'en' ? 'Snapshot verified on {date}' : 'Momentopname geverifieerd op {date}');
  const snapshotNoteText = snapshotNoteTemplate.replace('{date}', latestVerifiedAt);

  container.innerHTML = `
    <div class="stats-strip-card" role="region" aria-label="${statsContent.title?.[lang] || 'Inzamelingsstatistieken'}">
      <div class="stats-grid">
        <div class="stat-box">
          <span class="stat-number">${totalCampaigns}</span>
          <span class="stat-metric">${totalCampaignsLabel}</span>
        </div>
        <div class="stat-box">
          <span class="stat-number">${totalOnlineDonations}</span>
          <span class="stat-metric">${totalDonationsLabel}</span>
        </div>
        <div class="stat-box">
          <span class="stat-number">${formattedTotalRaised}</span>
          <span class="stat-metric">${totalRaisedLabel}</span>
        </div>
      </div>
      <div class="stats-footer-meta">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        <span>${snapshotNoteText}</span>
      </div>
    </div>
  `;
}
