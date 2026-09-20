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

  const cardBadgeLabel = contentData?.fundraisersSection?.cardBadges?.[item.id]?.[lang] ||
    contentData?.fundraisersSection?.campaignTypes?.[item.category]?.[lang] ||
    (item.category === 'collective' ? 'ALGEMENE PARKNEST-INZAMELING' : 'PERSOONLIJKE INZAMELING');

  const donationPurposePrefix = contentData?.fundraisersSection?.donationPurposePrefix?.[lang] ||
    (lang === 'en' ? 'The purpose of this campaign is:' : 'Het doel van deze actie is:');

  const avatarMap = {
    'rooie-jaap-knives': 'jaaphopman_avatar'
  };

  const avatarName = avatarMap[item.id];
  let avatarHTML = '';
  if (avatarName) {
    avatarHTML = `
      <picture class="card-avatar-wrapper">
        <source srcset="public/assets/${avatarName}.webp" type="image/webp">
        <img src="public/assets/${avatarName}.png" alt="${titleText}" class="card-avatar-img" width="48" height="48" loading="lazy" onerror="this.parentElement.style.display='none'">
      </picture>
    `;
  }

  const campaignContextData = contentData?.fundraisersSection?.campaignContext?.[item.id];
  let contextBtnHTML = '';
  if (campaignContextData) {
    const contextBtnLabel = labels.contextBtn ? labels.contextBtn[lang] : (lang === 'en' ? 'Context & background' : 'Context & achtergrond');
    contextBtnHTML = `
      <button type="button" class="context-btn" aria-label="${contextBtnLabel} (${titleText})">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        <span>${contextBtnLabel}</span>
      </button>
    `;
  }

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

  const shareHTML = createShareSectionHTML(shareContent, lang, shareUrl, titleText, purposeText);

  card.innerHTML = `
    <div class="campaign-type-badge-bar">
      <span class="card-campaign-badge ${item.category}-card-badge">${cardBadgeLabel}</span>
    </div>

    <div class="fundraiser-card-header ${avatarName ? 'has-avatar' : ''}">
      ${avatarHTML}
      <div class="header-title-wrapper">
        <h4 class="fundraiser-card-title">${titleText}</h4>
        <p class="fundraiser-purpose">${purposeText}</p>
      </div>
    </div>

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
        <div class="progress-bar-track" role="progressbar" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100" aria-label="${progressLabelText}: ${percentageStatusText}">
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

    <div class="point-of-donation-box">
      <span class="point-of-donation-prefix">${donationPurposePrefix}</span>
      <p class="point-of-donation-purpose"><strong>${purposeText}</strong></p>
      ${contextBtnHTML}
      <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="donate-btn">
        ${labels.donateLink[lang]} <span class="visually-hidden">(${titleText})</span>
      </a>
    </div>

    ${shareHTML}
  `;

  attachShareListeners(card, state, shareContent, lang, shareUrl, titleText, purposeText);

  const contextBtn = card.querySelector('.context-btn');
  if (contextBtn && campaignContextData) {
    contextBtn.addEventListener('click', (e) => {
      openContextModal(state, campaignContextData, lang, e.currentTarget);
    });
  }

  return card;
}
