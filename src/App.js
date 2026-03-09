import React, { useState, useCallback, useRef, memo } from 'react';
import pinyinData from './pinyins.json';
import syllablesData from './syllables.json';
import syllableToPinyins from './syllableToPinyins.json';
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
const FINALS = [
  'i','a','e','ê','ai','ei','ao','ou','an','en','ang','eng',
  'er','ia','io','ie','iai','iao','iu','ian','in','iang','ing',
  'u','ua','uo','uai','ui','uan','un','uang','ong','ü','üe',
  'üan','ün','iong',
];

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
const SoundCell = memo(function SoundCell({ cellKey, onTap }) {
  const data = CELLS[cellKey];
  if (!data) return <td className="cell cell--empty" />;
  return (
    <td className="cell">
      <button className="cell-btn" onClick={() => onTap(data.syl, data.pins)}>
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

/* ── App ── */
export default function App() {
  const [active, setActive] = useState(null);
  const audioRef = useRef(null);

  const open = useCallback((syl, pins) => setActive({ syl, pins }), []);
  const close = useCallback(() => setActive(null), []);

  const play = useCallback(py => {
    const ids = pinyinData[py];
    if (!ids || !ids.length) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const a = new Audio(mp3Url(ids[Math.floor(Math.random() * ids.length)]));
    audioRef.current = a;
    a.play().catch(() => {});
  }, []);

  return (
    <div className="app">
      <header className="header">
        <div className="header-tag">Mandarin Chinese</div>
        <h1 className="header-title"><span className="header-zh">拼音</span> Sound Table</h1>
        <p className="header-sub">Tap a syllable to hear its tones</p>
      </header>

      <div className="table-wrap">
        <table className="sound-table">
          <thead>
            <tr>
              <th className="th corner" />
              {FINALS.map(f => (
                <th key={f} className="th col-head">{f}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {INITIALS.map(ini => (
              <tr key={ini}>
                <th className="th row-head">{ini}</th>
                {FINALS.map(fin => (
                  <SoundCell key={fin} cellKey={`${ini}|${fin}`} onTap={open} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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
