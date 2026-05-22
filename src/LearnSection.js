import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import irregulars from './irregulars.json';
import { FINAL_GROUPS } from './finalsGroups';
import './LearnSection.css';

/* ── Collapsible section card ── */
function Section({ title, children, open, onToggle }) {
  return (
    <motion.div
      className={`learn-card ${open ? 'learn-card--open' : ''}`}
      layout
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.button
        className="learn-card-head"
        onClick={onToggle}
        aria-expanded={open}
        whileTap={{ scale: 0.99 }}
      >
        <span className="learn-card-title">{title}</span>
        <motion.span
          className="learn-card-arrow"
          aria-hidden="true"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.span>
      </motion.button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="learn-card-body"
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="learn-card-content">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Irregular syllable row ── */
function IrregularRow({ syl, explanation }) {
  return (
    <motion.div
      className="irreg-row"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <code className="irreg-syl">{syl}</code>
      <span className="irreg-exp">{explanation}</span>
    </motion.div>
  );
}

/* ── Finals group badge ── */
function GroupBadge({ group }) {
  return (
    <motion.span
      className="group-badge"
      whileHover={{ scale: 1.04, borderColor: 'rgba(196, 168, 130, 0.4)' }}
      transition={{ duration: 0.15 }}
    >
      <span className="group-badge-label">{group.label}</span>
      <span className="group-badge-finals">
        {group.finals.join(' · ')}
      </span>
    </motion.span>
  );
}

/* ── LearnSection ── */
export default function LearnSection() {
  const [openIdx, setOpenIdx] = useState(null);

  const toggle = useCallback(
    idx => setOpenIdx(prev => (prev === idx ? null : idx)),
    []
  );

  /* Collect irregular keys for Tricky Sounds section */
  const irregKeys = Object.keys(irregulars);

  return (
    <section className="learn" id="learn-section">
      <div className="learn-inner">
        <motion.h2
          className="learn-heading"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          Learn
        </motion.h2>

        {/* ─── Section 1: What is Pinyin? ─── */}
        <Section
          title="What is Pinyin?"
          open={openIdx === 0}
          onToggle={() => toggle(0)}
        >
          <p>
            <strong>Pinyin</strong> is the official romanization system for
            Standard Mandarin Chinese. It uses the Latin alphabet to represent
            Chinese sounds, making pronunciation accessible to learners.
          </p>
          <p>
            Each syllable is built from an <strong>initial</strong> (the
            starting consonant) and a <strong>final</strong> (the vowel or
            vowel–consonant combination), plus one of{' '}
            <strong>four tones</strong> that distinguish meaning.
          </p>
          <p>
            The table above maps every valid initial–final combination in
            Standard Mandarin, giving you the exact pinyin spelling for each
            sound.
          </p>

          <h4 className="learn-subheading">Finals by Starting Vowel</h4>
          <p className="learn-caption">
            The final repertoire is grouped by its initial vowel sound,
            which helps with memorisation:
          </p>
          <div className="group-list">
            {FINAL_GROUPS.map(g => (
              <GroupBadge key={g.label} group={g} />
            ))}
          </div>
        </Section>

        {/* ─── Section 2: Tricky Sounds ─── */}
        <Section
          title="Tricky Sounds"
          open={openIdx === 1}
          onToggle={() => toggle(1)}
        >
          <h4 className="learn-subheading">j / q / x — Alveolo-palatal</h4>
          <p>
            Place the <strong>middle of your tongue</strong> against the hard
            palate (the dome behind your upper teeth). The tongue tip stays
            <strong> down behind the lower teeth</strong> — this is the key
            difference from zh/ch/sh.
          </p>
          <ul className="learn-list">
            <li>
              <code>j</code> — unaspirated, like English “jeep” but
              with a flatter tongue
            </li>
            <li>
              <code>q</code> — aspirated, a strong puff of air accompanies the
              sound
            </li>
            <li>
              <code>x</code> — like English “sheep” but with the
              tongue body raised high toward the palate
            </li>
          </ul>

          <h4 className="learn-subheading">zh / ch / sh / r — Retroflex</h4>
          <p>
            <strong>Curl the tip of your tongue backward</strong> toward the
            front of the hard palate. This gives a thick, “American
            r”-like quality. The tongue does <em>not</em> touch the
            alveolar ridge (unlike z/c/s).
          </p>
          <ul className="learn-list">
            <li>
              <code>zh</code> — unaspirated, like “j” in
              “jungle” with curled tongue
            </li>
            <li>
              <code>ch</code> — aspirated, like “ch” in
              “church” with curled tongue
            </li>
            <li>
              <code>sh</code> — like “sh” in “shirt”
              with curled tongue
            </li>
            <li>
              <code>r</code> — the voiced counterpart of{' '}
              <code>sh</code>, similar to the “r” in
              “rain”
            </li>
          </ul>

          <h4 className="learn-subheading">z / c / s — Dental (flat)</h4>
          <p>
            The tongue tip touches the <strong>back of the upper teeth</strong>{' '}
            or the alveolar ridge. The tongue stays flat — no curling.
          </p>
          <ul className="learn-list">
            <li>
              <code>z</code> — unaspirated, like “dz” in
              “adze”
            </li>
            <li>
              <code>c</code> — aspirated, like “ts” in
              “cats”
            </li>
            <li>
              <code>s</code> — like “s” in “see”
            </li>
          </ul>

          <h4 className="learn-subheading">Irregular Pronunciations</h4>
          <p>
            Several pinyin syllables deviate from their expected sound. Here
            are the most important ones to be aware of:
          </p>
          <div className="irreg-list">
            {irregKeys.slice(0, 20).map(k => (
              <IrregularRow key={k} syl={k} explanation={irregulars[k]} />
            ))}
          </div>
          {irregKeys.length > 20 && (
            <details className="irreg-more">
              <summary className="irreg-more-summary">
                Show {irregKeys.length - 20} more
              </summary>
              <div className="irreg-list">
                {irregKeys.slice(20).map(k => (
                  <IrregularRow key={k} syl={k} explanation={irregulars[k]} />
                ))}
              </div>
            </details>
          )}
        </Section>

        {/* ─── Section 3: The 4 Tones ─── */}
        <Section
          title="The 4 Tones"
          open={openIdx === 2}
          onToggle={() => toggle(2)}
        >
          <p>
            Mandarin is a tonal language — the same syllable spoken with
            different pitch contours conveys entirely different meanings. There
            are four main tones, plus a neutral tone.
          </p>

          <div className="tone-demo">
            {[
              { mark: '\u02c9', num: '1st', label: 'high level', example: 'mā', meaning: 'mother', color: 'var(--tone-1)' },
              { mark: '\u02ca', num: '2nd', label: 'rising', example: 'má', meaning: 'hemp', color: 'var(--tone-2)' },
              { mark: '\u02c7', num: '3rd', label: 'dipping', example: 'mǎ', meaning: 'horse', color: 'var(--tone-3)' },
              { mark: '\u02cb', num: '4th', label: 'falling', example: 'mà', meaning: 'scold', color: 'var(--tone-4)' },
            ].map((tone, i) => (
              <motion.div
                key={tone.num}
                className="tone-demo-row"
                style={{ '--tone-color': tone.color }}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
              >
                <span className="tone-demo-mark">{tone.mark}</span>
                <span className="tone-demo-num">{tone.num}</span>
                <span className="tone-demo-label">{tone.label}</span>
                <span className="tone-demo-example">{tone.example}</span>
                <span className="tone-demo-meaning">{tone.meaning}</span>
              </motion.div>
            ))}
          </div>

          <p>
            Tap any syllable in the table to hear its four tones played aloud.
            The tone colours in the popup match the indicators above.
          </p>

          <h4 className="learn-subheading">Tone Sandhi</h4>
          <p>
            In natural speech, tones change depending on context. The most
            common shift is the <strong>third tone sandhi</strong>: when two
            3rd-tone syllables appear together (e.g. nǐ hǎo), the first one
            is pronounced as a 2nd tone (ní hǎo).
          </p>
        </Section>
      </div>
    </section>
  );
}
