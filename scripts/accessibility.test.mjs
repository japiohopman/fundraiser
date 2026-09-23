import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { createFundraiserCard } from '../src/features/fundraisers/card.js';

const rootDir = process.cwd();
const htmlContent = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const cssContent = fs.readFileSync(path.join(rootDir, 'styles.css'), 'utf8');
const contentData = JSON.parse(fs.readFileSync(path.join(rootDir, 'data/content.json'), 'utf8'));
const fundraisersData = JSON.parse(fs.readFileSync(path.join(rootDir, 'data/fundraisers.json'), 'utf8'));

test('Accessibility: index.html landmark structure and skip link', () => {
  // Landmarks
  assert.match(htmlContent, /<header\s+[^>]*role="banner"/i, '<header role="banner"> landmark must exist');
  assert.match(htmlContent, /<main\s+[^>]*id="main-content"[^>]*role="main"/i, '<main id="main-content" role="main"> landmark must exist');
  assert.match(htmlContent, /<main\s+[^>]*tabindex="-1"/i, 'main content must have tabindex="-1" for skip link target focus');
  assert.match(htmlContent, /<footer\s+[^>]*role="contentinfo"/i, '<footer role="contentinfo"> landmark must exist');

  // Skip link
  assert.match(htmlContent, /<a\s+[^>]*href="#main-content"\s+class="skip-link"/i, 'Skip link element pointing to #main-content must exist');

  // Warning region landmark
  assert.match(htmlContent, /class="prominent-warning-box"\s+role="region"\s+aria-labelledby="prominent-warning-title"/i, 'Warning banner must have role="region" and aria-labelledby');
});

test('Accessibility: modal dialog structure and attributes', () => {
  // Context modal
  assert.match(htmlContent, /id="context-modal"\s+class="modal-overlay"\s+role="dialog"\s+aria-modal="true"\s+aria-labelledby="context-modal-title"\s+hidden/i, '#context-modal must have role="dialog", aria-modal="true", aria-labelledby, and hidden');

  // QR modal
  assert.match(htmlContent, /id="qr-modal"\s+class="modal-overlay"\s+role="dialog"\s+aria-modal="true"\s+aria-labelledby="qr-modal-title"\s+aria-describedby="qr-modal-desc"\s+hidden/i, '#qr-modal must have role="dialog", aria-modal="true", aria-labelledby, aria-describedby, and hidden');
});

test('Accessibility: fundraiser card progressbar and share control attributes', () => {
  if (typeof globalThis.window === 'undefined') {
    globalThis.window = { location: { href: 'https://japiohopman.github.io/fundraiser' } };
  }
  if (typeof globalThis.document === 'undefined') {
    globalThis.document = {
      createElement: () => ({
        className: '',
        id: '',
        innerHTML: '',
        querySelector: () => null,
        querySelectorAll: () => []
      })
    };
  }

  const sampleItem = fundraisersData.fundraisers[0]; // parknest-collective
  const labels = contentData.fundraisersSection.labels;
  const shareContent = contentData.share;

  const card = createFundraiserCard(sampleItem, labels, shareContent, 'nl', contentData, {});
  const innerHTML = card.innerHTML;

  // Progressbar ARIA attributes
  assert.match(innerHTML, /role="progressbar"/i, 'Card HTML must contain role="progressbar"');
  assert.match(innerHTML, /aria-valuenow="\d+"/i, 'Progressbar must carry aria-valuenow');
  assert.match(innerHTML, /aria-valuemin="0"/i, 'Progressbar must carry aria-valuemin="0"');
  assert.match(innerHTML, /aria-valuemax="100"/i, 'Progressbar must carry aria-valuemax="100"');
  assert.match(innerHTML, /aria-valuetext="[^"]+"/i, 'Progressbar must carry aria-valuetext');
  assert.match(innerHTML, /aria-label="[^"]+"/i, 'Progressbar must carry aria-label');

  // Card share controls
  assert.match(innerHTML, /class="[^"]*share-toggle-btn[^"]*"/i, 'Share button must exist');
  assert.match(innerHTML, /aria-haspopup="dialog"/i, 'Share button must carry aria-haspopup="dialog" to trigger shared QR overlay');
});

