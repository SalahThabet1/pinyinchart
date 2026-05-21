# Pinyin Chart — Fix Plan

## Overview
A React 18 CRA app — dark themed, mobile-first, with a scrollable pinyin grid and tone bottom-sheet. Below are the planned improvements, each with scope, approach, and files touched.

---

## P1 — Search Bar

**What:** A text input above the grid that filters syllables in real-time. Accepts pinyin (use `v` for `ü`). Matches against displayed syllable text. When filtering, non-matching cells dim or hide; matching cells highlight.

**Files touched:**
- `src/App.js` — add `searchQuery` state, filter logic
- `src/App.css` — search bar styling + highlight/dim classes

**Approach:** Simple `useState` + `filter`. No debounce needed at this scale (400 cells). Highlight matched cells with a glow/border animation.

**Estimate:** ~30 lines JS, ~30 lines CSS

---

## P1 — On-Click Behavior Switch

**What:** A small dropdown/segmented control above the grid: "Show tones" | "Play tone 1" | "Play tone 2" | "Play tone 3" | "Play tone 4". Default = "Show tones" (current bottom-sheet behavior). When a specific tone is selected, clicking any cell plays that tone's audio directly — no overlay.

**Files touched:**
- `src/App.js` — add `clickMode` state, branch in `open()` callback
- `src/App.css` — segmented control styling
- Optionally extract `SoundCell` logic for the direct-play path

**Approach:** The data already has tone-indexed pinyins (`pinyins[]` with 4 entries). Direct play just calls `play(pinyins[toneIndex])` and skips the sheet. Persist choice in localStorage for repeat visits.

**Estimate:** ~40 lines JS, ~25 lines CSS

---

## P1 — Tone Pair Practice Mode

**What:** A separate view/tab where users practice combinations of two syllables with tone sandhi. Shows two adjacent cells, each clickable. Can randomize or let users pick. Play audio for the pair.

**Files touched:**
- `src/App.js` — add tab navigation state, `TonePairBoard` component
- New: `src/TonePairBoard.js` — the pair practice component
- `src/App.css` — tab bar + pair board styling

**Approach:** Two syllable slots. Pick one, then another. Play each individually or both in sequence. Add a "Random pair" button. Later: common 2-syllable word combinations from a word list.

**Estimate:** ~80-100 lines JS, ~40 lines CSS

---

## P2 — Bold Irregular Syllables

**What:** Syllables where the vowel sound deviates from standard (zi, ci, si, zhi, chi, shi, ri, ye, yan, yuan, yun, etc.) display in **bold** with a subtle visual indicator. A small legend or tooltip explains why.

**Files touched:**
- `src/syllables.json` or a new `src/irregulars.json` — define the exception set
- `src/App.js` — pass irregular flag to `SoundCell`
- `src/App.css` — `.cell-btn--irregular` bold class + legend

**Approach:** A simple Set of known irregular syllables. Cells that match get a bold weight + dotted underline or info dot. Legend in the header area.

**Estimate:** ~15 lines JS, ~10 lines CSS

---

## P2 — Grouped Final Headers

**What:** Visually group finals by their starting vowel (A-group, O-group, E-group, I-group, U-group, Ü-group) with subtle dividers in the header row or background tint bands.

**Files touched:**
- `src/App.js` — replace flat `FINALS` mapping with grouped render
- `src/data/finals.js` (new) — grouped final definitions
- `src/App.css` — group divider/border styles

**Approach:** Define groups as `{ label: 'A', finals: ['a','ai','an','ang','ao'] }` etc. Render group separator columns or alternating bg tint. CLI chart does this well.

**Estimate:** ~25 lines JS, ~15 lines CSS

---

## P2 — Educational Content Section

**What:** Below the chart, add an expandable section with:
- What is Pinyin? (brief intro)
- Pronunciation notes (j/q/x vs zh/ch/sh tongue placement)
- Tone explanation with audio examples

**Files touched:**
- `src/App.js` — import `LearnSection` component
- New: `src/LearnSection.js` — collapsible educational content
- `src/App.css` — section styling, accordion

**Approach:** Keep it concise, collapsible accordion so it doesn't dominate the page. Reference the FIH brand tone. Plain markdown-like JSX.

**Estimate:** ~60 lines JS, ~20 lines CSS

---

## P3 — Audio Source Upgrade

**What:** Currently uses MSU tone library with random ID selection, which means inconsistent recordings per syllable. Replace with a reliable, consistent audio source.

**Options:**
1. Pre-recorded audio files bundled or hosted (best quality, largest)
2. A consistent API (e.g., TTS via browser SpeechSynthesis as fallback)
3. Curated MSU IDs (pick one good ID per syllable instead of random)

**Approach:** Low-effort fix = change `Math.floor(Math.random() * ids.length)` to always use `ids[0]` (first/primary recording). This gives consistency without changing the source.

**Estimate:** 1 line changed in `src/App.js`

---

## P3 — PDF Download

**What:** Generate a static PDF of the full pinyin chart for offline reference. Use `html2canvas` + `jspdf` or render via a hidden table.

**Approach:** `npm install html2canvas jspdf`. Add a "Download PDF" button that captures the grid and saves. Keep it simple — one page, no pagination needed for the smaller print layout.

**Estimate:** ~30 lines JS, plus 2 new deps

---

## Implementation Order (recommended)

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| 1 | Search bar | Small | High |
| 2 | On-click mode switch | Small | High |
| 3 | Tone Pairs | Medium | Highest |
| 4 | Irregular syllable bolding | Small | Medium |
| 5 | Grouped finals | Small | Medium |
| 6 | Educational content | Medium | Medium |
| 7 | Audio consistency | Trivial | Medium |
| 8 | PDF download | Small | Low |

## Quick wins (day 1)
1. Fix audio to use `ids[0]` instead of random
2. Add search bar
3. Add on-click dropdown

## Big push (day 2-3)
4. Tone Pairs mode
5. Irregular bolding + grouped finals

## Polish (day 4)
6. Educational content
7. PDF download (optional)

---
