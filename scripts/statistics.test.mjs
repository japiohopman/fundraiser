import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculateCampaignStats, formatDonationCount, renderCampaignStats } from '../src/features/fundraisers/stats.js';

test('calculateCampaignStats returns 6 individual campaign donation counts and latest verifiedAt date', () => {
  const fundraisersData = JSON.parse(readFileSync('./data/fundraisers.json', 'utf8'));
  const stats = calculateCampaignStats(fundraisersData.fundraisers);

  assert.equal(stats.campaigns.length, 6);

  const parknest = stats.campaigns.find(c => c.id === 'parknest-collective');
  const kathinka = stats.campaigns.find(c => c.id === 'kathinka-dog-collars');
  const jim = stats.campaigns.find(c => c.id === 'jim-gijbels-paintings');
  const jaap = stats.campaigns.find(c => c.id === 'rooie-jaap-knives');
  const suzy = stats.campaigns.find(c => c.id === 'suzy-creamcheese-kitchenware');
  const manon = stats.campaigns.find(c => c.id === 'manon-kinkt-shirts');

  assert.equal(parknest.name, 'ParkNest');
  assert.equal(parknest.count, 808);

  assert.equal(kathinka.name, 'Kathinka');
  assert.equal(kathinka.count, 1);

  assert.equal(jim.name, 'Jim');
  assert.equal(jim.count, 3);

  assert.equal(jaap.name, 'Jaap');
  assert.equal(jaap.count, 4);

  assert.equal(suzy.name, 'Suzy');
  assert.equal(suzy.count, 3);

  assert.equal(manon.name, 'Manon');
  assert.equal(manon.count, 2);

  assert.equal(stats.latestVerifiedAt, '2026-09-21');
});

test('formatDonationCount correctly applies singular/plural wording in NL and EN', () => {
  assert.equal(formatDonationCount(1, 'nl'), '1 donatie');
  assert.equal(formatDonationCount(3, 'nl'), '3 donaties');
  assert.equal(formatDonationCount(808, 'nl'), '808 donaties');

  assert.equal(formatDonationCount(1, 'en'), '1 donation');
  assert.equal(formatDonationCount(3, 'en'), '3 donations');
  assert.equal(formatDonationCount(808, 'en'), '808 donations');
});

test('renderCampaignStats renders 6 campaign boxes and avoids aggregate euro totals', () => {
  const fundraisersData = JSON.parse(readFileSync('./data/fundraisers.json', 'utf8'));
  const container = { innerHTML: '' };

  renderCampaignStats(container, fundraisersData.fundraisers, {}, 'nl');

  const text = container.innerHTML;
  assert.ok(text.includes('ParkNest'));
  assert.ok(text.includes('808 donaties'));
  assert.ok(text.includes('Kathinka'));
  assert.ok(text.includes('1 donatie'));
  assert.ok(text.includes('Jaap'));
  assert.ok(text.includes('4 donaties'));
  assert.ok(text.includes('Momentopname geverifieerd op 2026-09-21'));

  // Ensure no aggregate financial amount is rendered in stats strip
  assert.ok(!text.includes('€'));
  assert.ok(!text.includes('62.050'));
  assert.ok(!text.includes('62,050'));
});

test('index.html contains unified fundraisers grid container and campaign stats strip container', () => {
  const html = readFileSync('./index.html', 'utf8');

  assert.ok(html.includes('id="campaign-stats-strip"'));
  assert.ok(html.includes('id="unified-fundraisers-list"'));
  assert.ok(!html.includes('id="collective-fundraisers-list"'));
  assert.ok(!html.includes('id="personal-fundraisers-list"'));
});
