# Jules Queue Orchestrator — Setup (v4)

Jules works through the tasks under `### Ready` in the `## Now` section of `docs/roadmap.md`, one at a time, top to bottom. There is no separate `### Active` queue section. The currently running Jules session is tracked only in `.github/jules-queue-state.json`.

## How the loop works

1. The orchestrator (GitHub Actions, every 30 minutes after the first controlled cycle, or run manually) reads the first unchecked task under `### Ready`.
2. If no session is active, it starts one Jules session with the full task specification and records that session in `.github/jules-queue-state.json`.
3. Jules implements and verifies the task, then opens a pull request into `main`. After verification, Jules changes only his own task line from `[ ]` to `[x]` in `### Ready`.
4. CI runs, including `Content Guard` on pull requests. You review and merge the PR.
5. On the next orchestrator run, the session is cleared only when the corresponding PR is merged and the roadmap task is checked. The orchestrator then starts the next unchecked Ready task.

If Jules could not fully verify a task, he must leave the task unchecked and explain why in the PR. After you review the limitation, you may tick the task yourself; the next orchestrator run can then advance the queue.

## Rules

- Only unchecked tasks under `### Ready` are dispatched.
- `### Blocked` and `### Human Review` are never dispatched.
- There is no `### Active` queue section. Do not create or maintain one.
- `.github/jules-queue-state.json` is the single source of truth for the currently active Jules session.
- The orchestrator never edits `docs/roadmap.md`. Jules updates his own Ready checkbox in his PR; a human may tick it after an explicitly documented verification limitation has been reviewed.
- The orchestrator's only automated commit to `main` is a queue-state update (message `chore: advance Jules queue`).
- `Content Guard` fails PRs that touch protected content files or add files over 1 MB without the `content-approved` label.

## One-time setup

1. Install the Jules GitHub app on `japiohopman/fundraiser`.
2. Create the Jules API key and add it as repository secret `JULES_API_KEY`. Never commit it.
3. Settings → Actions → General → Workflow permissions: allow read and write.
4. If `main` is protected, allow `github-actions[bot]` to push queue-state updates to it.
5. Create the `content-approved` label (Issues → Labels).
6. Keep the `schedule:` block commented out until one full manual cycle has been verified.

## Controlled first cycle

1. Review the order of unchecked tasks under `### Ready` in `docs/roadmap.md`.
2. Run **Jules Queue Orchestrator** manually.
3. Confirm that `.github/jules-queue-state.json` records the started session and that Jules receives the first unchecked Ready task.
4. Review the resulting PR and its CI checks; merge it when verified.
5. Confirm the merged PR contains the expected `[x]` checkbox for that task.
6. Run the workflow again. It should clear the completed session state and start the next unchecked Ready task.
7. Only after that cycle is clean should the 30-minute schedule be enabled.

## When something looks stuck

Open the latest run of **Jules Queue Orchestrator** in the Actions tab.

- **No PR yet:** Jules is still working. After 48 hours, inspect the session in Jules.
- **PR open, not merged:** this is the human review gate.
- **PR merged, task unchecked:** Jules could not fully verify it. Read the PR, then tick the task yourself only when satisfied.
- **FAILED:** inspect the Jules session. Do not silently clear an active session unless the session was actually cancelled or is otherwise known to be abandoned.
- **Active task missing from roadmap:** the orchestrator fails closed. Restore the exact task line or deliberately reset `activeSession` to `null` after confirming there is no live Jules session that would be orphaned.

## GitHub Actions safety

The orchestrator workflow checks out `main` explicitly, so running the workflow manually from another branch cannot accidentally read or push a branch-local queue state.
