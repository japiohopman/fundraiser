# Contributing

## Branch workflow

- `main` is the deployable/default branch.
- Work starts on a focused feature or documentation branch.
- Open a pull request into `main` when the work is complete enough to review.
- Review the diff and checks before merging.
- Do not edit `main` directly for normal project work.

## Content workflow

For fundraiser information:

1. Update `docs/fundraisers.md` with the evidence first.
2. Mark the verification state and `verifiedAt` date in the eventual data model.
3. Update website data/content from the verified source register.
4. Keep the original campaign URL visible and inspectable.

Do not publish new campaign amounts, beneficiary claims, money-flow claims, or social-media claims from memory or assumption.

## Scope discipline

The initial product is a static information site. Avoid adding a backend, authentication, database, or automatic campaign scraping unless a documented requirement is added to the roadmap first.

## Issue intake

Use GitHub Issues to capture follow-up work, bugs, and out-of-scope findings as soon as they are noticed. Before creating a new issue, search for an existing issue that already describes the same work. Do not expand the current PR to include follow-up work unless the current task explicitly includes it; link the issue from the PR instead.

Issues are an intake mechanism, not a second Jules dispatch queue. The ordered dispatch queue remains `## Now` → `### Ready` in `docs/roadmap.md`.

## Automation (Jules orchestrator)

Implementation tasks are dispatched from the `## Now` → `### Ready` queue in `docs/roadmap.md`; see `docs/JULES_ORCHESTRATOR_SETUP.md`. Jules works on the first unchecked Ready task and delivers a pull request into `main`.

The queue has no separate `### Active` roadmap section. The current Jules session is tracked only in `.github/jules-queue-state.json`; that state is cleared after the corresponding PR is merged and the task is checked in the roadmap. The merge of a Jules PR automatically triggers the next queue evaluation; no manual "advance queue" run is normally needed.

The `Content Guard` check fails any pull request that touches protected content files or adds a file over 1 MB without the `content-approved` label. That is intentional: when a content change is deliberate and verified, add the label `content-approved`.

Automation may commit only queue-state changes to `main` (message `chore: advance Jules queue`). Jules' implementation and roadmap checkbox changes always arrive through a pull request and are reviewed before merge.
