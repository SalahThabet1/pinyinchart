#!/usr/bin/env python3
"""
Generate pinyinSplit.json — maps tone-marked pinyin to per-syllable color info.
Uses pypinyin TONE3 format (dong1 xi1) which provides reliable syllable boundaries.

Output format:
  {
    "dōngxī": [["dōng", 1], ["xī", 1]],
    "nǐ hǎo": [["nǐ", 3], ["hǎo", 3]],
    "zhuōzi": [["zhuō", 1], ["zi", 5]]
  }

Tone colors: 1=red, 2=green, 3=blue, 4=purple, 5=grey
"""
import json, re, sys

try:
    from pypinyin import pinyin, Style
except ImportError:
    sys.stderr.write("pypinyin not found — install with: pip install pypinyin\n")
    sys.exit(1)

# Unicode tone marks
TONE_MARKS = 'āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ'
# Map tone-marked vowels to numbers
TONE_MAP = {}
for i, cs in enumerate(['āēīōūǖĀĒĪŌŪǕ',
                         'áéíóúǘÁÉÍÓÚǗ',
                         'ǎěǐǒǔǚǍĚǏǑǓǙ',
                         'àèìòùǜÀÈÌÒÙǛ'], 1):
    for c in cs:
        TONE_MAP[c] = i

TONE_TO_VOWEL = str.maketrans({'ā':'a','á':'a','ǎ':'a','à':'a',
                                'ē':'e','é':'e','ě':'e','è':'e',
                                'ī':'i','í':'i','ǐ':'i','ì':'i',
                                'ō':'o','ó':'o','ǒ':'o','ò':'o',
                                'ū':'u','ú':'u','ǔ':'u','ù':'u',
                                'ǖ':'v','ǘ':'v','ǚ':'v','ǜ':'v'})

def untone(marked):
    return marked.translate(TONE_TO_VOWEL)

def get_tone_num(syl):
    for c in syl:
        if c in TONE_MAP:
            return TONE_MAP[c]
    return 5

def tone2_to_tone3(tone2_syls):
    """Convert TONE2 syllables (e.g. 'dong1', 'xi1') to tone-marked pinyin + tone number."""
    result = []
    for t3 in tone2_syls:
        # t3 is like 'dong1' or 'zhuo1'
        # Split off the trailing digit
        m = re.match(r'^(.+?)(\d)$', t3)
        if not m:
            continue
        base, num = m.group(1), int(m.group(2))

        # Map plain vowels with tone: dong1 → dōng (1st tone)
        # We need to apply tone mark to the vowel
        # In TONE3, the base is plain pinyin (no marks)
        # We need to find the vowel and add the appropriate tone mark
        tone_marked = apply_tone(base, num)

        result.append([tone_marked, num])
    return result

VOWEL_SEQ = ['a', 'e', 'i', 'o', 'u', 'v']  # v = ü
VOWEL_SORT = {'a': 4, 'e': 3, 'i': 0, 'o': 2, 'u': 1, 'v': 0}  # higher = priority

def apply_tone(base, tone_num):
    """Apply a tone mark to the correct vowel in a pinyin syllable."""
    if tone_num == 5:
        return base

    tone_vowels = {
        1: {'a':'ā','e':'ē','i':'ī','o':'ō','u':'ū','v':'ǖ'},
        2: {'a':'á','e':'é','i':'í','o':'ó','u':'ú','v':'ǘ'},
        3: {'a':'ǎ','e':'ě','i':'ǐ','o':'ǒ','u':'ǔ','v':'ǚ'},
        4: {'a':'à','e':'è','i':'ì','o':'ò','u':'ù','v':'ǜ'},
    }

    # Find which vowel gets the tone mark (pinyin rule: a/e always, ou→o, otherwise last vowel)
    # Priority: a > e > o > rest (last if no a/e/o)
    vowel_positions = []
    for v in ['a', 'e', 'o']:
        idx = base.find(v)
        if idx != -1:
            vowel_positions.append((idx, v))

    if vowel_positions:
        # Use the first (leftmost) priority vowel
        vowel_positions.sort(key=lambda x: x[0])
        pos, v = vowel_positions[0]
    else:
        # Find last vowel among i,u,ü
        for idx in range(len(base) - 1, -1, -1):
            if base[idx] in 'iuv':
                pos, v = idx, base[idx]
                break
        else:
            return base  # no vowel found

    result = list(base)
    result[pos] = tone_vowels[tone_num][v]
    return ''.join(result)


def split_with_tones(tone_marked_py):
    """
    Given tone-marked pinyin like 'dōngxī', return syllable breakdown.
    Uses pypinyin for reliable splitting, but converts tone3 to tone-marked.
    """
    # First, convert tone-marked to plain text
    plain = untone(tone_marked_py)
    # Need to handle apostrophe (隔音符号)
    plain = plain.replace("'", '')
    # π pypinyin
    try:
        # Split by characters - pypinyin handles this
        # But we need to handle the case where pinyin has spaces:
        if ' ' in tone_marked_py:
            # Already space-separated syllables
            syls = tone_marked_py.split()
            return [[s, get_tone_num(s)] for s in syls if s]

        # Get pypinyin TONE3 output
        # We need the Chinese chars... but pypinyin requires Chinese characters!
        # For pinyin strings, we need to split them differently.
        pass
    except:
        pass

    # Fallback: use pypinyin to split, but we need Chinese characters
    # Since we don't have them, use the regex-based splitter
    return None


def main():
    # Read tonePairWords.json to get all pinyin strings
    with open('src/tonePairWords.json') as f:
        tpw = json.load(f)

    # Collect ALL unique pinyin strings
    all_py = set()
    for k, words in tpw.items():
        for w in words:
            py = w['pinyin']
            all_py.add(py)

    # Also get the Chinese characters for each word
    # We need the mapping from pinyin → Chinese chars to use pypinyin
    # Actually, for pypinyin we need the Chinese chars, not the pinyin
    # So we build: chars → pinyin_tone3 → colored split

    result = {}

    # Collect all unique Chinese words
    all_chars = {}
    for k, words in tpw.items():
        for w in words:
            ch = w['chars']
            if ch not in all_chars:
                py = w['pinyin']
                all_chars[ch] = py

    # Process with pypinyin
    for ch, py in all_chars.items():
        t3 = pinyin(ch, style=Style.TONE3, neutral_tone_with_five=True)
        t3_syls = [p[0] for p in t3]
        split_info = tone2_to_tone3(t3_syls)

        # Store by BOTH chars and pinyin
        result[ch] = split_info

        # Also store by the original pinyin string
        result[py] = split_info

    # Also handle pinyin strings not word-based (like individual syllables)
    # Add some common additional pinyin strings from LearnSection etc.
    extra = [
        'bō pō mō fō', 'bo1 po1 mo1 fo1',  # learn section
        'dā dá dǎ dà', 'tā tǎ tà',  # etc
    ]

    # Write the output
    # Also include a fallback function to apply tone marks

    with open('src/pinyinSplit.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"Generated pinyinSplit.json with {len(result)} entries")
    print(f"Unique words: {len(all_chars)}")

    # Print some examples
    for ch in list(all_chars.keys())[:10]:
        py = all_chars[ch]
        info = result.get(py, [])
        colored = ' '.join(f"{s}({t})" for s, t in info)
        print(f"  {ch:5s} {py:12s} → {colored}")

if __name__ == '__main__':
    main()
