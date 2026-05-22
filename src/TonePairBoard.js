import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import pinyinData from './pinyins.json';
import syllablesData from './syllables.json';
import syllableToPinyins from './syllableToPinyins.json';
import { IconDice, IconPlay, IconSpeaker, IconClose } from './icons';
import './TonePairBoard.css';

/* ===== Constants ===== */
const mp3Url = id =>
  `https://tone.lib.msu.edu/tone/${id}/PROXY_MP3/download`;

const TONE_DISPLAY_ORDER = [2, 1, 3, 0]; // data[2]=1st, data[1]=2nd, data[3]=3rd, data[0]=4th
const TONE_COLORS = ['var(--tone-1)', 'var(--tone-2)', 'var(--tone-3)', 'var(--tone-4)'];
const MAX_RECENT = 5;

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

/* ===== Pre-compute all valid syllables at module load ===== */
const ALL_SYLLABLES = (() => {
  const list = [];
  for (const ini of INITIALS) {
    for (const fin of FINALS) {
      const row = syllablesData[ini];
      if (!row) continue;
      const syl = row[fin];
      if (!syl) continue;
      const pins = syllableToPinyins[syl];
      if (pins && pins.length) list.push({ syl, pins });
    }
  }
  return list;
})();

/* ===== Play a single pinyin audio, resolves when done ===== */
function playPromise(py, audioRef) {
  return new Promise((resolve) => {
    const ids = pinyinData[py];
    if (!ids || !ids.length) { resolve(); return; }
    if (audioRef.current) { audioRef.current.pause(); }
    const a = new Audio(mp3Url(ids[Math.floor(Math.random() * ids.length)]));
    audioRef.current = a;
    a.onended = resolve;
    a.play().catch(() => resolve());
  });
}

