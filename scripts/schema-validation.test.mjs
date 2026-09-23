import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();

test('JSON Integrity: data files exist and are valid JSON', () => {
  const jsonFiles = [
    'data/content.json',
    'data/fundraisers.json',
    'data/donors.json',
    'data/fundraisers.schema.json',
    'data/donors.schema.json'
  ];

  jsonFiles.forEach(file => {
    const filePath = path.join(rootDir, file);
    assert.ok(fs.existsSync(filePath), `File ${file} must exist on disk`);
    const content = fs.readFileSync(filePath, 'utf8');
    assert.doesNotThrow(() => JSON.parse(content), `File ${file} must contain valid JSON`);
  });
});

test('Content Data Contract: data/content.json structure and required keys', () => {
  const contentPath = path.join(rootDir, 'data/content.json');
  const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

  assert.ok(content.meta, 'content.json must contain meta section');
  assert.ok(content.meta.title?.nl && content.meta.title?.en, 'meta.title must have nl and en translations');
  assert.ok(content.hero, 'content.json must contain hero section');
  assert.ok(content.fundraisersSection, 'content.json must contain fundraisersSection');
  assert.ok(content.share, 'content.json must contain share section');
  assert.ok(content.thankYou, 'content.json must contain thankYou section');
  assert.ok(content.footer, 'content.json must contain footer section');
});

test('Asset Integrity: referenced local asset files exist on disk', () => {
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  const stylesCss = fs.readFileSync(path.join(rootDir, 'styles.css'), 'utf8');
  const contentJsonStr = fs.readFileSync(path.join(rootDir, 'data/content.json'), 'utf8');

  // Match all public/assets/... occurrences
  const assetRegex = /public\/assets\/[a-zA-Z0-9_\-\.\/]+/g;

  const foundAssets = new Set([
    ...(indexHtml.match(assetRegex) || []),
    ...(stylesCss.match(assetRegex) || []),
    ...(contentJsonStr.match(assetRegex) || [])
  ]);

  assert.ok(foundAssets.size > 0, 'Should find local asset references in codebase');

  foundAssets.forEach(assetPath => {
    // Clean up trailing quotes or parens if matched
    const cleanPath = assetPath.replace(/['"\)]+$/, '');
    const fullPath = path.join(rootDir, cleanPath);
    assert.ok(
      fs.existsSync(fullPath),
      `Referenced asset ${cleanPath} must exist on disk`
    );
  });
});
