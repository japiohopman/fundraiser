import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { renderThankYou } from '../src/features/thank-you/donor-wall.js';

const rootDir = process.cwd();
const htmlContent = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const cssContent = fs.readFileSync(path.join(rootDir, 'styles.css'), 'utf8');
const contentData = JSON.parse(fs.readFileSync(path.join(rootDir, 'data/content.json'), 'utf8'));
const donorsData = JSON.parse(fs.readFileSync(path.join(rootDir, 'data/donors.json'), 'utf8'));

test('Thank You: index.html structure, heart container and accessibility attributes', () => {
  assert.match(htmlContent, /<section\s+[^>]*id="thank-you"[^>]*class="[^"]*thank-you-section[^"]*"/i, '#thank-you section must exist');
  assert.match(htmlContent, /aria-labelledby="thank-you-title"/i, 'thank-you section must be labelled by thank-you-title');

  assert.match(htmlContent, /id="donor-wall"[^>]*class="donor-wall"/i, '#donor-wall must exist');
  assert.match(htmlContent, /data-i18n-attr="aria-label:thankYou\.donorWallLabel"/i, '#donor-wall must carry i18n attribute for aria-label');

  assert.match(htmlContent, /class="donor-zone donor-zone-start"/i, '.donor-zone-start must exist inside #donor-wall');
  assert.match(htmlContent, /class="donor-zone donor-zone-end"/i, '.donor-zone-end must exist inside #donor-wall');

  assert.match(htmlContent, /class="thank-you-heart-container"/i, '.thank-you-heart-container must exist inside #donor-wall');
  assert.match(htmlContent, /class="thank-you-heart-svg"/i, 'Heart SVG must exist inside heart container');
  assert.match(htmlContent, /id="thank-you-title"\s+class="thank-you-display-title"\s+data-i18n="thankYou\.title"/i, 'Gratitude title must exist inside heart container');
  assert.match(htmlContent, /class="thank-you-display-message"\s+data-i18n="thankYou\.message"/i, 'Gratitude message must exist inside heart container');
});

test('Thank You: styles.css display typography, self-hosted font faces, grid layout and pill removal', () => {
  // Self-hosted Cormorant Garamond font face rules
  assert.match(cssContent, /font-family:\s*'Cormorant Garamond'/i, 'styles.css must specify Cormorant Garamond font-family');
  assert.match(cssContent, /public\/assets\/fonts\/cormorant-garamond-v21-latin-600\.woff2/i, 'styles.css must reference normal 600 woff2 font asset');
  assert.match(cssContent, /public\/assets\/fonts\/cormorant-garamond-v21-latin-600italic\.woff2/i, 'styles.css must reference italic 600 woff2 font asset');

  // Donor wall grid template layout
  assert.match(cssContent, /grid-template-columns:\s*1fr\s+minmax\([^)]+\)\s+1fr/i, 'styles.css must configure 3-column desktop grid for donor wall');
  assert.match(cssContent, /grid-template-areas:\s*"start heart end"/i, 'styles.css must set start, heart, and end grid template areas');

  // Removal of hard 1.5px border/background/shadow pill treatment in favor of Cormorant Garamond display typography
  assert.match(cssContent, /\.donor-item\s*\{[^}]*font-family:\s*var\(--font-display\)/i, '.donor-item must use var(--font-display)');
  assert.match(cssContent, /\.donor-item\s*\{[^}]*background:\s*transparent/i, '.donor-item must have transparent background');
  assert.match(cssContent, /\.donor-item\s*\{[^}]*border:\s*none/i, '.donor-item must have border: none');
  assert.match(cssContent, /\.donor-item\s*\{[^}]*box-shadow:\s*none/i, '.donor-item must have box-shadow: none');

  // Reduced motion support
  assert.match(cssContent, /@media\s*\([^)]*prefers-reduced-motion:\s*reduce[^)]*\)[\s\S]*?\.donor-item\s*\{[^}]*animation:\s*none\s*!important/i, 'Reduced motion query must disable animations on .donor-item');

  // Print stylesheet visibility rules for donor items
  assert.match(cssContent, /@media\s+print[\s\S]*?\.donor-item\s*\{[^}]*opacity:\s*1\s*!important/i, 'Print media stylesheet must reset .donor-item opacity to 1 !important');
});

