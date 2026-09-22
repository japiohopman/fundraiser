import { formatCurrency } from '../../utils/currency.js';
import { createShareSectionHTML, attachShareListeners } from './share.js';
import { openContextModal } from '../../ui/context-modal.js';

/**
 * Creates and returns the DOM element for a fundraiser card.
 * @param {Object} item - Fundraiser object from data/fundraisers.json
 * @param {Object} labels - Labels dictionary from content.json
 * @param {Object} shareContent - Share dictionary from content.json
 * @param {string} lang - Current language ('nl'|'en')
 * @param {Object} contentData - Full contentData object
 * @param {Object} state - Application state
 * @returns {HTMLElement}
 */
export function createFundraiserCard(item, labels, shareContent, lang, contentData, state) {
  const card = document.createElement('article');
  card.className = `fundraiser-card category-${item.category}`;
  card.id = `fundraiser-${item.id}`;

  const titleText = item.title[lang] || item.title.nl;
  const purposeText = item.purpose[lang] || item.purpose.nl;
  const targetFormatted = formatCurrency(item.financials.targetAmount, lang);
  const onlineRaisedFormatted = formatCurrency(item.financials.onlineAmountRaised, lang);
  const offlineRaisedFormatted = formatCurrency(item.financials.offlineDonationAmount, lang);
  const displayedTotalFormatted = formatCurrency(item.financials.displayedTotalRaised, lang);

  const targetAmount = item.financials.targetAmount || 0;
  const totalRaised = item.financials.displayedTotalRaised || 0;
  const percentage = targetAmount > 0 ? Math.round((totalRaised / targetAmount) * 100) : 0;
  const cappedPercentage = Math.min(percentage, 100);
  const isTargetReached = targetAmount > 0 && totalRaised >= targetAmount;

  const targetReachedText = labels.targetReached ? labels.targetReached[lang] : (lang === 'en' ? 'Target reached' : 'Doel bereikt');
  const progressLabelText = labels.progressLabel ? labels.progressLabel[lang] : (lang === 'en' ? 'Fundraising progress' : 'Voortgang inzameling');
  const percentageStatusText = isTargetReached ? `${percentage}% — ${targetReachedText}` : `${percentage}%`;

  const identityNameMap = {
    'parknest-collective': 'ParkNest',
    'kathinka-dog-collars': 'Kathinka van Velzen',
    'jim-gijbels-paintings': 'Jim Gijbels',
    'rooie-jaap-knives': 'Jaap Hopman',
    'suzy-creamcheese-kitchenware': 'Suzy Creamcheese',
    'manon-kinkt-shirts': 'Manon'
  };

  const identityName = identityNameMap[item.id] ||
    contentData?.fundraisersSection?.cardBadges?.[item.id]?.[lang] ||
    contentData?.fundraisersSection?.cardBadges?.[item.id]?.nl ||
    titleText;

  const categoryBadgeText = item.category === 'collective'
    ? (contentData?.fundraisersSection?.collectiveBadge?.[lang] || 'Collectiefonds')
    : (contentData?.fundraisersSection?.personalBadge?.[lang] || 'Persoonlijk herstel');

  const avatarMap = {
    'parknest-collective': 'parknest-avatar',
    'kathinka-dog-collars': 'kathinka-avatar',
    'jim-gijbels-paintings': 'jim-avatar',
    'rooie-jaap-knives': 'jaaphopman_avatar',
    'suzy-creamcheese-kitchenware': 'suzy-avatar',
    'manon-kinkt-shirts': 'manon-avatar'
  };

  const avatarName = avatarMap[item.id];
  let avatarHTML = '';
  if (avatarName) {
    avatarHTML = `
      <picture class="card-avatar-wrapper">
        <source srcset="public/assets/${avatarName}.webp" type="image/webp">
        <img src="public/assets/${avatarName}.webp" alt="${identityName}" class="card-avatar-img" width="56" height="56" loading="lazy" decoding="async">
      </picture>
    `;
  }

  const campaignContextData = contentData?.fundraisersSection?.campaignContext?.[item.id];
  const fallbackContext = {
    title: item.title,
    text: item.purpose,
    link: null
  };
  const contextData = campaignContextData || fallbackContext;

  const summaryText = campaignContextData?.summary?.[lang] ||
    campaignContextData?.summary?.nl ||
    purposeText;

  const detailsBtnLabel = labels.detailsBtn ? labels.detailsBtn[lang] : (lang === 'en' ? 'Show details' : 'Bekijk details');
  const contextBtnHTML = `
    <button type="button" class="context-btn" aria-label="${detailsBtnLabel} (${titleText})">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
      <span>${detailsBtnLabel}</span>
    </button>
  `;

  let beneficiaryHTML = '';
  if (item.beneficiary.name) {
    beneficiaryHTML = `
      <div class="meta-item">
        <strong>${labels.beneficiary[lang]}</strong> ${item.beneficiary.name}
      </div>
    `;
  }

  let directBankHTML = '';
  if (item.id === 'parknest-collective') {
    directBankHTML = `
      <div class="meta-item direct-bank-info">
        <strong>${labels.directBank[lang]}</strong> ${labels.directBankText[lang]}
      </div>
    `;
  }

  // Construct absolute share URL pointing directly to campaign's anchor
  const baseUrl = window.location.href.split('#')[0];
  const shareUrl = `${baseUrl}#fundraiser-${item.id}`;

  const donateUrl = item.donateUrl;
  const shareHTML = createShareSectionHTML(shareContent, lang, shareUrl, titleText, purposeText, item.id);

  card.innerHTML = `
    <div class="fundraiser-card-header ${avatarName ? 'has-avatar' : ''}">
      ${avatarHTML}
      <div class="header-title-wrapper">
        <span class="category-badge ${item.category}-badge card-type-badge">${categoryBadgeText}</span>
        <div class="fundraiser-identity-name">${identityName}</div>
        <h4 class="fundraiser-card-title">${titleText}</h4>
      </div>
    </div>

    <p class="fundraiser-purpose">${summaryText}</p>

    <div class="fundraiser-stats">
      <div class="stat-row">
        <span class="stat-label">${labels.target[lang]}</span>
        <span class="stat-value">${targetFormatted}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">${labels.onlineRaised[lang]}</span>
        <span class="stat-value">${onlineRaisedFormatted} (${item.financials.onlineDonationCount})</span>
      </div>
      ${item.financials.offlineDonationAmount > 0 ? `
      <div class="stat-row">
        <span class="stat-label">${labels.offlineRaised[lang]}</span>
        <span class="stat-value">${offlineRaisedFormatted}</span>
      </div>
      ` : ''}
      <div class="stat-row">
        <span class="stat-label">${labels.totalDisplayed[lang]}</span>
        <span class="stat-value">${displayedTotalFormatted}</span>
      </div>
      <div class="fundraiser-progress-wrapper">
        <div class="progress-bar-header">
          <span class="progress-amounts">${displayedTotalFormatted} / ${targetFormatted}</span>
          <span class="progress-percentage ${isTargetReached ? 'target-reached' : ''}">
            ${percentageStatusText}
          </span>
        </div>
        <div class="progress-bar-track" role="progressbar" aria-valuenow="${cappedPercentage}" aria-valuemin="0" aria-valuemax="100" aria-valuetext="${percentageStatusText}" aria-label="${progressLabelText}">
          <div class="progress-bar-fill ${item.category}-progress-fill ${isTargetReached ? 'target-reached-fill' : ''}" style="width: ${cappedPercentage}%;"></div>
        </div>
      </div>
    </div>

    <div class="fundraiser-meta">
      <div class="meta-item">
        <strong>${labels.organiser[lang]}</strong> ${item.organiser.name}
      </div>
      ${beneficiaryHTML}
      ${directBankHTML}
      <div class="meta-item">
        <strong>${labels.verifiedDate[lang]}</strong> ${item.dates.verifiedAt}
      </div>
    </div>

    <div class="card-actions">
      <div class="primary-actions">
        ${contextBtnHTML}
        <a href="${donateUrl}" target="_blank" rel="noopener noreferrer" class="donate-btn" aria-label="${lang === 'en' ? 'Donate to' : 'Doneer aan'} ${identityName} (${titleText})">
          <svg class="donate-btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" aria-hidden="true" width="16" height="16">
            <path d="M298.9 24.31c-14.9.3-25.6 3.2-32.7 8.4l-97.3 52.1-54.1 73.59c-11.4 17.6-3.3 51.6 32.3 29.8l39-51.4c49.5-42.69 150.5-23.1 102.6 62.6-23.5 49.6-12.5 73.8 17.8 84l13.8-46.4c23.9-53.8 68.5-63.5 66.7-106.9l107.2 7.7-1-112.09-194.3-1.4zM244.8 127.7c-17.4-.3-34.5 6.9-46.9 17.3l-39.1 51.4c10.7 8.5 21.5 3.9 32.2-6.4 12.6 6.4 22.4-3.5 30.4-23.3 3.3-13.5 8.2-23 23.4-39zm-79.6 96c-.4 0-.9 0-1.3.1-3.3.7-7.2 4.2-9.8 12.2-2.7 8-3.3 19.4-.9 31.6 2.4 12.1 7.4 22.4 13 28.8 5.4 6.3 10.4 8.1 13.7 7.4 3.4-.6 7.2-4.2 9.8-12.1 2.7-8 3.4-19.5 1-31.6-2.5-12.2-7.5-22.5-13-28.8-4.8-5.6-9.2-7.6-12.5-7.6zm82.6 106.8c-7.9.1-17.8 2.6-27.5 7.3-11.1 5.5-19.8 13.1-24.5 20.1-4.7 6.9-5.1 12.1-3.6 15.2 1.5 3 5.9 5.9 14.3 6.3 8.4.5 19.7-1.8 30.8-7.3 11.1-5.5 19.8-13 24.5-20 4.7-6.9 5.1-12.2 3.6-15.2-1.5-3.1-5.9-5.9-14.3-6.3-1.1-.1-2.1-.1-3.3-.1zm-97.6 95.6c-4.7.1-9 .8-12.8 1.9-8.5 2.5-13.4 7-15 12.3-1.7 5.4 0 11.8 5.7 18.7 5.8 6.8 15.5 13.3 27.5 16.9 11.9 3.6 23.5 3.5 32.1.9 8.6-2.5 13.5-7 15.1-12.3 1.6-5.4 0-11.8-5.8-18.7-5.7-6.8-15.4-13.3-27.4-16.9-6.8-2-13.4-2.9-19.4-2.8z"></path>
          </svg>
          <span>${identityName}</span>
        </a>
      </div>
      ${shareHTML}
    </div>
  `;

  const qrTargetUrl = donateUrl;
  attachShareListeners(card, state, shareContent, lang, shareUrl, titleText, purposeText, qrTargetUrl);

  const contextBtn = card.querySelector('.context-btn');
  if (contextBtn) {
    contextBtn.addEventListener('click', (e) => {
      openContextModal(state, contextData, lang, e.currentTarget, item);
    });
  }

  return card;
}
