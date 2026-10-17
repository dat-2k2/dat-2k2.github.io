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

## UI kit redesign — Figma "UI Kit" page + app frames

Dat asked for one kit shared by the portfolio and the three demo sites (Quantum Labs, Shader Testbed,
FuncProg), each page keeping a layout that fits its purpose. Home went to the "C+B" direction (bento hero +
console panel, orange kept). Frames: Page 1 (home desktop/mobile + dark clones, projects), "UI Kit" (tokens,
components), "App — Quantum Labs" (course + lesson, desktop + mobile), "App — Shader Testbed" (desktop,
mobile sheet open / peek / Shader tab), "App — FuncProg" (desktop + mobile). Exports in `design/`,
`design/apps/`, `design/kit-*.png`. Each round below used fresh reviewer subagents (one per area).

### Round 1 — FAIL (portfolio, Quantum, Shader, FuncProg)

Applied: duplicate `Console/benchmark` removed from the thesis card, metrics column 300 px, mobile glyph
resized, hero row-2 tiles stretched, status line "Open to new projects", time tile "Hanoi · GMT+7 /
remote-friendly", GitHub tile "3 live demos / 18 public repos", moon icon on every toggle. Quantum: footer
wraps on mobile, "Next mission →" in the mobile status bar, "Reset progress", "Badges · 0/6", 5 progress
segments, "Run again" → "Reset" (later renamed "Re-run" on Dat's call, matching the code), toggle icons. Shader: artboard 1440×1358, panel hugs content, "Hide ›",
280 px editor, Compile/Revert + status bar, peek and Shader-tab mobile frames. FuncProg: console detached
with a Copy button, snippet/tabs/footer wrap on mobile, stacked mobile header, mobile H2, source panel
stretched.

### Round 2 — FAIL (one blocker each; FuncProg PASS)

| Area | Blocking | Fix |
|------|----------|-----|
| Portfolio | Console rows lost the space between coloured spans ("vs OpenCV1.3× faster"). | Trailing spaces trimmed, rows given an 8 px gap (22 rows across pages + kit). |
| Quantum | Lesson-mobile export cut off the "Next mission →" button. | Status bar set to hug its content; frame re-exported at 390×1125. |
| Shader | Compile toolbar clipped the "● COMPILED · 12 MS" chip. | Toolbar wraps; chip drops to a second row. |

Nits applied in Figma: equal-height HANOI/GITHUB tiles on mobile, green LIVE badges on /projects/,
kit small button "Reset" (now "Re-run"), moon icon in the kit nav toggle, Shader-tab underline moved to "Shader".
Nits carried into code (not Figma): progress-segment contrast, 40 px tap targets, mobile progress strip under
the Quantum hero, brand + theme toggle in the lesson bar, shortcut hints hidden on touch, locked-lesson
descriptions hidden on narrow screens, hanging indent for wrapped code lines, code-pane scroll fade, GitHub
link kept in the FuncProg mobile header/footer, panel scroll + sticky Compile bar, scene re-centred beside the
floating panel, platform-aware shortcut label, 24 px slider thumbs on touch.

### Round 3 — apps PASS · portfolio FAIL (one line)

Quantum 5/4/5/4/5/5/4 · Shader 4/4/5/4/4/4/4 · FuncProg 4/4/5/3/4/4/3 (hierarchy / type / contrast /
mobile / clarity / consistency / polish). Portfolio: the "vs CPU 10×" row had been missed by the spacing fix;
kit toggle icon sat off-centre. Both fixed (all remaining rows on every page, icon centred in a 40 px box).

### Round 4 — portfolio PASS

All five console lines verified at 3× zoom; kit toggle icon centred to the pixel. No blocking findings.
Open nits carried into code: hero CTAs stack on narrow phones (no orphaned LinkedIn), 3-column /projects/
grid ≥1100 px, non-breaking hyphens in "end‑to‑end", 40 px text-link targets.
