/**
 * Default fallback identity short names if content dictionary is absent.
 */
const DEFAULT_CAMPAIGN_SHORT_NAMES = {
  'parknest-collective': 'ParkNest',
  'kathinka-dog-collars': 'Kathinka',
  'jim-gijbels-paintings': 'Jim',
  'rooie-jaap-knives': 'Jaap',
  'suzy-creamcheese-kitchenware': 'Suzy',
  'manon-kinkt-shirts': 'Manon'
};

/**
 * Formats a donation count string with proper singular/plural wording from content or fallbacks.
 * e.g., "1 donatie" or "3 donaties" / "1 donation" or "3 donations"
 * @param {number} count
 * @param {string} [lang]
 * @param {Object} [content]
 * @returns {string}
 */
export function formatDonationCount(count, lang = 'nl', content = null) {
  const statsDict = content?.fundraisersSection?.statistics;
  let singular = statsDict?.donationSingular?.[lang];
  let plural = statsDict?.donationPlural?.[lang];

  if (!singular || !plural) {
    singular = lang === 'en' ? 'donation' : 'donatie';
    plural = lang === 'en' ? 'donations' : 'donaties';
  }

  return `${count} ${count === 1 ? singular : plural}`;
}

/**
 * Calculates campaign-level donation counts and latest verifiedAt date.
 * @param {Array} fundraisers
 * @param {string} [lastVerifiedAtFallback]
 * @param {Object} [content]
 * @param {string} [lang]
 * @returns {Object} { campaigns: Array<{ id: string, name: string, count: number }>, latestVerifiedAt: string }
 */
export function calculateCampaignStats(fundraisers, lastVerifiedAtFallback = '2026-09-20', content = null, lang = 'nl') {
  let latestVerifiedAt = lastVerifiedAtFallback;
  const shortNameDict = content?.fundraisersSection?.statistics?.campaignShortNames;

  const campaigns = fundraisers.map(item => {
    if (item.dates?.verifiedAt && item.dates.verifiedAt > latestVerifiedAt) {
      latestVerifiedAt = item.dates.verifiedAt;
    }

    const nameFromContent = shortNameDict?.[item.id]?.[lang];
    const name = nameFromContent || DEFAULT_CAMPAIGN_SHORT_NAMES[item.id] || item.id;

    return {
      id: item.id,
      name,
      count: item.financials?.onlineDonationCount || 0
    };
  });

  return {
    campaigns,
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

  const { campaigns, latestVerifiedAt } = calculateCampaignStats(fundraisers, '2026-09-20', content, lang);

  const statsDict = content?.fundraisersSection?.statistics;
  const regionTitle = statsDict?.title?.[lang] || (lang === 'en' ? 'Campaign Statistics' : 'Inzamelingsstatistieken');

  const snapshotTemplate = statsDict?.snapshotNote?.[lang] || (lang === 'en'
    ? 'Snapshot verified on {date}'
    : 'Momentopname geverifieerd op {date}');
  const snapshotNoteText = snapshotTemplate.replace('{date}', latestVerifiedAt);

  container.innerHTML = `
    <div class="stats-strip-card" role="region" aria-label="${regionTitle}">
      <div class="stats-grid">
        ${campaigns.map(c => `
          <div class="stat-box">
            <span class="stat-metric">${c.name}</span>
            <span class="stat-number">${formatDonationCount(c.count, lang, content)}</span>
          </div>
        `).join('')}
      </div>
      <div class="stats-footer-meta">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        <span>${snapshotNoteText}</span>
      </div>
    </div>
  `;
}
