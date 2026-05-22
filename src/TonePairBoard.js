import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import pinyinData from './pinyins.json';
import tonePairWords from './tonePairWords.json';
import { IconPlay, IconSpeaker } from './icons';
import './TonePairBoard.css';

/* ===== Constants ===== */
const mp3Url = id =>
  `https://tone.lib.msu.edu/tone/${id}/PROXY_MP3/download`;

const TONE_COLORS = ['var(--tone-1)', 'var(--tone-2)', 'var(--tone-3)', 'var(--tone-4)'];
const TONE_LABELS = ['1st', '2nd', '3rd', '4th'];
const TONE_NUMBERS = [1, 2, 3, 4];

/* Light haptic feedback */
function hapticFeedback() {
  try { if (navigator.vibrate) navigator.vibrate(10); } catch (_) {}
}

/* Get audio ID for a pinyin syllable */
function getAudioId(py) {
  const ids = pinyinData[py];
  if (!ids || !ids.length) return null;
  return ids[0]; // consistent voice
}

/* Play a sequence of syllables with configurable gap */
async function playSyllableSequence(syllables, audioRef, gapMs = 200) {
  for (let i = 0; i < syllables.length; i++) {
    const id = getAudioId(syllables[i]);
    if (!id) continue;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const a = new Audio(mp3Url(id));
    audioRef.current = a;
    await new Promise(resolve => {
      a.onended = resolve;
      a.onerror = resolve;
      a.play().catch(resolve);
    });
    if (i < syllables.length - 1) {
      await new Promise(r => setTimeout(r, gapMs));
    }
  }
}

/* ===== Single Tone Pair Cell ===== */
function TonePairCell({ rowTone, colTone, pairKey }) {
  const [wordIdx, setWordIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const words = tonePairWords[pairKey] || [];
  const word = words[wordIdx];
  const isSandhi = rowTone === 3 && colTone === 3;

  const handlePlay = useCallback(async () => {
    if (!word || playing) return;
    hapticFeedback();
    setPlaying(true);
    await playSyllableSequence(word.syllables, audioRef, 150);
    setPlaying(false);
  }, [word, playing]);

  useEffect(() => () => { if (audioRef.current) audioRef.current.pause(); }, []);

  const cycleWord = useCallback((dir) => {
    setWordIdx(prev => {
      const next = prev + dir;
      if (next < 0) return words.length - 1;
      if (next >= words.length) return 0;
      return next;
    });
  }, [words.length]);

  if (!word) return null;

  return (
    <motion.div
      className={`tp-cell${isSandhi ? ' tp-cell--sandhi' : ''}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Tone pair label */}
      <div className="tp-cell-label" style={{ '--tc1': TONE_COLORS[rowTone - 1], '--tc2': TONE_COLORS[colTone - 1] }}>
        <span className="tp-cell-label-num">{rowTone}</span>
        <span className="tp-cell-label-sep">-</span>
        <span className="tp-cell-label-num">{colTone}</span>
      </div>

      {/* Word display */}
      <div className="tp-cell-word">
        <div className="tp-cell-chars">{word.chars}</div>
        <div className="tp-cell-pinyin">{word.pinyin}</div>
        <div className="tp-cell-trans">{word.translation}</div>
      </div>

      {/* Sandhi note */}
      {isSandhi && (
        <div className="tp-cell-sandhi">
          <span className="tp-sandhi-badge">sandhi: {rowTone}→2</span>
        </div>
      )}

      {/* Controls */}
      <div className="tp-cell-controls">
        <button
          className={`tp-cell-btn tp-cell-btn--play${playing ? ' tp-cell-btn--playing' : ''}`}
          onClick={handlePlay}
          disabled={playing}
          aria-label={`Play ${word.chars}`}
        >
          {playing ? <IconSpeaker size={12} /> : <IconPlay size={12} />}
        </button>
        <div className="tp-cell-nav">
          <button className="tp-cell-btn tp-cell-btn--nav" onClick={() => cycleWord(-1)} aria-label="Previous word">‹</button>
          <span className="tp-cell-counter">{wordIdx + 1}/{words.length}</span>
          <button className="tp-cell-btn tp-cell-btn--nav" onClick={() => cycleWord(1)} aria-label="Next word">›</button>
        </div>
      </div>
    </motion.div>
  );
}

/* ===== Tone Pair Board — 4×4 Grid ===== */
export default function TonePairBoard() {
  return (
    <motion.div
      className="tp-board"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="tp-head">
        <motion.h2
          className="tp-title"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.2 }}
        >
          Tone Pairs
        </motion.h2>
        <motion.p
          className="tp-sub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
        >
          Practice two-syllable tone combinations — click cells to hear
        </motion.p>
      </div>

      {/* 4×4 Grid */}
      <div className="tp-grid">
        {/* Header row */}
        <div className="tp-grid-corner"></div>
        {TONE_NUMBERS.map(t => (
          <div key={`col-${t}`} className="tp-grid-header" style={{ '--hc': TONE_COLORS[t - 1] }}>
            <span className="tp-grid-header-label">{TONE_LABELS[t - 1]}</span>
            <span className="tp-grid-header-icon">↑</span>
          </div>
        ))}

        {/* Data rows */}
        {TONE_NUMBERS.map(rowTone => (
          <React.Fragment key={`row-${rowTone}`}>
            {/* Row header */}
            <div className="tp-grid-row-header" style={{ '--hc': TONE_COLORS[rowTone - 1] }}>
              <span className="tp-grid-header-icon">→</span>
              <span className="tp-grid-header-label">{TONE_LABELS[rowTone - 1]}</span>
            </div>
            {/* Cells */}
            {TONE_NUMBERS.map(colTone => {
              const pairKey = `${rowTone}-${colTone}`;
              return (
                <TonePairCell
                  key={pairKey}
                  rowTone={rowTone}
                  colTone={colTone}
                  pairKey={pairKey}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Legend */}
      <div className="tp-legend">
        <span className="tp-legend-item">
          <span className="tp-legend-dot" style={{ background: 'var(--tone-1)' }}></span> 1st (flat)
        </span>
        <span className="tp-legend-item">
          <span className="tp-legend-dot" style={{ background: 'var(--tone-2)' }}></span> 2nd (rising)
        </span>
        <span className="tp-legend-item">
          <span className="tp-legend-dot" style={{ background: 'var(--tone-3)' }}></span> 3rd (dip)
        </span>
        <span className="tp-legend-item">
          <span className="tp-legend-dot" style={{ background: 'var(--tone-4)' }}></span> 4th (falling)
        </span>
        <span className="tp-legend-item tp-legend-sandhi">
          ⚡ 3-3 sandhi: first tone → 2nd
        </span>
      </div>
    </motion.div>
  );
}
