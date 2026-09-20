# Roadmap

## Now

> Dispatch queue for the Jules orchestrator (`scripts/jules-orchestrator.mjs`), worked top to bottom. Only unchecked tasks under `### Ready` are dispatched, one at a time. Jules ticks his own task in place (`[ ]` to `[x]`) in his pull request after verifying it; you review and merge, and the orchestrator then starts the next task. `### Blocked` and `### Human Review` are never dispatched. A task is a top-level checkbox line plus indented detail bullets (Problem, Goal, Scope, Constraints, Acceptance, Verification); keep the first line unchanged once a task is in progress. Finished tasks stay in place as `[x]`. The phase sections below are the long-term plan.

### Ready

- [x] **Keyboard navigation and focus visibility** (merged in PR #18)
- [x] **Contrast audit and fixes** (merged in PR #19)

- [x] **Page shell: header, typography, reading layout and responsive behaviour**
  - **Problem:** At 375px the header (title, subtitle, language switcher, menu button) takes about 225px of the first screen and the subtitle is squeezed beside the buttons. On desktop the prose is capped near 68ch but sits in cards about 1000px wide, leaving a large empty area on the right. Hero and section titles use fixed sizes. Only two breakpoints exist (768px and 900px) and there is no wide-screen tuning.
  - **Goal:** One coherent, mobile-first pass over the page shell: a compact header on small screens, fluid typography, a comfortable reading column on wide screens, and responsive behaviour that holds from 320px to 1440px.
  - **Scope:** `styles.css`. `index.html` and `app.js` only for markup or class hooks the styling needs.
  - **Constraints:** Presentation only. No visible text changes and no new user-visible strings. Keep the keyboard focus rings and the WCAG AA colour tokens from the earlier accessibility work. Do not change the fundraiser cards beyond what the shell needs (they get their own task).
  - **Acceptance:** At 320, 375, 768, 1024 and 1440px there is no horizontal scrolling and no clipped or overlapping control. At 375px the header takes no more than about 120px, with title, language switcher and menu button all reachable. Hero and section titles scale fluidly (`clamp()`). On wide screens the prose column is narrowed so it no longer leaves a large empty area beside it. Every interactive element still shows a visible focus ring when tabbing.
  - **Verification:** Serve the site statically, take before and after screenshots at the widths above, tab through the page once, and describe exactly what you checked in the pull request. Tick the Phase 1B item "Responsive design refinement across mobile, tablet, and desktop breakpoints" only if this task fully completes it.

- [x] **Fundraiser cards: hierarchy, readability and print**
  - **Problem:** Each campaign is shown inside three nested boxes (section card, group box, campaign card). The small meta text (organiser, legal entity, last verified) is hard to read, and the goal and total amounts are visually weaker than their labels. There is no print styling, and the page is about 13,600px long on mobile.
  - **Goal:** Make each campaign card easier to scan and read while keeping the collective versus personal distinction unmistakable, and add a print stylesheet so the page prints as a usable document.
  - **Scope:** `styles.css`. `index.html` and `app.js` only for markup or class hooks the styling needs (for example to flatten a wrapper).
  - **Constraints:** Presentation only. No visible text changes, no new strings, no change to any number or wording. The green (collective) and indigo (personal) distinction, the campaign-type labels and the yellow separation warning must stay at least as prominent as they are now. Do not touch `data/`.
  - **Acceptance:** One level less of nested borders and backgrounds around each campaign. Meta text is at least 14px. Goal and total amounts are clearly stronger than their labels. On print: navigation, share buttons and the QR modal are hidden; campaign-type labels and the separation warning remain visible; a campaign card is not split across pages. Checked at 375px and 1440px, and in a print preview.
  - **Verification:** Screenshots before and after at 375px and 1440px, plus a print-preview check (for example a headless browser PDF), described in the pull request.

- [ ] **Technical foundation: validation, share metadata and repo hygiene**
  - **Problem:** CI only checks that a few documents exist. Nothing validates `data/fundraisers.json` against its schema, or that `data/content.json` and `index.html` are well formed. `index.html` has no Open Graph or Twitter tags, so shared links show a bare preview. `styles.css` has hardcoded `#ffffff` values and a duplicate colour token, and an unused, byte-identical `jaaphopman_avatar.webp` sits in the repository root.
  - **Goal:** Let CI catch data and markup mistakes before merge, make shared links preview properly, and remove the small inconsistencies.
  - **Scope:** `.github/workflows/foundation-check.yml` (or a new workflow), a validation script under `scripts/`, the `<head>` of `index.html`, colour tokens in `styles.css`, and the root avatar file.
  - **Constraints:** Do not edit anything under `data/`. No `package.json` or runtime dependency for the site itself; CI tools run via `npx` with pinned versions inside the workflow only. Validation must pass on current `main`; report genuine findings in the pull request instead of editing content to satisfy a tool. Meta tags may reuse the existing Dutch title and description text verbatim and nothing else; no og:url, og:image or canonical (the domain is undecided). If you cannot modify workflow files, put the validation in a script under `scripts/` and describe the one-line workflow change needed.
  - **Acceptance:** CI validates `data/fundraisers.json` against `data/fundraisers.schema.json`, checks that `data/content.json` parses, and validates the HTML. A deliberately broken JSON file (tested locally, not committed) makes it fail. `index.html` has og:type, og:locale (nl_NL), og:title, og:description and twitter:card. The hardcoded `#ffffff` values use a token, the duplicate token is resolved with an identical visual result, and the root avatar is removed after a search confirms nothing references it.
  - **Verification:** Run the validation locally, show the failing example, and confirm the site looks identical before and after. Tick the Phase 2 items "GitHub Actions CI workflow for build and lint validation" and "Automated HTML / JSON schema validation step" only if this task fully completes them.

### Blocked

- [ ] GitHub Pages deployment from `main` (needs your decision on repository settings and domain)
- [ ] Link integrity check for external campaign sources (decide first how to handle rate limits and bot blocking on the crowdfunding platform)
- [ ] Final launch review and pre-launch verification

### Human Review

- [ ] Refine Dutch-first copy and English translation review (wording about real people and money; a human reads every change first)
- [ ] Visual design polish and brand colour harmony (subjective; decide the direction before an agent touches it)
- [ ] Screen-reader accessibility audit (needs manual testing with a real screen reader)
- [ ] Test that generated QR codes scan on real phones and decide what happens with URLs too long for Version 5-L (the QR generator in `app.js` is hand-written)
- [ ] Decide the favicon: personal avatar or a neutral mark (the site presents itself as independent)
- [ ] The mobile page is about 13,600px long: decide on a back-to-top link and/or collapsible timeline and sources (adds interface text in nl and en)
- [x] Decide whether goal versus total should be shown as a progress bar (implemented with compact progress indicators on all fundraiser cards)
- [ ] Decide which lines of the yellow warning box carry bold emphasis (currently every line is bold, which weakens the key line)
- [ ] Decide whether a dark colour scheme is wanted

## Phase 0 — Evidence and content foundation

**Status: Completed**

- [x] Bootstrap repository and branch/PR workflow
- [x] Write project purpose and neutral editorial position
- [x] Create fundraiser register with verification states
- [x] Record the ParkNest collective fundraiser separately from personal campaigns
- [x] Record known personal campaigns for Kathinka, Jim Gijbels, and Rooie Jaap
- [x] Mark unsupported social-media claims as unverified rather than publishing them as fact
- [x] Capture the four live campaign pages and record exact title, organiser, beneficiary, purpose, goal, current amount, status, update history, and payout/fee information where disclosed
- [x] Preserve dated evidence for the current campaign values
- [x] Verify the exact relationship, if any, between the collective ParkNest fundraiser and the personal campaigns
- [x] Review ParkNest Facebook/Instagram history for documented sharing of the personal campaigns and record evidence rather than assumptions
- [x] Decide which additional fundraising actions, if any, belong in the public register

## Phase 1A — Semantic HTML & bilingual content architecture

**Status: Completed**

- [x] Define the canonical fundraiser data schema (`data/fundraisers.schema.json` and `data/fundraisers.json`)
- [x] Define the distinction between collective, personal, and other campaigns in code/data
- [x] Define source records and `verifiedAt` metadata
- [x] Create bilingual site content dictionary (`data/content.json`)
- [x] Build canonical page structure (`index.html`) with semantic landmarks, heading hierarchy, and accessibility features
- [x] Build responsive baseline presentation stylesheet (`styles.css`) keeping presentation separate from content
- [x] Implement dynamic rendering and accessible language switcher (`app.js`) with localStorage persistence and document `lang` updating
- [x] Build prominent fundraiser separation warning banner and explicit campaign-type labels (`ALGEMENE PARKNEST-INZAMELING` / `PERSOONLIJKE INZAMELING`) with point-of-donation purpose statements
- [x] Build "What is this donation for?" explanation section and fire timeline
- [x] Build sources, verification methodology, and independent-site disclosure

## Phase 1B — Content refinement & visual design baseline

**Status: In Progress**

- [ ] Refine Dutch-first copy and English translation review
- [x] Add personal first-person story ("Mijn verhaal") for Rooie Jaap with explicit provenance labeling, freelance chef context, equipment loss explanation, and connection to replacement reference list
- [x] Restructure fundraiser page flow (Hero -> Purpose -> Fundraisers -> Equipment -> Timeline -> Sources -> Thank You -> Footer) and introduce compact human context overlays
- [ ] Add visual design polish and brand color harmony
- [x] Responsive design refinement across mobile, tablet, and desktop breakpoints
- [x] Keyboard navigation and focus ring visibility testing
- [ ] Contrast ratio and screen-reader accessibility audit

## Phase 2 — Static website deployment & delivery

**Status: Planned**

- [ ] GitHub Actions CI workflow for build and lint validation
- [ ] Automated HTML / JSON schema validation step
- [ ] Link integrity check for external campaign sources
- [ ] GitHub Pages deployment configuration from `main`
- [ ] Final launch review and pre-launch verification

## Open questions & evidence limits

These remain explicitly documented to prevent unverified claims:

1. **Exact values & goals (Snapshot verified 17 Sept 2026):**
   - ParkNest collective: €30,061 online + €25,790 offline = €55,851 displayed total raised of €150,000 goal (767 online donations). Created 24 Oct 2025.
   - Kathinka: €0 raised of €2,300 goal (0 donations).
   - Jim Gijbels: €30 raised of €300 goal (2 donations). Open-ended.
   - Rooie Jaap: €100 raised of €577 goal (1 donation). Documented replacement-reference total across 7 items: €576.45.
2. **Beneficiaries & payout destination:**
   - ParkNest collective explicitly names **Stichting Buurtbelang Parknest** as legal beneficiary.
   - Personal campaigns (Kathinka, Jim Gijbels, Rooie Jaap) have undisclosed legal beneficiaries (`type: undisclosed`, `beneficiaryName: null`).
   - All four campaigns show creator profile **Dirk Zaal** on WhyDonate. Whether funds collected in sub-campaigns are paid out to Stichting Buurtbelang Parknest or directly to the named individuals is undisclosed on the platform level.
3. **Formal platform relationships:**
   - On WhyDonate, campaigns 2, 3, and 4 are created with `parent_id: 101918` under the main ParkNest campaign.
   - Do not infer money flows between campaigns.
4. **Social media promotion evidence:**
   - ParkNest's official website (22 August 2026 article) explicitly acknowledges Jim Gijbels' paintings and Kathinka's dog collars as items destroyed in the fire, but links only to the main ParkNest fundraiser. No direct promotional posts for individual sub-campaign URLs were found in the public material checked during the documented date range (20 Aug - 17 Sept 2026).
5. **Historical title/description edits:**
   - WhyDonate metadata shows `created_at` 24 October 2025 under slug `houd-parknest-open-in-de-winter`. Platform limitations prevent verifying historical campaign title modifications prior to August 2026.
6. **Additional campaigns:**
   - No other public fundraising campaigns connected to the fire were identified with sufficient source evidence as of 17 September 2026.

## Next milestone

**Phase 1B — Content refinement & visual design baseline**
