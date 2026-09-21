import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { createFundraiserCard } from '../src/features/fundraisers/card.js';
import { openContextModal } from '../src/ui/context-modal.js';

const contentData = JSON.parse(readFileSync(new URL('../data/content.json', import.meta.url), 'utf8'));
const fundraisersData = JSON.parse(readFileSync(new URL('../data/fundraisers.json', import.meta.url), 'utf8'));

test('data/content.json contains valid parknest-collective campaignContext structure', () => {
  const context = contentData?.fundraisersSection?.campaignContext?.['parknest-collective'];
  assert.ok(context, 'parknest-collective campaignContext should exist');

  // Verify title and summary
  assert.ok(context.title?.nl && context.title?.en, 'Title should exist in NL and EN');
  assert.ok(context.summary?.nl && context.summary?.en, 'Summary should exist in NL and EN');
  assert.ok(context.summary.nl.length > 50 && context.summary.nl.length < 400, 'Summary should be concise (~2-3 sentences)');

  // Verify sections
  assert.ok(Array.isArray(context.sections), 'Sections should be an array');
  assert.equal(context.sections.length, 4, 'Should have 4 structured sections');

  const sectionHeadingsNL = context.sections.map(s => s.heading?.nl);
  assert.deepEqual(sectionHeadingsNL, [
    'ParkNest vóór de brand',
    'Wat verloren ging',
    'Wat doorgaat',
    'Waar de crowdfunding voor bedoeld is'
  ]);

  const sectionHeadingsEN = context.sections.map(s => s.heading?.en);
  assert.deepEqual(sectionHeadingsEN, [
    'ParkNest before the fire',
    'What was lost',
    'What continues',
    'What the crowdfunding supports'
  ]);

  // Section 4 bullets check
  assert.ok(Array.isArray(context.sections[3].bullets), 'Section 4 should have bullet list');
  assert.equal(context.sections[3].bullets.length, 4, 'Section 4 should have 4 bullets');
});

test('parknest-collective context enforces factual dates and volunteer group facts without unconfirmed names', () => {
  const context = contentData?.fundraisersSection?.campaignContext?.['parknest-collective'];
  const jsonString = JSON.stringify(context);

  // Factual dates check
  assert.match(jsonString, /20 op vrijdag 21 augustus 2026/, 'NL date should be exact');
  assert.match(jsonString, /20 to Friday 21 August 2026/, 'EN date should be exact');

  // Volunteer group fact check
  assert.match(jsonString, /dertig vrijwilligers/i, 'NL volunteer group fact present');
  assert.match(jsonString, /thirty volunteers/i, 'EN volunteer group fact present');
  assert.match(jsonString, /19 tot 80 jaar/i, 'NL volunteer age range present');
  assert.match(jsonString, /19 to 80/i, 'EN volunteer age range present');

  // Candidate names check (must NOT be published yet)
  const unconfirmedNames = ['Jos', 'Kris', 'Murat'];
  unconfirmedNames.forEach(name => {
    assert.equal(jsonString.includes(name), false, `Unconfirmed name ${name} should not be in content`);
  });
});

