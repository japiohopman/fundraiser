import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculateCampaignStats, formatDonationCount, renderCampaignStats } from '../src/features/fundraisers/stats.js';

test('calculateCampaignStats calculates financial totals, distribution percentages, and formatted strings', () => {
  const fundraisersData = JSON.parse(readFileSync('./data/fundraisers.json', 'utf8'));
  const contentData = JSON.parse(readFileSync('./data/content.json', 'utf8'));
  const statsNL = calculateCampaignStats(fundraisersData.fundraisers, '2026-09-20', contentData, 'nl');

  assert.equal(statsNL.campaigns.length, 6);
  assert.equal(statsNL.totalAmount, 62050);
  assert.equal(statsNL.formattedTotalAmount.replace(/\s/g, ' '), '€ 62.050');
  assert.equal(statsNL.latestVerifiedAt, '2026-09-21');

  const parknest = statsNL.campaigns.find(c => c.id === 'parknest-collective');
  const suzy = statsNL.campaigns.find(c => c.id === 'suzy-creamcheese-kitchenware');
  const jaap = statsNL.campaigns.find(c => c.id === 'rooie-jaap-knives');
  const jim = statsNL.campaigns.find(c => c.id === 'jim-gijbels-paintings');
  const kathinka = statsNL.campaigns.find(c => c.id === 'kathinka-dog-collars');
  const manon = statsNL.campaigns.find(c => c.id === 'manon-kinkt-shirts');

  assert.equal(parknest.amount, 58864);
  assert.equal(parknest.count, 808);
  assert.ok(parknest.percentage > 94.8 && parknest.percentage < 94.9);
  assert.equal(parknest.formattedPercentage, '94,87%');

  assert.equal(suzy.amount, 2050);
  assert.equal(suzy.formattedPercentage, '3,30%');

  assert.equal(jaap.amount, 395);
  assert.equal(jaap.formattedPercentage, '0,64%');

  assert.equal(jim.amount, 330);
  assert.equal(jim.formattedPercentage, '0,53%');

  assert.equal(kathinka.amount, 300);
  assert.equal(kathinka.formattedPercentage, '0,48%');

  assert.equal(manon.amount, 111);
  assert.equal(manon.formattedPercentage, '0,18%');

  // Verify percentages sum to 100% within tolerance
  const sumPercentages = statsNL.campaigns.reduce((acc, c) => acc + c.percentage, 0);
  assert.ok(Math.abs(sumPercentages - 100) < 0.001);

  // EN contract
  const statsEN = calculateCampaignStats(fundraisersData.fundraisers, '2026-09-20', contentData, 'en');
  assert.equal(statsEN.formattedTotalAmount.replace(/\s/g, ' '), '€62,050');
  const parknestEN = statsEN.campaigns.find(c => c.id === 'parknest-collective');
  assert.equal(parknestEN.formattedPercentage, '94.87%');
});

test('formatDonationCount correctly applies singular/plural wording in NL and EN', () => {
  const contentData = JSON.parse(readFileSync('./data/content.json', 'utf8'));

  assert.equal(formatDonationCount(1, 'nl', contentData), '1 donatie');
  assert.equal(formatDonationCount(3, 'nl', contentData), '3 donaties');
  assert.equal(formatDonationCount(808, 'nl', contentData), '808 donaties');

  assert.equal(formatDonationCount(1, 'en', contentData), '1 donation');
  assert.equal(formatDonationCount(3, 'en', contentData), '3 donations');
  assert.equal(formatDonationCount(808, 'en', contentData), '808 donations');
});

test('renderCampaignStats renders donut chart, center total, legend details, and separate donation counts', () => {
  const fundraisersData = JSON.parse(readFileSync('./data/fundraisers.json', 'utf8'));
  const contentData = JSON.parse(readFileSync('./data/content.json', 'utf8'));

  class MockElement {
    constructor() {
      this.innerHTML = '';
      this.listeners = [];
    }
    querySelectorAll() {
      return [
        { classList: { toggle: () => {}, remove: () => {} }, dataset: { campaignId: 'parknest-collective' }, addEventListener: () => {} }
      ];
    }
  }

  const container = new MockElement();

  renderCampaignStats(container, fundraisersData.fundraisers, contentData, 'nl');

  const text = container.innerHTML.replace(/\s/g, ' ');

  // Donut chart title & center total
  assert.ok(text.includes('Verdeling Geregistreerd Donatiebedrag'));
  assert.ok(text.includes('Totaal geregistreerd'));
  assert.ok(text.includes('€ 62.050'));

  // SVG structure and accessibility tags
  assert.ok(text.includes('class="donut-svg"'));
  assert.ok(text.includes('role="img"'));
  assert.ok(text.includes('<title id="donut-chart-title-nl">'));
  assert.ok(text.includes('<desc id="donut-chart-desc-nl">'));

  // Legend list details & campaign avatars
  assert.ok(text.includes('class="donut-legend-list"'));
  assert.ok(text.includes('class="legend-avatar-img"'));
  assert.ok(text.includes('parknest-avatar.webp'));
  assert.ok(text.includes('jaaphopman_avatar.webp'));
  assert.ok(text.includes('ParkNest'));
  assert.ok(text.includes('94,87%'));
  assert.ok(text.includes('€ 58.864'));

  assert.ok(text.includes('Suzy'));
  assert.ok(text.includes('3,30%'));
  assert.ok(text.includes('€ 2.050'));

  assert.ok(text.includes('Jaap'));
  assert.ok(text.includes('0,64%'));
  assert.ok(text.includes('€ 395'));

  // Separate donation counts section
  assert.ok(text.includes('Aantal Online Donaties per Actie'));
  assert.ok(text.includes('808 donaties'));
  assert.ok(text.includes('1 donatie'));
  assert.ok(text.includes('4 donaties'));
  assert.ok(text.includes('Momentopname geverifieerd op 2026-09-21'));
});

test('index.html contains unified fundraisers grid container and campaign stats strip container', () => {
  const html = readFileSync('./index.html', 'utf8');

  assert.ok(html.includes('id="campaign-stats-strip"'));
  assert.ok(html.includes('id="unified-fundraisers-list"'));
  assert.ok(!html.includes('id="collective-fundraisers-list"'));
  assert.ok(!html.includes('id="personal-fundraisers-list"'));
});