test('Accessibility: styles.css contains focus-visible, touch target and reduced motion rules', () => {
  assert.ok(cssContent.includes(':focus-visible'), 'styles.css must contain :focus-visible rules');
  assert.ok(cssContent.includes('prefers-reduced-motion'), 'styles.css must contain prefers-reduced-motion query');
  assert.ok(cssContent.includes('scroll-behavior: auto !important'), 'styles.css must disable smooth scroll under prefers-reduced-motion');
  assert.ok(cssContent.includes('.modal-close-btn'), 'styles.css must style .modal-close-btn');
});

test('Accessibility regression: QR modal focus lifecycle on rapid open/close', async () => {
  const { openQRModal, closeQRModal } = await import('../src/ui/qr-modal.js');

  let focusedElement = null;
  const triggerBtn = {
    focus: () => { focusedElement = triggerBtn; }
  };

  const closeBtn = {
    id: 'qr-modal-close-btn',
    focus: () => { focusedElement = closeBtn; }
  };

  const modal = {
    id: 'qr-modal',
    hidden: true,
    classList: {
      add: (cls) => { if (cls === 'open') modal.isOpenClass = true; },
      remove: (cls) => { if (cls === 'open') modal.isOpenClass = false; }
    },
    hasAttribute: (attr) => attr === 'hidden' ? modal.hidden : false,
    setAttribute: (attr, val) => { if (attr === 'hidden') modal.hidden = true; },
    removeAttribute: (attr) => { if (attr === 'hidden') modal.hidden = false; }
  };

  const titleEl = { textContent: '' };
  const campaignNameEl = { textContent: '', style: {} };
  const thankYouEl = { textContent: '', style: {} };
  const descEl = { textContent: '' };
  const svgContainer = { innerHTML: '' };
  const urlEl = { textContent: '' };

  const originalDoc = globalThis.document;
  globalThis.document = {
    getElementById: (id) => {
      if (id === 'qr-modal') return modal;
      if (id === 'qr-modal-title') return titleEl;
      if (id === 'qr-modal-campaign-name') return campaignNameEl;
      if (id === 'qr-modal-thank-you') return thankYouEl;
      if (id === 'qr-modal-desc') return descEl;
      if (id === 'qr-code-svg-container') return svgContainer;
      if (id === 'qr-modal-url-text') return urlEl;
      if (id === 'qr-modal-close-btn') return closeBtn;
      return null;
    },
    body: {
      contains: (el) => el === closeBtn
    },
    activeElement: triggerBtn
  };

  try {
    const state = { isQRModalOpen: false };

    // 1. Rapidly open QR modal
    openQRModal(state, 'Test Title', 'https://example.com', triggerBtn);
    assert.equal(state.isQRModalOpen, true);
    assert.equal(modal.hidden, false);

    // 2. Immediately close QR modal before 50ms focus timeout elapses
    closeQRModal(state);
    assert.equal(state.isQRModalOpen, false);
    assert.equal(modal.hidden, true);
    assert.equal(focusedElement, triggerBtn, 'Focus must be restored immediately to triggerBtn on close');

    // 3. Wait longer than 50ms timeout window
    await new Promise((resolve) => setTimeout(resolve, 80));

    // 4. Confirm focus did NOT leak to the now-hidden close button
    assert.notEqual(focusedElement, closeBtn, 'Delayed callback must NOT focus close button when modal was immediately closed');
    assert.equal(focusedElement, triggerBtn, 'Focus must remain on restored trigger button');
  } finally {
    globalThis.document = originalDoc;
  }
});
