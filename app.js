/**
 * ParkNest Fundraiser Transparency App
 * Bootstrap / Controller module connecting state, data, UI components, and feature renderers.
 */

import { state } from './src/core/state.js';
import { loadAppData } from './src/core/data.js';
import { updateI18nDOM, updateLangButtons } from './src/core/i18n.js';
import { setupLanguageSwitcher, setupMobileNav, updateMenuToggleLabel } from './src/ui/navigation.js';
import { setupQRModal } from './src/ui/qr-modal.js';
import { setupSiteShare, updateSiteShareUI } from './src/ui/site-share.js';
import { renderFundraisers } from './src/features/fundraisers/render.js';
import { renderRooieJaapEquipment } from './src/features/rooie-jaap/equipment.js';
import { renderTimeline } from './src/features/timeline/render.js';
import { renderSources } from './src/features/sources/render.js';
import { renderThankYou } from './src/features/thank-you/donor-wall.js';

async function initApp() {
  try {
    const savedLang = localStorage.getItem('parknest_lang');
    if (savedLang && ['nl', 'en'].includes(savedLang)) {
      state.currentLang = savedLang;
    }

    const { fundraisersData, contentData, donorsData } = await loadAppData();
    state.fundraisersData = fundraisersData;
    state.contentData = contentData;
    state.donorsData = donorsData;

    setupLanguageSwitcher(setLanguage);
    setupMobileNav(state, state.contentData);
    setupQRModal(state);
    setupSiteShare(state);

    renderApp();
  } catch (error) {
    console.error('App initialization error:', error);
  }
}

function setLanguage(lang) {
  if (lang === state.currentLang) return;
  state.currentLang = lang;
  localStorage.setItem('parknest_lang', lang);
  renderApp();
}

function renderApp() {
  const lang = state.currentLang;
  const content = state.contentData;
  const fundraisers = state.fundraisersData.fundraisers;

  document.documentElement.lang = lang;

  updateI18nDOM(content, lang);
  updateLangButtons(lang);
  updateMenuToggleLabel(state, content);
  updateSiteShareUI(state, content);

  renderFundraisers(fundraisers, content, lang, state);
  renderRooieJaapEquipment(content.rooieJaapEquipment, lang, state.fundraisersData);
  renderTimeline(content.timeline.events, lang);
  renderSources(content.sources.links, lang);
  renderThankYou(state.donorsData, content, lang);
}

document.addEventListener('DOMContentLoaded', initApp);
