# Mandarin Sound Table — Project History

## Overview

An interactive Mandarin Chinese pinyin chart / sound table built with React 18 (Create React App). Dark-themed, mobile-first, with audio playback via the MSU tone library. Deployed via GitHub Pages at `https://salahthabet1.github.io/pinyinchart/`.

**Repo:** `github.com/SalahThabet1/pinyinchart.git`
**Live:** `https://salahthabet1.github.io/pinyinchart/`
**Local:** `~/Projects/pinyin chart/mandarin-sound-table/`

---

## Architecture

### Stack
- **React 18** — `createRoot`, hooks (`useState`, `useCallback`, `useRef`, `memo`)
- **framer-motion v11** — animations, gestures, AnimatePresence
- **CSS Custom Properties** — dark theme, FIH brand palette
- **gh-pages** — deployment to GitHub Pages (`gh-pages` branch)
- **MSU Tone Library** — audio source at `https://tone.lib.msu.edu/tone/{id}/PROXY_MP3/download`

### Data Files (`src/`)

| File | Format | Purpose |
|------|--------|---------|
| `syllables.json` | `{initial: {final: syllable}}` | Maps every valid initial+final comb to a syllable string. Empty string = invalid combo. |
| `syllableToPinyins.json` | `{syllable: [4thTone, 2ndTone, 1stTone, 3rdTone]}` | Tone-marked forms for each syllable. Order: [4th, 2nd, 1st, 3rd]. |
| `pinyins.json` | `{toneMarkedPinyin: [audioID, ...]}` | Audio IDs from MSU library for each tone form. Multiple IDs = multiple recordings. |
| `irregulars.json` | `{syllable: explanation}` | 44 syllables with non-obvious pronunciation. |
| `finalsGroups.js` | `export const FINAL_GROUPS` | Finals organized by starting vowel (A/O/E/IA/U/Ü groups). |

### Component Tree

```
<App>
  ├── <header> — title, subtitle
  ├── <nav.tab-bar> — "Sound Table" | "Tone Pairs"
  ├── [activeTab === 'chart']
  │   ├── <div.controls-bar>
  │   │   ├── <SearchBar> — filter input with clear button
  │   │   └── <ClickModeSwitch> — "Show tones" | T1 | T2 | T3 | T4
  │   ├── <div.table-wrap>
  │   │   └── <table.sound-table>
  │   │       ├── thead — grouped finals headers (A/O/E/IA/U/Ü)
  │   │       └── tbody — initials x finals grid
  │   │           └── <SoundCell> — individual syllable button (x400+)
  │   ├── <IrregularLegend> — explains dotted-underline syllables
  │   └── <LearnSection> — collapsible: What is Pinyin / Tricky Sounds / The 4 Tones
  ├── [activeTab === 'pairs']
  │   └── <TonePairBoard> — 2-slot pair practice, random, play both, recents
  └── [active state]
      └── <ToneSheet> — bottom-sheet overlay with 4 tone buttons
```

### Tone Display Order

The data order in `syllableToPinyins.json` is `[4th, 2nd, 1st, 3rd]` (indices 0-3). The display order uses `TONE_DISPLAY_ORDER = [2, 1, 3, 0]` to map to 1st→2nd→3rd→4th in the UI.

```javascript
TONE_DISPLAY_ORDER = [2, 1, 3, 0]; // data index for each display slot
// display[0] = data[2] = 1st tone
// display[1] = data[1] = 2nd tone
// display[2] = data[3] = 3rd tone
// display[3] = data[0] = 4th tone
```

---

## Session History

### 2026-03-09 — Initial Creation
- CRA scaffold, React 18, basic pinyin grid
- Tone bottom-sheet with MSU audio
- GitHub Pages deploy (SalahThabet1.github.io/pinyinchart)

### 2026-05-21 — Major Overhaul (this session)

**Trigger:** Audit against 3 popular pinyin charts (Yoyo Chinese, Yabla, CLI StudyCLI) revealed gaps.

**6 parallel agents deployed:**

| # | Agent | Files | What |
|---|-------|-------|------|
| 1 | Search + Click Mode | `SearchBar.js/.css`, `ClickModeSwitch.js/.css` | Filter input, segmented tone mode switch |
| 2 | Tone Pair Board | `TonePairBoard.js/.css` | 2-slot practice with random/recents/play-both |
| 3 | Learning Content | `LearnSection.js/.css`, `irregulars.json`, `finalsGroups.js` | Accordion lessons, 44 irregular entries, grouped finals |
| 4 | Integration | `App.js`, `App.css` | Wired all components, tab system, grouped headers, irregular bolding |
| 5 | Polish + Animations | All CSS files, `index.js`, `index.css` | Framer Motion, micro-interactions, reduced-motion support |
| 6 | Data Fix (this run) | `syllables.json`, `syllableToPinyins.json`, `pinyins.json` | Fixed 12 missing pinyin entries |

