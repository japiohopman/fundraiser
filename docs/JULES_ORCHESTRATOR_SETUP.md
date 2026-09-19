# Jules Queue Orchestrator — Setup (v3)

Jules works through the tasks under `### Ready` in the `## Now` section of `docs/roadmap.md`, one at a time, top to bottom. Your only recurring job is to review and merge his pull requests.

## How the loop works

1. The orchestrator (GitHub Actions, every 30 minutes, or run manually) starts a Jules session for the first unchecked Ready task, with the full task text.
2. Jules implements it, verifies it (see `AGENT_RULES.md`, section 5), and opens a pull request that also ticks his own task (`- [x]`) in `docs/roadmap.md`.
3. CI runs, including the `Content Guard` check. You review and merge.
4. On its next run the orchestrator sees: PR merged and task ticked. It clears the session and starts the next task.

If Jules could not fully verify a task he leaves it unticked and says why in the PR. Once you have read that and are satisfied, tick the box yourself; the queue then advances.

## Rules

- Only `### Ready` is dispatched. `### Blocked` and `### Human Review` never are.
- A task is a top-level `- [ ]` line plus indented detail bullets. Do not change the first line of a task that is in progress.
- The orchestrator never edits the roadmap. The only file it commits to `main` is `.github/jules-queue-state.json` (message `chore: advance Jules queue`).
- The `Content Guard` check fails PRs that touch `data/`, `docs/fundraisers.md`, `docs/editorial-policy.md` or `docs/story.md`, or add a file over 1 MB. For an intended content change add the label `content-approved`.

## One-time setup

1. Install the Jules GitHub app on `japiohopman/fundraiser`.
2. Repository secret `JULES_API_KEY` (never commit it).
3. Settings, Actions, General, Workflow permissions: read and write.
4. If `main` is protected, allow `github-actions[bot]` to push (bypass), otherwise the queue-state commit fails. Optionally require the `Content Guard` and `Foundation Check` checks before merging.
5. Create the label `content-approved` (Issues, Labels).

## When something looks stuck

Open the latest run of "Jules Queue Orchestrator" in the Actions tab; each run says what it is waiting for:

- "No PR yet": Jules is still working. After 48 hours the log says so.
- "open, not merged yet": waiting for you.
- "merged, but the task is still unchecked": read the PR, then tick the box.
- "FAILED": look at the session in Jules, then set `activeSession` to `null` in `.github/jules-queue-state.json` to retry.

If a run fails while saving its state, the log has a line `Started Jules session ...`. That session exists but is not recorded: cancel it in Jules or copy its name into the state file before running again, otherwise a duplicate session starts.
