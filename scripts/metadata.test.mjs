import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const indexPath = path.join(rootDir, 'index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf8');

test('Favicon and icon metadata tags exist and reference valid assets', () => {
  assert.match(indexHtml, /<link rel="icon" type="image\/svg\+xml" href="public\/assets\/favicon\.svg">/);
  assert.match(indexHtml, /<link rel="icon" type="image\/png" sizes="32x32" href="public\/assets\/favicon-32x32\.png">/);
  assert.match(indexHtml, /<link rel="apple-touch-icon" href="public\/assets\/apple-touch-icon\.png">/);
  assert.match(indexHtml, /<meta name="theme-color" content="#1e3a8a">/);

  assert.ok(fs.existsSync(path.join(rootDir, 'public/assets/favicon.svg')), 'favicon.svg must exist');
  assert.ok(fs.existsSync(path.join(rootDir, 'public/assets/favicon-32x32.png')), 'favicon-32x32.png must exist');
  assert.ok(fs.existsSync(path.join(rootDir, 'public/assets/apple-touch-icon.png')), 'apple-touch-icon.png must exist');
});

test('Open Graph and Twitter sharing metadata tags exist with i18n bindings', () => {
  assert.match(indexHtml, /<meta property="og:type" content="website">/);
  assert.match(indexHtml, /<meta property="og:title" content="[^"]+" data-i18n-attr="content:meta\.title">/);
  assert.match(indexHtml, /<meta property="og:description" content="[^"]+" data-i18n-attr="content:meta\.description">/);
  assert.match(indexHtml, /<meta property="og:url" content="https:\/\/japiohopman\.github\.io\/fundraiser">/);
  assert.match(indexHtml, /<meta property="og:image" content="https:\/\/japiohopman\.github\.io\/fundraiser\/public\/assets\/page-hero\.webp">/);
  assert.match(indexHtml, /<meta property="og:image:alt" content="[^"]+" data-i18n-attr="content:hero\.imageAlt">/);

  assert.match(indexHtml, /<meta name="twitter:card" content="summary_large_image">/);
  assert.match(indexHtml, /<meta name="twitter:title" content="[^"]+" data-i18n-attr="content:meta\.title">/);
  assert.match(indexHtml, /<meta name="twitter:description" content="[^"]+" data-i18n-attr="content:meta\.description">/);
  assert.match(indexHtml, /<meta name="twitter:image" content="https:\/\/japiohopman\.github\.io\/fundraiser\/public\/assets\/page-hero\.webp">/);

  assert.match(indexHtml, /<link rel="canonical" href="https:\/\/japiohopman\.github\.io\/fundraiser">/);
});
