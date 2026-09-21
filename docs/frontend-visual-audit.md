# Frontend Visual Refinement Audit (Issue #49)

**Date:** 21 September 2026
**Status:** Completed Audit & Refinement Plan
**Scope:** Static Web Application (`index.html`, `styles.css`, `app.js`, `src/**/*`)
**Tested Viewports:** 320px, 375px, 480px, 768px, 1024px, 1440px, 1920px
**Languages Tested:** Dutch (NL) & English (EN)

---

## Executive Summary

This audit provides an evidence-based evaluation of the ParkNest Fundraiser Transparency website UI/UX baseline. The application is functional, accessible, and responsive across all target viewports with zero horizontal scrolling (`overflow-x`) and solid WCAG focus state implementations.

The purpose of this audit is to identify specific areas for refinement—distinguishing **Objective Defects** (bugs, visual overlaps, accessibility or DOM state errors) from **Subjective Recommendations** (typography polish, spacing density, visual emphasis)—before implementation in Issue #52.

All recommendations adhere strictly to project limits:
- **No factual data changes** (no edits to `data/` or protected markdown files).
- **No external frameworks or dependencies**.
- **Preservation of neutral editorial tone** and distinction between collective (`green`) and personal (`cool indigo/slate`) campaigns.

---

## Audit Methodology & Environment

1. **Automated & Visual Verification Setup**:
   - Headless Chromium browser automation via Playwright running a local static server (`http://localhost:8086`).
   - Automated screenshot capture and DOM inspection across 7 viewports: 320px (mobile XS), 375px (mobile S), 480px (mobile L), 768px (tablet), 1024px (desktop S), 1440px (desktop standard), and 1920px (desktop wide).
   - Dynamic language switching verification across Dutch (NL) and English (EN).
2. **Feature & Edge Case Scenarios Verified**:
   - Keyboard navigation (`Tab` flow and `:focus-visible` outline rendering).
   - Motion preferences (`prefers-reduced-motion: reduce`).
   - Modal interactions (`#context-modal`, `#qr-modal`, focus trap, gallery item rendering).
   - Fixed element collisions (bottom share widget `#site-share-btn` vs footer / body content).
   - Media loading and broken image asset fallback handling.
   - Print stylesheet rendering (`@media print`).

---

## Detailed Audit Findings by Category

### 1. Visual Hierarchy & Typography

* **Objective Defects**:
  * *None identified.* Headings (`h1`-`h3`) maintain semantic order and proper DOM hierarchy.

* **Subjective Recommendations**:
  * **Finding 1.1 (Card Identity Typography Parity):** Fundraiser identity names use Georgia serif (`font-family: Georgia, serif`), but modal titles and sub-headings use standard system sans-serif (`var(--font-sans)`).
    * **Affected Files:** `styles.css`
    * **Priority:** Low
    * **Proposed Change:** Standardize card headers and modal campaign identity titles to use Georgia serif when rendering personal/organization identity titles for visual consistency across card and modal surfaces.
    * **Acceptance Criteria:** Identity names in cards and detail modals share consistent serif typography without affecting UI control buttons.
  * **Finding 1.2 (Section Subtitle Hierarchy):** On large screens (1440px+), section titles (`.section-title`) and subsection headings (`.section-subtitle`) have narrow visual separation in font size (28.8px vs 18px).
    * **Affected Files:** `styles.css`
    * **Priority:** Low
    * **Proposed Change:** Utilize existing `--font-size-2xl` token for `.section-title` on desktop viewports to increase contrast with subsection titles.
    * **Acceptance Criteria:** Clear visual step between section H2 and subsection H3 headings at desktop resolutions.

---

### 2. Layout Density & Spacing Rhythm

* **Objective Defects**:
  * *None identified.* Main container padding scales smoothly (`16px` on mobile, `24px` on tablet/desktop).

* **Subjective Recommendations**:
  * **Finding 2.1 (Compact Viewport Card Action Stacking):** At 320px–375px widths, primary card actions (`Details` and `Donate` buttons) wrap vertically due to text length in EN ("Details & Story" / "Donate on WhyDonate").
    * **Affected Files:** `styles.css`, `src/features/fundraisers/card.js`
    * **Priority:** Medium
    * **Proposed Change:** Ensure primary action container uses flex layout with `flex: 1 1 0` and max-content padding at `<480px` viewports so action buttons remain side-by-side or stack with consistent 8px vertical gap without text clipping.
    * **Acceptance Criteria:** Buttons in fundraiser cards remain legible with no text overflow or tight button collision at 320px width in both NL and EN.
  * **Finding 2.2 (Donor Wall Height Buffer):** The donor wall heart animation stage (`.thank-you-stage`) has a fixed minimum height (`min-height: clamp(320px, 50vh, 440px)`), which causes slightly elevated whitespace on tablet landscape mode.
    * **Affected Files:** `styles.css`
    * **Priority:** Low
    * **Proposed Change:** Adjust `.thank-you-stage` min-height to `clamp(280px, 40vh, 400px)` for compact screens.
    * **Acceptance Criteria:** Reduced empty vertical space around donor credits on low-height viewports.

