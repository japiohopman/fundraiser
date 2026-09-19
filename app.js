/**
 * ParkNest Fundraiser Transparency App
 * Handles dynamic content rendering, localization (NL/EN), mobile navigation, share options, and accessibility.
 */

let state = {
  currentLang: 'nl',
  fundraisersData: null,
  contentData: null,
  donorsData: null,
  isNavOpen: false,
  isQRModalOpen: false,
  activeShareCardId: null,
  lastFocusedElement: null
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

/**
 * Pure JavaScript Standalone QR Code Generator (Version 5-L, 37x37 matrix)
 * Generates an accessible, clean SVG string for any URL up to ~106 bytes without external dependencies.
 */
class QRCodeGen {
  static createSVG(text) {
    const bytes = new TextEncoder().encode(text);
    const dataCWCount = 108;
    const ecCWCount = 26;
    const N = 37;

    if (bytes.length > 106) {
      throw new Error("Text too long for Version 5 QR Code");
    }

    // 1. Bit Buffer & Data Codewords
    const data = new Uint8Array(dataCWCount);
    let bitPos = 0;

    const writeBits = (val, num) => {
      for (let i = num - 1; i >= 0; i--) {
        const bit = (val >> i) & 1;
        const byteIdx = Math.floor(bitPos / 8);
        const bitIdx = 7 - (bitPos % 8);
        if (bitIdx >= 0 && byteIdx < dataCWCount) {
          if (bit) data[byteIdx] |= (1 << bitIdx);
        }
        bitPos++;
      }
    };

    // Mode: Byte (0100)
    writeBits(0b0100, 4);
    // Count: 8 bits
    writeBits(bytes.length, 8);
    // Data bytes
    for (let i = 0; i < bytes.length; i++) {
      writeBits(bytes[i], 8);
    }
    // Terminator: up to 4 zero bits
    const termLen = Math.min(4, dataCWCount * 8 - bitPos);
    writeBits(0, termLen);

    // Byte alignment
    while (bitPos % 8 !== 0) bitPos++;

    // Pad bytes
    const pad = [0xEC, 0x11];
    let padIdx = 0;
    while (bitPos < dataCWCount * 8) {
      writeBits(pad[padIdx % 2], 8);
      padIdx++;
    }

    // 2. Reed-Solomon EC Codewords
    const exp = new Uint8Array(512);
    const log = new Uint8Array(256);
    let x = 1;
    for (let i = 0; i < 255; i++) {
      exp[i] = x;
      exp[i + 255] = x;
      log[x] = i;
      x = (x << 1) ^ (x & 128 ? 285 : 0);
    }

    // Generator polynomial for 26 EC codewords
    let g = new Uint8Array([1]);
    for (let i = 0; i < ecCWCount; i++) {
      const nextG = new Uint8Array(g.length + 1);
      for (let j = 0; j < g.length; j++) {
        nextG[j] ^= exp[log[g[j]] + i];
        nextG[j + 1] ^= g[j];
      }
      g = nextG;
    }

    const msg = new Uint8Array(dataCWCount + ecCWCount);
    msg.set(data);
    for (let i = 0; i < dataCWCount; i++) {
      const coef = msg[i];
      if (coef !== 0) {
        const logCoef = log[coef];
        for (let j = 0; j < g.length; j++) {
          msg[i + j] ^= exp[logCoef + log[g[j]]];
        }
      }
    }
    const ec = msg.slice(dataCWCount);

    // Combine Data + EC
    const allCW = new Uint8Array(dataCWCount + ecCWCount);
    allCW.set(data);
    allCW.set(ec, dataCWCount);

    // 3. Matrix Construction (37x37)
    const matrix = Array.from({ length: N }, () => new Int8Array(N).fill(-1));

    // Finder patterns
    const addFinder = (r, c) => {
      for (let dr = -1; dr <= 7; dr++) {
        for (let dc = -1; dc <= 7; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < N && nc >= 0 && nc < N) {
            if (dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6) {
              const isBlack = (dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4));
              matrix[nr][nc] = isBlack ? 1 : 0;
            } else {
              matrix[nr][nc] = 0;
            }
          }
        }
      }
    };

    addFinder(0, 0);
    addFinder(0, N - 7);
    addFinder(N - 7, 0);

    // Alignment pattern (for V5: row 30, col 30)
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        const isBlack = (Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0));
        matrix[30 + dr][30 + dc] = isBlack ? 1 : 0;
      }
    }

    // Timing patterns
    for (let i = 8; i < N - 8; i++) {
      if (matrix[6][i] === -1) matrix[6][i] = (i % 2 === 0) ? 1 : 0;
      if (matrix[i][6] === -1) matrix[i][6] = (i % 2 === 0) ? 1 : 0;
    }

    // Dark module
    matrix[N - 8][6] = 1;

    // Reserve Format Info areas
    for (let i = 0; i <= 8; i++) {
      if (matrix[6][i] === -1) matrix[6][i] = 0;
      if (matrix[i][6] === -1) matrix[i][6] = 0;
      if (matrix[8][i] === -1) matrix[8][i] = 0;
      if (matrix[i][8] === -1) matrix[i][8] = 0;
    }
    for (let i = 0; i < 8; i++) {
      if (matrix[N - 1 - i][8] === -1) matrix[N - 1 - i][8] = 0;
      if (matrix[8][N - 1 - i] === -1) matrix[8][N - 1 - i] = 0;
    }

    // Place Data bits
    let cwIdx = 0, bitIdxInCW = 7;
    let upward = true;

    for (let col = N - 1; col > 0; col -= 2) {
      if (col === 6) col = 5;

      const rows = [];
      if (upward) {
        for (let r = N - 1; r >= 0; r--) rows.push(r);
      } else {
        for (let r = 0; r < N; r++) rows.push(r);
      }

      for (let r of rows) {
        for (let c = col; c >= col - 1; c--) {
          if (matrix[r][c] === -1) {
            let bit = 0;
            if (cwIdx < allCW.length) {
              bit = (allCW[cwIdx] >> bitIdxInCW) & 1;
              bitIdxInCW--;
              if (bitIdxInCW < 0) {
                bitIdxInCW = 7;
                cwIdx++;
              }
            }
            const maskBit = ((r + c) % 2 === 0) ? 1 : 0;
            matrix[r][c] = bit ^ maskBit;
          }
        }
      }
      upward = !upward;
    }

    // Format Info bits for L level (01) + Mask 0 (000)
    const formatBits = [1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0];

    const formatCoords1 = [
      [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [7, 8], [8, 8],
      [8, 7], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0]
    ];
    for (let i = 0; i < 15; i++) {
      const [r, c] = formatCoords1[i];
      matrix[r][c] = formatBits[i];
    }

    const formatCoords2 = [
      [8, N - 1], [8, N - 2], [8, N - 3], [8, N - 4], [8, N - 5], [8, N - 6], [8, N - 7],
      [N - 7, 8], [N - 6, 8], [N - 5, 8], [N - 4, 8], [N - 3, 8], [N - 2, 8], [N - 1, 8]
    ];
    for (let i = 0; i < 14; i++) {
      const [r, c] = formatCoords2[i];
      matrix[r][c] = formatBits[i < 7 ? i : i + 1];
    }

    // 4. Build SVG string
    const border = 2;
    const viewSize = N + border * 2;
    let pathD = '';

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (matrix[r][c] === 1) {
          pathD += `M${c + border},${r + border}h1v1h-1z `;
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewSize} ${viewSize}" width="220" height="220" role="img" aria-label="QR Code">
      <rect width="${viewSize}" height="${viewSize}" fill="#ffffff"/>
      <path d="${pathD.trim()}" fill="#0f172a"/>
    </svg>`;
  }
}

// Initialize Application
async function initApp() {
  try {
    const savedLang = localStorage.getItem('parknest_lang');
    if (savedLang && ['nl', 'en'].includes(savedLang)) {
      state.currentLang = savedLang;
    }

    const [fundraisersRes, contentRes, donorsRes] = await Promise.all([
      fetch('data/fundraisers.json'),
      fetch('data/content.json'),
      fetch('data/donors.json').catch(err => {
        console.warn('Could not fetch donors.json:', err);
        return { ok: false };
      })
    ]);

    if (!fundraisersRes.ok || !contentRes.ok) {
      throw new Error('Failed to load application data files');
    }

    state.fundraisersData = await fundraisersRes.json();
    state.contentData = await contentRes.json();

    if (donorsRes && donorsRes.ok) {
      state.donorsData = await donorsRes.json();
    } else {
      state.donorsData = { donors: [] };
    }

    setupLanguageSwitcher();
    setupMobileNav();
    setupQRModal();

    renderApp();

  } catch (error) {
    console.error('App initialization error:', error);
  }
}

// Language Switcher Setup
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

// Mobile Nav Setup
function setupMobileNav() {
  const toggleBtn = document.getElementById('menu-toggle-btn');
  const navMenu = document.getElementById('main-nav-menu');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMobileNav();
  });

  const navLinks = navMenu.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (state.isNavOpen) {
        toggleMobileNav(false);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.isNavOpen) {
      toggleMobileNav(false);
      toggleBtn.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (state.isNavOpen && !e.target.closest('.site-header')) {
      toggleMobileNav(false);
    }
  });
}

function toggleMobileNav(forceState) {
  const toggleBtn = document.getElementById('menu-toggle-btn');
  const navMenu = document.getElementById('main-nav-menu');
  if (!toggleBtn || !navMenu) return;

  state.isNavOpen = forceState !== undefined ? forceState : !state.isNavOpen;

  toggleBtn.setAttribute('aria-expanded', state.isNavOpen ? 'true' : 'false');
  navMenu.classList.toggle('open', state.isNavOpen);
  document.body.classList.toggle('nav-drawer-open', state.isNavOpen);

  const labelSpan = toggleBtn.querySelector('.menu-toggle-label');
  if (labelSpan && state.contentData?.nav) {
    const lang = state.currentLang;
    labelSpan.textContent = state.isNavOpen
      ? (state.contentData.nav.closeMenu?.[lang] || 'Sluiten')
      : (state.contentData.nav.openMenu?.[lang] || 'Menu');
  }
}

// QR Code Modal Setup
function setupQRModal() {
  const modal = document.getElementById('qr-modal');
  const closeBtn = document.getElementById('qr-modal-close-btn');

  if (!modal || !closeBtn) return;

  closeBtn.addEventListener('click', closeQRModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeQRModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.isQRModalOpen) {
      closeQRModal();
    } else if (e.key === 'Tab' && state.isQRModalOpen) {
      trapModalFocus(e, modal);
    }
  });
}

function trapModalFocus(e, modal) {
  const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const visibleFocusables = Array.from(focusables).filter(el => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement);

  if (visibleFocusables.length === 0) return;

  const firstEl = visibleFocusables[0];
  const lastEl = visibleFocusables[visibleFocusables.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === firstEl) {
      e.preventDefault();
      lastEl.focus();
    }
  } else {
    if (document.activeElement === lastEl) {
      e.preventDefault();
      firstEl.focus();
    }
  }
}

function openQRModal(titleText, shareUrl, triggerEl) {
  const modal = document.getElementById('qr-modal');
  const titleEl = document.getElementById('qr-modal-campaign-name');
  const svgContainer = document.getElementById('qr-code-svg-container');
  const urlEl = document.getElementById('qr-modal-url-text');
  const closeBtn = document.getElementById('qr-modal-close-btn');

  if (!modal || !svgContainer) return;

  state.lastFocusedElement = triggerEl || document.activeElement;

  if (titleEl) titleEl.textContent = titleText;
  if (urlEl) urlEl.textContent = shareUrl;

  try {
    svgContainer.innerHTML = QRCodeGen.createSVG(shareUrl);
  } catch (err) {
    console.error('Failed to generate QR Code:', err);
    svgContainer.textContent = shareUrl;
  }

  modal.classList.add('open');
  modal.removeAttribute('hidden');
  state.isQRModalOpen = true;

  if (closeBtn) {
    setTimeout(() => closeBtn.focus(), 50);
  }
}

function closeQRModal() {
  const modal = document.getElementById('qr-modal');
  if (!modal) return;

  modal.classList.remove('open');
  modal.setAttribute('hidden', '');
  state.isQRModalOpen = false;

  if (state.lastFocusedElement && typeof state.lastFocusedElement.focus === 'function') {
    state.lastFocusedElement.focus();
    state.lastFocusedElement = null;
  }
}

function setLanguage(lang) {
  state.currentLang = lang;
  localStorage.setItem('parknest_lang', lang);
  renderApp();
}

function renderApp() {
  const lang = state.currentLang;
  const content = state.contentData;
  const fundraisers = state.fundraisersData.fundraisers;

  document.documentElement.lang = lang;

  const i18nElements = document.querySelectorAll('[data-i18n]');
  i18nElements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    const textObj = getNestedProperty(content, key);
    if (textObj && textObj[lang]) {
      el.textContent = textObj[lang];
    }
  });

  const i18nAttrElements = document.querySelectorAll('[data-i18n-attr]');
  i18nAttrElements.forEach(el => {
    const attrMapping = el.getAttribute('data-i18n-attr');
    const [attrName, key] = attrMapping.split(':');
    const textObj = getNestedProperty(content, key);
    if (textObj && textObj[lang]) {
      el.setAttribute(attrName, textObj[lang]);
    }
  });

  const langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach(btn => {
    const btnLang = btn.getAttribute('data-lang');
    const isActive = btnLang === lang;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });

  const toggleBtn = document.getElementById('menu-toggle-btn');
  if (toggleBtn) {
    const labelSpan = toggleBtn.querySelector('.menu-toggle-label');
    if (labelSpan && content.nav) {
      labelSpan.textContent = state.isNavOpen
        ? (content.nav.closeMenu[lang] || 'Sluiten')
        : (content.nav.openMenu[lang] || 'Menu');
    }
  }

  renderFundraisers(fundraisers, content, lang);
  renderRooieJaapEquipment(content.rooieJaapEquipment, lang);
  renderTimeline(content.timeline.events, lang);
  renderSources(content.sources.links, lang);
  renderThankYou(state.donorsData, content, lang);
}

function renderThankYou(donorsData, content, lang) {
  const container = document.getElementById('donor-wall');
  if (!container) return;

  const donors = (donorsData && Array.isArray(donorsData.donors)) ? donorsData.donors : [];

  if (donors.length === 0) {
    const fallbackText = content?.thankYou?.fallbackMessage?.[lang] ||
      (lang === 'en'
        ? 'Thanks to all friends, supporters, and neighbors who care about ParkNest.'
        : 'Dank aan alle vrienden, supporters en buurtbewoners die ParkNest een warm hart toe dragen.');
    container.innerHTML = `<p class="donor-fallback-message">${fallbackText}</p>`;
    return;
  }

  // Construct dynamic item sequence with gratitude gestures interspersed every ~4 donors
  const gestures = ['🫶', '🫰'];
  let gestureIdx = 0;
  const itemsSequence = [];

  donors.forEach((donor, index) => {
    itemsSequence.push({ type: 'name', value: donor.name });
    if ((index + 1) % 4 === 0) {
      itemsSequence.push({ type: 'gesture', value: gestures[gestureIdx % gestures.length] });
      gestureIdx++;
    }
  });

  // Distribute items across 3 woven rows
  const rowCount = 3;
  const rows = [[], [], []];

  itemsSequence.forEach((item, index) => {
    rows[index % rowCount].push(item);
  });

  // Calculate animation parameters for smooth staggered entry
  const lifecycleDuration = 9; // seconds per lifecycle
  const totalItemsCount = itemsSequence.length;

  container.innerHTML = '';

  rows.forEach((rowItems, rowIndex) => {
    const rowEl = document.createElement('div');
    rowEl.className = `donor-row donor-row-${rowIndex + 1}`;

    // Ensure enough items per row to feel full by duplicating sequence if row is small
    let displayItems = [...rowItems];
    if (displayItems.length > 0 && displayItems.length < 5) {
      displayItems = [...displayItems, ...displayItems, ...displayItems];
    }

    displayItems.forEach((item, itemIndex) => {
      const span = document.createElement('span');
      if (item.type === 'gesture') {
        span.className = 'donor-item donor-gesture';
        span.setAttribute('aria-hidden', 'true');
      } else {
        span.className = 'donor-item';
      }
      span.textContent = item.value;

      // Stagger delay based on position across rows
      const globalIndex = rowIndex + itemIndex * rowCount;
      const delay = (globalIndex * (lifecycleDuration / Math.max(totalItemsCount, 1))).toFixed(2);
      span.style.setProperty('--item-delay', `${delay}s`);

      rowEl.appendChild(span);
    });

    container.appendChild(rowEl);
  });
}

function renderFundraisers(fundraisers, content, lang) {
  const collectiveContainer = document.getElementById('collective-fundraisers-list');
  const personalContainer = document.getElementById('personal-fundraisers-list');

  if (!collectiveContainer || !personalContainer) return;

  collectiveContainer.innerHTML = '';
  personalContainer.innerHTML = '';

  const labels = content.fundraisersSection.labels;

  fundraisers.forEach(item => {
    const card = createFundraiserCard(item, labels, content.share, lang);
    if (item.category === 'collective') {
      collectiveContainer.appendChild(card);
    } else {
      personalContainer.appendChild(card);
    }
  });
}

function createFundraiserCard(item, labels, shareContent, lang) {
  const card = document.createElement('article');
  card.className = `fundraiser-card category-${item.category}`;
  card.id = `fundraiser-${item.id}`;

  const titleText = item.title[lang] || item.title.nl;
  const purposeText = item.purpose[lang] || item.purpose.nl;
  const targetFormatted = formatCurrency(item.financials.targetAmount, lang);
  const onlineRaisedFormatted = formatCurrency(item.financials.onlineAmountRaised, lang);
  const offlineRaisedFormatted = formatCurrency(item.financials.offlineDonationAmount, lang);
  const displayedTotalFormatted = formatCurrency(item.financials.displayedTotalRaised, lang);

  const cardBadgeLabel = state.contentData?.fundraisersSection?.cardBadges?.[item.id]?.[lang] ||
    state.contentData?.fundraisersSection?.campaignTypes?.[item.category]?.[lang] ||
    (item.category === 'collective' ? 'ALGEMENE PARKNEST-INZAMELING' : 'PERSOONLIJKE INZAMELING');

  const donationPurposePrefix = state.contentData?.fundraisersSection?.donationPurposePrefix?.[lang] ||
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

  // WhatsApp & Email share texts
  const waText = encodeURIComponent(
    lang === 'en'
      ? `Check out this specific fundraiser for ${titleText} (${purposeText}): ${shareUrl}`
      : `Bekijk deze specifieke inzamelingsactie voor ${titleText} (${purposeText}): ${shareUrl}`
  );
  const emailSubject = encodeURIComponent(
    lang === 'en'
      ? `Fundraiser: ${titleText}`
      : `Inzamelingsactie: ${titleText}`
  );
  const emailBody = encodeURIComponent(
    lang === 'en'
      ? `Check out this specific fundraiser for ${titleText}.\n\nPurpose: ${purposeText}\n\nLink: ${shareUrl}`
      : `Bekijk deze specifieke inzamelingsactie voor ${titleText}.\n\nDoel: ${purposeText}\n\nLink: ${shareUrl}`
  );

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

    <div class="card-share-section">
      <button type="button" class="share-toggle-btn" aria-expanded="false">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="share-icon"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
        <span>${shareContent?.shareAction?.[lang] || 'Delen'}</span>
      </button>

      <div class="card-share-container" hidden>
        ${navigator.share ? `
          <button type="button" class="share-btn native-share-btn">
            ${shareContent?.webShare?.[lang] || 'Delen...'}
          </button>
        ` : ''}
        <a href="https://wa.me/?text=${waText}" target="_blank" rel="noopener noreferrer" class="share-btn whatsapp-btn">
          ${shareContent?.whatsapp?.[lang] || 'WhatsApp'}
        </a>
        <a href="mailto:?subject=${emailSubject}&body=${emailBody}" class="share-btn email-btn">
          ${shareContent?.email?.[lang] || 'E-mail'}
        </a>
        <button type="button" class="share-btn copy-link-btn">
          ${shareContent?.copyLink?.[lang] || 'Kopieer link'}
        </button>
        <button type="button" class="share-btn qr-code-btn">
          ${shareContent?.qrCode?.[lang] || 'QR Code'}
        </button>
      </div>
    </div>
  `;

  // Attach share section event listeners
  const shareToggleBtn = card.querySelector('.share-toggle-btn');
  const shareContainer = card.querySelector('.card-share-container');
  const nativeShareBtn = card.querySelector('.native-share-btn');
  const copyLinkBtn = card.querySelector('.copy-link-btn');
  const qrCodeBtn = card.querySelector('.qr-code-btn');

  if (shareToggleBtn && shareContainer) {
    shareToggleBtn.addEventListener('click', () => {
      const isExpanded = shareToggleBtn.getAttribute('aria-expanded') === 'true';
      shareToggleBtn.setAttribute('aria-expanded', !isExpanded ? 'true' : 'false');
      shareContainer.hidden = isExpanded;
    });
  }

  if (nativeShareBtn) {
    nativeShareBtn.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({
          title: titleText,
          text: purposeText,
          url: shareUrl
        }).catch(err => console.log('Native share cancelled:', err));
      }
    });
  }

  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(shareUrl).then(() => {
        const origText = copyLinkBtn.textContent;
        copyLinkBtn.textContent = shareContent?.copiedFeedback?.[lang] || 'Link gekopieerd!';
        copyLinkBtn.classList.add('copied');
        setTimeout(() => {
          copyLinkBtn.textContent = origText;
          copyLinkBtn.classList.remove('copied');
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy link:', err);
      });
    });
  }

  if (qrCodeBtn) {
    qrCodeBtn.addEventListener('click', (e) => {
      openQRModal(titleText, shareUrl, e.currentTarget);
    });
  }

  return card;
}

function renderRooieJaapEquipment(contentEquipment, lang) {
  const container = document.getElementById('rooie-jaap-equipment-container');
  if (!container || !contentEquipment) return;

  const rooieJaapFundraiser = state.fundraisersData?.fundraisers?.find(f => f.id === 'rooie-jaap-knives');
  const equipmentRef = rooieJaapFundraiser?.equipmentReferences;

  if (!equipmentRef || !equipmentRef.items) return;

  const locale = lang === 'en' ? 'en-US' : 'nl-NL';
  const formatPrice = (val) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(val);

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

document.addEventListener('DOMContentLoaded', initApp);
