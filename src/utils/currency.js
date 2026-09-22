/**
 * Format numbers as EUR currency strings.
 * @param {number|null|undefined} amount
 * @param {string} lang
 * @returns {string}
 */
export function formatCurrency(amount, lang) {
  if (amount === null || amount === undefined) return '—';
  const locale = lang === 'en' ? 'en-US' : 'nl-NL';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format percentages (e.g. 94.865 -> "94,87%" in NL, "94.87%" in EN).
 * @param {number} percentage - Percentage value from 0 to 100
 * @param {string} lang
 * @returns {string}
 */
export function formatPercentage(percentage, lang) {
  if (percentage === null || percentage === undefined || isNaN(percentage)) return '0%';
  const locale = lang === 'en' ? 'en-US' : 'nl-NL';
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(percentage / 100);
}
