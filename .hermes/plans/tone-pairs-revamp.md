# Tone Pairs Revamp Plan

## The Problem
Our current tone pairs UI has two empty slots where users pick syllables. This is wrong.
Real tone pair practice (Yoyo Chinese, Chinese Deck, Mandarin Blueprint) uses a **4×4 grid** where each cell contains real vocabulary words with characters, pinyin, English, and native audio.

## How Yoyo Chinese Does It
- 4×5 grid: rows = 1st tone, cols = 1st/2nd/3rd/4th/neutral
- Each cell: real Chinese words (中国 zhōngguó, 谢谢 xièxie, etc.)
- Characters + pinyin + English + play audio
- "Refresh for more" swaps to different words

## How Chinese Deck Does It
- 4×4 grid + neutral column
- Shows 3-5 example words per cell
- Click plays the word audio

## Mandarin Blueprint
- Focuses on 19 pairs (3-3 is same as 2-3 due to sandhi)
- Each pair gets "anchor words" — high-frequency words

## Our Approach: 4×4 Grid (no neutral, phase 2)

### Phase 1: Vocabulary Data
Create `src/tonePairWords.json` — curated word list covering all 16 tone pairs.
- 8-10 words per pair, sorted by frequency
- Each word: `{ chars, pinyin, translation }`
- ~130 words total

### Phase 2: Grid UI
Replace the current two-slot UI with a 4×4 tone pair grid.
- Rows: 1st/2nd/3rd/4th tone (first syllable)
- Cols: 1st/2nd/3rd/4th tone (second syllable)
- Each cell shows:
  - Tone pair label (e.g., "1-3")
  - One example word (chars, pinyin, translation)
  - Play button (plays both syllables sequentially, 200ms gap)
  - "Next" button (cyclically shows next word in list)
  - Word counter (e.g., "1/8")

### Phase 3: Audio
Use existing `pinyins.json` to get audio IDs for each pinyin in the word.
- Split word pinyin into syllables (e.g., zhōngguó → ["zhōng", "guó"])
- Look up audio IDs, use ids[0] for consistent voice
- Play with 200ms gap between syllables

### Phase 4: Styling
- Compact grid cells on mobile
- Responsive: 4×4 on mobile, wider on desktop
- Tone color coding (red/yellow/green/blue)
- Match FIH light theme

## Files to Create/Modify
- **CREATE**: `src/tonePairWords.json` — vocabulary database
- **REPLACE**: `src/TonePairBoard.js` — new grid component
- **REPLACE**: `src/TonePairBoard.css` — new grid styles

## Vocabulary Data Structure
```json
{
  "1-1": [
    { "chars": "今天", "pinyin": "jīntiān", "translation": "today" },
    { "chars": "咖啡", "pinyin": "kāfēi", "translation": "coffee" }
  ],
  "1-2": [
    { "chars": "中国", "pinyin": "zhōngguó", "translation": "China" }
  ]
}
```

## Audio Logic
1. User clicks play on a cell
2. Split pinyin: "zhōngguó" → ["zhōng", "guó"]
3. Look up audio IDs: `pinyins["zhōng"][0]`, `pinyins["guó"][0]`
4. Play syllable 1 → wait 200ms → play syllable 2