**Gap Analysis (vs Yoyo/Yabla/CLI):**

| Gap | Status | Implemented |
|-----|--------|-------------|
| Search bar | ✅ | Filter input, dims non-matches, `v` for `ü` |
| One-click tone play | ✅ | Mode switch: "Show tones" vs T1/T2/T3/T4 direct |
| Tone Pairs practice | ✅ | Two-slot board, random, play both, recent history |
| Educational content | ✅ | 3-section accordion: Intro, Tricky Sounds, Tones |
| Bold irregulars | ✅ | Dotted underline + legend below grid |
| Grouped finals | ✅ | A/O/E/IA/U/Ü headers with colSpan |
| Audio consistency | ✅ | `ids[0]` instead of `Math.random()` |
| Animations | ✅ | Framer Motion: stagger, springs, AnimatePresence |
| PDF download | ❌ Skipped | Not requested |

**Bundle:** JS 131.52 kB gzipped, CSS 4.64 kB gzipped

---

## Known Data Quirks

### Missing Entries (Fixed 2026-05-21)

The following pinyin syllables were missing from the chart due to incomplete data files:

| Syllables | Root Cause | Fix |
|-----------|-----------|-----|
| `zhi chi shi ri` | `syllables.json` had `zh+i=""`, `ch+i=""`, etc. (treated as invalid) | Set to valid syllable string |
| `zi ci si` | Same — dental series + `i` marked empty | Set to valid syllable string |
| `nü lü` | In `syllables.json` but missing from `syllableToPinyins.json` (no tone forms) | Added tone entries |
| `nüe lüe` | In `syllables.json` but no tone forms or audio entries | Added tone forms + audio IDs |
| `o` (standalone) | `∅+o` key missing from `syllables.json` entirely | Added entry |

### MSU Audio Library Encoding

The MSU tone library uses `v` to represent `ü` in API search queries (e.g., `nvè` = `nüè`). The `pinyins.json` stores both conventions:
- `v`-format keys: `"nvè"`, `"lvé"`, etc. (original from data source)
- `ü`-format keys: `"nüè"`, `"lǘ"`, etc. (added for proper Unicode matching)

Audio is always accessed by numeric ID via `mp3Url(id)`, so key format doesn't affect playback.

### Invalid Combos in syllables.json

Some initial+final combinations in `syllables.json` produce non-standard pinyin that doesn't exist in any audio library:
- `l + üan = "lüan"` — **not a valid pinyin syllable** (no audio, no standard characters)
- `l + ün = "lün"` — **not a valid pinyin syllable** (no audio, no standard characters)
- `n + üan = ""` — correctly marked invalid
- `n + ün = ""` — correctly marked invalid

These pseudo-syllables don't appear in the grid because `CELLS` precomputation drops entries with no `syllableToPinyins` entry.

### Tone Color Scheme

```
--tone-1: #C0392B  (red)     — 1st tone (flat)
--tone-2: #D4A76A  (gold)    — 2nd tone (rising)
--tone-3: #5B9E6F  (green)   — 3rd tone (dip)
--tone-4: #6B9FC4  (blue)    — 4th tone (falling)
```

### Brand Palette (FIH-inspired)

```
--bg-primary:   #1C1410  (ink black)
--bg-secondary: #261c17  (dark brown)
--bg-card:      #2d221a  (card brown)
--text-primary: #F2EBE0  (beige)
--text-accent:  #C4A882  (sand)
--red-bright:   #C0392B  (brand accent)
```

---

## How To

### Run Dev Server
```bash
cd ~/Projects/pinyin\ chart/mandarin-sound-table
npm start
```

### Build & Deploy
```bash
npm run deploy   # builds + pushes to gh-pages branch
```

### Add Missing Pinyin Syllable

1. **`syllables.json`** — Set `{initial}.{final} = "syllable"` (e.g., `"zh"."i" = "zhi"`)
2. **`syllableToPinyins.json`** — Add `"syllable" -> ["4th", "2nd", "1st", "3rd"]` with proper Unicode tone marks
3. **`pinyins.json`** — Add audio IDs for each tone form (search MSU API or find IDs for similar pinyins)

### Audio ID Format
```javascript
const mp3Url = id => `https://tone.lib.msu.edu/tone/${id}/PROXY_MP3/download`;
// Audio IDs are integers, typically 4-5 digits
```

---

## To Do / Future

- [ ] PDF download of the chart (low priority)
- [ ] Tone sandhi rules in LearnSection
- [ ] Common 2-syllable word lists for Tone Pairs mode
- [ ] Audio loading indicator/state
- [ ] Keyboard navigation (arrow keys across grid)
