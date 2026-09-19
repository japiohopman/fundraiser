# Paste these into docs/roadmap.md

Replace the whole `### Ready` block and the whole `### Human Review` block under `## Now`. Leave `### Active` and `### Blocked` exactly as they are.

---

### Ready

- [ ] Compact the header on mobile (below 600px): the title, subtitle, language switcher and menu button currently take about 225px of the first screen; keep title, language switcher and menu button on one tidy row, shorten or tuck away the subtitle, keep the menu accessible; presentation only, no content changes
- [ ] Add Open Graph and Twitter card meta tags to `index.html` (og:type, og:locale nl_NL, og:title, og:description, twitter:card) reusing the existing title and description text only; no og:url, og:image or canonical yet (domain undecided); no content changes
- [ ] Typography and reading layout: use fluid `clamp()` sizes for the hero title and section titles, and narrow the main content column on wide screens (around 880px, card grids excepted) so prose does not leave a large empty area on the right; presentation only, no content changes
- [ ] Fundraiser card readability in `styles.css`: raise the small meta text (organiser, legal entity, last verified) to at least 14px, make the goal and total amounts visually stronger than their labels, and reduce the nesting of borders and backgrounds (section card, group box, campaign card) by one level while keeping the green/indigo campaign-type distinction, the type labels and the separation warning clearly visible; presentation only, no content changes
- [ ] Responsive refinement: review `index.html` and `styles.css` at 320, 375, 768 and 1440px, fix overflow, spacing and readability problems, and add a breakpoint for wide screens; presentation only, no content changes
- [ ] Add automated data validation to `.github/workflows/foundation-check.yml`: validate `data/fundraisers.json` against `data/fundraisers.schema.json` and check that `data/content.json` is valid JSON; no new runtime dependencies for the site itself
- [ ] Add a print stylesheet section to `styles.css` so the page prints readably (hide navigation, share buttons and modal; keep campaign-type labels and the separation warning visible); no content changes
- [ ] Repo hygiene: replace the hardcoded `#ffffff` values in `styles.css` with a colour token, remove the duplicate `--color-text-subtle` if it equals `--color-text-muted` (update usages), and delete the unused duplicate `jaaphopman_avatar.webp` in the repo root after confirming nothing references it

---

### Human Review

- [ ] Refine Dutch-first copy and English translation review (wording about real people and money; a human reads every change first)
- [ ] Visual design polish and brand colour harmony (subjective; decide the direction before an agent touches it)
- [ ] Screen-reader accessibility audit (needs manual testing with a real screen reader)
- [ ] Test that generated QR codes scan on real phones and decide what happens with URLs too long for Version 5-L (the QR generator in `app.js` is hand-written)
- [ ] Decide the favicon: personal avatar or a neutral mark (the site presents itself as independent)
- [ ] The mobile page is about 13,600px long: decide on a back-to-top link and/or collapsible timeline and sources (adds interface text in nl and en)
- [ ] Decide whether goal versus total should be shown as a progress bar (numbers presentation; must carry the last-verified date and stay neutral)
- [ ] Decide which lines of the yellow warning box carry bold emphasis (currently every line is bold, which weakens the key line)
- [ ] Decide whether a dark colour scheme is wanted
