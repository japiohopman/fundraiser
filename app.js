/**
 * ParkNest Fundraiser Transparency App
 * Handles dynamic content rendering, localization (NL/EN), and accessibility.
 */

let state = {
  currentLang: 'nl',
  fundraisersData: null,
  contentData: null
};

// Utility to safely access nested object properties via dot notation
function getNestedProperty(obj, path) {
  return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : null), obj);
}

// Format numbers as EUR currency strings
function formatCurrency(amount, lang) {
  if (amount === null || amount === undefined) return '—';
  const locale = lang === 'en' ? 'en-US' : 'nl-NL';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Initialize Application
async function initApp() {
  try {
    // Determine language from localStorage or default to 'nl'
    const savedLang = localStorage.getItem('parknest_lang');
    if (savedLang && ['nl', 'en'].includes(savedLang)) {
      state.currentLang = savedLang;
    }

    // Fetch canonical fundraiser data and content dictionary concurrently
    const [fundraisersRes, contentRes] = await Promise.all([
      fetch('data/fundraisers.json'),
      fetch('data/content.json')
    ]);

    if (!fundraisersRes.ok || !contentRes.ok) {
      throw new Error('Failed to load application data files');
    }

    state.fundraisersData = await fundraisersRes.json();
    state.contentData = await contentRes.json();

    // Setup language switcher button event listeners
    setupLanguageSwitcher();

    // Initial render
    renderApp();

  } catch (error) {
    console.error('App initialization error:', error);
  }
}

// Setup Event Listeners for Language Switcher Buttons
function setupLanguageSwitcher() {
  const langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetLang = btn.getAttribute('data-lang');
      if (targetLang && targetLang !== state.currentLang) {
        setLanguage(targetLang);
      }
    });
  });
}

// Set Active Language and Re-render
function setLanguage(lang) {
  state.currentLang = lang;
  localStorage.setItem('parknest_lang', lang);
  renderApp();
}

// Render All Components according to state.currentLang
function renderApp() {
  const lang = state.currentLang;
  const content = state.contentData;
  const fundraisers = state.fundraisersData.fundraisers;

  // 1. Update document html lang attribute
  document.documentElement.lang = lang;

  // 2. Update i18n text nodes in static HTML
  const i18nElements = document.querySelectorAll('[data-i18n]');
  i18nElements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    const textObj = getNestedProperty(content, key);
    if (textObj && textObj[lang]) {
      el.textContent = textObj[lang];
    }
  });

  // 3. Update i18n attributes
  const i18nAttrElements = document.querySelectorAll('[data-i18n-attr]');
  i18nAttrElements.forEach(el => {
    const attrMapping = el.getAttribute('data-i18n-attr'); // e.g. "content:meta.description"
    const [attrName, key] = attrMapping.split(':');
    const textObj = getNestedProperty(content, key);
    if (textObj && textObj[lang]) {
      el.setAttribute(attrName, textObj[lang]);
    }
  });

  // 4. Update Language Switcher UI buttons
  const langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach(btn => {
    const btnLang = btn.getAttribute('data-lang');
    const isActive = btnLang === lang;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });

  // 5. Render Fundraiser Cards from canonical data
  renderFundraisers(fundraisers, content, lang);

  // 6. Render Timeline Events
  renderTimeline(content.timeline.events, lang);

  // 7. Render Sources List
  renderSources(content.sources.links, lang);
}

// Render Fundraisers split into Collective and Personal grids
function renderFundraisers(fundraisers, content, lang) {
  const collectiveContainer = document.getElementById('collective-fundraisers-list');
  const personalContainer = document.getElementById('personal-fundraisers-list');

  if (!collectiveContainer || !personalContainer) return;

  collectiveContainer.innerHTML = '';
  personalContainer.innerHTML = '';

  const labels = content.fundraisersSection.labels;

  fundraisers.forEach(item => {
    const card = createFundraiserCard(item, labels, lang);
    if (item.category === 'collective') {
      collectiveContainer.appendChild(card);
    } else {
      personalContainer.appendChild(card);
    }
  });
}

// Create individual Fundraiser Card Element
function createFundraiserCard(item, labels, lang) {
  const card = document.createElement('article');
  card.className = `fundraiser-card category-${item.category}`;

  const titleText = item.title[lang] || item.title.nl;
  const purposeText = item.purpose[lang] || item.purpose.nl;
  const targetFormatted = formatCurrency(item.financials.targetAmount, lang);
  const onlineRaisedFormatted = formatCurrency(item.financials.onlineAmountRaised, lang);
  const offlineRaisedFormatted = formatCurrency(item.financials.offlineDonationAmount, lang);
  const displayedTotalFormatted = formatCurrency(item.financials.displayedTotalRaised, lang);

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

  card.innerHTML = `
    <div class="fundraiser-card-header">
      <h4 class="fundraiser-card-title">${titleText}</h4>
      <p class="fundraiser-purpose">${purposeText}</p>
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

    <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="donate-btn">
      ${labels.donateLink[lang]} <span class="visually-hidden">(${titleText})</span>
    </a>
  `;

  return card;
}

// Render Timeline
function renderTimeline(events, lang) {
  const container = document.getElementById('timeline-list');
  if (!container) return;

  container.innerHTML = events.map(evt => `
    <li class="timeline-item">
      <div class="timeline-date">${evt.date}</div>
      <h3 class="timeline-event-title">${evt.title[lang] || evt.title.nl}</h3>
      <p class="timeline-event-desc">${evt.description[lang] || evt.description.nl}</p>
    </li>
  `).join('');
}

// Render Sources List
function renderSources(links, lang) {
  const container = document.getElementById('sources-list');
  if (!container) return;

  container.innerHTML = links.map(link => `
    <li>
      <a href="${link.url}" target="_blank" rel="noopener noreferrer">
        ${link.label[lang] || link.label.nl}
      </a>
    </li>
  `).join('');
}

// Start App when DOM ready
document.addEventListener('DOMContentLoaded', initApp);
