import React, { useState, useCallback, useRef, memo } from 'react';
import pinyinData from './pinyins.json';
import syllablesData from './syllables.json';
import syllableToPinyins from './syllableToPinyins.json';
import SearchBar from './SearchBar';
import ClickModeSwitch from './ClickModeSwitch';
import TonePairBoard from './TonePairBoard';
import LearnSection from './LearnSection';
import { FINAL_GROUPS } from './finalsGroups';
import irregulars from './irregulars.json';
import './App.css';

const mp3Url = id =>
  `https://tone.lib.msu.edu/tone/${id}/PROXY_MP3/download`;

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
const SoundCell = memo(function SoundCell({ cellKey, onTap, isDimmed, isIrregular }) {
  const data = CELLS[cellKey];
  if (!data) return <td className="cell cell--empty" />;
  const cls = 'cell-btn' +
    (isDimmed ? ' cell-btn--dimmed' : '') +
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
                onClick={() => onPlay(py)}
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
function IrregularLegend() {
  return (
    <div className="irregular-legend">
      <span className="irregular-legend-dot">⏺</span>
      <span>Irregular pronunciation — tap to learn more</span>
    </div>
  );
}

/* ── App ── */
export default function App() {
  const [active, setActive] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [clickMode, setClickMode] = useState('Show tones');
  const [activeTab, setActiveTab] = useState('chart');
  const audioRef = useRef(null);

  const open = useCallback((syl, pins) => {
    const modeIndex = ['Show tones', 'T1', 'T2', 'T3', 'T4'].indexOf(clickMode);
    if (modeIndex > 0) {
      /* Direct tone play — skip the sheet */
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
    const ids = pinyinData[py];
    if (!ids || !ids.length) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const a = new Audio(mp3Url(ids[0]));
    audioRef.current = a;
    a.play().catch(() => {});
  }, []);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="app">
      <header className="header">
        <div className="header-tag">Mandarin Chinese</div>
        <h1 className="header-title"><span className="header-zh">拼音</span> Sound Table</h1>
        <p className="header-sub">Tap a syllable to hear its tones</p>
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
            <SearchBar value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
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
                      const matchesQuery = !isSearching ||
                        syl.toLowerCase().includes(searchQuery.trim().toLowerCase());
                      const isIrreg = !!irregulars[syl];
                      return (
                        <SoundCell
                          key={fin}
                          cellKey={cellKey}
                          onTap={open}
                          isDimmed={isSearching && !matchesQuery}
                          isIrregular={isIrreg}
                        />
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <IrregularLegend />
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
  );
}
