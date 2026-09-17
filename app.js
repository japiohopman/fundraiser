/**
 * ParkNest Fundraiser Transparency App
 * Handles dynamic content rendering, localization (NL/EN), mobile navigation, and accessibility.
 */

let state = {
  currentLang: 'nl',
  fundraisersData: null,
  contentData: null,
  isNavOpen: false
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

    // Setup UI event handlers
    setupLanguageSwitcher();
    setupMobileNav();

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

// Setup Accessible Mobile Navigation Menu
function setupMobileNav() {
  const toggleBtn = document.getElementById('menu-toggle-btn');
  const navMenu = document.getElementById('main-nav-menu');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMobileNav();
  });

  // Close menu when clicking any nav link
  const navLinks = navMenu.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (state.isNavOpen) {
        toggleMobileNav(false);
      }
    });
  });

  // Close menu on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.isNavOpen) {
      toggleMobileNav(false);
      toggleBtn.focus();
    }
  });

  // Close menu on click outside header
  document.addEventListener('click', (e) => {
    if (state.isNavOpen && !e.target.closest('.site-header')) {
      toggleMobileNav(false);
    }
  });
}

// Toggle Mobile Navigation Drawer State
function toggleMobileNav(forceState) {
  const toggleBtn = document.getElementById('menu-toggle-btn');
  const navMenu = document.getElementById('main-nav-menu');
  if (!toggleBtn || !navMenu) return;

  state.isNavOpen = forceState !== undefined ? forceState : !state.isNavOpen;

  toggleBtn.setAttribute('aria-expanded', state.isNavOpen ? 'true' : 'false');
  navMenu.classList.toggle('open', state.isNavOpen);
  document.body.classList.toggle('nav-drawer-open', state.isNavOpen);

  // Update toggle button text label
  const labelSpan = toggleBtn.querySelector('.menu-toggle-label');
  if (labelSpan && state.contentData?.nav) {
    const lang = state.currentLang;
    labelSpan.textContent = state.isNavOpen
      ? (state.contentData.nav.closeMenu?.[lang] || 'Sluiten')
      : (state.contentData.nav.openMenu?.[lang] || 'Menu');
  }
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

  // 5. Sync Mobile Menu toggle button label state
  const toggleBtn = document.getElementById('menu-toggle-btn');
  if (toggleBtn) {
    const labelSpan = toggleBtn.querySelector('.menu-toggle-label');
    if (labelSpan && content.nav) {
      labelSpan.textContent = state.isNavOpen
        ? (content.nav.closeMenu[lang] || 'Sluiten')
        : (content.nav.openMenu[lang] || 'Menu');
    }
  }

  // 6. Render Fundraiser Cards from canonical data
  renderFundraisers(fundraisers, content, lang);

  // 7. Render Rooie Jaap Equipment Reference Table from canonical fundraiser data
  renderRooieJaapEquipment(content.rooieJaapEquipment, lang);

  // 8. Render Timeline Events
  renderTimeline(content.timeline.events, lang);

  // 9. Render Sources List
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

  // Assign stable DOM anchor ID for direct navigation routing
  card.id = `fundraiser-${item.id}`;

  const titleText = item.title[lang] || item.title.nl;
  const purposeText = item.purpose[lang] || item.purpose.nl;
  const targetFormatted = formatCurrency(item.financials.targetAmount, lang);
  const onlineRaisedFormatted = formatCurrency(item.financials.onlineAmountRaised, lang);
  const offlineRaisedFormatted = formatCurrency(item.financials.offlineDonationAmount, lang);
  const displayedTotalFormatted = formatCurrency(item.financials.displayedTotalRaised, lang);

  // Retrieve explicit card badge label from content dictionary or fallback
  const cardBadgeLabel = state.contentData?.fundraisersSection?.cardBadges?.[item.id]?.[lang] ||
    state.contentData?.fundraisersSection?.campaignTypes?.[item.category]?.[lang] ||
    (item.category === 'collective' ? 'ALGEMENE PARKNEST-INZAMELING' : 'PERSOONLIJKE INZAMELING');

  const donationPurposePrefix = state.contentData?.fundraisersSection?.donationPurposePrefix?.[lang] ||
    (lang === 'en' ? 'The purpose of this campaign is:' : 'Het doel van deze actie is:');

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
    <div class="campaign-type-badge-bar">
      <span class="card-campaign-badge ${item.category}-card-badge">${cardBadgeLabel}</span>
    </div>

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

    <div class="point-of-donation-box">
      <span class="point-of-donation-prefix">${donationPurposePrefix}</span>
      <p class="point-of-donation-purpose"><strong>${purposeText}</strong></p>
      <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="donate-btn">
        ${labels.donateLink[lang]} <span class="visually-hidden">(${titleText})</span>
      </a>
    </div>
  `;

  return card;
}

// Render Rooie Jaap Equipment Reference List & Table from Canonical Fundraiser Data
function renderRooieJaapEquipment(contentEquipment, lang) {
  const container = document.getElementById('rooie-jaap-equipment-container');
  if (!container || !contentEquipment) return;

  // Retrieve canonical fundraiser equipment data for rooie-jaap-knives
  const rooieJaapFundraiser = state.fundraisersData?.fundraisers?.find(f => f.id === 'rooie-jaap-knives');
  const equipmentRef = rooieJaapFundraiser?.equipmentReferences;

  if (!equipmentRef || !equipmentRef.items) return;

  const locale = lang === 'en' ? 'en-US' : 'nl-NL';
  const formatPrice = (val) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(val);

  // Calculate reference total directly from canonical equipment item prices
  const totalAmount = equipmentRef.items.reduce((sum, item) => sum + item.price, 0);

  const rowsHTML = equipmentRef.items.map(item => `
    <tr>
      <td>${item.name[lang] || item.name.nl}</td>
      <td class="price-cell">${formatPrice(item.price)}</td>
    </tr>
  `).join('');

  container.innerHTML = `
    <table class="equipment-table">
      <thead>
        <tr>
          <th scope="col">${contentEquipment.tableHeaders.item[lang]}</th>
          <th scope="col" class="price-cell">${contentEquipment.tableHeaders.price[lang]}</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHTML}
      </tbody>
      <tfoot>
        <tr class="total-row">
          <th scope="row">${contentEquipment.totalLabel[lang]}</th>
          <td class="price-cell"><strong>${formatPrice(totalAmount)}</strong></td>
        </tr>
      </tfoot>
    </table>
    <p class="equipment-note">${contentEquipment.note[lang]}</p>
  `;
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
