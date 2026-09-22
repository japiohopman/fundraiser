import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

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

test('renderCampaignStats outputs internal legend and stat box links to #fundraiser-[id]', () => {
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

  if (typeof globalThis.document === 'undefined') {
    globalThis.document = {
      getElementById: (id) => elements[id] || null,
      addEventListener: () => {}
    };
  } else {
    const origGetById = globalThis.document.getElementById;
    globalThis.document.getElementById = (id) => elements[id] || (origGetById ? origGetById.call(globalThis.document, id) : null);
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
