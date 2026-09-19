/**
 * Handles language switcher wiring and mobile navigation behavior.
 */

/**
 * Connects language buttons to the language change callback.
 * @param {Function} onLanguageChange
 */
export function setupLanguageSwitcher(onLanguageChange) {
  const langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetLang = btn.getAttribute('data-lang');
      if (targetLang) {
        onLanguageChange(targetLang);
      }
    });
  });
}

/**
 * Initializes mobile drawer navigation toggles, keyboard escape listener, and click outside handling.
 * @param {Object} state
 * @param {Object} content
 */
export function setupMobileNav(state, content) {
  const toggleBtn = document.getElementById('menu-toggle-btn');
  const navMenu = document.getElementById('main-nav-menu');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMobileNav(state, content);
  });

  const navLinks = navMenu.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (state.isNavOpen) {
        toggleMobileNav(state, content, false);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.isNavOpen) {
      toggleMobileNav(state, content, false);
      toggleBtn.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (state.isNavOpen && !e.target.closest('.site-header')) {
      toggleMobileNav(state, content, false);
    }
  });
}

/**
 * Toggles or explicitly sets mobile nav drawer open state.
 * @param {Object} state
 * @param {Object} content
 * @param {boolean} [forceState]
 */
export function toggleMobileNav(state, content, forceState) {
  const toggleBtn = document.getElementById('menu-toggle-btn');
  const navMenu = document.getElementById('main-nav-menu');
  if (!toggleBtn || !navMenu) return;

  state.isNavOpen = forceState !== undefined ? forceState : !state.isNavOpen;

  toggleBtn.setAttribute('aria-expanded', state.isNavOpen ? 'true' : 'false');
  navMenu.classList.toggle('open', state.isNavOpen);
  document.body.classList.toggle('nav-drawer-open', state.isNavOpen);

  updateMenuToggleLabel(state, content);
}

/**
 * Updates the visible mobile toggle button text label.
 * @param {Object} state
 * @param {Object} content
 */
export function updateMenuToggleLabel(state, content) {
  const toggleBtn = document.getElementById('menu-toggle-btn');
  if (!toggleBtn) return;

  const labelSpan = toggleBtn.querySelector('.menu-toggle-label');
  if (labelSpan && content?.nav) {
    const lang = state.currentLang;
    labelSpan.textContent = state.isNavOpen
      ? (content.nav.closeMenu?.[lang] || 'Sluiten')
      : (content.nav.openMenu?.[lang] || 'Menu');
  }
}
