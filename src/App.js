import React, { useState, useCallback, useRef, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import syllablesData from './syllables.json';
import syllableToPinyins from './syllableToPinyins.json';
import SearchBar from './SearchBar';
import ClickModeSwitch from './ClickModeSwitch';
import TonePairBoard from './TonePairBoard';
import LearnSection from './LearnSection';
import { FINAL_GROUPS } from './finalsGroups';
import irregulars from './irregulars.json';
import { IconInfo, IconTable, IconRefresh, IconBook } from './icons';
import './App.css';
import './components/SoundCell.css';
import './components/ToneSheet.css';

/* Tone-marked pinyin → audio filename converter */
const TONE_TO_NUM = {'ā':'a1','á':'a2','ǎ':'a3','à':'a4',
  'ē':'e1','é':'e2','ě':'e3','è':'e4',
  'ī':'i1','í':'i2','ǐ':'i3','ì':'i4',
  'ō':'o1','ó':'o2','ǒ':'o3','ò':'o4',
  'ū':'u1','ú':'u2','ǔ':'u3','ù':'u4',
  'ǖ':'v1','ǘ':'v2','ǚ':'v3','ǜ':'v4',
  'ü':'v'};
const pinyinAudioSrc = py => {
  let s = '', t = '';
  for (const ch of py) {
    const m = TONE_TO_NUM[ch];
    if (m) { if (m[1]) { t = m[1]; s += m[0]; } else s += m; }
    else s += ch;
  }
  return `${process.env.PUBLIC_URL || ''}/audio/${s}${t}.mp3`;
};

/* Light haptic feedback for mobile */
function hapticFeedback() {
  try {
    if (navigator.vibrate) navigator.vibrate(10);
  } catch (_) { /* ignore */ }
}

/* Display order: 1st, 2nd, 3rd, 4th.
   Data order per syllable is [4th, 2nd, 1st, 3rd] (indices 0-3). */
const TONE_DISPLAY_ORDER = [2, 1, 3, 0]; // data index for each display slot
const TONE_COLORS = ['var(--tone-1)', 'var(--tone-2)', 'var(--tone-3)', 'var(--tone-4)'];
const TONE_LABELS = ['1st', '2nd', '3rd', '4th'];

const INITIALS = [
  '∅','b','p','m','f','d','t','n','l','g','k','h',
  'j','q','x','zh','ch','sh','r','z','c','s',
];

/* Build flat FINALS array from FINAL_GROUPS for cell iteration */
const FINALS = FINAL_GROUPS.flatMap(g => g.finals);

/* Pre-compute every valid cell once at module load */
const CELLS = (() => {
  const map = {};
  for (const ini of INITIALS) {
    for (const fin of FINALS) {
      const row = syllablesData[ini];
      if (!row) continue;
      const syl = row[fin];
      if (!syl) continue;
      const pins = syllableToPinyins[syl];
      if (pins && pins.length) map[`${ini}|${fin}`] = { syl, pins };
    }
  }
  return map;
})();

/* ── Cell ── */
const SoundCell = memo(function SoundCell({ cellKey, onTap, isDimmed, isMatched, isIrregular }) {
  const data = CELLS[cellKey];
  if (!data) return <td className="cell cell--empty" />;
  const cls = 'cell-btn' +
    (isDimmed ? ' cell-btn--dimmed' : '') +
    (isMatched ? ' cell-btn--matched' : '') +
    (isIrregular ? ' cell-btn--irregular' : '');
  return (
    <td className="cell">
      <button className={cls} onClick={() => onTap(data.syl, data.pins)}>
        {data.syl}
      </button>
    </td>
  );
});

/* ── Tone bottom-sheet ── */
function ToneSheet({ syllable, pinyins, onPlay, onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-label={`Tones for ${syllable}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="sheet-head">
          <span className="sheet-syl">{syllable}</span>
          <button className="sheet-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="sheet-grid">
          {TONE_DISPLAY_ORDER.map((dataIdx, displayIdx) => {
            const py = pinyins[dataIdx];
            if (!py) return null;
            return (
              <button
                key={py}
                className="tone-btn"
                style={{ '--c': TONE_COLORS[displayIdx] }}
                onClick={() => {
                  hapticFeedback();
                  onPlay(py);
                }}
              >
                <span className="tone-num">{displayIdx + 1}</span>
                <span className="tone-py">{py}</span>
                <span className="tone-label">{TONE_LABELS[displayIdx]} tone</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Irregular groupings by phonetic category ── */
const IRREG_GROUPS = [
  {
    label: 'Apical Vowels (舌尖音)',
    desc: 'The letter "i" sounds completely different — no front vowel, just a sustained buzz.',
    keys: ['zi', 'ci', 'si', 'zhi', 'chi', 'shi', 'ri'],
  },
  {
    label: 'Ü Rule — Written "u", Spoken "ü"',
    desc: 'After j, q, x and y, the letter "u" represents the rounded front vowel [y]. The umlaut is omitted in writing.',
    keys: ['ju', 'qu', 'xu', 'juan', 'quan', 'xuan', 'jun', 'qun', 'xun', 'jue', 'que', 'xue', 'yuan', 'yue', 'yun'],
  },
  {
    label: 'Vowel Shifts',
    desc: 'Letters "e" and "a" take unexpected values in certain environments.',
    keys: ['ye', 'yan', 'yin', 'ying'],
  },
  {
    label: 'Hidden Glides',
    desc: 'Compound finals conceal an extra vowel that surfaces in careful speech.',
    keys: ['iu', 'ui', 'un'],
  },
  {
    label: 'Labial + "o" → [wo]',
    desc: 'A [w] glide is inserted between labial initials and "o".',
    keys: ['bo', 'po', 'mo', 'fo', 'lo', 'yo'],
  },
  {
    label: 'Eng as [əŋ]',
    desc: 'The "eng" final uses a schwa [ə], not a front [e].',
    keys: ['beng', 'peng', 'weng', 'yong'],
  },
  {
    label: 'Syllabic Nasals',
    desc: 'Standalone nasal consonants — no vowel at all.',
    keys: ['m', 'n', 'ng', 'hm', 'hng'],
  },
  {
    label: 'Rare / Exceptional',
    desc: 'Syllables that break standard initial-final constraints.',
    keys: ['dia', 'nun', 'bia'],
  },
];

/* ── Irregular group card ── */
function IrregularGroupCard({ group }) {
  return (
    <div className="btm-irreg-group">
      <h4 className="btm-irreg-head">{group.label}</h4>
      <p className="btm-irreg-desc">{group.desc}</p>
      <div className="btm-irreg-rows">
        {group.keys.map(k => (
          <div key={k} className="btm-irreg-row">
            <code className="btm-irreg-syl">{k}</code>
            <span className="btm-irreg-exp">{irregulars[k]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Irregular section below Sound Table ── */
function IrregularCard() {
  return (
    <div className="btm-irreg-wrap">
      <h3 className="btm-irreg-title">
        <IconInfo size={16} />
        Irregular Pronunciations
      </h3>
      <p className="btm-irreg-sub">
        Syllables that break the expected sound rules from their spelling, grouped by phonetic theme.
      </p>
      {IRREG_GROUPS.map(g => (
        <IrregularGroupCard key={g.label} group={g} />
      ))}
    </div>
  );
}

/* ── App ── */
export default function App() {
  const [active, setActive] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [clickMode, setClickMode] = useState('Show tones');
  const [activeTab, setActiveTab] = useState('chart');
  const [searchMode, setSearchMode] = useState('syllable'); // 'syllable' | 'pinyin' | 'both'
  const audioRef = useRef(null);

  const open = useCallback((syl, pins) => {
    const modeIndex = ['Show tones', 'T1', 'T2', 'T3', 'T4'].indexOf(clickMode);
    if (modeIndex > 0) {
      /* Direct tone play — skip the sheet */
      hapticFeedback();
      const dataIdx = TONE_DISPLAY_ORDER[modeIndex - 1];
      const py = pins[dataIdx];
      if (!py) return;
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      const a = new Audio(pinyinAudioSrc(py));
      audioRef.current = a;
      a.play().catch(() => {});
      return;
    }
    /* Show tones (default behavior) */
    setActive({ syl, pins });
  }, [clickMode]);

  const close = useCallback(() => setActive(null), []);

  const play = useCallback(py => {
    hapticFeedback();
    if (!py) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const a = new Audio(pinyinAudioSrc(py));
    audioRef.current = a;
    a.play().catch(() => {});
  }, []);

  const isSearching = searchQuery.trim().length > 0;

  const cellKeys = Object.keys(CELLS);
  const totalCells = cellKeys.length;

  /* Pre-compute matched cell keys — single pass, O(1) lookup per cell */
  const matchedKeys = useMemo(() => {
    const set = new Set();
    if (!isSearching) return set;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return set;
    for (const key of cellKeys) {
      const data = CELLS[key];
      if (!data) continue;
      if (searchMode === 'syllable' || searchMode === 'both') {
        if (data.syl.toLowerCase().includes(q)) { set.add(key); continue; }
      }
      if (searchMode === 'pinyin' || searchMode === 'both') {
        if (data.pins && data.pins.some(p => p && p.toLowerCase().includes(q))) { set.add(key); continue; }
      }
    }
    return set;
  }, [searchQuery, searchMode, isSearching, cellKeys]);

  return (
    <div className="app">
        {/* Tab bar */}
        <nav className="tab-bar" role="tablist" aria-label="View mode">
          <button
            className={'tab-btn' + (activeTab === 'chart' ? ' tab-btn--active' : '')}
            role="tab"
            aria-selected={activeTab === 'chart'}
            onClick={() => setActiveTab('chart')}
          >
            <IconTable size={14} />
            Sound Table
          </button>
          <button
            className={'tab-btn' + (activeTab === 'pairs' ? ' tab-btn--active' : '')}
            role="tab"
            aria-selected={activeTab === 'pairs'}
            onClick={() => setActiveTab('pairs')}
          >
            <IconRefresh size={14} />
            Tone Sandhi
          </button>
          <button
            className={'tab-btn' + (activeTab === 'learn' ? ' tab-btn--active' : '')}
            role="tab"
            aria-selected={activeTab === 'learn'}
            onClick={() => setActiveTab('learn')}
          >
            <IconBook size={14} />
            Learn
          </button>
        </nav>

        {activeTab === 'chart' && (
          <>
            <div className="controls-bar">
              <SearchBar
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                searchMode={searchMode}
                onSearchModeChange={setSearchMode}
              />
              <ClickModeSwitch mode={clickMode} onChange={setClickMode} />
            </div>

            <div className="table-wrap">
              <table className="sound-table">
                <thead>
                  <tr>
                    <th className="th corner" />
                    {FINAL_GROUPS.map(group => (
                      <th
                        key={group.label}
                        className="th col-head group-header"
                        colSpan={group.finals.length}
                      >
                        {group.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                    {INITIALS.map(ini => (
                      <tr key={ini}>
                        <th className="th row-head">{ini}</th>
                        {FINALS.map(fin => {
                          const cellKey = `${ini}|${fin}`;
                          const data = CELLS[cellKey];
                          const syl = data ? data.syl : '';
                          const matchesQuery = !isSearching || matchedKeys.has(cellKey);
                          const isIrreg = !!irregulars[syl];
                          return (
                            <SoundCell
                              key={fin}
                              cellKey={cellKey}
                              onTap={open}
                              isDimmed={isSearching && !matchesQuery}
                              isMatched={isSearching && matchesQuery}
                              isIrregular={isIrreg}
                            />
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
              </table>
              <AnimatePresence>
                {isSearching && (
                  <motion.div
                    className="search-info"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                  >
                    Matched <strong>{matchedKeys.size || totalCells}</strong> / {totalCells} syllables
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="irreg-section">
              <IrregularCard />
            </div>
          </>
        )}

        {activeTab === 'pairs' && <TonePairBoard />}

        {activeTab === 'learn' && <LearnSection />}

        {/* ── Footer (all tabs) ── */}
        <div className="lp-footer">
          <p>
            Audio by <a href="https://github.com/hugolpz/audio-cmn" target="_blank" rel="noopener noreferrer">Hugo (Chen Wang / Yue Tan)</a> (CC-BY-SA)
            &middot; Words from HSK 2012 &middot; Dictionary data from <a href="https://cc-cedict.org" target="_blank" rel="noopener noreferrer">CC-CEDICT</a> (CC-BY-SA 4.0)
          </p>
          <p className="lp-footer-copy">
            All rights reserved &middot; &copy; falafelinhotpot.com
          </p>
        </div>

        {active && (
          <ToneSheet
            syllable={active.syl}
            pinyins={active.pins}
            onPlay={play}
            onClose={close}
          />
        )}
      </div>
  );
}
