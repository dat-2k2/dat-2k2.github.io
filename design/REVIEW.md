# Design review log

Each round is run by a fresh, independent reviewer subagent that only sees the exported frame PNGs
(`design/*.png`), the Figma link and `design/REFERENCES.md`. Rubric: visual hierarchy, typography &
spacing rhythm, WCAG AA contrast, mobile layout at 390, 10-second content clarity for a client,
consistency, polish vs the Mobbin references. PASS requires zero BLOCKING findings.

Figma file: https://www.figma.com/design/Kq03FAdHeFmKwMrmS74gM9

## Round 1 — FAIL

Scores: hierarchy 4 · typography 4 · contrast 4 · mobile 3 · clarity 4 · consistency 5 · polish 4.

Contrast: every text/background pair passes AA in both modes (lowest: accent on surface-2, 4.59:1 light).
Outline-button and hairline borders were 1.24:1 / 1.32:1 against the background.

| # | Severity | Finding | Fix applied |
|---|----------|---------|-------------|
| 1 | BLOCKING | Mobile footer: the languages + "Back to top" mono line clipped at the frame edge; "Back to top" lost. | Footer meta is now a wrapping row of two items (languages, Back to top) on both frames. |
| 2 | NIT | Outline buttons (GitHub/LinkedIn) and theme toggle borders at ~1.3:1. | New `color/border-strong` token (#8F8882 light / #6B6560 dark, ≥3:1 on bg) bound to Button/Secondary and the toggle. |
| 3 | NIT | NewHub (the client-relevant project) read weaker than the thesis card: one metric, empty panel. | Added a second metric (2× mobile delivery speed from the Expo + Lark CI/CD pipeline — from the CV). |
| 4 | NIT | Olympiad prize repeated three times (hero fact, education, award card); scholarship twice. | Hero slot 4 is now "Scale — ~21k DAU product maintained at Base.vn"; prize kept in Education + award card. |
| 5 | NIT | "Coursework" orphaned in Skills (education content, left an empty column). | Removed from Skills; added as a coursework line under the Bachelor entry. Skills is now 6 groups in a 2-column grid. |
| 6 | NIT | Chip naming inconsistent ("QStash" vs "Upstash QStash"; "GCP · Vertex AI" bundled). | Unified to "Upstash QStash"; split into "GCP" and "Vertex AI". |
| 7 | NIT | Desktop nav omitted Education. | Added. |
| 8 | NIT | Dot grid under the 12px mono meta line reduced legibility slightly. | Dot alpha 0.35 → 0.28; the fade overlay stays. |
| 9 | NIT | Mobile meta line wrapped with a trailing "·" and orphaned "Remote-friendly". | Set as two lines on mobile; in code the items are separate spans with CSS separators. |
| 10 | NIT | Mobile: "LinkedIn ↗" orphans to a second row; no mobile anchor menu. | Accepted for a one-pager: CTAs wrap naturally in code; footer "Back to top" retained. |

## Round 2 — PASS

Fresh reviewer. All ten round-1 fixes verified in the exports; no clipping or overflow on any frame.

Scores: hierarchy 4 · typography 4 · contrast 5 · mobile 4 · clarity 4 · consistency 4 · polish 4.

Contrast: all text pairs ≥ 4.5:1 in both modes (lowest 4.59:1, accent on surface-2 light);
outline-button boundary 3.34:1 light / 3.44:1 dark with the new `border-strong` token.

No BLOCKING findings. Nits raised and what was done with them (applied after the PASS, in Figma and code):

| # | Finding | Done |
|---|---------|------|
| 1 | Role title in the hero meta line sits in 12px mono subtle. | Role rendered in `text` color (both). |
| 2 | Hero orders GitHub → LinkedIn, Contact the reverse. | Contact reordered to GitHub → LinkedIn. |
| 3 | NewHub side panel has no visual, unlike the thesis card. | Added a small "prompt → post" glyph in the same style as the thesis grid. Plus a "Live at newhub.vn ↗" link (supplied by Dat). |
| 4 | Repo stack line wraps with a trailing "·" on mobile. | Items are separate spans with CSS separators. |
| 5 | "BA/PM" breaks at the slash on mobile. | `white-space: nowrap`. |
| 6 | Mobile email too small to read as the CTA. | 26px at 390 (fits one line), scaling to 52px. |
| 7 | "Nguyen Quoc / Dat" widow on mobile. | Accepted — `text-wrap: balance` is set; 52px keeps the display scale. |
| 8 | Card edges rely on a 1.24:1 hairline. | Cards use a slightly stronger `border-card` (#D6D3D0 / #3A3532). |
| 9 | No persistent hire CTA once you scroll past the hero. | Compact "Hire me" button added to the sticky nav. |

Also added after the PASS, from Dat's proof links: Base Wework and Base Office are linked from the Base.vn role.
The `design/*.png` exports are the frames after these changes.

## Post-review additions — product imagery

Dat asked for images of the work. Raw landing-page captures were rejected (they bring other brands' palettes,
nav bars and headlines into the page). Instead, the product UI was cropped out of the public pages and set on
uniform 16:10 tiles (`assets/work/*.webp`, 20–90 KB each, lazy-loaded): NewHub's app mock on its project card,
Base Office / Base Wework UI as a two-up under the Base.vn role, and the Shor-code circuit from `quantum-labs`
as a thumbnail on its repo row. Crawl script and originals are not committed.

## /projects/ page — added later

A second page, designed in Figma on the same tokens (frames "Projects — Desktop 1440 / Mobile 390",
exports `design/projects-*.png`). Scope was narrowed by Dat to the three demos built today —
Quantum Labs, Shader Testbed, FuncProg — so the filter chips, code-only cards and coursework list in the
first draft were removed. The home page's repo rows now show the same three live demos.
