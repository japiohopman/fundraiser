import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { createFundraiserCard } from '../src/features/fundraisers/card.js';
import { renderCampaignStats } from '../src/features/fundraisers/stats.js';
import { setupContextModal, closeContextModal } from '../src/ui/context-modal.js';

const contentData = JSON.parse(readFileSync(new URL('../data/content.json', import.meta.url), 'utf8'));
const fundraisersData = JSON.parse(readFileSync(new URL('../data/fundraisers.json', import.meta.url), 'utf8'));

test('index.html purpose section contains internal links for all six fundraiser cards', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  const campaignIds = [
    'parknest-collective',
    'kathinka-dog-collars',
    'jim-gijbels-paintings',
    'rooie-jaap-knives',
    'suzy-creamcheese-kitchenware',
    'manon-kinkt-shirts'
  ];

  campaignIds.forEach(id => {
    assert.ok(
      html.includes(`href="#fundraiser-${id}"`),
      `index.html purpose section should contain internal link for #fundraiser-${id}`
    );
  });
});

test('createFundraiserCard sets tabindex="-1" on article element for keyboard focusability', () => {
  if (typeof globalThis.window === 'undefined') {
    globalThis.window = { location: { href: 'https://japiohopman.github.io/fundraiser' } };
  }
  if (typeof globalThis.document === 'undefined') {
    globalThis.document = {
      createElement: () => ({
        className: '',
        id: '',
        tabIndex: 0,
        innerHTML: '',
        querySelector: () => null,
        querySelectorAll: () => []
      })
    };
  }

  const jaapItem = fundraisersData.fundraisers.find(f => f.id === 'rooie-jaap-knives');
  const labels = contentData.fundraisersSection.labels;
  const shareContent = contentData.share;
  const state = { fundraisersData, contentData };

  const card = createFundraiserCard(jaapItem, labels, shareContent, 'nl', contentData, state);
  assert.equal(card.tabIndex, -1, 'Fundraiser card article element should have tabIndex = -1');
});

test('renderCampaignStats outputs internal legend and stat box links and keyboard-focusable donut segments', () => {
  class MockElement {
    constructor() {
      this.innerHTML = '';
    }
    querySelectorAll() {
      return [];
    }
  }

  const container = new MockElement();
  renderCampaignStats(container, fundraisersData.fundraisers, contentData, 'nl');

  const html = container.innerHTML;

  const campaignIds = [
    'parknest-collective',
    'kathinka-dog-collars',
    'jim-gijbels-paintings',
    'rooie-jaap-knives',
    'suzy-creamcheese-kitchenware',
    'manon-kinkt-shirts'
  ];

  campaignIds.forEach(id => {
    assert.ok(
      html.includes(`href="#fundraiser-${id}"`),
      `renderCampaignStats should output internal anchor link for #fundraiser-${id}`
    );
  });

  // Verify SVG donut segment keyboard accessibility attributes
  assert.ok(html.includes('tabindex="0"'), 'Donut segment circles should be keyboard focusable with tabindex="0"');
  assert.ok(html.includes('role="link"'), 'Donut segment circles should have role="link"');
});

test('context modal closes and navigates when internal campaign link is clicked', () => {
  let modalClosed = false;
  let scrolledToTarget = false;
  let focusedTarget = false;

  const mockTarget = {
    scrollIntoView: () => { scrolledToTarget = true; },
    focus: () => { focusedTarget = true; }
  };

  const listeners = {};
  const mockBody = {
    addEventListener: (event, handler) => {
      listeners[event] = handler;
    }
  };

  const mockModal = {
    classList: { add: () => {}, remove: () => {} },
    setAttribute: () => {},
    removeAttribute: () => {},
    addEventListener: () => {}
  };

  const mockCloseBtn = {
    addEventListener: () => {}
  };

  const elements = {
    'context-modal': mockModal,
    'context-modal-close-btn': mockCloseBtn,
    'context-modal-body': mockBody,
    'fundraiser-suzy-creamcheese-kitchenware': mockTarget
  };

  const mockDocument = {
    getElementById: (id) => elements[id] || null,
    addEventListener: () => {},
    activeElement: null
  };

  if (typeof globalThis.document === 'undefined') {
    globalThis.document = mockDocument;
  } else {
    const origGetById = globalThis.document.getElementById;
    globalThis.document.getElementById = (id) => elements[id] || (origGetById ? origGetById.call(globalThis.document, id) : null);
    if (!globalThis.document.addEventListener) {
      globalThis.document.addEventListener = () => {};
    }
  }

  if (typeof globalThis.window === 'undefined') {
    globalThis.window = { location: { hash: '' } };
  }

  const state = { isContextModalOpen: true };

  setupContextModal(state);

  assert.ok(listeners['click'], 'Click listener attached to context modal body');

  const mockLink = {
    getAttribute: (attr) => attr === 'href' ? '#fundraiser-suzy-creamcheese-kitchenware' : null
  };

  const mockEvent = {
    preventDefault: () => {},
    target: {
      closest: (selector) => selector === 'a[href^="#fundraiser-"]' ? mockLink : null
    }
  };

  listeners['click'](mockEvent);

  assert.equal(state.isContextModalOpen, false, 'Context modal should be closed');
  assert.equal(scrolledToTarget, true, 'Should scroll to target fundraiser card');
  assert.equal(focusedTarget, true, 'Should focus target fundraiser card');
  assert.equal(globalThis.window.location.hash, '#fundraiser-suzy-creamcheese-kitchenware', 'Hash location should update to target fundraiser');
});