---

### 3. Warning Banner Prominence & Distinction

* **Objective Defects**:
  * *None identified.* Warning banner uses amber background (`#fffbe1`), strong amber border (`#d97706`), warning icon, and explicit text explanation meeting WCAG contrast.

* **Subjective Recommendations**:
  * **Finding 3.1 (Warning List Visual Structure):** On mobile viewports (320px–375px), the warning bullet list (`.warning-list`) relies on standard disc list-style with `20px` left padding, which reduces text scanning area.
    * **Affected Files:** `styles.css`
    * **Priority:** Low
    * **Proposed Change:** Use custom check/warning bullet markers or inline subtle border-left accents for warning list items to maximize text width on small screens.
    * **Acceptance Criteria:** Increased readable text line length in warning list on mobile screens without sacrificing bullet separation.

---

### 4. Share UI & Fixed Widget Placement/Collisions

* **Objective Defects**:
  * **Finding 4.1 (Fixed Widget Mobile Footer Collision):** The fixed bottom-left share widget (`.site-share-widget`) remains fixed at `bottom: 16px, left: 16px`. On mobile screens (320px–375px), when scrolling to the very bottom of the page, the share button covers part of the footer copyright / verification meta text.
    * **Affected Files:** `styles.css`, `index.html`
    * **Priority:** High
    * **Proposed Change:** Add a media query or margin-bottom adjustment to the footer/main content or raise the z-index/positioning of footer text so fixed controls do not obscure essential disclaimer text. Alternatively, adjust bottom offset or dock the share button inline inside the footer on small viewports when scrolled to bottom.
    * **Acceptance Criteria:** All footer text and disclaimers remain fully readable and unobstructed at all scroll positions on 320px–375px viewports.
  * **Finding 4.2 (Share Panel Focus Trap / Escape Key Handling):** When opening the fixed share panel (`#site-share-panel`), focus moves to the panel, but pressing `Escape` does not close the share panel (unlike modals).
    * **Affected Files:** `src/ui/site-share.js`
    * **Priority:** Medium
    * **Proposed Change:** Add an `KeyDown` listener for the `Escape` key to close the site share panel and restore focus to `#site-share-btn`.
    * **Acceptance Criteria:** Pressing `Escape` anywhere while the site share panel is open closes it and restores focus to the share toggle button.

---

### 5. Image Galleries & Media Edge States

* **Objective Defects**:
  * **Finding 5.1 (Gallery Thumbnail Alt Text Fallback & Aspect Ratio):** In campaign detail modals with multi-image galleries (e.g. Manon T-shirts), gallery thumbnails utilize `aspect-ratio: 4 / 3` with `object-fit: cover`. If an image fails to load or experiences network latency, no visible text placeholder indicates image loading state.
    * **Affected Files:** `styles.css`, `src/ui/context-modal.js`
    * **Priority:** Medium
    * **Proposed Change:** Add CSS fallback background pattern/icon and alt attribute propagation for broken images in `.context-modal-gallery-thumb`.
    * **Acceptance Criteria:** Missing or slow-loading gallery images show a graceful neutral background container with visible alt text.

* **Subjective Recommendations**:
  * **Finding 5.2 (Hero Image Load Priority):** The hero image (`public/assets/page-hero.webp`) includes `loading="eager"` and `fetchpriority="high"`, which is optimal. However, explicit CSS aspect ratio (`1360 / 512`) should be strictly enforced on `.hero-image` to prevent any layout shift during dynamic font rendering.
    * **Affected Files:** `styles.css`
    * **Priority:** Low
    * **Proposed Change:** Ensure `.hero-image` CSS includes `aspect-ratio: 1360 / 512; width: 100%; height: auto;`.
    * **Acceptance Criteria:** Zero Cumulative Layout Shift (CLS) during hero image loading.

---

### 6. Long-Page Navigation & Scroll Ergonomics

* **Objective Defects**:
  * *None identified.* Anchors (`#hero`, `#fundraisers`, `#purpose`, `#sources`, `#footer-disclosure`) all function correctly.

