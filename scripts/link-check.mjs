#!/usr/bin/env node
/**
 * Resilient External Link & Source Integrity Checker
 *
 * Extracts and verifies external HTTP(S) links across data files and index.html.
 * Distinguishes hard broken links (404, 410, DNS failure, malformed syntax)
 * from resilient rate-limiting / anti-bot challenges (403, 429, 999).
 */

import { readFileSync } from 'node:fs';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const DEFAULT_TIMEOUT = 10000;

export function validateUrlSyntax(urlString) {
  try {
    const parsed = new URL(urlString);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function classifyHttpStatus(status) {
  if (status >= 200 && status < 400) {
    return 'VALID';
  }
  // 403 (Forbidden/Cloudflare), 429 (Too Many Requests), 999 (LinkedIn/Custom Anti-Bot)
  if (status === 403 || status === 429 || status === 999) {
    return 'RESILIENT';
  }
  // 404 (Not Found), 410 (Gone), 5xx (Server Error)
  if (status === 404 || status === 410 || (status >= 500 && status < 600)) {
    return 'BROKEN';
  }
  return 'BROKEN';
}

export function extractExternalUrls() {
  const extracted = [];
  const addUrl = (url, sourceFile, path) => {
    if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
      extracted.push({ url, sourceFile, path });
    }
  };

  const traverse = (obj, file, path = '') => {
    if (!obj) return;
    if (typeof obj === 'string') {
      // Find all http(s) URLs in string
      const matches = obj.match(/https?:\/\/[^\s"'<>()]+/g);
      if (matches) {
        matches.forEach(m => addUrl(m, file, path));
      }
    } else if (Array.isArray(obj)) {
      obj.forEach((item, idx) => traverse(item, file, `${path}[${idx}]`));
    } else if (typeof obj === 'object') {
      for (const [key, val] of Object.entries(obj)) {
        traverse(val, file, path ? `${path}.${key}` : key);
      }
    }
  };

  // 1. data/fundraisers.json
  try {
    const fundraisersData = JSON.parse(readFileSync(new URL('../data/fundraisers.json', import.meta.url), 'utf8'));
    traverse(fundraisersData, 'data/fundraisers.json');
  } catch (err) {
    console.error(`Error reading data/fundraisers.json: ${err.message}`);
  }

  // 2. data/content.json
  try {
    const contentData = JSON.parse(readFileSync(new URL('../data/content.json', import.meta.url), 'utf8'));
    traverse(contentData, 'data/content.json');
  } catch (err) {
    console.error(`Error reading data/content.json: ${err.message}`);
  }

  // 3. index.html
  try {
    const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    const hrefMatches = indexHtml.match(/href=["'](https?:\/\/[^"']+)["']/g);
    if (hrefMatches) {
      hrefMatches.forEach(match => {
        const url = match.replace(/^href=["']/, '').replace(/["']$/, '');
        addUrl(url, 'index.html', 'href');
      });
    }
  } catch (err) {
    console.error(`Error reading index.html: ${err.message}`);
  }

  // Deduplicate by URL while keeping source references
  const uniqueUrlsMap = new Map();
  for (const item of extracted) {
    if (!uniqueUrlsMap.has(item.url)) {
      uniqueUrlsMap.set(item.url, { ...item, sources: [`${item.sourceFile} (${item.path})`] });
    } else {
      uniqueUrlsMap.get(item.url).sources.push(`${item.sourceFile} (${item.path})`);
    }
  }

  return Array.from(uniqueUrlsMap.values());
}

export async function checkUrl(item, options = {}) {
  const { url } = item;
  if (!validateUrlSyntax(url)) {
    return {
      ...item,
      category: 'BROKEN',
      status: 'INVALID_URL',
      reason: 'Malformed URL syntax'
    };
  }

  if (options.offline) {
    return {
      ...item,
      category: 'VALID',
      status: 'SKIPPED_OFFLINE',
      reason: 'Offline mode check'
    };
  }

  const timeoutMs = options.timeout || DEFAULT_TIMEOUT;

  const fetchWithTimeout = async (method) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method,
        headers: { 'User-Agent': USER_AGENT },
        signal: controller.signal,
        redirect: 'follow'
      });
      return { ok: true, status: res.status, statusText: res.statusText };
    } catch (err) {
      return { ok: false, error: err };
    } finally {
      clearTimeout(timer);
    }
  };

  // Try HEAD first
  let result = await fetchWithTimeout('HEAD');
  // Fall back to GET if HEAD was refused/method not allowed or failed
  if (!result.ok || result.status === 405 || result.status === 403 || result.status === 400) {
    const getResult = await fetchWithTimeout('GET');
    if (getResult.ok) {
      result = getResult;
    }
  }

  if (result.ok) {
    const category = classifyHttpStatus(result.status);
    return {
      ...item,
      category,
      status: result.status,
      reason: category === 'RESILIENT' ? `Rate-limit / Anti-bot (${result.status})` : `HTTP ${result.status}`
    };
  } else {
    const err = result.error;
    const isTimeout = err.name === 'AbortError';
    return {
      ...item,
      category: 'BROKEN',
      status: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
      reason: isTimeout ? `Request timed out after ${timeoutMs}ms` : err.message
    };
  }
}

export async function runLinkCheck(options = {}) {
  const items = extractExternalUrls();
  const results = [];

  for (const item of items) {
    const res = await checkUrl(item, options);
    results.push(res);
  }

  return results;
}

// CLI Execution
if (process.argv[1] && process.argv[1].endsWith('link-check.mjs')) {
  const isOffline = process.argv.includes('--offline') || process.argv.includes('--allow-offline');
  console.log(`Starting external link integrity check (${isOffline ? 'OFFLINE MODE' : 'ONLINE MODE'})...\n`);

  runLinkCheck({ offline: isOffline }).then(results => {
    let brokenCount = 0;
    let resilientCount = 0;
    let validCount = 0;

    results.forEach(res => {
      if (res.category === 'VALID') {
        validCount++;
        console.log(`  [VALID] ${res.status}: ${res.url}`);
      } else if (res.category === 'RESILIENT') {
        resilientCount++;
        console.log(`  [RESILIENT] ${res.status}: ${res.url} (${res.reason})`);
      } else {
        brokenCount++;
        console.log(`  [BROKEN] ${res.status}: ${res.url} (${res.reason})`);
      }
    });

    console.log(`\nSummary: ${results.length} total URLs checked (${validCount} valid, ${resilientCount} resilient anti-bot/rate-limited, ${brokenCount} broken).`);

    if (brokenCount > 0) {
      console.error(`\nLink integrity check FAILED with ${brokenCount} broken link(s).`);
      process.exit(1);
    } else {
      console.log(`\nLink integrity check PASSED.`);
      process.exit(0);
    }
  }).catch(err => {
    console.error(`Link check error: ${err.message}`);
    process.exit(1);
  });
}
