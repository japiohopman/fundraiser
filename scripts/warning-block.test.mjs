import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const contentPath = path.join(rootDir, 'data/content.json');
const indexPath = path.join(rootDir, 'index.html');

const contentJson = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
const indexHtml = fs.readFileSync(indexPath, 'utf8');

test('Warning block content structure and copy requirements (Issue #51)', () => {
  const warning = contentJson?.fundraisersSection?.prominentWarning;
  assert.ok(warning, 'prominentWarning object must exist in data/content.json');

  // Verify NL heading contains "Let op"
  assert.match(warning.title.nl, /Let op/i, 'NL warning title must include "Let op"');
  // Verify EN heading contains "Warning" or equivalent English warning
  assert.match(warning.title.en, /Warning/i, 'EN warning title must include "Warning"');

  // Verify Kathinka van Velzen is used as concrete example
  assert.match(warning.bullet3.nl, /Kathinka van Velzen/i, 'NL bullet3 must mention Kathinka van Velzen');
  assert.match(warning.bullet3.en, /Kathinka van Velzen/i, 'EN bullet3 must mention Kathinka van Velzen');

  // Verify Jaap is NOT mentioned in the warning block copy
  const fullWarningJsonStr = JSON.stringify(warning);
  assert.doesNotMatch(fullWarningJsonStr, /Jaap/i, 'Warning block copy must NOT mention Jaap');
});

test('index.html contains warning block section and non-color icon elements', () => {
  assert.match(indexHtml, /class="prominent-warning-box"/, 'index.html must contain prominent-warning-box container');
  assert.match(indexHtml, /id="prominent-warning-title"/, 'index.html must contain prominent-warning-title element');
  assert.match(indexHtml, /class="warning-icon"/, 'index.html must contain warning-icon SVG visual element');
  assert.match(indexHtml, /data-i18n="fundraisersSection\.prominentWarning\.title"/, 'Warning title must be bound to i18n key');
  assert.match(indexHtml, /data-i18n="fundraisersSection\.prominentWarning\.bullet1"/, 'Warning bullet 1 must be bound to i18n key');
});
