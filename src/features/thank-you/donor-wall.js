/**
 * Renders the Thank You / Donor wall section.
 * Preserves donor source data, approved names, gesture sequence (🫶 / 🫰),
 * 3-row woven layout, accessibility label, and reduced motion behavior.
 * @param {Object} donorsData
 * @param {Object} content
 * @param {string} lang
 */
export function renderThankYou(donorsData, content, lang) {
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

  container.innerHTML = '';

  rows.forEach((rowItems, rowIndex) => {
    if (rowItems.length === 0) return;

    const rowEl = document.createElement('div');
    rowEl.className = `donor-row donor-row-${rowIndex + 1}`;

    rowItems.forEach((item, itemIndex) => {
      const span = document.createElement('span');
      if (item.type === 'gesture') {
        span.className = 'donor-item donor-gesture';
        span.setAttribute('aria-hidden', 'true');
      } else {
        span.className = 'donor-item';
      }
      span.textContent = item.value;

      // Organic spatial shifts and staggered timing delays for interwoven stream
      const globalIndex = rowIndex + itemIndex * rowCount;
      const delay = (globalIndex * 1.8).toFixed(2);
      const xShift = (itemIndex % 2 === 0 ? 1 : -1) * (4 + (globalIndex % 3) * 3);
      const yShift = (itemIndex % 3 === 0 ? -1 : 1) * (2 + (globalIndex % 2) * 2);

      span.style.setProperty('--item-delay', `${delay}s`);
      span.style.setProperty('--x-shift', `${xShift}px`);
      span.style.setProperty('--y-shift', `${yShift}px`);

      rowEl.appendChild(span);
    });

    container.appendChild(rowEl);
  });
}
