import test from 'node:test';
import assert from 'node:assert/strict';

import { orchestrate } from '../scripts/jules-orchestrator.mjs';

const roadmap = `# Roadmap

## Now

### Ready

- [x] **Share experience: direct QR + copy link with clear destination context** (Issue #69)
  - **Goal:** Completed.

- [ ] **Thank-you section: place gratitude message inside heart and introduce editorial display typography** (Issue #72)
  - **Goal:** Implement and verify the thank-you section.
`;

test('clears a PAUSED session whose roadmap task is already checked, then dispatches the next Ready task', async () => {
  const state = {
    activeSession: {
      name: 'sessions/old-69',
      task: '**Share experience: direct QR + copy link with clear destination context** (Issue #69)',
      taskId: 'Issue#69',
      title: 'Share experience: direct QR + copy link with clear destination context',
      startedAt: '2026-09-22T17:03:46.009Z',
    },
  };

  const calls = [];
  let savedStates = [];

  const result = await orchestrate({
    state,
    roadmapText: roadmap,
    julesFetch: async (path, options = {}) => {
      calls.push({ path, options });
      if (path === 'sessions' && options.method === 'POST') {
        return { name: 'sessions/new-72' };
      }
      throw new Error(`unexpected Jules call: ${path}`);
    },
    githubFetch: async () => {
      throw new Error('githubFetch should not be needed for a checked stale task');
    },
    saveStateAndPush: nextState => {
      savedStates.push(structuredClone(nextState));
    },
    log: () => {},
  });

  assert.equal(state.activeSession.name, 'sessions/new-72');
  assert.equal(result.stateChanged, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].path, 'sessions');
  assert.equal(calls[0].options.method, 'POST');
  assert.match(calls[0].options.body, /Issue #72/);
  assert.ok(savedStates.some(s => s.activeSession?.name === 'pending'));
});

test('does not clear a genuinely current PAUSED session for the first unchecked Ready task', async () => {
  const state = {
    activeSession: {
      name: 'sessions/current-72',
      task: '**Thank-you section: place gratitude message inside heart and introduce editorial display typography** (Issue #72)',
      taskId: 'Issue#72',
      title: 'Thank-you section: place gratitude message inside heart and introduce editorial display typography',
      startedAt: new Date().toISOString(),
    },
  };

  const calls = [];

  const result = await orchestrate({
    state,
    roadmapText: roadmap,
    julesFetch: async path => {
      calls.push(path);
      return { state: 'PAUSED', outputs: [] };
    },
    githubFetch: async () => {
      throw new Error('githubFetch should not be called for a live PAUSED session');
    },
    log: () => {},
  });

  assert.equal(state.activeSession.name, 'sessions/current-72');
  assert.equal(result.stateChanged, false);
  assert.deepEqual(calls, ['sessions/current-72']);
});
