/**
 * Renders timeline events list into the designated container.
 * @param {Array} events
 * @param {string} lang
 */
export function renderTimeline(events, lang) {
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
