import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculateCampaignStats, formatDonationCount } from '../src/features/fundraisers/stats.js';

test('calculateCampaignStats aggregates counts, totals, and latest verifiedAt correctly from data/fundraisers.json', () => {
  const fundraisersData = JSON.parse(readFileSync('./data/fundraisers.json', 'utf8'));
  const stats = calculateCampaignStats(fundraisersData.fundraisers);

  assert.equal(stats.totalCampaigns, 6);
  // Total online donation count: 808 + 1 + 3 + 4 + 3 + 2 = 821
  assert.equal(stats.totalOnlineDonations, 821);
  // Total displayed raised: 58864 + 300 + 330 + 395 + 2050 + 111 = 62050
  assert.equal(stats.totalRaised, 62050);
  assert.equal(stats.latestVerifiedAt, '2026-09-21');
});

test('formatDonationCount correctly applies singular/plural wording in NL and EN', () => {
  const content = JSON.parse(readFileSync('./data/content.json', 'utf8'));
  const statsContent = content.fundraisersSection.stats;

  assert.equal(formatDonationCount(1, statsContent, 'nl'), '1 donatie');
  assert.equal(formatDonationCount(3, statsContent, 'nl'), '3 donaties');
  assert.equal(formatDonationCount(808, statsContent, 'nl'), '808 donaties');

  assert.equal(formatDonationCount(1, statsContent, 'en'), '1 donation');
  assert.equal(formatDonationCount(3, statsContent, 'en'), '3 donations');
  assert.equal(formatDonationCount(808, statsContent, 'en'), '808 donations');
});

test('index.html contains unified fundraisers grid container and campaign stats strip container', () => {
  const html = readFileSync('./index.html', 'utf8');

  assert.ok(html.includes('id="campaign-stats-strip"'));
  assert.ok(html.includes('id="unified-fundraisers-list"'));
  assert.ok(!html.includes('id="collective-fundraisers-list"'));
  assert.ok(!html.includes('id="personal-fundraisers-list"'));
});
