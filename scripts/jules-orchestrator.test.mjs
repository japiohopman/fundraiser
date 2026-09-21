import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseNow,
  isReady,
  extractTitle,
  extractTaskId,
  findMatchingTask,
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

test('PR closed unmerged + Jules session IN_PROGRESS -> keep active state; no dispatch', async () => {
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
      return { state: 'closed', merged: false };
    },
  });

  assert.equal(result.stateChanged, false);
  assert.equal(result.state.activeSession.name, 'sessions/1');
  assert.equal(postCount, 0);
});

test('PR closed unmerged + Jules session UNKNOWN -> keep active state; no dispatch', async () => {
  const state = { activeSession: { name: 'sessions/1', task: '**Task 1**' } };
  const roadmapText = `## Now\n### Ready\n- [ ] **Task 1**\n`;

  let postCount = 0;
  const result = await orchestrate({
    state,
    roadmapText,
    julesFetch: async (path, options) => {
      if (options?.method === 'POST') postCount++;
      return { state: 'UNKNOWN', outputs: [{ pullRequest: { url: 'https://github.com/repo/pull/10' } }] };
    },
    githubFetch: async (path) => {
      assert.equal(path, 'pulls/10');
      return { state: 'closed', merged: false };
    },
  });

  assert.equal(result.stateChanged, false);
  assert.equal(result.state.activeSession.name, 'sessions/1');
  assert.equal(postCount, 0);
});

test('PR closed unmerged + Jules session FAILED -> safe recovery', async () => {
  const state = { activeSession: { name: 'sessions/1', task: '**Task 1**' } };
  const roadmapText = `## Now\n### Ready\n- [ ] **Task 1**\n- [ ] **Task 2**\n`;

  let postCount = 0;
  const result = await orchestrate({
    state,
    roadmapText,
    julesFetch: async (path, options) => {
      if (options?.method === 'POST') {
        postCount++;
        return { name: 'sessions/2' };
      }
      return { state: 'FAILED', outputs: [{ pullRequest: { url: 'https://github.com/repo/pull/10' } }] };
    },
    githubFetch: async (path) => {
      assert.equal(path, 'pulls/10');
      return { state: 'closed', merged: false };
    },
  });

  assert.equal(result.stateChanged, true);
  assert.equal(postCount, 1);
  assert.equal(result.state.activeSession.name, 'sessions/2');
});

test('Jules session 404 + no independent GitHub evidence -> keep active state; no dispatch', async () => {
  const state = { activeSession: { name: 'sessions/404-session', task: '**Task 1**' } };
  const roadmapText = `## Now\n### Ready\n- [ ] **Task 1**\n`;

  let postCount = 0;
  const result = await orchestrate({
    state,
    roadmapText,
    julesFetch: async (path, options) => {
      if (options?.method === 'POST') postCount++;
      throw new Error('Jules API sessions/404-session failed: 404 Not Found');
    },
    githubFetch: async (path) => {
      assert.equal(path, 'pulls?state=all');
      return [];
    },
  });

  assert.equal(result.stateChanged, false);
  assert.equal(result.state.activeSession.name, 'sessions/404-session');
  assert.equal(postCount, 0);
});

test('Jules session 404 + associated PR open -> keep active state; no dispatch', async () => {
  const state = { activeSession: { name: 'sessions/404-session', task: '**Task 1**' } };
  const roadmapText = `## Now\n### Ready\n- [ ] **Task 1**\n`;

  let postCount = 0;
  const result = await orchestrate({
    state,
    roadmapText,
    julesFetch: async (path, options) => {
      if (options?.method === 'POST') postCount++;
      throw new Error('Jules API sessions/404-session failed: 404 Not Found');
    },
    githubFetch: async (path) => {
      assert.equal(path, 'pulls?state=all');
      return [{ number: 12, state: 'open', title: 'Fix Task 1', body: 'Implements **Task 1**' }];
    },
  });

  assert.equal(result.stateChanged, false);
  assert.equal(result.state.activeSession.name, 'sessions/404-session');
  assert.equal(postCount, 0);
});

test('Jules session 404 + associated work conclusively completed -> safe recovery', async () => {
  const state = { activeSession: { name: 'sessions/404-session', task: '**Task 1**' } };
  const roadmapText = `## Now\n### Ready\n- [x] **Task 1** (merged in PR #12)\n- [ ] **Task 2**\n`;

  let postCount = 0;
  const result = await orchestrate({
    state,
    roadmapText,
    julesFetch: async (path, options) => {
      if (options?.method === 'POST') {
        postCount++;
        return { name: 'sessions/2' };
      }
      throw new Error('Jules API sessions/404-session failed: 404 Not Found');
    },
    githubFetch: async (path) => {
      assert.equal(path, 'pulls?state=all');
      return [{ number: 12, state: 'closed', merged: true, title: 'Fix Task 1', body: 'Implements **Task 1**' }];
    },
  });

  assert.equal(result.stateChanged, true);
  assert.equal(postCount, 1);
  assert.equal(result.state.activeSession.name, 'sessions/2');
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

test('Active task missing + Jules session FAILED safely -> clear stale state and continue', async () => {
  const state = { activeSession: { name: 'sessions/1', task: '**Missing Task**' } };
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
  });

  assert.equal(result.stateChanged, true);
  assert.equal(postCount, 1);
  assert.equal(result.state.activeSession.name, 'sessions/new-task-2');
});

