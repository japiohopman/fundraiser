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
