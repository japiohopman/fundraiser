#!/usr/bin/env node
/**
 * Jules Queue Orchestrator (v3 — fundraiser)
 *
 * Runs on a schedule (see .github/workflows/jules-orchestrator.yml) and keeps ONE Jules
 * session busy at a time, working through the tasks under "### Ready" in the "## Now"
 * section of docs/roadmap.md, top to bottom.
 *
 * A task is a top-level checkbox line plus its indented detail bullets:
 *
 *   - [ ] **Title**
 *     - **Problem:** ...
 *     - **Goal:** ...
 *     - **Acceptance:** ...
 *
 * Tasks stay where they are. Jules ticks his own task IN PLACE (- [ ] -> - [x]) in the same
 * pull request, after verifying his work (see AGENT_RULES.md). The orchestrator never edits
 * the roadmap; the only thing it commits is .github/jules-queue-state.json.
 *
 * Each run:
 *   1. If a session is active:
 *        - no PR yet                    -> wait
 *        - PR open, not merged          -> wait (this is the human review: you merge)
 *        - PR merged, task still [ ]    -> wait (Jules could not verify; read the PR, then
 *                                          tick the box yourself if you are satisfied)
 *        - PR merged and task is [x]    -> done: clear the session and continue below
 *   2. If no session is active: take the first unchecked task under "### Ready", start a
 *      Jules session with the full task text, and record it in the state file.
 *
 * "### Blocked" and "### Human Review" are never dispatched.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const STATE_PATH = '.github/jules-queue-state.json';
const ROADMAP_PATH = process.env.ROADMAP_PATH || 'docs/roadmap.md';
const STALE_HOURS = 48;

const HARD_LIMITS =
  'Hard limits for this repository: do NOT add or change any factual claim about a campaign, ' +
  'person, amount, beneficiary or money flow unless the Ready task explicitly requires a verified ' +
  'content update and the PR receives the content-approved label; do NOT edit protected evidence ' +
  'in docs/fundraisers.md, docs/editorial-policy.md or docs/story.md; do not edit anything under ' +
  'data/ unless the Ready task explicitly allows that exact content-data scope. Do NOT add user-visible ' +
  'text unless the task explicitly allows it. Keep this a static site: no backend, no new ' +
  'runtime dependencies, no scraping. Never edit the "### Blocked" or "### Human Review" ' +
  'sections of docs/roadmap.md or any task other than your own.';

/** Parses the "## Now" section of the roadmap into tasks (checkbox line + indented body). */
export function parseNow(text) {
  const lines = text.split('\n');
  const tasks = [];
  let inNow = false;
  let section = null;
  let current = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^##\s+Now\b/i.test(line)) { inNow = true; continue; }
    if (inNow && /^##\s+[^#]/.test(line)) break; // next top-level section
    if (!inNow) continue;

    const heading = line.match(/^###\s+(.+?)\s*$/);
    if (heading) { section = heading[1]; current = null; continue; }

    const task = line.match(/^- \[( |x)\]\s*(.+?)\s*$/i);
    if (task) {
      current = { section, line: i, checked: task[1].toLowerCase() === 'x', text: task[2], body: [] };
      tasks.push(current);
      continue;
    }
    if (current) {
      if (/^\s+\S/.test(line) || line.trim() === '') current.body.push(line);
      else current = null; // unindented prose ends the task body
    }
  }
  for (const t of tasks) while (t.body.length && t.body[t.body.length - 1].trim() === '') t.body.pop();
  return tasks;
}

export const isReady = t => /^Ready\b/i.test(t.section || '');

function loadState() {
  if (!existsSync(STATE_PATH)) return { activeSession: null };
  return JSON.parse(readFileSync(STATE_PATH, 'utf8'));
}
function saveState(state) {
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + '\n');
}