test('Thank You: renderThankYou renders split donor zones, gestures, and timing variables', () => {
  const elements = {};

  const createDummyElem = (className = '', id = '') => {
    const children = [];
    const styleProps = {};

    const elem = {
      id,
      className,
      innerHTML: '',
      style: {
        setProperty: (prop, val) => { styleProps[prop] = val; },
        getProperty: (prop) => styleProps[prop]
      },
      appendChild: (child) => { children.push(child); },
      querySelector: (selector) => {
        if (selector === '.thank-you-heart-container' && elem.hasHeart) return elem.heartContainer;
        if (selector === '.donor-zone-start') return elem.zoneStart;
        if (selector === '.donor-zone-end') return elem.zoneEnd;
        return null;
      },
      querySelectorAll: () => [],
      get children() { return children; }
    };
    return elem;
  };

  const zoneStart = createDummyElem('donor-zone donor-zone-start');
  const zoneEnd = createDummyElem('donor-zone donor-zone-end');
  const heartContainer = createDummyElem('thank-you-heart-container');

  const donorWallContainer = createDummyElem('donor-wall', 'donor-wall');
  donorWallContainer.hasHeart = true;
  donorWallContainer.heartContainer = heartContainer;
  donorWallContainer.zoneStart = zoneStart;
  donorWallContainer.zoneEnd = zoneEnd;

  const originalDoc = globalThis.document;
  globalThis.document = {
    getElementById: (id) => id === 'donor-wall' ? donorWallContainer : null,
    createElement: (tag) => {
      const el = createDummyElem();
      el.tagName = tag;
      el.attributes = {};
      el.setAttribute = (k, v) => { el.attributes[k] = v; };
      return el;
    }
  };

  try {
    // Save original donors array snapshot to confirm renderThankYou does not mutate donorsData in place
    const originalDonorsCopy = JSON.parse(JSON.stringify(donorsData.donors));

    renderThankYou(donorsData, contentData, 'nl');

    // Verify donorsData.donors was not mutated in place
    assert.deepEqual(donorsData.donors, originalDonorsCopy, 'donorsData.donors array must not be mutated by rendering');

    assert.ok(zoneStart.children.length > 0, '.donor-zone-start must receive donor items');
    assert.ok(zoneEnd.children.length > 0, '.donor-zone-end must receive donor items');

    const allRenderedItems = [...zoneStart.children, ...zoneEnd.children];
    assert.ok(allRenderedItems.length >= donorsData.donors.length, 'Total rendered items must include all donors and interspersed gestures');

    const gestureItems = allRenderedItems.filter(item => item.className.includes('donor-gesture'));
    assert.ok(gestureItems.length > 0, 'Interspersed gratitude gestures (🫶 / 🫰) must exist');
    gestureItems.forEach(item => {
      assert.equal(item.attributes['aria-hidden'], 'true', 'Gesture elements must carry aria-hidden="true"');
    });

    const renderedNameItems = allRenderedItems.filter(item => !item.className.includes('donor-gesture'));
    assert.equal(renderedNameItems.length, donorsData.donors.length, 'Every donor in data/donors.json must be rendered exactly once');

    // Verify set equality: no missing donors, no unexpected extra donors
    const sourceDonorSet = new Set(donorsData.donors.map(d => d.name));
    const renderedDonorSet = new Set(renderedNameItems.map(item => item.textContent));

    assert.equal(renderedDonorSet.size, sourceDonorSet.size, 'Set size of rendered donors must equal set size of source donors');
    sourceDonorSet.forEach(name => {
      assert.ok(renderedDonorSet.has(name), `Source donor "${name}" must be present in rendered donor set`);
    });

    const firstItem = zoneStart.children[0];
    assert.ok(firstItem.style.getProperty('--item-delay'), 'Item must carry --item-delay custom property');
  } finally {
    globalThis.document = originalDoc;
  }
});

