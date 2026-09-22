import { formatCurrency, formatPercentage } from '../../utils/currency.js';

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

const CAMPAIGN_AVATAR_MAP = {
  'parknest-collective': 'parknest-avatar',
  'kathinka-dog-collars': 'kathinka-avatar',
  'jim-gijbels-paintings': 'jim-avatar',
  'rooie-jaap-knives': 'jaaphopman_avatar',
  'suzy-creamcheese-kitchenware': 'suzy-avatar',
  'manon-kinkt-shirts': 'manon-avatar'
};

/**
 * Visual styling palette for campaigns (colors and non-color geometric legend symbols).
 */
const CAMPAIGN_PALETTE = {
  'parknest-collective': {
    color: '#166534',
    symbolSVG: `<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="currentColor"/></svg>`
  },
  'kathinka-dog-collars': {
    color: '#4338ca',
    symbolSVG: `<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><rect x="1" y="1" width="14" height="14" rx="2" fill="currentColor"/></svg>`
  },
  'jim-gijbels-paintings': {
    color: '#0284c7',
    symbolSVG: `<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><polygon points="8,1 15,15 1,15" fill="currentColor"/></svg>`
  },
  'rooie-jaap-knives': {
    color: '#d97706',
    symbolSVG: `<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><polygon points="8,1 15,8 8,15 1,8" fill="currentColor"/></svg>`
  },
  'suzy-creamcheese-kitchenware': {
    color: '#7c3aed',
    symbolSVG: `<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><polygon points="8,1 15,5 15,11 8,15 1,11 1,5" fill="currentColor"/></svg>`
  },
  'manon-kinkt-shirts': {
    color: '#e11d48',
    symbolSVG: `<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><polygon points="8,1 10,6 15,6 11,9 13,15 8,11 3,15 5,9 1,6 6,6" fill="currentColor"/></svg>`
  }
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
 * Calculates campaign-level statistics, distribution totals, and percentages.
 * @param {Array} fundraisers
 * @param {string} [lastVerifiedAtFallback]
 * @param {Object} [content]
 * @param {string} [lang]
 * @returns {Object}
 */
export function calculateCampaignStats(fundraisers, lastVerifiedAtFallback = '2026-09-20', content = null, lang = 'nl') {
  let latestVerifiedAt = lastVerifiedAtFallback;
  const shortNameDict = content?.fundraisersSection?.statistics?.campaignShortNames;

  let totalAmount = 0;
  fundraisers.forEach(item => {
    totalAmount += item.financials?.displayedTotalRaised || 0;
  });

  const campaigns = fundraisers.map(item => {
    if (item.dates?.verifiedAt && item.dates.verifiedAt > latestVerifiedAt) {
      latestVerifiedAt = item.dates.verifiedAt;
    }

    const nameFromContent = shortNameDict?.[item.id]?.[lang];
    const name = nameFromContent || DEFAULT_CAMPAIGN_SHORT_NAMES[item.id] || item.id;
    const count = item.financials?.onlineDonationCount || 0;
    const amount = item.financials?.displayedTotalRaised || 0;
    const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
    const palette = CAMPAIGN_PALETTE[item.id] || {
      color: '#475569',
      symbolSVG: `<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="currentColor"/></svg>`
    };
    const avatarName = CAMPAIGN_AVATAR_MAP[item.id] || null;

    return {
      id: item.id,
      name,
      avatarName,
      count,
      amount,
      formattedAmount: formatCurrency(amount, lang),
      percentage,
      formattedPercentage: formatPercentage(percentage, lang),
      category: item.category || 'personal',
      color: palette.color,
      symbolSVG: palette.symbolSVG
    };
  });

  return {
    campaigns,
    totalAmount,
    formattedTotalAmount: formatCurrency(totalAmount, lang),
    latestVerifiedAt
  };
}

/**
 * Renders the statistics strip element including the donation distribution donut chart and legend.
 * @param {HTMLElement} container
 * @param {Array} fundraisers
 * @param {Object} content
 * @param {string} lang
 */
export function renderCampaignStats(container, fundraisers, content, lang = 'nl') {
  if (!container) return;

  const { campaigns, totalAmount, formattedTotalAmount, latestVerifiedAt } = calculateCampaignStats(
    fundraisers,
    '2026-09-20',
    content,
    lang
  );

  const statsDict = content?.fundraisersSection?.statistics;
  const regionTitle = statsDict?.title?.[lang] || (lang === 'en' ? 'Campaign Statistics' : 'Inzamelingsstatistieken');

  const distributionTitle = statsDict?.distributionTitle?.[lang] || (lang === 'en'
    ? 'Donation Distribution Across Campaigns'
    : 'Verdeling Geregistreerd Donatiebedrag');

  const totalRegisteredLabel = statsDict?.totalRegisteredLabel?.[lang] || (lang === 'en'
    ? 'Total registered'
    : 'Totaal geregistreerd');

  const donationCountsTitle = statsDict?.donationCountsTitle?.[lang] || (lang === 'en'
    ? 'Online Donations per Campaign'
    : 'Aantal Online Donaties per Actie');

  const snapshotTemplate = statsDict?.snapshotNote?.[lang] || (lang === 'en'
    ? 'Snapshot verified on {date}'
    : 'Momentopname geverifieerd op {date}');
  const snapshotNoteText = snapshotTemplate.replace('{date}', latestVerifiedAt);

  // SVG Donut Calculations
  const radius = 70;
  const circumference = 2 * Math.PI * radius; // ~439.82297
  let cumulativeOffset = 0;

  const segmentsHTML = campaigns.map(c => {
    const rawDash = (c.percentage / 100) * circumference;
    // Enforce minimum visual arc length (~1.5px) for very small segments so they remain visible
    const dashLength = c.percentage > 0 ? Math.max(rawDash, 1.5) : 0;
    const gapLength = Math.max(circumference - dashLength, 0);
    const strokeOffset = -cumulativeOffset;

    cumulativeOffset += rawDash;

    return `
      <circle
        class="donut-segment"
        data-campaign-id="${c.id}"
        cx="100"
        cy="100"
        r="${radius}"
        fill="transparent"
        stroke="${c.color}"
        stroke-width="16"
        stroke-dasharray="${dashLength.toFixed(4)} ${gapLength.toFixed(4)}"
        stroke-dashoffset="${strokeOffset.toFixed(4)}"
        tabindex="0"
        role="link"
        aria-label="${c.name}: ${c.formattedAmount} (${c.formattedPercentage})"
      >
        <title>${c.name}: ${c.formattedAmount} (${c.formattedPercentage})</title>
      </circle>
    `;
  }).join('');

  const chartTitleText = lang === 'en'
    ? 'Donut chart showing registered donation distribution across campaigns'
    : 'Cirkeldiagram verdeling geregistreerd donatiebedrag over de acties';

  const chartDescText = campaigns
    .map(c => `${c.name}: ${c.formattedAmount} (${c.formattedPercentage})`)
    .join(', ') + `. ${totalRegisteredLabel}: ${formattedTotalAmount}.`;

  container.innerHTML = `
    <div class="stats-strip-card" role="region" aria-label="${regionTitle}">
      <div class="stats-distribution-section">
        <h3 class="stats-section-title">${distributionTitle}</h3>

        <div class="donut-chart-wrapper">
          <div class="donut-svg-container">
            <svg
              class="donut-svg"
              viewBox="0 0 200 200"
              width="200"
              height="200"
              role="img"
              aria-labelledby="donut-chart-title-${lang} donut-chart-desc-${lang}"
            >
              <title id="donut-chart-title-${lang}">${chartTitleText}</title>
              <desc id="donut-chart-desc-${lang}">${chartDescText}</desc>
              <g transform="rotate(-90 100 100)" class="donut-segments-group">
                ${segmentsHTML}
              </g>
              <g class="donut-center-group">
                <text x="100" y="95" text-anchor="middle" class="donut-center-label">${totalRegisteredLabel}</text>
                <text x="100" y="115" text-anchor="middle" class="donut-center-value">${formattedTotalAmount}</text>
              </g>
            </svg>
          </div>

          <div class="donut-legend-container">
            <ul class="donut-legend-list" role="list">
              ${campaigns.map(c => `
                <li class="donut-legend-item" data-campaign-id="${c.id}" role="listitem">
                  <a href="#fundraiser-${c.id}" class="legend-item-link">
                    <div class="legend-avatar-badge-wrapper" style="--symbol-color: ${c.color}">
                      ${c.avatarName ? `
                        <picture class="legend-avatar-wrapper">
                          <source srcset="public/assets/${c.avatarName}.webp" type="image/webp">
                          <img src="public/assets/${c.avatarName}.webp" alt="" class="legend-avatar-img" width="32" height="32" loading="lazy" decoding="async">
                        </picture>
                      ` : ''}
                      <span class="legend-symbol-badge" aria-hidden="true">${c.symbolSVG}</span>
                    </div>
                    <div class="legend-text">
                      <span class="legend-name">${c.name}</span>
                      <span class="legend-details">
                        <strong class="legend-amount">${c.formattedAmount}</strong>
                        <span class="legend-percentage">(${c.formattedPercentage})</span>
                      </span>
                    </div>
                  </a>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      </div>

      <div class="stats-counts-section">
        <h3 class="stats-counts-title">${donationCountsTitle}</h3>
        <div class="stats-grid">
          ${campaigns.map(c => `
            <a href="#fundraiser-${c.id}" class="stat-box-link">
              <div class="stat-box" data-campaign-id="${c.id}">
                <span class="stat-metric">${c.name}</span>
                <span class="stat-number">${formatDonationCount(c.count, lang, content)}</span>
              </div>
            </a>
          `).join('')}
        </div>
      </div>

      <div class="stats-footer-meta">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        <span>${snapshotNoteText}</span>
      </div>
    </div>
  `;

  // Attach hover/focus interaction linking between legend items and chart segments
  attachInteractiveHighlighting(container);
}

/**
 * Attaches event listeners for interactive highlighting between legend items and donut chart segments.
 * @param {HTMLElement} container
 */
function attachInteractiveHighlighting(container) {
  const legendItems = container.querySelectorAll('.donut-legend-item');
  const segments = container.querySelectorAll('.donut-segment');

  function highlight(campaignId) {
    if (!campaignId) return;
    legendItems.forEach(item => {
      item.classList.toggle('is-highlighted', item.dataset.campaignId === campaignId);
    });
    segments.forEach(seg => {
      seg.classList.toggle('is-highlighted', seg.dataset.campaignId === campaignId);
    });
  }

  function clearHighlight() {
    legendItems.forEach(item => item.classList.remove('is-highlighted'));
    segments.forEach(seg => seg.classList.remove('is-highlighted'));
  }

  legendItems.forEach(item => {
    const id = item.dataset.campaignId;
    item.addEventListener('mouseenter', () => highlight(id));
    item.addEventListener('mouseleave', clearHighlight);
    item.addEventListener('focus', () => highlight(id));
    item.addEventListener('blur', clearHighlight);
  });

  segments.forEach(seg => {
    const id = seg.dataset.campaignId;
    seg.addEventListener('mouseenter', () => highlight(id));
    seg.addEventListener('mouseleave', clearHighlight);
    seg.addEventListener('focus', () => highlight(id));
    seg.addEventListener('blur', clearHighlight);
    seg.addEventListener('click', () => {
      window.location.hash = `fundraiser-${id}`;
    });
    seg.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.location.hash = `fundraiser-${id}`;
      }
    });
    if (seg.style) {
      seg.style.cursor = 'pointer';
    }
  });
}