test('Active task missing + Jules session CANCELLED safely -> clear stale state and continue', async () => {
  const state = { activeSession: { name: 'sessions/1', task: '**Missing Task**' } };
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
      return { state: 'CANCELLED', outputs: [] };
    },
  });

  assert.equal(result.stateChanged, true);
  assert.equal(postCount, 1);
  assert.equal(result.state.activeSession.name, 'sessions/new-task-2');
});

test('Active task missing + Jules session COMPLETED safely -> clear stale state and continue', async () => {
  const state = { activeSession: { name: 'sessions/1', task: '**Missing Task**' } };
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
      return { state: 'COMPLETED', outputs: [] };
    },
  });

  assert.equal(result.stateChanged, true);
  assert.equal(postCount, 1);
  assert.equal(result.state.activeSession.name, 'sessions/new-task-2');
});

test('Existing stale Technical Foundation state + current roadmap fixture -> recover and select Issue #39', async () => {
  const staleStateFixture = {
    activeSession: {
      name: 'sessions/15518956742770897260',
      task: '**Technical foundation: validation, share metadata and repo hygiene**',
      startedAt: '2026-09-19T09:21:32.982Z',
    },
  };

  const roadmapFixture = `
# Roadmap

## Now

### Ready

- [x] **Technical foundation: validation, share metadata and repo hygiene** (merged in PR #28)

- [ ] **Manon T-shirt gallery: reconnect verified local assets** (Issue #39)
  - **Problem:** ...
`;

  let postCount = 0;
  let dispatchedTitle = null;

  const result = await orchestrate({
    state: staleStateFixture,
    roadmapText: roadmapFixture,
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

test('Two Jules sessions with same title but different claim IDs -> recover only exact matching claim', async () => {
  const pendingState = {
    activeSession: {
      name: 'pending',
      claimId: 'claim_target_123',
      task: '**Task 1**',
      title: 'Task 1',
      taskId: 'task-1',
      startedAt: new Date().toISOString(),
    },
  };
  const roadmapText = `## Now\n### Ready\n- [ ] **Task 1**\n`;

  let postCount = 0;
  const result = await orchestrate({
    state: pendingState,
    roadmapText,
    julesFetch: async (path, options) => {
      if (options?.method === 'POST') {
        postCount++;
        return { name: 'sessions/duplicate-should-not-happen' };
      }
      if (path === 'sessions') {
        return {
          sessions: [
            { name: 'sessions/wrong-claim-456', title: 'Task 1 [claim:claim_other_456]', prompt: '[claim:claim_other_456]', state: 'IN_PROGRESS' },
            { name: 'sessions/correct-claim-123', title: 'Task 1 [claim:claim_target_123]', prompt: '[claim:claim_target_123]', state: 'IN_PROGRESS' },
          ],
        };
      }
      if (path === 'sessions/correct-claim-123') {
        return { name: 'sessions/correct-claim-123', state: 'IN_PROGRESS', outputs: [] };
      }
      return {};
    },
  });

  assert.equal(postCount, 0, 'No duplicate POST should be made when exact claimId session is recovered');
  assert.equal(result.state.activeSession.name, 'sessions/correct-claim-123');
});

test('Pending reservation with no matching claim -> remain safely pending / do not blindly create duplicate until timeout', async () => {
  const pendingState = {
    activeSession: {
      name: 'pending',
      claimId: 'claim_target_recent',
      task: '**Task 1**',
      title: 'Task 1',
      taskId: 'task-1',
      startedAt: new Date().toISOString(), // recent (0 minutes old)
    },
  };
  const roadmapText = `## Now\n### Ready\n- [ ] **Task 1**\n`;

  let postCount = 0;
  const result = await orchestrate({
    state: pendingState,
    roadmapText,
    julesFetch: async (path, options) => {
      if (options?.method === 'POST') postCount++;
      if (path === 'sessions') {
        return {
          sessions: [
            { name: 'sessions/wrong-claim-456', title: 'Task 1 [claim:claim_other_456]', state: 'IN_PROGRESS' },
          ],
        };
      }
      return {};
    },
  });

  assert.equal(postCount, 0, 'Should NOT create a duplicate POST while pending reservation is recent');
  assert.equal(result.stateChanged, false, 'State should remain pending and unchanged while waiting');
  assert.equal(result.state.activeSession.name, 'pending');
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