test('Thank You: renderThankYou performs deterministic non-mutating shuffle when Math.random is mocked', () => {
  const createDummyElem = () => {
    const children = [];
    const styleProps = {};
    const elem = {
      innerHTML: '',
      style: { setProperty: (p, v) => { styleProps[p] = v; } },
      appendChild: (child) => { children.push(child); },
      querySelector: (sel) => sel === '.donor-zone-start' ? elem.zoneStart : sel === '.donor-zone-end' ? elem.zoneEnd : elem.heartContainer,
      querySelectorAll: () => [],
      get children() { return children; }
    };
    return elem;
  };

  const zoneStart = createDummyElem();
  const zoneEnd = createDummyElem();
  const heartContainer = createDummyElem();
  const donorWallContainer = createDummyElem();
  donorWallContainer.hasHeart = true;
  donorWallContainer.heartContainer = heartContainer;
  donorWallContainer.zoneStart = zoneStart;
  donorWallContainer.zoneEnd = zoneEnd;

  const sampleDonorsData = {
    donors: [
      { name: 'Alpha' },
      { name: 'Beta' },
      { name: 'Gamma' },
      { name: 'Delta' }
    ]
  };

  const sampleDonorsCopy = JSON.parse(JSON.stringify(sampleDonorsData.donors));

  const originalDoc = globalThis.document;
  const originalMathRandom = Math.random;

  // Mock Math.random to force a deterministic Fisher-Yates swap sequence
  let callCount = 0;
  Math.random = () => {
    callCount++;
    return 0; // Fisher-Yates with random=0 reverses or shifts deterministically
  };

  globalThis.document = {
    getElementById: (id) => id === 'donor-wall' ? donorWallContainer : null,
    createElement: () => ({ setAttribute: () => {}, style: { setProperty: () => {} } })
  };

  try {
    renderThankYou(sampleDonorsData, contentData, 'nl');

    assert.deepEqual(sampleDonorsData.donors, sampleDonorsCopy, 'Sample donors array must not be mutated in place');

    const allRenderedItems = [...zoneStart.children, ...zoneEnd.children];
    const renderedNameItems = allRenderedItems.filter(item => !item.className?.includes?.('donor-gesture'));

    assert.equal(renderedNameItems.length, 4, 'All 4 sample donors must be rendered');
    const renderedNames = renderedNameItems.map(i => i.textContent);

    // Verify all names are present regardless of shuffle order
    ['Alpha', 'Beta', 'Gamma', 'Delta'].forEach(name => {
      assert.ok(renderedNames.includes(name), `Rendered shuffled set must include "${name}"`);
    });
  } finally {
    Math.random = originalMathRandom;
    globalThis.document = originalDoc;
  }
});

test('Thank You: renderThankYou fallback message when donor list is empty', () => {
  const zoneEnd = {
    className: 'donor-zone donor-zone-end',
    innerHTML: '',
    appendChild: () => {},
    style: { setProperty: () => {} }
  };
  const zoneStart = {
    className: 'donor-zone donor-zone-start',
    innerHTML: '',
    appendChild: () => {},
    style: { setProperty: () => {} }
  };
  const heartContainer = {
    className: 'thank-you-heart-container',
    style: { setProperty: () => {} }
  };
  const donorWallContainer = {
    id: 'donor-wall',
    className: 'donor-wall',
    innerHTML: '',
    appendChild: () => {},
    querySelector: (sel) => {
      if (sel === '.thank-you-heart-container') return heartContainer;
      if (sel === '.donor-zone-start') return zoneStart;
      if (sel === '.donor-zone-end') return zoneEnd;
      return null;
    },
    style: { setProperty: () => {} }
  };

  const originalDoc = globalThis.document;
  globalThis.document = {
    getElementById: (id) => id === 'donor-wall' ? donorWallContainer : null,
    createElement: () => ({ setAttribute: () => {}, style: { setProperty: () => {} } })
  };

  try {
    renderThankYou({ donors: [] }, contentData, 'nl');
    assert.match(zoneEnd.innerHTML, /donor-fallback-message/i, 'Fallback message must be rendered when donors array is empty');
    assert.match(zoneEnd.innerHTML, new RegExp(contentData.thankYou.fallbackMessage.nl, 'i'), 'Fallback message must match localized thankYou.fallbackMessage');
  } finally {
    globalThis.document = originalDoc;
  }
});
