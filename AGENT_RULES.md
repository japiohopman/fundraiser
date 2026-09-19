# Agent Ground Rules

Read this together with [CONTRIBUTING.md](./CONTRIBUTING.md) and [docs/editorial-policy.md](./docs/editorial-policy.md).
It applies to every automated coding agent (Jules and others) working in this repository.

## 1. The editorial policy is not negotiable

This site documents real fundraising actions and real people. Therefore:

- Never add, change or remove a factual claim about a campaign, a person, an amount, a beneficiary or a money flow.
- Never edit the values in `data/fundraisers.json` or the evidence in `docs/fundraisers.md`. Those change only through the content workflow in `CONTRIBUTING.md`, by a human, from a verified source.
- Never soften, sharpen or "improve" wording about who is responsible for what. If copy looks wrong, describe the problem in the PR instead of rewriting it.
- Do not use accusatory vocabulary (see editorial policy, rule 3).

## 2. Stay inside the task

Do exactly the task you were given. If you notice something else worth fixing, mention it in the PR description; do not fix it in the same PR.

## 3. Keep it a static site

No backend, authentication, database, scraping or new runtime dependencies (see "Scope discipline" in `CONTRIBUTING.md`). Dev-only tooling used inside GitHub Actions is fine if the task asks for it.

## 4. Never touch the queue

Do not edit the `## Now` section of `docs/roadmap.md`, and never tick a checkbox in it. Completion is confirmed by a human after review. The phase sections lower in that file are the plan; only update their status text when the PR truly completes an item.

## 5. Do not claim what you have not verified

"It should work" is not a result. State in the PR what you actually ran or looked at (which browser width, which tool, which check). If you could not verify something, say so plainly.

## 6. Pull requests

- Work on a focused branch and open a PR into `main`. Never push to `main`.
- One task per PR. Describe what changed, what you verified, and anything you deliberately did not touch.
- Do not commit binaries over 1 MB or vendored third-party code.
