/**
 * Internationalization (i18n) helpers for nested content lookup and DOM translation updates.
 */

/**
 * Utility to safely access nested object properties via dot notation.
 * @param {Object} obj
 * @param {string} path
 * @returns {any}
 */
export function getNestedProperty(obj, path) {
  return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : null), obj);
}

/**
 * Updates DOM elements with data-i18n and data-i18n-attr attributes for the specified language.
 * @param {Object} content
 * @param {string} lang
 */
export function updateI18nDOM(content, lang) {
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
}

/**
 * Updates language switcher buttons active states and aria-pressed attributes.
 * @param {string} lang
 */
export function updateLangButtons(lang) {
  const langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach(btn => {
    const btnLang = btn.getAttribute('data-lang');
    const isActive = btnLang === lang;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}