async function julesFetch(path, options = {}) {
  const res = await fetch(`https://jules.googleapis.com/v1alpha/${path}`, {
    ...options,
    headers: { 'X-Goog-Api-Key': process.env.JULES_API_KEY, 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  if (!res.ok) throw new Error(`Jules API ${path} failed: ${res.status} ${await res.text()}`);
  return res.json();
}
async function githubRequest(path, options = {}) {
  const res = await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`GitHub API ${path} failed: ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}
async function githubFetch(path) { return githubRequest(path); }
const prNumberFrom = url => Number((url.match(/\/pull\/(\d+)/) || [])[1]) || null;

function buildPrompt(task) {
  return [
    'Read AGENT_RULES.md, CONTRIBUTING.md, docs/editorial-policy.md and docs/roadmap.md before starting.',
    'Your task is the first unchecked task under "### Ready" in docs/roadmap.md. Full specification:',
    [`- [ ] ${task.text}`, ...task.body].join('\n'),
    HARD_LIMITS,
    'Work through the whole task and verify the result as described under "Verification" in AGENT_RULES.md before you open the pull request. ' +
      'Take the time this needs: one thorough pull request is better than a quick partial one.',
    `When you are done AND have verified the result, edit docs/roadmap.md yourself in the same pull request: change this task's own checkbox line from "- [ ] ${task.text}" to "- [x] ${task.text}" in place (do not move it or change its bullets), and tick a Phase item lower in that file only if this pull request fully completes it. ` +
      'If you could not verify everything, leave the checkbox unchecked and say exactly why in the pull request description.',
    'Open a pull request; never push to main.',
  ].join('\n\n');
}

async function main() {
  for (const name of ['JULES_API_KEY', 'GITHUB_TOKEN', 'GITHUB_REPOSITORY', 'JULES_SOURCE']) {
    if (!process.env[name]) throw new Error(`${name} is not set`);
  }

  const state = loadState();
  const tasks = parseNow(readFileSync(ROADMAP_PATH, 'utf8'));
  let stateChanged = false;

  if (state.activeSession) {
    const active = state.activeSession;
    const entry = tasks.find(t => t.text === active.task);
    if (!entry) {
      throw new Error(
        `Active task "${active.task}" was not found under "## Now" in ${ROADMAP_PATH}. ` +
        `Restore the task line, or set activeSession to null in ${STATE_PATH} if it was cancelled on purpose.`
      );
    }

    console.log(`Active task: ${active.task.slice(0, 100)}`);
    const session = await julesFetch(active.name);
    console.log(`Jules session ${active.name} state: ${session.state ?? 'unknown'}`);
    if (session.state === 'FAILED') {
      throw new Error(`Jules session ${active.name} FAILED. Look at it in Jules, then set activeSession to null in ${STATE_PATH} to retry the task.`);
    }

    const prOutput = (session.outputs || []).find(o => o.pullRequest)?.pullRequest;
    if (!prOutput) {
      const hours = (Date.now() - new Date(active.startedAt).getTime()) / 36e5;
      console.log(hours > STALE_HOURS
        ? `No PR after ${Math.round(hours)}h — check the session in Jules; it may be waiting for input.`
        : 'No PR yet. Nothing to do this run.');
      return;
    }

    const prNumber = prNumberFrom(prOutput.url);
    if (!prNumber) throw new Error(`Could not parse PR number from ${prOutput.url}`);
    const pr = await githubFetch(`pulls/${prNumber}`);
    if (/^\s*- \[[ x]\].*Content approval:\s*Required/i.test(task.body.join('\n')) || /Content approval:\s*Required/i.test(task.body.join('\n'))) {
      await githubRequest(`issues/${prNumber}/labels`, {
        method: 'POST',
        body: JSON.stringify({ labels: ['content-approved'] }),
      });
      console.log(`Applied content-approved label to PR #${prNumber}.`);
    }
    if (!pr.merged) {
      console.log(`PR #${prNumber} is open, not merged yet — waiting for your review.`);
      return;
    }
    if (!entry.checked) {
      console.log(`PR #${prNumber} is merged, but the task is still unchecked in the roadmap. Jules could not fully verify it — read the PR description, then tick the box yourself if you are satisfied.`);
      return;
    }

    console.log(`PR #${prNumber} merged and task confirmed done. Advancing the queue.`);
    state.activeSession = null;
    stateChanged = true;
  }

  if (!state.activeSession) {
    const next = tasks.filter(isReady).find(t => !t.checked);
    if (!next) {
      console.log('Nothing unchecked under ### Ready. Queue is empty (Blocked and Human Review are never dispatched).');
    } else {
      console.log(`Dispatching next task: ${next.text.slice(0, 100)}`);
      const session = await julesFetch('sessions', {
        method: 'POST',
        body: JSON.stringify({
          prompt: buildPrompt(next),
          sourceContext: { source: process.env.JULES_SOURCE, githubRepoContext: { startingBranch: 'main' } },
          automationMode: 'AUTO_CREATE_PR',
          title: next.text.replace(/[*`]/g, '').slice(0, 80),
        }),
      });
      // Logged first: if saving the state below ever fails, this line tells you which session is orphaned.
      console.log(`Started Jules session ${session.name}`);
      state.activeSession = { name: session.name, task: next.text, startedAt: new Date().toISOString() };
      stateChanged = true;
    }
  }

  if (stateChanged) {
    saveState(state);
    commitAndPush();
  }
}

function commitAndPush() {
  execSync('git config user.name "jules-orchestrator[bot]"');
  execSync('git config user.email "jules-orchestrator@users.noreply.github.com"');
  execSync(`git add ${STATE_PATH}`);
  if (!execSync('git diff --cached --name-only').toString().trim()) {
    console.log('Nothing to commit.');
    return;
  }
  execSync('git commit -m "chore: advance Jules queue"');
  try {
    execSync('git push');
  } catch (e) {
    // Retry once after a rebase. If that also fails the job goes red on purpose: the state was not
    // saved, and staying silent would let the next run start a duplicate session.
    console.log('Push failed, retrying after rebase:', e.message);
    execSync('git pull --rebase');
    execSync('git push');
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => { console.error(err); process.exit(1); });
}
