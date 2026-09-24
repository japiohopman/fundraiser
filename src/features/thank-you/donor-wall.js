/**
 * Renders the Thank You / Donor wall section.
 * Preserves donor source data, approved names, gesture sequence (🫶 / 🫰),
 * split donor zones (start/left/upper and end/right/lower), accessibility labels,
 * and reduced motion behavior.
 * @param {Object} donorsData
 * @param {Object} content
 * @param {string} lang
 */
export function renderThankYou(donorsData, content, lang) {
  const container = document.getElementById('donor-wall');
  if (!container) return;

  let heartEl = container.querySelector('.thank-you-heart-container');
  let zoneStart = container.querySelector('.donor-zone-start');
  let zoneEnd = container.querySelector('.donor-zone-end');

  // Structural recovery if innerHTML was overwritten
  if (!heartEl) {
    heartEl = document.createElement('div');
    heartEl.className = 'thank-you-heart-container';
    const titleText = content?.thankYou?.title?.[lang] || '';
    const msgText = content?.thankYou?.message?.[lang] || '';
    heartEl.innerHTML = `
      <svg class="thank-you-heart-svg" viewBox="0 0 512 512" width="480" height="480" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M480.25 156.355c0 161.24-224.25 324.43-224.25 324.43S31.75 317.595 31.75 156.355c0-91.41 70.63-125.13 107.77-125.13 77.65 0 116.48 65.72 116.48 65.72s38.83-65.73 116.48-65.73c37.14.01 107.77 33.72 107.77 125.14z"/>
      </svg>
      <div class="thank-you-gratitude-content">
        <h2 id="thank-you-title" class="thank-you-display-title" data-i18n="thankYou.title">${titleText}</h2>
        <p class="thank-you-display-message" data-i18n="thankYou.message">${msgText}</p>
      </div>
    `;
  }

  if (!zoneStart) {
    zoneStart = document.createElement('div');
    zoneStart.className = 'donor-zone donor-zone-start';
  }

  if (!zoneEnd) {
    zoneEnd = document.createElement('div');
    zoneEnd.className = 'donor-zone donor-zone-end';
  }

  // Ensure correct DOM order inside container: zoneStart -> heartEl -> zoneEnd
  container.innerHTML = '';
  container.appendChild(zoneStart);
  container.appendChild(heartEl);
  container.appendChild(zoneEnd);

  zoneStart.innerHTML = '';
  zoneEnd.innerHTML = '';

  const donors = (donorsData && Array.isArray(donorsData.donors)) ? donorsData.donors : [];

  if (donors.length === 0) {
    const fallbackText = content?.thankYou?.fallbackMessage?.[lang] || '';
    if (fallbackText) {
      zoneEnd.innerHTML = `<p class="donor-fallback-message">${fallbackText}</p>`;
    }
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

  const totalItems = itemsSequence.length;
  const staggerStep = 1.6;
  const totalDuration = Math.max(totalItems * staggerStep, 6.0);
  container.style.setProperty('--total-duration', `${totalDuration.toFixed(2)}s`);

  // Distribute sequence evenly between start zone (left/upper) and end zone (right/lower)
  const midPoint = Math.ceil(totalItems / 2);

  itemsSequence.forEach((item, globalIndex) => {
    const span = document.createElement('span');
    if (item.type === 'gesture') {
      span.className = 'donor-item donor-gesture';
      span.setAttribute('aria-hidden', 'true');
    } else {
      span.className = 'donor-item';
    }
    span.textContent = item.value;

    const delay = (-globalIndex * staggerStep).toFixed(2);
    const xShift = (globalIndex % 2 === 0 ? 1 : -1) * (4 + (globalIndex % 3) * 3);
    const yShift = (globalIndex % 3 === 0 ? -1 : 1) * (2 + (globalIndex % 2) * 2);

    span.style.setProperty('--item-delay', `${delay}s`);
    span.style.setProperty('--x-shift', `${xShift}px`);
    span.style.setProperty('--y-shift', `${yShift}px`);

    if (globalIndex < midPoint) {
      zoneStart.appendChild(span);
    } else {
      zoneEnd.appendChild(span);
    }
  });
}
