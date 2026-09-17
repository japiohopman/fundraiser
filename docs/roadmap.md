# Roadmap

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

## Phase 1 — Content model and information architecture

**Status: Planned**

- [x] Define the canonical fundraiser data schema (`data/fundraisers.schema.json` and `data/fundraisers.json`)
- [x] Define the distinction between collective, personal, and other campaigns in code/data
- [x] Define source records and `verifiedAt` metadata
- [ ] Draft final Dutch copy for the home page
- [ ] Draft the "what happened" timeline
- [ ] Draft campaign-card copy from verified source data only
- [ ] Add independent-site disclosure and source methodology page

## Phase 2 — Static website

**Status: Planned**

- [ ] Build responsive static website
- [ ] Implement campaign overview as the primary interaction
- [ ] Implement clear distinction between collective ParkNest support and personal recovery campaigns
- [ ] Add direct source/donation links
- [ ] Add verification date to dynamic campaign information
- [ ] Add accessibility baseline: semantic HTML, keyboard navigation, contrast, reduced-motion support, descriptive link text
- [ ] Add mobile-first layout and fast-loading imagery

## Phase 3 — Quality and delivery workflow

**Status: Planned**

- [ ] GitHub Actions CI on pull requests and pushes
- [ ] Build/type/lint/test checks
- [ ] Validate required source/content files
- [ ] Check external source links where technically reliable
- [ ] GitHub Pages deployment from `main`
- [ ] Protect `main` through PR-based changes once the repository has enough workflow configuration

## Phase 4 — Launch review

**Status: Planned**

- [ ] Editorial fact check of every public statement
- [ ] Verify every fundraiser link immediately before launch
- [ ] Verify amounts/status immediately before launch
- [ ] Test mobile, desktop, accessibility, and link navigation
- [ ] Confirm independent-site disclaimer is visible
- [ ] Publish

## Phase 5 — Maintenance

**Status: Planned**

- [ ] Re-check campaign values on a defined cadence while campaigns remain active
- [ ] Mark closed/ended campaigns clearly rather than removing historical records without explanation
- [ ] Record material changes in campaign purpose or beneficiary
- [ ] Keep source register and website data synchronized

## Open questions & evidence limits

These remain explicitly documented to prevent unverified claims:

1. **Exact values & goals (Verified 17 Sept 2026):**
   - ParkNest collective: €30,061 online + €25,790 offline = €55,851 displayed total raised of €150,000 goal (767 online donations). Created 24 Oct 2025 (originally for winter support; repurposed after August 2026 fire).
   - Kathinka: €0 raised of €2,300 goal (0 donations).
   - Jim Gijbels: €30 raised of €300 goal (2 donations). Open-ended.
   - Rooie Jaap: €100 raised of €577 goal (1 donation).
2. **Beneficiaries & payout destination:**
   - ParkNest collective explicitly names **Stichting Buurtbelang Parknest** (and direct bank IBAN `NL96 INGB 0114 0203 37`).
   - Personal campaigns (Kathinka, Jim Gijbels, Rooie Jaap) have undisclosed legal beneficiaries (`type: undisclosed`, `beneficiaryName: null`).
   - All four campaigns show creator profile **Dirk Zaal** on WhyDonate. Whether funds collected in sub-campaigns are paid out to Stichting Buurtbelang Parknest or directly to the named individuals is undisclosed on the platform level.
3. **Formal platform relationships:**
   - On WhyDonate, campaigns 2, 3, and 4 are created with `parent_id: 101918` under the main ParkNest campaign.
   - Do not infer money flows between campaigns.
4. **Social media promotion evidence:**
   - ParkNest's official website (22 August 2026 article) explicitly acknowledges Jim Gijbels' paintings and Kathinka's dog collars as items destroyed in the fire, but links only to the main ParkNest fundraiser. No direct promotional posts for individual sub-campaign URLs were found in the public material checked during the documented date range (20 Aug - 17 Sept 2026).
5. **Additional campaigns:**
   - No other public fundraising campaigns connected to the fire were identified with sufficient source evidence as of 17 September 2026.
6. **Project hosting of new fundraiser:**
   - The project remains an independent information site linking visitors directly to verified external campaigns.

## Next milestone

**Phase 1 — Canonical data model & information architecture**
