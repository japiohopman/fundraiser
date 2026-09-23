#!/usr/bin/env node
/**
 * Content Guard — deterministic check for pull requests.
 *
 * This site documents real people and real money, so factual content must never change by
 * accident (or by an automated agent). The rules are mechanical:
 *
 *   1. A PR that touches a protected content file fails, unless it carries the label
 *      `content-approved` (a deliberate human decision, one click).
 *   2. A PR may not add a file larger than 1 MB.
 *
 * Environment: BASE_REF (target branch, default main), PR_LABELS (JSON array of label names).
 */
import { execSync } from 'node:child_process';

const BASE = process.env.BASE_REF || 'main';
const LABELS = JSON.parse(process.env.PR_LABELS || '[]');
const APPROVAL_LABEL = 'content-approved';
const MAX_BYTES = 1_000_000;

const PROTECTED = [
  /^data\/(?!donors\.json)/,
  /^docs\/fundraisers\.md$/,
  /^docs\/editorial-policy\.md$/,
  /^docs\/story\.md$/,
];

const sh = cmd => execSync(cmd, { encoding: 'utf8' }).trim();

const rows = sh(`git diff --name-status origin/${BASE}...HEAD`).split('\n').filter(Boolean).map(line => {
  const [status, ...paths] = line.split('\t');
  return { status: status[0], paths };
});

const touched = new Set(rows.flatMap(r => r.paths));
const protectedTouched = [...touched].filter(p => PROTECTED.some(re => re.test(p)));
const oversized = rows
  .filter(r => r.status === 'A' || r.status === 'R')
  .map(r => r.paths[r.paths.length - 1])
  .filter(p => { try { return Number(sh(`git cat-file -s HEAD:"${p}"`)) > MAX_BYTES; } catch { return false; } });

let failed = false;

if (protectedTouched.length) {
  if (LABELS.includes(APPROVAL_LABEL)) {
    console.log(`::notice::Protected content changed, approved via the "${APPROVAL_LABEL}" label:\n  ${protectedTouched.join('\n  ')}`);
  } else {
    failed = true;
    console.log(
      `::error::This PR changes protected content files:\n  ${protectedTouched.join('\n  ')}\n` +
      `Facts about campaigns, amounts and people only change through the content workflow in CONTRIBUTING.md. ` +
      `If this change is intended and verified, add the label "${APPROVAL_LABEL}" to the PR.`
    );
  }
}
if (oversized.length) {
  failed = true;
  console.log(`::error::Files larger than 1 MB added:\n  ${oversized.join('\n  ')}`);
}

if (!failed) console.log(`Content guard passed (${touched.size} file(s) changed, none protected or oversized).`);
process.exit(failed ? 1 : 0);
