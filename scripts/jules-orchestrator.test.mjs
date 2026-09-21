import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  parseNow,
  isReady,
  extractTitle,
  extractTaskId,
  findMatchingTask,
  isContentApprovalRequired,
  orchestrate,
} from './jules-orchestrator.mjs';

test('parseNow and parser isolation', () => {
  const roadmapSample = `
# Roadmap

## Now

### Ready

- [x] **Completed Task**
  - **Problem:** ...
- [ ] **Task 1**
  - **Problem:** First ready task

### Blocked

- [ ] **Blocked Task**

### Human Review

- [ ] **Review Task**
`;

  const tasks = parseNow(roadmapSample);
  assert.equal(tasks.length, 4);

  const readyTasks = tasks.filter(isReady);
  assert.equal(readyTasks.length, 2);
  assert.equal(readyTasks[0].text, '**Completed Task**');
  assert.equal(readyTasks[1].text, '**Task 1**');

  const readyUnchecked = readyTasks.filter(t => !t.checked);
  assert.equal(readyUnchecked.length, 1);
  assert.equal(readyUnchecked[0].text, '**Task 1**');
});

test('extractTitle, extractTaskId and findMatchingTask', () => {
  const t1 = '**Technical foundation: validation, share metadata and repo hygiene** (merged in PR #28)';
  const t2 = '**Manon T-shirt gallery: reconnect verified local assets** (Issue #39)';

  assert.equal(extractTitle(t1), 'Technical foundation: validation, share metadata and repo hygiene');
  assert.equal(extractTitle(t2), 'Manon T-shirt gallery: reconnect verified local assets');

  assert.equal(extractTaskId(t1), 'PR#28');
  assert.equal(extractTaskId(t2), 'Issue#39');

  const parsedTasks = [
    { text: t1, checked: true },
    { text: t2, checked: false },
  ];

  // Old state format matching
  const legacyActiveState = {
    name: 'sessions/123',
    task: '**Technical foundation: validation, share metadata and repo hygiene**',
  };

  const matched = findMatchingTask(legacyActiveState, parsedTasks);
  assert.notEqual(matched, null);
  assert.equal(matched.text, t1);
});

test('Active task exists + Jules has no PR yet -> wait', async () => {
  const state = { activeSession: { name: 'sessions/1', task: '**Task 1**' } };
  const roadmapText = `## Now\n### Ready\n- [ ] **Task 1**\n`;

  let postCount = 0;
  const result = await orchestrate({
    state,
    roadmapText,
    julesFetch: async (path, options) => {
      if (options?.method === 'POST') postCount++;
      return { state: 'IN_PROGRESS', outputs: [] };
    },
    githubFetch: async () => assert.fail('githubFetch should not be called when no PR output'),
  });

  assert.equal(result.stateChanged, false);
  assert.equal(result.state.activeSession.name, 'sessions/1');
  assert.equal(postCount, 0);
});

test('Active task exists + PR open -> wait', async () => {
  const state = { activeSession: { name: 'sessions/1', task: '**Task 1**' } };
  const roadmapText = `## Now\n### Ready\n- [ ] **Task 1**\n`;

  let postCount = 0;
  const result = await orchestrate({
    state,
    roadmapText,
    julesFetch: async (path, options) => {
      if (options?.method === 'POST') postCount++;
      return { state: 'IN_PROGRESS', outputs: [{ pullRequest: { url: 'https://github.com/repo/pull/10' } }] };
    },
    githubFetch: async (path) => {
      assert.equal(path, 'pulls/10');
      return { state: 'open', merged: false };
    },
  });

  assert.equal(result.stateChanged, false);
  assert.equal(result.state.activeSession.name, 'sessions/1');
  assert.equal(postCount, 0);
});

test('Active task exists + merged PR + roadmap task [x] -> clear state and advance', async () => {
  const state = { activeSession: { name: 'sessions/1', task: '**Task 1**' } };
  const roadmapText = `## Now\n### Ready\n- [x] **Task 1** (merged in PR #10)\n- [ ] **Task 2**\n`;

  let postCount = 0;
  const result = await orchestrate({
    state,
    roadmapText,
    julesFetch: async (path, options) => {
      if (options?.method === 'POST') {
        postCount++;
        return { name: 'sessions/2' };
      }
      return { state: 'COMPLETED', outputs: [{ pullRequest: { url: 'https://github.com/repo/pull/10' } }] };
    },
    githubFetch: async (path) => {
      assert.equal(path, 'pulls/10');
      return { state: 'closed', merged: true };
    },
  });

  assert.equal(result.stateChanged, true);
  assert.equal(postCount, 1);
  assert.equal(result.state.activeSession.name, 'sessions/2');
  assert.equal(extractTitle(result.state.activeSession.task), 'Task 2');
});

