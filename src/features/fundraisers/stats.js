import { formatCurrency } from '../../utils/currency.js';

const STATS_I18N = {
  title: {
    nl: 'Inzamelingsstatistieken',
    en: 'Campaign Statistics'
  },
  totalCampaigns: {
    nl: 'Inzamelingsacties',
    en: 'Fundraising campaigns'
  },
  totalDonations: {
    nl: 'Online donaties',
    en: 'Online donations'
  },
  totalRaised: {
    nl: 'Totaal opgehaald',
    en: 'Total raised'
  },
  donationSingular: {
    nl: 'donatie',
    en: 'donation'
  },
  donationPlural: {
    nl: 'donaties',
    en: 'donations'
  },
  snapshotNote: {
    nl: 'Momentopname geverifieerd op {date}',
    en: 'Snapshot verified on {date}'
  }
};

/**
 * Formats a donation count string with proper singular/plural wording.
 * e.g., "1 donatie" or "3 donaties" / "1 donation" or "3 donations"
 * @param {number} count
 * @param {Object} [statsContent]
 * @param {string} [lang]
 * @returns {string}
 */
export function formatDonationCount(count, statsContent = {}, lang = 'nl') {
  const singular = statsContent?.donationSingular?.[lang] || STATS_I18N.donationSingular[lang] || STATS_I18N.donationSingular.nl;
  const plural = statsContent?.donationPlural?.[lang] || STATS_I18N.donationPlural[lang] || STATS_I18N.donationPlural.nl;
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

  const statsContent = content?.fundraisersSection?.stats || {};
  const { totalCampaigns, totalOnlineDonations, totalRaised, latestVerifiedAt } = calculateCampaignStats(fundraisers);

  const regionTitle = statsContent.title?.[lang] || STATS_I18N.title[lang] || STATS_I18N.title.nl;
  const totalCampaignsLabel = statsContent.totalCampaigns?.[lang] || STATS_I18N.totalCampaigns[lang] || STATS_I18N.totalCampaigns.nl;

  const donationWord = totalOnlineDonations === 1
    ? (statsContent.donationSingular?.[lang] || STATS_I18N.donationSingular[lang] || STATS_I18N.donationSingular.nl)
    : (statsContent.donationPlural?.[lang] || STATS_I18N.donationPlural[lang] || STATS_I18N.donationPlural.nl);

  const totalDonationsLabel = lang === 'en' ? `Online ${donationWord}` : `Online ${donationWord}`;
  const totalRaisedLabel = statsContent.totalRaised?.[lang] || STATS_I18N.totalRaised[lang] || STATS_I18N.totalRaised.nl;

  const formattedTotalRaised = formatCurrency(totalRaised, lang);

  const snapshotNoteTemplate = statsContent.snapshotNote?.[lang] || STATS_I18N.snapshotNote[lang] || STATS_I18N.snapshotNote.nl;
  const snapshotNoteText = snapshotNoteTemplate.replace('{date}', latestVerifiedAt);

  container.innerHTML = `
    <div class="stats-strip-card" role="region" aria-label="${regionTitle}">
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
