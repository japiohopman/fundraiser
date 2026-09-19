/**
 * Renders source links list into the designated container.
 * @param {Array} links
 * @param {string} lang
 */
export function renderSources(links, lang) {
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