test('createFundraiserCard uses dedicated campaignContext.summary for parknest-collective', () => {
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

  const parknestItem = fundraisersData.fundraisers.find(f => f.id === 'parknest-collective');
  const labels = contentData.fundraisersSection.labels;
  const shareContent = contentData.share;
  const state = { fundraisersData, contentData };

  const cardNL = createFundraiserCard(parknestItem, labels, shareContent, 'nl', contentData, state);
  const purposeMatchNL = cardNL.innerHTML.match(/<p class=\"fundraiser-purpose\">([\s\S]*?)<\/p>/i);
  assert.ok(purposeMatchNL, 'fundraiser-purpose element rendered in card HTML');
  assert.equal(
    purposeMatchNL[1].trim(),
    contentData.fundraisersSection.campaignContext['parknest-collective'].summary.nl.trim(),
    'Card description should match campaignContext.summary instead of item.purpose'
  );

  const cardEN = createFundraiserCard(parknestItem, labels, shareContent, 'en', contentData, state);
  const purposeMatchEN = cardEN.innerHTML.match(/<p class=\"fundraiser-purpose\">([\s\S]*?)<\/p>/i);
  assert.ok(purposeMatchEN, 'fundraiser-purpose element rendered in card HTML');
  assert.equal(
    purposeMatchEN[1].trim(),
    contentData.fundraisersSection.campaignContext['parknest-collective'].summary.en.trim(),
    'Card description in EN should match EN summary'
  );
});

test('openContextModal renders structured sections in NL and EN for parknest-collective', () => {
  const elements = {};
  const mockModal = {
    classList: { add: () => {}, remove: () => {} },
    setAttribute: () => {},
    removeAttribute: () => {}
  };
  const mockTitle = { textContent: '' };
  const mockBody = { innerHTML: '' };
  const mockCloseBtn = { focus: () => {} };

  elements['context-modal'] = mockModal;
  elements['context-modal-title'] = mockTitle;
  elements['context-modal-body'] = mockBody;
  elements['context-modal-close-btn'] = mockCloseBtn;

  globalThis.document = {
    getElementById: (id) => elements[id] || null,
    activeElement: null
  };

  const parknestItem = fundraisersData.fundraisers.find(f => f.id === 'parknest-collective');
  const parknestContext = contentData.fundraisersSection.campaignContext['parknest-collective'];
  const state = { fundraisersData, contentData, isContextModalOpen: false };

  // NL modal test
  openContextModal(state, parknestContext, 'nl', null, parknestItem);
  assert.equal(mockTitle.textContent, 'ParkNest — Buurtplek & Herstelverhaal');

  const headingMatchesNL = mockBody.innerHTML.match(/<h4 class=\"context-modal-section-title\">([\s\S]*?)<\/h4>/g) || [];
  const renderedHeadingsNL = headingMatchesNL.map(h => h.replace(/<[^>]+>/g, '').trim());
  assert.deepEqual(renderedHeadingsNL, [
    'ParkNest vóór de brand',
    'Wat verloren ging',
    'Wat doorgaat',
    'Waar de crowdfunding voor bedoeld is'
  ]);

  const listItemsNL = mockBody.innerHTML.match(/<li>([\s\S]*?)<\/li>/g) || [];
  assert.equal(listItemsNL.length, 4, 'Should render 4 bullet points in NL');
  assert.match(listItemsNL[0], /activiteiten in het park blijven organiseren/);

  // EN modal test
  openContextModal(state, parknestContext, 'en', null, parknestItem);
  assert.equal(mockTitle.textContent, 'ParkNest — Community Space & Recovery Story');

  const headingMatchesEN = mockBody.innerHTML.match(/<h4 class=\"context-modal-section-title\">([\s\S]*?)<\/h4>/g) || [];
  const renderedHeadingsEN = headingMatchesEN.map(h => h.replace(/<[^>]+>/g, '').trim());
  assert.deepEqual(renderedHeadingsEN, [
    'ParkNest before the fire',
    'What was lost',
    'What continues',
    'What the crowdfunding supports'
  ]);
});

test('personal fundraiser campaignContext entries remain intact', () => {
  const personalIds = [
    'rooie-jaap-knives',
    'kathinka-dog-collars',
    'suzy-creamcheese-kitchenware',
    'jim-gijbels-paintings',
    'manon-kinkt-shirts'
  ];

  personalIds.forEach(id => {
    const context = contentData?.fundraisersSection?.campaignContext?.[id];
    assert.ok(context, `Personal fundraiser ${id} campaignContext must exist`);
    assert.ok(context.title, `Personal fundraiser ${id} title must exist`);
    assert.ok(context.text, `Personal fundraiser ${id} text must exist`);
  });
});
