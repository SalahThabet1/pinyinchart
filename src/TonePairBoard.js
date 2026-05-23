import React, { useState, useCallback, useRef, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import tonePairWords from './tonePairWords.json';
import wordsWithAudio from './wordsWithAudio.json';
import { IconPlay, IconSpeaker } from './icons';
import { colorPinyin } from './pinyinColor';
import './TonePairBoard.css';

/* ── Constants ── */
const TONE_COLORS = ['var(--tone-1)', 'var(--tone-2)', 'var(--tone-3)', 'var(--tone-4)'];
const TONE_LABELS = ['1st', '2nd', '3rd', '4th'];
const ROW_TONES = [1, 2, 3, 4];
const COL_TONES = [1, 2, 3, 4, 5]; // 5 = neutral (轻声)

function hapticFeedback() {
  try { if (navigator.vibrate) navigator.vibrate(10); } catch (_) {}
}

/* ── Word Popup ── */
function WordPopup({ pairKey, words, onClose }) {
  const [playingIdx, setPlayingIdx] = useState(null);
  const audioRef = useRef(null);
  const [rowTone, colTone] = pairKey.split('-').map(Number);
  const colLabel = colTone === 5 ? '∅' : TONE_LABELS[colTone - 1];

  const handlePlay = useCallback((idx, word) => {
    hapticFeedback();
    if (playingIdx === idx) {
      if (audioRef.current) { audioRef.current.pause(); }
      setPlayingIdx(null);
      return;
    }
    setPlayingIdx(idx);

    const wordSrc = `${process.env.PUBLIC_URL || ''}/audio/${word.chars}.mp3`;
    if (audioRef.current) audioRef.current.pause();
    const a = new Audio(wordSrc);
    audioRef.current = a;
    a.onended = () => setPlayingIdx(null);
    a.onerror = () => setPlayingIdx(null);
    a.play().catch(() => setPlayingIdx(null));
  }, [playingIdx]);

  return (
    <div className="tpop-overlay" onClick={onClose}>
      <motion.div
        className="tpop-modal"
        role="dialog"
        aria-label={`Tone pair ${rowTone}-${colTone}`}
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {/* Header */}
        <div className="tpop-header">
          <div className="tpop-title-area">
            <span className="tpop-pair">
              <span className="tpop-tone-num" style={{ color: TONE_COLORS[rowTone - 1] }}>{rowTone}</span>
              <span className="tpop-sep">-</span>
              <span className="tpop-tone-num" style={{ color: colTone === 5 ? 'var(--text-secondary)' : TONE_COLORS[colTone - 1] }}>{colLabel}</span>
            </span>
            <span className="tpop-title-label">{words.length} word{words.length !== 1 ? 's' : ''}</span>
          </div>
          <button className="tpop-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Word list */}
        <div className="tpop-list">
          {words.map((w, i) => (
            <motion.div
              key={w.chars}
              className="tpop-word"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.035, duration: 0.15 }}
            >
              <div className="tpop-word-main">
                <div className="tpop-word-left">
                  <span className="tpop-chars">{w.chars}</span>
                  <span className="tpop-pinyin">{colorPinyin(w.pinyin)}</span>
                  {w.translation && (
                    <span className="tpop-trans">{w.translation}</span>
                  )}
                </div>
                <button
                  className={`tpop-play ${playingIdx === i ? 'tpop-play--active' : ''}`}
                  onClick={() => handlePlay(i, w)}
                  aria-label={`Play ${w.chars}`}
                >
                  {playingIdx === i ? <IconSpeaker size={16} /> : <IconPlay size={16} />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ── Single Grid Cell ── */
function TonePairCell({ rowTone, colTone, pairKey, words, onClick }) {
  const wordCount = words.length;
  const isNeutral = colTone === 5;

  return (
    <motion.button
      className={`tp-cell${pairKey === '3-3' ? ' tp-cell--sandhi' : ''}`}
      onClick={() => onClick(pairKey)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.12 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
    >
      <div className="tp-cell-label" style={{
        '--tc1': TONE_COLORS[rowTone - 1],
        '--tc2': isNeutral ? 'var(--text-secondary)' : TONE_COLORS[colTone - 1]
      }}>
        <span className="tp-cell-label-num">{rowTone}</span>
        <span className="tp-cell-label-sep">-</span>
        <span className="tp-cell-label-num">{isNeutral ? '∅' : colTone}</span>
      </div>
      {pairKey === '3-3' && <div className="tp-cell-badge">sandhi</div>}
      <div className="tp-cell-count">{wordCount}</div>
    </motion.button>
  );
}

/* ── Main Board ── */
export default function TonePairBoard() {
  const [popupPair, setPopupPair] = useState(null);

  const openPopup = useCallback((pairKey) => {
    hapticFeedback();
    setPopupPair(pairKey);
  }, []);

  const closePopup = useCallback(() => setPopupPair(null), []);

  const activeWords = popupPair
    ? (tonePairWords[popupPair] || []).filter(w => wordsWithAudio[w.chars]).slice(0, 8)
    : [];

  return (
    <div className="tp-wrapper">
      <div className="tp-scroll-container">
      <motion.div
        className="tp-board"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="tp-head">
          <h2 className="tp-title">Tone Sandhi</h2>
          <p className="tp-sub">
            Two-syllable tone combos — tap a cell to explore words
          </p>
        </div>

        {/* 4×5 Grid */}
        <div className="tp-grid">
          <div className="tp-grid-corner" />

          {COL_TONES.map(t => (
            <div
              key={`col-${t}`}
              className="tp-grid-header"
              style={{ '--hc': t === 5 ? 'var(--text-secondary)' : TONE_COLORS[t - 1] }}
            >
              <span className="tp-grid-header-icon">{t === 5 ? '∅' : '↑'}</span>
              <span className="tp-grid-header-label">{t === 5 ? 'neutral' : TONE_LABELS[t - 1]}</span>
            </div>
          ))}

          {ROW_TONES.map(rowTone => (
            <Fragment key={`row-${rowTone}`}>
              <div className="tp-grid-row-header" style={{ '--hc': TONE_COLORS[rowTone - 1] }}>
                <span className="tp-grid-header-icon">→</span>
                <span className="tp-grid-header-label">{TONE_LABELS[rowTone - 1]}</span>
              </div>
              {COL_TONES.map(colTone => {
                const pairKey = `${rowTone}-${colTone}`;
                const words = tonePairWords[pairKey] || [];
                const audioWords = words.filter(w => wordsWithAudio[w.chars]);
                return (
                  <TonePairCell
                    key={pairKey}
                    rowTone={rowTone}
                    colTone={colTone}
                    pairKey={pairKey}
                    words={audioWords}
                    onClick={openPopup}
                  />
                );
              })}
            </Fragment>
          ))}
        </div>

        {/* Legend */}
        <div className="tp-legend">
          <span className="tp-legend-item">
            <span className="tp-legend-dot" style={{ background: 'var(--tone-1)' }} /> 1st
          </span>
          <span className="tp-legend-item">
            <span className="tp-legend-dot" style={{ background: 'var(--tone-2)' }} /> 2nd
          </span>
          <span className="tp-legend-item">
            <span className="tp-legend-dot" style={{ background: 'var(--tone-3)' }} /> 3rd
          </span>
          <span className="tp-legend-item">
            <span className="tp-legend-dot" style={{ background: 'var(--tone-4)' }} /> 4th
          </span>
          <span className="tp-legend-item">
            <span className="tp-legend-dot" style={{ background: 'var(--tone-neutral)' }} /> ∅ neutral
          </span>
          <span className="tp-legend-item tp-legend-sandhi">⚡ 3-3 sandhi</span>
        </div>
      </motion.div>
      </div>

      <AnimatePresence>
        {popupPair && (
          <WordPopup
            pairKey={popupPair}
            words={activeWords}
            onClose={closePopup}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