/* ===== Slot View ===== */
function SlotView({ slot, placeholder, onClear, onTonePlay }) {
  if (!slot) {
    return (
      <motion.div
        className="tp-slot tp-slot--empty"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <span className="tp-placeholder">{placeholder}</span>
        <span className="tp-hint">Tap a cell in the chart</span>
      </motion.div>
    );
  }

  const { syl, pins } = slot;

  return (
    <motion.div
      className="tp-slot"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="tp-slot-head">
        <motion.span
          className="tp-syl"
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05, duration: 0.15 }}
        >
          {syl}
        </motion.span>
        <motion.button
          className="tp-clear"
          onClick={onClear}
          aria-label="Clear slot"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
        >
          <IconClose size={10} />
        </motion.button>
      </div>
      <div className="tp-tones">
        {TONE_DISPLAY_ORDER.map((dataIdx, displayIdx) => {
          const py = pins[dataIdx];
          if (!py) return null;
          return (
            <motion.button
              key={py}
              className="tp-tone"
              style={{ '--c': TONE_COLORS[displayIdx] }}
              onClick={() => onTonePlay(py)}
              title={`Play ${py} (tone ${displayIdx + 1})`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * displayIdx + 0.08, duration: 0.15 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
            >
              <span className="tp-tone-num">{displayIdx + 1}</span>
              <span className="tp-tone-py">{py}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ===== Recent Pair Row ===== */
function RecentRow({ pair, index, onSelect }) {
  const s1 = pair.slot1 ? pair.slot1.syl : '—';
  const s2 = pair.slot2 ? pair.slot2.syl : '—';
  return (
    <motion.button
      className="tp-recent-row"
      onClick={() => onSelect(pair)}
      title={`Load ${s1} + ${s2}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      layout
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="tp-recent-idx">{index}</span>
      <span className="tp-recent-syls">{s1}</span>
      <span className="tp-recent-plus">+</span>
      <span className="tp-recent-syls">{s2}</span>
    </motion.button>
  );
}

/* ===== Tone Pair Board ===== */
export default function TonePairBoard() {
  const [slot1, setSlot1] = useState(null);
  const [slot2, setSlot2] = useState(null);
  const [recent, setRecent] = useState([]);
  const [playingBoth, setPlayingBoth] = useState(false);
  const audioRef = useRef(null);

  /* Cleanup audio on unmount */
  useEffect(() => () => { if (audioRef.current) audioRef.current.pause(); }, []);

  /* Play a single tone */
  const playTone = useCallback((py) => {
    const ids = pinyinData[py];
    if (!ids || !ids.length) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const a = new Audio(mp3Url(ids[Math.floor(Math.random() * ids.length)]));
    audioRef.current = a;
    a.play().catch(() => {});
  }, []);

  /* Play both slots sequentially */
  const playBoth = useCallback(async () => {
    if (!slot1 && !slot2) return;
    setPlayingBoth(true);

    const pickPy = (pins) => pins[TONE_DISPLAY_ORDER[0]] || pins[TONE_DISPLAY_ORDER.find(i => pins[i])];

    if (slot1) { const py = pickPy(slot1.pins); if (py) await playPromise(py, audioRef); }
    if (slot2) { const py = pickPy(slot2.pins); if (py) await playPromise(py, audioRef); }

    setPlayingBoth(false);
  }, [slot1, slot2]);

  /* Random pair */
  const randomPair = useCallback(() => {
    if (ALL_SYLLABLES.length < 2) return;
    const i1 = Math.floor(Math.random() * ALL_SYLLABLES.length);
    let i2;
    do { i2 = Math.floor(Math.random() * ALL_SYLLABLES.length); } while (i2 === i1);
    const s1 = ALL_SYLLABLES[i1];
    const s2 = ALL_SYLLABLES[i2];
    setSlot1(s1);
    setSlot2(s2);
    setRecent(prev => {
      const pair = { slot1: s1, slot2: s2 };
      return [pair, ...prev.filter(
        r => r.slot1?.syl !== s1.syl && r.slot2?.syl !== s2.syl
      )].slice(0, MAX_RECENT);
    });
  }, []);

  /* Recall a recent pair */
  const recallPair = useCallback((pair) => {
    setSlot1(pair.slot1 || null);
    setSlot2(pair.slot2 || null);
  }, []);

  /* Auto-add to recent when both slots are filled */
  useEffect(() => {
    if (!slot1 || !slot2) return;
    setRecent(prev => {
      const exists = prev.some(r =>
        r.slot1?.syl === slot1.syl && r.slot2?.syl === slot2.syl
      );
      if (exists) return prev;
      return [{ slot1, slot2 }, ...prev].slice(0, MAX_RECENT);
    });
  }, [slot1, slot2]);

  /* Fill a slot from an external call (chart click) */
  const fillFromChart = useCallback((syl, pins) => {
    const entry = { syl, pins };
    if (!slot1) {
      setSlot1(entry);
    } else if (!slot2) {
      setSlot2(entry);
    } else {
      /* Both filled — replace slot1, demote to slot2 */
      setSlot2(slot1);
      setSlot1(entry);
    }
  }, [slot1, slot2]);

  /* Expose fillFromChart globally so App.js can call it */
  useEffect(() => {
    window.__fillTonePairSlot = fillFromChart;
    return () => { delete window.__fillTonePairSlot; };
  }, [fillFromChart]);

  const hasBoth = !!(slot1 && slot2);

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
          Practice two-syllable tone combinations
        </motion.p>
      </div>

      {/* Slots */}
      <div className="tp-slots-row">
        <SlotView
          slot={slot1}
          placeholder="Slot 1"
          onClear={() => setSlot1(null)}
          onTonePlay={playTone}
        />
        <span className="tp-plus">+</span>
        <SlotView
          slot={slot2}
          placeholder="Slot 2"
          onClear={() => setSlot2(null)}
          onTonePlay={playTone}
        />
      </div>

      {/* Controls */}
      <div className="tp-actions">
        <motion.button
          className="tp-btn tp-btn--rand"
          onClick={randomPair}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <IconDice size={14} /> Random Pair
        </motion.button>
        <motion.button
          className={`tp-btn tp-btn--play${!hasBoth ? ' tp-btn--muted' : ''}${playingBoth ? ' tp-btn--playing' : ''}`}
          onClick={playBoth}
          disabled={!hasBoth}
          whileHover={hasBoth ? { scale: 1.02 } : {}}
          whileTap={hasBoth ? { scale: 0.97 } : {}}
          animate={playingBoth ? { scale: [1, 1.03, 1] } : { scale: 1 }}
          transition={playingBoth ? { duration: 0.8, repeat: Infinity } : {}}
        >
          {playingBoth ? <><IconSpeaker size={14} /> Playing…</> : <><IconPlay size={14} /> Play Both</>}
        </motion.button>
      </div>

      {/* Recent pairs */}
      <AnimatePresence mode="popLayout">
        {recent.length > 0 && (
          <motion.div
            className="tp-recent"
            key="recent-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <span className="tp-recent-title">Recent pairs</span>
            <div className="tp-recent-list">
              <AnimatePresence mode="popLayout">
                {recent.map((pair, i) => (
                  <RecentRow
                    key={`${pair.slot1?.syl}-${pair.slot2?.syl}`}
                    pair={pair}
                    index={i + 1}
                    onSelect={recallPair}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
