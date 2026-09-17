# Roadmap

## Phase 0 — Evidence and content foundation

**Status: In progress**

- [x] Bootstrap repository and branch/PR workflow
- [x] Write project purpose and neutral editorial position
- [x] Create fundraiser register with verification states
- [x] Record the ParkNest collective fundraiser separately from personal campaigns
- [x] Record known personal campaigns for Kathinka, Jim Gijbels, and Rooie Jaap
- [x] Mark unsupported social-media claims as unverified rather than publishing them as fact
- [ ] Capture the four live campaign pages and record exact title, organiser, beneficiary, purpose, goal, current amount, status, update history, and payout/fee information where disclosed
- [ ] Preserve dated evidence for the current campaign values
- [ ] Verify the exact relationship, if any, between the collective ParkNest fundraiser and the personal campaigns
- [ ] Review ParkNest Facebook/Instagram history for documented sharing of the personal campaigns and record evidence rather than assumptions
- [ ] Decide which additional fundraising actions, if any, belong in the public register

## Phase 1 — Content model and information architecture

**Status: Planned**

- [ ] Define the canonical fundraiser data schema
- [ ] Define the distinction between collective, personal, and other campaigns in code/data
- [ ] Define source records and `verifiedAt` metadata
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

## Open questions

These should be resolved through source verification, not assumptions:

1. What are the exact current values and goals of each campaign?
2. Who is the named beneficiary of each campaign, and where is the money paid out?
3. Are the personal campaigns formally connected to ParkNest, or simply organised in response to losses suffered by people associated with ParkNest?
4. Which personal campaigns were publicly promoted by ParkNest itself, and through which channels?
5. Are there further campaigns that should be included?
6. Should the project eventually host a new fundraiser of its own, or should it remain an information hub linking to existing verified campaigns?

## Next milestone

**M0 — Verified fundraiser map**

Do not treat the visual site as ready for launch until the four known campaigns have a completed source record and the public copy can explain the difference between them without relying on inference.