* **Subjective Recommendations**:
  * **Finding 6.1 (Back-to-Top Ergonomics):** The page height is approximately 3500px–4500px on mobile viewports. Scrolling back to top requires significant manual swiping.
    * **Affected Files:** `index.html`, `styles.css`, `app.js`
    * **Priority:** Medium
    * **Proposed Change:** Consider introducing a lightweight "Back to top" link near the footer or integrated with the floating control area to improve scroll ergonomics for long mobile sessions.
    * **Acceptance Criteria:** Visitors can return to top/navigation in a single tap on long mobile views.

---

### 7. Motion, Animation & Reduced-Motion Ergonomics

* **Objective Defects**:
  * *None identified.* `@media (prefers-reduced-motion: reduce)` correctly disables all continuous heartbeat and donor wall CSS keyframe animations.

* **Subjective Recommendations**:
  * **Finding 7.1 (Hamburger Menu Transition):** The mobile hamburger navigation toggle opens abruptly without a height/opacity fade transition.
    * **Affected Files:** `styles.css`
    * **Priority:** Low
    * **Proposed Change:** Add a subtle `max-height` or `opacity` CSS transition for `.main-nav` when `prefers-reduced-motion` is false.
    * **Acceptance Criteria:** Smooth expand/collapse animation for mobile menu while preserving instant display when reduced motion is preferred.

---

### 8. Performance, Media Loading & Asset Strategy

* **Objective Defects**:
  * *None identified.* All assets are served locally from `public/assets/`. Total repository JS/CSS payload is under 150 KB gzip, zero external network dependencies.

* **Subjective Recommendations**:
  * **Finding 8.1 (Avatar Asset Decoding):** Fundraiser avatars (`.card-avatar-img`) load synchronously.
    * **Affected Files:** `src/features/fundraisers/card.js`
    * **Priority:** Low
    * **Proposed Change:** Add `decoding="async"` to `.card-avatar-img` elements in card templates.
    * **Acceptance Criteria:** Image decoding offloaded from main thread without visible pop-in.

---

### 9. Edge States, Print Styles & Error Resilience

* **Objective Defects**:
  * **Finding 9.1 (Print Stylesheet Link Formatting):** In `@media print`, all links render `href` text in parentheses (`a[href^="http"]::after { content: " (" attr(href) ")"; }`). For long WhyDonate URLs, this causes text overflow on standard printed pages.
    * **Affected Files:** `styles.css`
    * **Priority:** Medium
    * **Proposed Change:** Add `word-break: break-all;` to `a[href^="http"]::after` in `@media print` rules.
    * **Acceptance Criteria:** Print layout does not clip or overflow long URLs across page margins when printed or saved to PDF.

---

## Action Plan Mapping for Issue #52 Implementation

| Finding ID | Category | Affected File(s) | Priority | Recommended Change |
| :--- | :--- | :--- | :--- | :--- |
| **4.1** | Share UI / Layout | `styles.css`, `index.html` | **High** | Adjust footer padding / share widget position to prevent overlapping footer disclaimers on mobile. |
| **4.2** | Share UI / A11y | `src/ui/site-share.js` | **Medium** | Implement `Escape` key handler to close site share panel and restore button focus. |
| **2.1** | Layout Density | `styles.css` | **Medium** | Ensure primary card action buttons stack or wrap cleanly without text clipping at 320px. |
| **5.1** | Media Edge States | `styles.css`, `src/ui/context-modal.js` | **Medium** | Add graceful broken image fallbacks and alt visibility in gallery thumbnails. |
| **9.1** | Print Stylesheet | `styles.css` | **Medium** | Add `word-break: break-all` for printed link URLs to prevent print page margin overflow. |
| **6.1** | Navigation | `index.html`, `styles.css` | **Medium** | Add accessible "Back to top" navigation link in footer section. |
| **1.1** | Typography | `styles.css` | **Low** | Align card and modal identity titles with Georgia serif typography token. |
| **1.2** | Typography | `styles.css` | **Low** | Adjust desktop section title sizing (`--font-size-2xl`) for clearer visual hierarchy. |
| **7.1** | Motion | `styles.css` | **Low** | Add subtle accordion transition for mobile nav menu when reduced motion is off. |
| **8.1** | Performance | `src/features/fundraisers/card.js` | **Low** | Add `decoding="async"` to avatar images. |

---

## Verification Summary

- **Viewports Inspected:** 320px, 375px, 480px, 768px, 1024px, 1440px, 1920px.
- **Languages Inspected:** Dutch (NL) and English (EN).
- **Automated Test Results:** All 27 existing unit/integration tests (`scripts/qr-share.test.mjs`, `scripts/jules-orchestrator.test.mjs`) pass.
- **Content Guard:** Passed (no protected content or large binary assets modified).
