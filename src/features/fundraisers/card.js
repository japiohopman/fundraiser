import { formatCurrency } from '../../utils/currency.js';
import { createShareSectionHTML, attachShareListeners } from './share.js';

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

  const cardBadgeLabel = contentData?.fundraisersSection?.cardBadges?.[item.id]?.[lang] ||
    contentData?.fundraisersSection?.campaignTypes?.[item.category]?.[lang] ||
    (item.category === 'collective' ? 'ALGEMENE PARKNEST-INZAMELING' : 'PERSOONLIJKE INZAMELING');

  const donationPurposePrefix = contentData?.fundraisersSection?.donationPurposePrefix?.[lang] ||
    (lang === 'en' ? 'The purpose of this campaign is:' : 'Het doel van deze actie is:');

  let avatarHTML = '';
  if (item.id === 'rooie-jaap-knives') {
    avatarHTML = `
      <picture class="card-avatar-wrapper">
        <source srcset="public/assets/jaaphopman_avatar.webp" type="image/webp">
        <img src="public/assets/jaaphopman_avatar.png" alt="Jaap Hopman avatar" class="card-avatar-img" width="48" height="48" loading="lazy">
      </picture>
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

    <div class="fundraiser-card-header ${item.id === 'rooie-jaap-knives' ? 'has-avatar' : ''}">
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
      <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="donate-btn">
        ${labels.donateLink[lang]} <span class="visually-hidden">(${titleText})</span>
      </a>
    </div>

    ${shareHTML}
  `;

  attachShareListeners(card, state, shareContent, lang, shareUrl, titleText, purposeText);

  return card;
}
