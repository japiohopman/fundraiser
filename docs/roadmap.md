# Roadmap

## Now

> Dispatch order for the Jules orchestrator (`scripts/jules-orchestrator.mjs`): first unchecked tasks under `### Ready` are dispatched one at a time. When `### Ready` is exhausted, the orchestrator automatically continues with the first unchecked top-level task in `## Phase 3 — Production Readiness & Launch`. Jules ticks only the task it actually completed in the same pull request; you review and merge, and the merge automatically advances the loop. `### Blocked` and `### Human Review` are never dispatched. The roadmap remains the single canonical execution plan; GitHub Issues are intake for follow-up work, not a second queue.

### Ready

- [x] **Production validation and regression gate** (Issue #81)

  - **Problem:** The repository has several automated checks already, but the production-readiness gate needs one explicit, reliable path covering the checks that can be verified automatically.
  - **Goal:** Formalize automated validation before deployment work begins.
  - **Scope:** Existing test suite, static-site serve/build sanity where applicable, HTML validation where practical, JSON/schema validation, Content Guard, existing accessibility automation, and technically appropriate local/static link checks.
  - **Constraints:** Preserve the static architecture. Do not change fundraiser facts/data. Do not weaken checks. Do not treat external rate-limit or anti-bot responses as proof that a source is broken. Automated checks are not proof of visual or screen-reader correctness.
  - **Acceptance:** One clear CI validation path exists; HTML and JSON/schema validation are covered where appropriate; existing Content Guard/accessibility checks remain active; failures distinguish code/schema failures from external-access limitations; no unrelated UI/content work.
  - **Verification:** Run the full automated suite and report automated checks separately from any manual/browser verification.

- [x] **Share UI: use shared QR overlay for campaign and site sharing** (Issue #89)
  - **Problem:** The personal fundraiser share control still expands an in-card action area before reaching the shared QR overlay, while the fixed site-wide share control uses a separate panel and does not expose the same native share action.
  - **Goal:** Provide one consistent QR/share overlay for campaign and site sharing.
  - **Scope:** Reuse the existing shared QR modal/overlay, campaign and site share entry points, action-button placement, thank-you message, native Web Share availability, and NL/EN/accessibility/mobile verification.
  - **Constraints:** Do not create a second modal implementation. Preserve the campaign-specific URL and canonical site URL. Do not change fundraiser facts or unrelated content.
  - **Acceptance:** Campaign Share opens the shared QR overlay directly; site Share opens the same overlay with the canonical site URL; both show the thank-you message above QR and actions below QR; native share appears when supported; keyboard focus, Escape, NL/EN and mobile remain correct.
  - **Verification:** Test campaign and site sharing at mobile and desktop widths, including QR destination correctness, copy link, native share availability, focus, Escape, and language switching. Run the full automated test suite.


- [x] **Frontend Visual Refinement Audit** (Issue #49)
  - **Problem:** The current frontend is functional and responsive, but the remaining visual issues need a disciplined audit before implementation: hierarchy, density, warning prominence, share UI, galleries, long-page navigation, motion, performance and edge states.
  - **Goal:** Produce an evidence-based frontend refinement plan without prematurely rewriting the visual system.
  - **Scope:** Current frontend implementation across NL/EN and approximately 320, 375, 480, 768, 1024, 1440 and 1920px.
  - **Constraints:** Audit first; do not perform a broad visual rewrite. Preserve the independent/editorial character. Separate objective defects from subjective recommendations. Do not introduce a new UI framework.
  - **Acceptance:** Audit findings identify affected components/files, priority, recommended change and acceptance criteria. Existing design tokens/components are considered before proposing new ones.
  - **Verification:** Browser/visual checks at the defined viewport set, including mobile, reduced motion, keyboard interaction, share/navigation collisions, image behavior, print and broken-state experience. Document exactly what was checked.

- [x] **Brand Identity, Favicon & Metadata** (Issue #50)
  - **Problem:** The site still needs a coherent neutral browser identity and complete sharing metadata.
  - **Goal:** Add a neutral independent-site mark and robust browser/social metadata without making the site look like a personal project.
  - **Scope:** Favicon/SVG mark, relevant browser metadata, theme color, Open Graph/Twitter metadata, and language-aware title/description where supported.
  - **Constraints:** Do not use Jaap's avatar as the favicon. Do not rewrite fundraiser content. Avoid unnecessary manifest/branding complexity.
  - **Acceptance:** NL/EN rendered HTML has valid metadata and all referenced assets resolve. The favicon represents the independent site rather than a person.
  - **Verification:** Inspect rendered HTML in both languages and verify asset paths and share metadata.

- [x] **Warning Block: Content & Visual Hierarchy** (Issue #51)
  - **Problem:** The warning must make the distinction between the general ParkNest fundraiser and separate personal fundraisers immediately understandable.
  - **Goal:** Create clear, factual NL/EN warning copy and a strong but restrained visual hierarchy.
  - **Scope:** Existing prominent warning content and its presentation.
  - **Constraints:** Use an exclamation-mark heading such as "Let op!" / an equivalent English warning. Use Kathinka van Velzen as the concrete example where needed. Do not mention Jaap in the warning. Do not add unsupported campaign claims.
  - **Acceptance:** Visitors can understand that ParkNest's general fundraiser and personal fundraisers have different purposes, and that donating to a personal fundraiser is not automatically donating to ParkNest.
  - **Verification:** Check NL/EN at mobile and desktop widths and confirm the warning does not rely on color alone.

- [x] **Frontend Refinement Implementation** (Issue #52)
  - **Problem:** The audit findings need to be translated into focused frontend improvements rather than an uncontrolled redesign.
  - **Goal:** Implement the prioritized visual/interaction refinements from Issue #49 while preserving architecture and editorial identity.
  - **Scope:** Only the components and styles identified by the audit, plus the finalized warning presentation from Issue #51.
  - **Constraints:** Presentation/interaction focused. Preserve existing components/tokens, responsive behavior and accessibility states. No duplicate state, new UI framework, or unrelated content changes.
  - **Acceptance:** Prioritized audit findings are addressed, NL/EN remain coherent, mobile and desktop layouts remain stable, and the site's visual hierarchy is clearer without adding decorative card density.
  - **Verification:** Run the existing test suite and browser/visual checks, including the audit viewport set, keyboard focus, reduced motion, modal/gallery behavior and language switching.

- [x] **Accessibility Refinement** (Issue #53)
  - **Problem:** Final accessibility verification should happen after the visual refinement work, not be assumed from automated checks alone.
  - **Goal:** Perform the final accessibility pass and document any remaining manual verification.
  - **Scope:** Landmarks, heading hierarchy, keyboard/focus, dialogs/galleries, screen-reader semantics, language switching, contrast, touch targets, reduced motion and error/control states.
  - **Constraints:** Do not redesign the visual system. Preserve NL/EN parity and existing architecture.
  - **Acceptance:** Identified accessibility defects are fixed or explicitly recorded as manual follow-up items; no automated check is presented as proof of real screen-reader verification.
  - **Verification:** Run supported automated accessibility checks plus targeted manual keyboard/screen-reader verification where feasible.

- [x] **Campaign statistics: donation distribution donut chart** (Issue #65)
  - **Problem:** The campaign statistics area shows aggregate figures, but does not yet provide a clear visual representation of how the registered donation total is distributed across the fundraiser campaigns.
  - **Goal:** Add a responsive, accessible donut chart showing how 100% of the registered donation amount is distributed across the fundraiser campaigns.
  - **Scope:** One segment per fundraiser; calculate percentages from the existing `data/fundraisers.json` financial totals; show campaign name, amount and percentage in an accessible textual legend/equivalent; show the overall registered donation total in the donut center; keep `onlineDonationCount` as a separate numeric statistic.
  - **Constraints:** Existing fundraiser data remains the single source of truth. Do not manually store percentages or modify factual campaign/source/financial data. Prefer native SVG/CSS and introduce no charting dependency unless clearly required by the existing architecture. Preserve static-site/GitHub Pages compatibility, NL/EN localization, responsive behavior and understanding without color alone. No unrelated redesign.
  - **Acceptance:** Segment percentages are calculated from underlying data; percentages sum to 100% within the expected rounding tolerance; displayed total matches the underlying campaign totals; `onlineDonationCount` remains distinct from unique donor count; existing statistics continue to work; new tests cover the calculation/rendering contract; no new runtime dependency; no horizontal overflow or clipped chart/legend content on mobile.
  - **Verification:** Check approximately 320px, 375px, 768px, 1024px and 1440px widths in NL and EN; perform keyboard/accessibility checks; report automated and visual verification separately.


- [x] **Share experience: direct QR + copy link with clear destination context** (Issue #69)
  - **Problem:** The fixed site-wide share control currently adds an extra interaction layer with native share, WhatsApp, email, copy link and a separate QR modal. The QR destination also needs clearer distinction between sharing this transparency site and sharing a specific fundraiser donation page.
  - **Goal:** Make sharing immediate and understandable: fixed Share opens directly to site QR + Copy Link, while campaign QR views clearly identify the donation-page destination.
  - **Scope:** Fixed site-share markup/logic, shared QR presentation/labels, and campaign-share destination semantics.
  - **Constraints:** Do not change canonical donation URLs or fundraiser facts. Preserve keyboard focus, Escape, reduced motion and mobile footer protection. Keep the static-site/no-runtime-dependency architecture. Content changes require the content-approved workflow.
  - **Acceptance:** Site Share opens directly to a clearly labelled site QR with Copy Link below it; WhatsApp/email are removed from the fixed site-share panel; campaign QR clearly identifies the specific fundraiser/donation page; site and campaign QR destinations are correct; NL/EN parity and accessibility are preserved.
  - **Verification:** Test 320, 375, 768, 1024 and 1440px in NL/EN, including QR generation, copy, focus, Escape, mobile collision checks and Jim donation QR destination. Run the full existing test suite.
  - **Content approval:** Required — apply `content-approved` to the implementation PR for intentional data/content.json changes.

- [x] **Fundraiser cards: replace dashboard/shop aesthetic with calm editorial visual language** (Issue #70)
  - **Problem:** The current combination of borders, badges, shadows, avatars, colored surfaces and strong actions gives the fundraiser cards a transactional/webshop/dashboard character.
  - **Goal:** Rework card presentation into a calm, professional editorial information surface while retaining clear campaign identity and collective/personal distinction.
  - **Scope:** Card presentation, surfaces, typography, spacing, shadows, borders, progress/statistic treatment and action presentation.
  - **Constraints:** Preserve all facts, anchors, internal links, progress bars, avatars, context/share actions, NL/EN and accessibility. Prefer existing tokens. Subtle gradients may be evaluated but must remain restrained and purposeful. Do not redesign into product/pricing tiles or add decorative density.
  - **Acceptance:** The fundraiser area reads as a documented set of campaigns rather than a shop; six cards share one coherent visual language; collective/personal remains understandable without relying on color alone; actions remain clear without dominating like ecommerce CTAs.
  - **Verification:** Inspect 320, 375, 480, 768, 1024, 1440 and 1920px in NL/EN plus focus, reduced-motion and print checks.

- [x] **Context modal: redesign desktop layout for editorial reading and media** (Issue #71)
  - **Problem:** The context modal is primarily a narrow single-column surface even when desktop width and media-rich content would benefit from a more deliberate editorial composition.
  - **Goal:** Use desktop space more effectively for text, provenance and media while keeping mobile simple and readable.
  - **Scope:** Responsive context-modal layout and presentation only; no route/page rewrite.
  - **Constraints:** Preserve focus trap, Escape, focus restoration, internal campaign links, galleries, image fallbacks, source links, NL/EN and reduced motion. Do not change factual content.
  - **Acceptance:** Image-heavy contexts can use a balanced text/media composition; long text remains readable; text-only contexts remain comfortable; the modal feels focused rather than dashboard-like; mobile remains single-column and uncluttered.
  - **Verification:** Test 375, 768, 1024, 1440 and 1920px in NL/EN with Jaap, Jim, Manon and ParkNest contexts, including keyboard, galleries and internal navigation.

- [x] **Thank-you section: place gratitude message inside heart and introduce editorial display typography** (Issue #72)
  - **Problem:** The current heart is a prominent animated graphic behind donor credits rather than the visual carrier of the gratitude message itself, and its treatment can feel more promotional than editorial.
  - **Goal:** Make the heart a deliberate closing gesture by placing a concise gratitude message inside it and using refined display typography.
  - **Scope:** Heart composition, message placement, typography and related donor-wall presentation.
  - **Constraints:** Preserve donor data and reduced-motion behavior. Prefer a Google Fonts family but self-host the required font assets locally rather than introducing a runtime CDN dependency. Keep the new display font isolated to the gratitude treatment unless a broader change is justified. Content changes require the content-approved workflow.
  - **Acceptance:** The heart contains the gratitude message; NL/EN are balanced; text is legible at mobile and desktop sizes; the treatment feels warm/editorial rather than commercial; reduced-motion remains calm and static.
  - **Verification:** Test 320, 375, 768, 1024, 1440 and 1920px in NL/EN, including donor wall visibility, print and font-loading behavior.
  - **Content approval:** Required — apply `content-approved` to the implementation PR for intentional data/content.json changes.
  - **Follow-up review adjustments:** Continue from the merged Issue #72 implementation. On desktop, place donor names to the left and right of the heart rather than in a separate block below it. On mobile, distribute donor names into upper and lower zones around/within the heart silhouette while keeping the gratitude message clear and unobstructed. Replace the current donor-name pill treatment with a more refined editorial type treatment using the existing self-hosted Cormorant Garamond; remove the hard 1.5px donor-name border/background/shadow treatment. Preserve donor order/data, gesture sequence, NL/EN, accessibility, reduced motion, print behavior, and static-site/no-CDN constraints.

### Blocked

- [ ] GitHub Pages deployment from `main` (needs your decision on repository settings and domain)
- [ ] Link integrity check for external campaign sources (decide first how to handle rate limits and bot blocking on the crowdfunding platform)
- [ ] Final launch review and pre-launch verification

### Human Review

- [ ] Refine Dutch-first copy and English translation review (wording about real people and money; a human reads every change first)
- [ ] Screen-reader accessibility audit / manual verification (Issue #53 implementation must record any remaining manual checks)
- [ ] Test that generated QR codes scan on real phones and decide what happens with URLs too long for Version 5-L
- [ ] Decide whether a dark colour scheme is wanted
- [ ] Decide on back-to-top and/or collapsible timeline/sources if the frontend audit identifies this as useful

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
- [x] Add dedicated ParkNest community story card and campaign context (sections for ParkNest vóór de brand, Wat verloren ging, Wat doorgaat, Waar de crowdfunding voor bedoeld is)
- [x] Add personal first-person story ("Mijn verhaal") for Rooie Jaap with explicit provenance labeling, freelance chef context, equipment loss explanation, and connection to replacement reference list
- [x] Restructure fundraiser page flow (Hero -> Purpose -> Fundraisers -> Equipment -> Timeline -> Sources -> Thank You -> Footer) and introduce compact human context overlays
- [x] Complete visual design polish and brand color harmony (Issues #49, #50, #51 and #52)
- [x] Responsive design refinement across mobile, tablet, and desktop breakpoints
- [x] Keyboard navigation and focus ring visibility testing
- [ ] Complete contrast ratio and screen-reader accessibility audit (Issue #53)

## Phase 2 — Editorial UX & visual refinement

**Status: Planned**

- [x] Issue #69 — Share experience: direct QR + copy link with clear destination context
- [x] Issue #70 — Fundraiser cards: replace dashboard/shop aesthetic with calm editorial visual language
- [x] Issue #71 — Context modal: redesign desktop layout for editorial reading and media
- [x] Issue #72 — Thank-you section: place gratitude message inside heart and introduce editorial display typography

### Phase 2 success criteria

The site should feel like a calm, independent editorial information resource rather than a donation dashboard or webshop. Sharing should be immediate and destination-aware, fundraiser cards should communicate information rather than products, context should read well on desktop and mobile, and the final thank-you gesture should feel human and intentional.

## Phase 3 — Production Readiness & Launch

**Status: In Progress**

- [ ] Accessibility and manual QA closure
- [ ] Resilient external-link/source integrity policy and check
- [ ] GitHub Pages deployment configuration and production verification
- [ ] Final editorial/content verification
- [ ] Launch review and handoff

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
