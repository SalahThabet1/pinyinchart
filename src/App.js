import React, { useState, useCallback, useRef, memo, useMemo } from 'react';
import { motion, LayoutGroup, AnimatePresence } from 'framer-motion';
import pinyinData from './pinyins.json';
import syllablesData from './syllables.json';
import syllableToPinyins from './syllableToPinyins.json';
import SearchBar from './SearchBar';
import ClickModeSwitch from './ClickModeSwitch';
import TonePairBoard from './TonePairBoard';
import LearnSection from './LearnSection';
import { FINAL_GROUPS } from './finalsGroups';
import irregulars from './irregulars.json';
import { IconInfo } from './icons';
import './App.css';

const mp3Url = id =>
  `https://tone.lib.msu.edu/tone/${id}/PROXY_MP3/download`;

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
      <motion.button
        className={cls}
        onClick={() => onTap(data.syl, data.pins)}
        layout
        initial={false}
        animate={{
          opacity: isDimmed ? 0.15 : 1,
          scale: isDimmed ? 0.85 : isMatched ? 1.04 : 1,
        }}
        transition={{
          duration: 0.2,
          ease: 'easeInOut',
        }}
      >
        {data.syl}
      </motion.button>
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

/* ── Irregular legend badge ── */
function IrregularCard() {
  const [open, setOpen] = useState(false);
  const irregKeys = Object.keys(irregulars);
  return (
    <div className={`irregular-card${open ? ' irregular-card--open' : ''}`}>
      <button className="irregular-card-head" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <IconInfo size={14} />
        <span>Irregular Pronunciations ({irregKeys.length})</span>
        <span className="irregular-card-arrow" aria-hidden="true">
          <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
            <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="irregular-card-body">
          {irregKeys.map(k => (
            <div key={k} className="irregular-card-row">
              <code className="irregular-card-syl">{k}</code>
              <span className="irregular-card-exp">{irregulars[k]}</span>
            </div>
          ))}
        </div>
      )}
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
      const ids = pinyinData[py];
      if (!ids || !ids.length) return;
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      const a = new Audio(mp3Url(ids[0]));
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
    const ids = pinyinData[py];
    if (!ids || !ids.length) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const a = new Audio(mp3Url(ids[0]));
    audioRef.current = a;
    a.play().catch(() => {});
  }, []);

  const isSearching = searchQuery.trim().length > 0;

  const cellKeys = Object.keys(CELLS);
  const totalCells = cellKeys.length;

  const matchCount = useMemo(() => {
    if (!isSearching) return totalCells;
    const q = searchQuery.trim().toLowerCase();
    let count = 0;
    for (const key of cellKeys) {
      const data = CELLS[key];
      if (!data) continue;
      const syl = data.syl;
      if (searchMode === 'syllable' || searchMode === 'both') {
        if (syl.toLowerCase().includes(q)) { count++; continue; }
      }
      if (searchMode === 'pinyin' || searchMode === 'both') {
        if (data.pins && data.pins.some(p => p && p.toLowerCase().includes(q))) { count++; continue; }
      }
    }
    return count;
  }, [searchQuery, searchMode, isSearching, totalCells, cellKeys]);

  return (
    <LayoutGroup>
      <div className="app">
        <header className="header">
          <div className="header-tag">Falafel in Hotpot</div>
          <h1 className="header-title">pinyin chart</h1>
          <p className="header-sub">Tap any syllable to hear its tones</p>
        </header>

        {/* Tab bar */}
        <nav className="tab-bar" role="tablist" aria-label="View mode">
          <button
            className={'tab-btn' + (activeTab === 'chart' ? ' tab-btn--active' : '')}
            role="tab"
            aria-selected={activeTab === 'chart'}
            onClick={() => setActiveTab('chart')}
          >
            Sound Table
          </button>
          <button
            className={'tab-btn' + (activeTab === 'pairs' ? ' tab-btn--active' : '')}
            role="tab"
            aria-selected={activeTab === 'pairs'}
            onClick={() => setActiveTab('pairs')}
          >
            Tone Pairs
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
                <AnimatePresence>
                  <tbody>
                    {INITIALS.map(ini => (
                      <tr key={ini}>
                        <th className="th row-head">{ini}</th>
                        {FINALS.map(fin => {
                          const cellKey = `${ini}|${fin}`;
                          const data = CELLS[cellKey];
                          const syl = data ? data.syl : '';
                          const matchesQuery = !isSearching || (() => {
                            const q = searchQuery.trim().toLowerCase();
                            if (!q) return true;
                            if (searchMode === 'syllable' || searchMode === 'both') {
                              if (syl.toLowerCase().includes(q)) return true;
                            }
                            if (searchMode === 'pinyin' || searchMode === 'both') {
                              if (data && data.pins && data.pins.some(p => p && p.toLowerCase().includes(q))) return true;
                            }
                            return false;
                          })();
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
                </AnimatePresence>
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
                    Matched <strong>{matchCount}</strong> / {totalCells} syllables
                  </motion.div>
                )}
              </AnimatePresence>
              <IrregularCard />
            </div>

            <LearnSection />
          </>
        )}

        {activeTab === 'pairs' && <TonePairBoard />}

        {active && (
          <ToneSheet
            syllable={active.syl}
            pinyins={active.pins}
            onPlay={play}
            onClose={close}
          />
        )}
      </div>
    </LayoutGroup>
  );
}
