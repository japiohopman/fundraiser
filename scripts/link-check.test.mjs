import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateUrlSyntax,
  classifyHttpStatus,
  extractExternalUrls,
  checkUrl,
  runLinkCheck
} from './link-check.mjs';

test('validateUrlSyntax correctly identifies valid and invalid http(s) URLs', () => {
  assert.equal(validateUrlSyntax('https://whydonate.com/nl/fundraising/kathinka'), true);
  assert.equal(validateUrlSyntax('http://parknest.nl'), true);
  assert.equal(validateUrlSyntax('ftp://example.com'), false);
  assert.equal(validateUrlSyntax('not-a-url'), false);
  assert.equal(validateUrlSyntax(''), false);
});

test('classifyHttpStatus correctly categorizes HTTP status codes', () => {
  assert.equal(classifyHttpStatus(200), 'VALID');
  assert.equal(classifyHttpStatus(301), 'VALID');
  assert.equal(classifyHttpStatus(302), 'VALID');

  assert.equal(classifyHttpStatus(403), 'RESILIENT');
  assert.equal(classifyHttpStatus(429), 'RESILIENT');
  assert.equal(classifyHttpStatus(999), 'RESILIENT');

  assert.equal(classifyHttpStatus(404), 'BROKEN');
  assert.equal(classifyHttpStatus(410), 'BROKEN');
  assert.equal(classifyHttpStatus(500), 'BROKEN');
  assert.equal(classifyHttpStatus(502), 'BROKEN');
  assert.equal(classifyHttpStatus(503), 'BROKEN');
  assert.equal(classifyHttpStatus(504), 'BROKEN');
});

test('extractExternalUrls extracts all external URLs from project data and index.html', () => {
  const items = extractExternalUrls();
  assert.ok(Array.isArray(items), 'extractExternalUrls should return an array');
  assert.ok(items.length >= 20, 'Should extract at least 20 unique external URLs');

  const urls = items.map(i => i.url);
  assert.ok(urls.includes('https://whydonate.com/nl/fundraising/houd-parknest-open-in-de-winter'));
  assert.ok(urls.includes('https://parknest.nl/ons-gebouw-is-verwoest-maar-parknest-gaat-door/'));
  assert.ok(urls.includes('https://japiohopman.github.io/keuken_cv/'));

  items.forEach(item => {
    assert.ok(validateUrlSyntax(item.url), `Extracted URL must be valid syntax: ${item.url}`);
    assert.ok(item.sources && item.sources.length > 0, `Item must track source location: ${item.url}`);
  });
});

test('checkUrl in offline mode skips network request and returns VALID', async () => {
  const item = { url: 'https://whydonate.com/nl/fundraising/kathinka', sourceFile: 'test', path: 'test' };
  const result = await checkUrl(item, { offline: true });

  assert.equal(result.category, 'VALID');
  assert.equal(result.status, 'SKIPPED_OFFLINE');
  assert.equal(result.url, item.url);
});

test('checkUrl identifies malformed URL as BROKEN', async () => {
  const item = { url: 'httpx://bad-url', sourceFile: 'test', path: 'test' };
  const result = await checkUrl(item, { offline: false });

  assert.equal(result.category, 'BROKEN');
  assert.equal(result.status, 'INVALID_URL');
});

test('runLinkCheck runs complete check in offline mode', async () => {
  const results = await runLinkCheck({ offline: true });
  assert.ok(Array.isArray(results));
  assert.ok(results.length >= 20);

  const broken = results.filter(r => r.category === 'BROKEN');
  assert.equal(broken.length, 0, 'No broken URLs should exist in project data');
});