test('Active task missing + Jules session still active -> keep state and do not dispatch another session', async () => {
  const state = { activeSession: { name: 'sessions/1', task: '**Missing Active Task**' } };
  const roadmapText = `## Now\n### Ready\n- [ ] **Task 2**\n`;

  let postCount = 0;
  const result = await orchestrate({
    state,
    roadmapText,
    julesFetch: async (path, options) => {
      if (options?.method === 'POST') postCount++;
      return { state: 'IN_PROGRESS', outputs: [] };
    },
    githubFetch: async () => assert.fail('No PR output expected'),
  });

  assert.equal(result.stateChanged, false);
  assert.equal(result.state.activeSession.name, 'sessions/1');
  assert.equal(postCount, 0);
});

test('Active task missing + Jules session completed/cancelled/failed safely -> clear stale state and continue', async () => {
  const state = { activeSession: { name: 'sessions/1', task: '**Missing Active Task**' } };
  const roadmapText = `## Now\n### Ready\n- [ ] **Task 2**\n`;

  let postCount = 0;
  const result = await orchestrate({
    state,
    roadmapText,
    julesFetch: async (path, options) => {
      if (options?.method === 'POST') {
        postCount++;
        return { name: 'sessions/new-task-2' };
      }
      return { state: 'FAILED', outputs: [] };
    },
    githubFetch: async () => {},
  });

  assert.equal(result.stateChanged, true);
  assert.equal(postCount, 1);
  assert.equal(result.state.activeSession.name, 'sessions/new-task-2');
  assert.equal(extractTitle(result.state.activeSession.task), 'Task 2');
});

test('Existing stale Technical Foundation state + current roadmap -> recover and select Issue #39', async () => {
  const state = JSON.parse(readFileSync('.github/jules-queue-state.json', 'utf8'));
  const roadmapText = readFileSync('docs/roadmap.md', 'utf8');

  let postCount = 0;
  let dispatchedTitle = null;

  const result = await orchestrate({
    state,
    roadmapText,
    julesFetch: async (path, options) => {
      if (options?.method === 'POST') {
        postCount++;
        const body = JSON.parse(options.body);
        dispatchedTitle = body.title;
        return { name: 'sessions/issue-39-session' };
      }
      assert.equal(path, 'sessions/15518956742770897260');
      return {
        name: 'sessions/15518956742770897260',
        state: 'COMPLETED',
        outputs: [{ pullRequest: { url: 'https://github.com/japiohopman/fundraiser/pull/28' } }],
      };
    },
    githubFetch: async (path) => {
      assert.equal(path, 'pulls/28');
      return { state: 'closed', merged: true };
    },
  });

  assert.equal(result.stateChanged, true);
  assert.equal(postCount, 1);
  assert.equal(result.state.activeSession.name, 'sessions/issue-39-session');
  assert.ok(result.state.activeSession.task.includes('Manon T-shirt gallery'));
  assert.ok(dispatchedTitle.includes('Manon T-shirt gallery'));
});

test('No unchecked Ready tasks -> report queue empty and do not create a session', async () => {
  const state = { activeSession: null };
  const roadmapText = `## Now\n### Ready\n- [x] **Task 1**\n`;

  let postCount = 0;
  const result = await orchestrate({
    state,
    roadmapText,
    julesFetch: async (path, options) => {
      if (options?.method === 'POST') postCount++;
      return {};
    },
  });

  assert.equal(result.stateChanged, false);
  assert.equal(result.state.activeSession, null);
  assert.equal(postCount, 0);
});

test('Content-approved task -> preserve automatic content-approved PR labeling', async () => {
  const state = { activeSession: { name: 'sessions/1', task: '**Content Task**' } };
  const roadmapText = `## Now\n### Ready\n- [ ] **Content Task**\n  - Content approval: Required\n`;

  let labelApplied = false;
  const result = await orchestrate({
    state,
    roadmapText,
    julesFetch: async () => {
      return { state: 'IN_PROGRESS', outputs: [{ pullRequest: { url: 'https://github.com/repo/pull/15' } }] };
    },
    githubFetch: async (path) => {
      assert.equal(path, 'pulls/15');
      return { state: 'open', merged: false };
    },
    githubRequest: async (path, options) => {
      if (path === 'issues/15/labels' && options?.method === 'POST') {
        const body = JSON.parse(options.body);
        if (body.labels.includes('content-approved')) {
          labelApplied = true;
        }
      }
      return {};
    },
  });

  assert.equal(labelApplied, true);
  assert.equal(result.stateChanged, false);
});

test('Never dispatch more than one Jules session from a single run', async () => {
  const state = { activeSession: null };
  const roadmapText = `## Now\n### Ready\n- [ ] **Task 1**\n- [ ] **Task 2**\n`;

  let postCount = 0;
  const result = await orchestrate({
    state,
    roadmapText,
    julesFetch: async (path, options) => {
      if (options?.method === 'POST') {
        postCount++;
        return { name: `sessions/dispatch-${postCount}` };
      }
      return {};
    },
  });

  assert.equal(result.stateChanged, true);
  assert.equal(postCount, 1);
  assert.equal(result.state.activeSession.name, 'sessions/dispatch-1');
  assert.ok(result.state.activeSession.task.includes('Task 1'));
});
