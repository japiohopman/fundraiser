# Jules Queue Orchestrator — Setup

Same orchestrator pattern as the artificer project, adapted to this static site.

## Files

```text
.github/workflows/jules-orchestrator.yml   # the heartbeat (cron OFF until verified)
.github/jules-queue-state.json             # which Jules session is active
scripts/jules-orchestrator.mjs             # the logic
docs/roadmap.md                            # `## Now` section = the dispatch queue
AGENT_RULES.md                             # rules Jules is told to read first
```

## Rules

1. Jules only dispatches from `### Ready`, one task at a time (`### Active` holds at most one).
2. `### Blocked` and `### Human Review` are never dispatched.
3. Two gates before the queue advances: the PR must be merged, **and** you must tick the task `[x]` under `### Active` yourself.
4. The orchestrator never ticks a checkbox itself.
5. Each task is a single line in the roadmap; keep the text stable while it is Active (it is used to match the task).

## One-time setup

1. Install the Jules GitHub app on `japiohopman/fundraiser` (jules.google.com).
2. Create an API key in Jules settings and add it as repository secret `JULES_API_KEY`. Never commit it.
3. Settings → Actions → General → Workflow permissions: allow read and write (the orchestrator commits the queue state).
4. If `main` is protected, allow `github-actions[bot]` to push to it (bypass), otherwise the queue-state commit fails and the run goes red.
5. Confirm `JULES_SOURCE` in the workflow reads `sources/github/japiohopman/fundraiser`.

## Controlled first cycle (cron stays off)

1. Review and order `### Ready` in `docs/roadmap.md`.
2. Actions → Jules Queue Orchestrator → Run workflow.
3. Check that the first Ready task moved to Active and a Jules session started.
4. Review the resulting PR; merge when verified.
5. Tick that task `[x]` under `### Active`.
6. Run the workflow again: the task leaves Active and the next Ready task starts.
7. Only after one clean cycle: uncomment the `schedule:` block in the workflow.

## Note on failures

If the run cannot push the queue state to `main`, it fails on purpose. Check the log for a line `Started Jules session ...`: that session exists but is not recorded yet. Cancel it in Jules or copy its name into `.github/jules-queue-state.json` before running again, otherwise a duplicate session is started.
