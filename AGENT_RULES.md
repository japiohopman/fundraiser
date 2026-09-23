# Agent Ground Rules

This is the single instruction file for every automated coding agent (Jules and others) working in this repository. Read it, [CONTRIBUTING.md](./CONTRIBUTING.md) and [docs/editorial-policy.md](./docs/editorial-policy.md) before you start, then work from `docs/roadmap.md`.

## 1. What this project is

An independent, static information site (`index.html`, `styles.css`, `app.js`, JSON in `data/`) that documents the crowdfunding actions connected to the August 2026 ParkNest fire in Amsterdam-Oost. It describes real people and real money. Clarity and accuracy matter more than polish.

## 2. Editorial integrity (hard limits)

- Never add, change or remove a factual claim about a campaign, a person, an amount, a beneficiary or a money flow.
- Never edit anything under `data/`, or the evidence in `docs/fundraisers.md`, `docs/editorial-policy.md` or `docs/story.md`. These change only through the content workflow in `CONTRIBUTING.md`, by a human, from a verified source. A CI check (`Content Guard`) fails any pull request that touches them without the `content-approved` label.
- Do not add user-visible text unless the task explicitly allows it. All site text lives in `data/content.json` in Dutch and English; do not hardcode text in HTML or JavaScript.
- Never soften, sharpen or "improve" wording about who is responsible for what. If copy looks wrong, describe it in the pull request instead of rewriting it.
- Do not use accusatory vocabulary (editorial policy, rule 3).
- If in doubt whether something is content or presentation, leave it alone and say so in the pull request.

## 3. Before you change anything

- Read the files the task touches, as they are now. Do not rely on what a document says the code does.
- Search for an existing class, token, function or pattern before adding a new one. Extend what exists.
- Preserve what already works: the skip link, `:focus-visible` styles, the focus trap in the QR modal, `prefers-reduced-motion`, the AA colour tokens, the collective (green) versus personal (indigo) distinction, the campaign-type labels and the yellow separation warning.

## 4. Scope

- Do exactly the task you were given, completely. Extra issues you notice must not be implemented in the current diff. Search GitHub Issues first; if the work is not already tracked, create a concise GitHub Issue with the problem, relevant evidence/context, and suggested next step, then link it from the pull request description.
- Keep this a static site: no backend, no new runtime dependencies, no scraping, no `package.json` for the site. CI tooling may use temporary tooling inside GitHub Actions when the task explicitly allows it.
- No binary over 1 MB, no vendored third-party code. Keep the QR generator and other existing code unless the task says otherwise.
- The Jules dispatch order is defined entirely by `docs/roadmap.md`: first use the first unchecked top-level task under `## Now` → `### Ready`; when that queue is exhausted, automatically continue with the first unchecked top-level task under `## Phase 3 — Production Readiness & Launch`. Do not create or maintain a separate `### Active` queue section. GitHub Issues are the intake for follow-up/out-of-scope work, not a second dispatch queue.
- Never edit `### Blocked` or `### Human Review` in `docs/roadmap.md`, or any task other than your own.

## 5. Verification (required before you open the pull request)

A task is done when you have seen it work, not when the code looks right.

1. Serve the site locally (`python3 -m http.server`; the page loads its JSON with `fetch`, so opening the file directly does not work).
2. For anything visual, take screenshots before and after with a headless browser (for example Playwright installed in a temporary directory; do not commit it) at 320, 375, 768, 1024 and 1440px. Check there is no horizontal scrolling and no clipped or overlapping control.
3. Tab through the page once and confirm every interactive element shows a visible focus ring. Switch the language (NL and EN) and confirm nothing breaks.
4. Run every check that exists in the repository or in `.github/workflows`, and do not weaken or bypass a check to make it pass.
5. In the pull request, report automated checks and visual checks separately, and say plainly what you could not verify.

## 6. Finishing: ticking your own task

You are the one who ticks the box, in the same pull request, only after step 5:

- In `docs/roadmap.md`, change your own task line from `- [ ]` to `- [x]`, in place, in the exact section from which the orchestrator dispatched it (`### Ready` or the Phase 3 section). Do not move it and do not change its bullets.
- If the dispatched task is represented in a Phase section, tick that exact task and nothing else. Only when a Ready-dispatched task separately and fully completes a Phase item may you tick that Phase item as well. Never tick an unrelated task.
- Do not add an `### Active` entry. The active Jules session is tracked only in `.github/jules-queue-state.json`.
- If you could not fully verify the task, leave the box unchecked and explain exactly why in the pull request description. An honest unchecked box is worth more than a false checked box.

## 7. Pull requests

- Work on a focused branch and open a pull request into `main`. Never push to `main`.
- One task per pull request. Title: what changed, in plain words.
- Description: what changed and why, automated checks, visual checks (which widths, what you looked at), what you deliberately did not touch, and follow-ups you noticed.
