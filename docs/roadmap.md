# Roadmap

## Now

> Dispatch queue for the Jules orchestrator (`scripts/jules-orchestrator.mjs`). Only `### Ready` is auto-dispatched, one task at a time. Move tasks between sections by hand. Ticking `[x]` under `### Active` — after you have reviewed and verified the merged PR — is what advances the queue. The phase sections below are the long-term plan, not the dispatch source. Each task must stay on ONE line.

### Active
- [ ] Keyboard navigation and focus visibility: make every interactive element in `index.html`, `styles.css` and `app.js` (menu, language switcher, share buttons, links) reachable by keyboard with a clearly visible focus ring; fix what is found; presentation and behaviour only, no content changes

### Ready

- [ ] Contrast audit and fixes: check every text/background pair in `styles.css` against WCAG 2.1 AA, adjust colours only where they fail and keep the campaign-type labels and separation banner clearly distinguishable; no content changes
- [ ] Responsive refinement: review `index.html` and `styles.css` at mobile, tablet and desktop widths, fix overflow, spacing and readability problems; presentation only, no content changes
- [ ] Add automated data validation to `.github/workflows/foundation-check.yml`: validate `data/fundraisers.json` against `data/fundraisers.schema.json` and check that `data/content.json` is valid JSON; no new runtime dependencies for the site itself

### Blocked

- [ ] GitHub Pages deployment from `main` (needs your decision on repository settings and domain)
- [ ] Link integrity check for external campaign sources (decide first how to handle rate limits and bot blocking on the crowdfunding platform)
- [ ] Final launch review and pre-launch verification

### Human Review

- [ ] Refine Dutch-first copy and English translation review (wording about real people and money; a human reads every change first)
- [ ] Visual design polish and brand colour harmony (subjective; decide the direction before an agent touches it)
- [ ] Screen-reader accessibility audit (needs manual testing with a real screen reader)

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
- [ ] Add visual design polish and brand color harmony
- [ ] Responsive design refinement across mobile, tablet, and desktop breakpoints
- [ ] Keyboard navigation and focus ring visibility testing
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
