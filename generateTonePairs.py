#!/usr/bin/env python3
"""Generate tonePairWords.json from HSK2012 word list + pypinyin + CC-CEDICT."""

import json
import re
import sys

try:
    from pypinyin import pinyin, Style
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'pypinyin'])
    from pypinyin import pinyin, Style

HSK_DIR = "/home/salah/pinyin-audio-sources/hugolpz/lists"
CEDICT = "/tmp/cedict"
OUTPUT = "/home/salah/Projects/pinyin chart/mandarin-sound-table/src/tonePairWords.json"

# ── Parse CC-CEDICT ──
# Format: traditional simplified [pinyin] /definition/
def parse_cedict(path):
    lookup = {}
    with open(path, encoding='utf-8') as f:
        for line in f:
            if line.startswith('#'):
                continue
            line = line.strip()
            if not line:
                continue
            # Match: traditional simplified [pinyin] /def/
            m = re.match(r'^(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+/(.*)/$', line)
            if m:
                simplified = m.group(2)
                definition = m.group(4)
                # Take the first English definition before any /
                defs = definition.split('/')
                first_def = defs[0].strip()
                if first_def and simplified not in lookup:
                    lookup[simplified] = first_def
    print(f"CC-CEDICT: {len(lookup)} entries loaded")
    return lookup

cedict = parse_cedict(CEDICT)

# ── Read HSK words ──
all_words = {}
for level in range(1, 7):
    path = f"{HSK_DIR}/HSK2012_{level}.txt"
    try:
        with open(path) as f:
            for line in f:
                w = line.strip()
                if w and not w.startswith('HSK') and len(w) >= 2 and len(w) <= 4:
                    if w not in all_words:
                        all_words[w] = level
        print(f"HSK{level}: {sum(1 for w in all_words.values() if w == level)} unique multi-char words")
    except FileNotFoundError:
        print(f"HSK{level}: not found at {path}")

print(f"\nTotal unique words: {len(all_words)}")

# ── Tone helpers ──
TONE_MAP = {
    'ā': 1, 'á': 2, 'ǎ': 3, 'à': 4,
    'ē': 1, 'é': 2, 'ě': 3, 'è': 4,
    'ī': 1, 'í': 2, 'ǐ': 3, 'ì': 4,
    'ō': 1, 'ó': 2, 'ǒ': 3, 'ò': 4,
    'ū': 1, 'ú': 2, 'ǔ': 3, 'ù': 4,
    'ǖ': 1, 'ǘ': 2, 'ǚ': 3, 'ǜ': 4,
}

def get_tone(syl):
    for ch in reversed(syl):
        if ch in TONE_MAP:
            return TONE_MAP[ch]
    return 5  # neutral

def short_pinyin(syllables):
    """Join syllables, strip any spaces."""
    return ''.join(syllables)

# ── Categorize by tone pair ──
tone_pairs = {}

for word, level in all_words.items():
    try:
        py_result = pinyin(word, style=Style.TONE)
        syllables = [p[0] for p in py_result]
        if len(syllables) != 2:
            continue
        
        t1 = get_tone(syllables[0])
        t2 = get_tone(syllables[1])
        pair_key = f"{t1}-{t2}"
        
        # Get translation
        translation = cedict.get(word, "")
        # Clean up the translation (remove extra notes)
        if translation:
            # Take just the first part before CL: classifier or similar
            translation = re.sub(r'\s*\(CL:[^)]+\)', '', translation).strip()
        
        entry = {
            "chars": word,
            "pinyin": short_pinyin(syllables),
            "syllables": syllables,
            "level": level,
            "translation": translation
        }
        
        if pair_key not in tone_pairs:
            tone_pairs[pair_key] = []
        tone_pairs[pair_key].append(entry)
    except Exception as e:
        pass  # skip problematic words

# ── Sort and trim (12 per cell) ──
for key in tone_pairs:
    tone_pairs[key].sort(key=lambda x: (x['level'], len(x['chars']), x['chars']))

# Print distribution
missing_translations = 0
for key in sorted(tone_pairs.keys(), key=lambda k: (int(k.split('-')[0]), int(k.split('-')[1]))):
    entries = tone_pairs[key]
    no_trans = sum(1 for e in entries if not e['translation'])
    missing_translations += no_trans
    print(f"  {key}: {len(entries)} words ({no_trans} missing translations)")

print(f"\nWords missing translations: {missing_translations}")

# ── Build output (top 12 per cell) ──
output = {}
for key in sorted(tone_pairs.keys(), key=lambda k: (int(k.split('-')[0]), int(k.split('-')[1]))):
    entries = tone_pairs[key][:12]
    out_entries = []
    for e in entries:
        out_entries.append({
            "chars": e["chars"],
            "pinyin": e["pinyin"],
            "syllables": e["syllables"],
            "translation": e["translation"]
        })
    output[key] = out_entries

with open(OUTPUT, 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\n✅ Written to {OUTPUT}")
print(f"Cells: {len(output)}, Words: {sum(len(v) for v in output.values())}")
