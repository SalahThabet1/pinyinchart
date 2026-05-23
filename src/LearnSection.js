import React from 'react';
import { motion } from 'framer-motion';
import irregulars from './irregulars.json';
import { FINAL_GROUPS } from './finalsGroups';
import {
  IconMusic, IconPuzzle, IconBook,
  IconTable, IconTarget, IconAlert,
  IconTrending, IconRefresh
} from './icons';
import './LearnSection.css';

/* ── Irregular groupings by phonetic category ── */
const IRREG_GROUPS = [
  {
    label: 'Apical Vowels (舌尖音)',
    desc: 'The letter "i" sounds completely different — no front vowel, just a sustained buzz.',
    keys: ['zi', 'ci', 'si', 'zhi', 'chi', 'shi', 'ri'],
  },
  {
    label: 'Ü Rule — Written "u", Spoken "ü"',
    desc: 'After j, q, x, and y, the letter "u" actually represents the rounded front vowel [y] (like German ü). The umlaut is omitted in writing.',
    keys: ['ju', 'qu', 'xu', 'juan', 'quan', 'xuan', 'jun', 'qun', 'xun', 'jue', 'que', 'xue', 'yuan', 'yue', 'yun'],
  },
  {
    label: 'Vowel Quality Shifts',
    desc: 'The letters "e" and "a" take unexpected values in certain environments.',
    keys: ['ye', 'yan', 'yin', 'ying'],
  },
  {
    label: 'Hidden Glides',
    desc: 'Compound finals conceal an extra vowel that surfaces in careful speech.',
    keys: ['iu', 'ui', 'un'],
  },
  {
    label: 'Labial + "o" → [wo]',
    desc: 'A [w] glide is inserted between labial initials (b, p, m, f) and "o".',
    keys: ['bo', 'po', 'mo', 'fo', 'lo', 'yo'],
  },
  {
    label: 'Eng as [əŋ]',
    desc: 'The "eng" final is pronounced with a schwa [ə], not a front [e].',
    keys: ['beng', 'peng', 'weng', 'yong'],
  },
  {
    label: 'Syllabic Nasals',
    desc: 'Standalone nasal consonants used as interjections — no vowel at all.',
    keys: ['m', 'n', 'ng', 'hm', 'hng'],
  },
  {
    label: 'Rare / Exceptional',
    desc: 'Uncommon syllables that break standard initial-final constraints.',
    keys: ['dia', 'nun', 'bia'],
  },
];

/* ── Section Divider ── */
function SectionSplit({ label }) {
  return (
    <div className="lp-split">
      <span className="lp-split-line" />
      {label && <span className="lp-split-label">{label}</span>}
      <span className="lp-split-line" />
    </div>
  );
}

/* ── Fade-in wrapper for sections ── */
function FadeIn({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/* ── Tone Contour SVG Chart ── */
function ToneChartSVG() {
  const tones = [
    { num: '1st', label: 'high level', color: 'var(--tone-1)', path: 'M20,20 L220,20' },
    { num: '2nd', label: 'rising',     color: 'var(--tone-2)', path: 'M20,60 Q120,20 220,20' },
    { num: '3rd', label: 'dipping',    color: 'var(--tone-3)', path: 'M20,40 Q120,100 220,40' },
    { num: '4th', label: 'falling',    color: 'var(--tone-4)', path: 'M20,20 Q120,60 220,100' },
  ];
  return (
    <div className="tone-chart-wrap">
      <svg viewBox="0 0 240 120" className="tone-chart-svg" aria-label="Tone contour chart">
        {[20, 40, 60, 80, 100].map(y => (
          <line key={y} x1="16" y1={y} x2="224" y2={y} stroke="var(--border-color)" strokeWidth="0.5" opacity="0.4" />
        ))}
        {tones.map((t, i) => (
          <g key={t.num}>
            <motion.path
              d={t.path}
              fill="none"
              stroke={t.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.15 }}
            />
            <circle cx={i < 2 ? 20 : 220} cy={i === 0 ? 20 : i === 1 ? 20 : i === 2 ? 40 : 100} r="3" fill={t.color} />
          </g>
        ))}
      </svg>
      <div className="tone-chart-labels">
        {tones.map(t => (
          <span key={t.num} className="tone-chart-label" style={{ color: t.color }}>
            <span className="tone-chart-dot" style={{ background: t.color }} />
            {t.num} — {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Syllable structure diagram ── */
function SyllableDiagram() {
  return (
    <div className="syllable-diagram">
      <div className="syll-diagram-inner">
        <motion.div
          className="syll-block"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0, duration: 0.3 }}
        >
          <div className="syll-block-label">Initial</div>
          <div className="syll-block-box" style={{ background: 'var(--tone-4)', opacity: 0.9 }}>b</div>
          <div className="syll-block-desc">starting consonant</div>
        </motion.div>
        <motion.span
          className="syll-plus"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >+</motion.span>
        <motion.div
          className="syll-block"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          <div className="syll-block-label">Final</div>
          <div className="syll-block-box" style={{ background: 'var(--tone-2)', opacity: 0.9 }}>a</div>
          <div className="syll-block-desc">vowel / ending</div>
        </motion.div>
        <motion.span
          className="syll-plus"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35 }}
        >+</motion.span>
        <motion.div
          className="syll-block"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <div className="syll-block-label">Tone</div>
          <div className="syll-block-box" style={{ background: 'var(--tone-1)', opacity: 0.9 }}>˥</div>
          <div className="syll-block-desc">pitch contour</div>
        </motion.div>
        <motion.span
          className="syll-eq"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        >
          <span className="syll-eq-box">bā</span>
        </motion.span>
      </div>
    </div>
  );
}

/* ── Finals table ── */
function FinalsTable() {
  return (
    <div className="finals-table-wrap">
      <table className="finals-table">
        <thead>
          <tr>
            <th>Group</th>
            <th>Finals</th>
          </tr>
        </thead>
        <tbody>
          {FINAL_GROUPS.map(g => (
            <tr key={g.label}>
              <td className="ft-group">{g.label}</td>
              <td className="ft-finals">{g.finals.join(' • ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Pronunciation group card ── */
function PronGroup({ icon: IconComp, title, rows }) {
  return (
    <motion.div
      className="pron-group"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
    >
      <div className="pron-group-head">
        {IconComp && <IconComp size={18} />}
        <span className="pron-title">{title}</span>
      </div>
      <div className="pron-group-rows">
        {rows.map(r => (
          <div key={r.code} className="pron-row">
            <code className="pron-code">{r.code}</code>
            <span className="pron-desc">{r.desc}</span>
            {r.aspiration && <span className="pron-asp">{r.aspiration}</span>}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Tone Demo Row ── */
function ToneDemoRow({ mark, num, label, example, meaning, color, delay }) {
  return (
    <motion.div
      className="tone-demo-row"
      style={{ '--tone-color': color }}
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.3 }}
    >
      <span className="tone-demo-mark">{mark}</span>
      <span className="tone-demo-num">{num}</span>
      <span className="tone-demo-label">{label}</span>
      <span className="tone-demo-example">{example}</span>
      <span className="tone-demo-meaning">{meaning}</span>
    </motion.div>
  );
}

/* ── Irregular group display ── */
function IrregularGroup({ group }) {
  return (
    <motion.div
      className="irreg-group-card"
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
    >
      <h4 className="irreg-group-head">{group.label}</h4>
      <p className="irreg-group-desc">{group.desc}</p>
      <div className="irreg-group-rows">
        {group.keys.map(k => (
          <div key={k} className="irreg-row">
            <code className="irreg-syl">{k}</code>
            <span className="irreg-exp">{irregulars[k]}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Main Learn Component ── */
export default function LearnSection() {
  return (
    <div className="learn-page">
      <div className="learn-page-inner">

        {/* ── Header ── */}
        <FadeIn>
          <div className="lp-header">
            <span className="lp-kicker">Guide</span>
            <h2 className="lp-title">Learning Mandarin Pinyin</h2>
            <p className="lp-sub">
              A quick reference to the sounds, tones, and pronunciation rules
              behind Standard Mandarin's romanisation system.
            </p>
          </div>
        </FadeIn>

        <SectionSplit label="Tones &amp; Sounds" />

        {/* ── Tone Contour Chart ── */}
        <FadeIn delay={0.1}>
          <section className="lp-section">
            <h3 className="lp-h">
              <IconMusic size={22} />
              The Four Tones at a Glance
            </h3>
            <p className="lp-body">
              Mandarin uses pitch contours to distinguish word meanings.
              Here's what each tone looks like against the syllable <strong>mā</strong>:
            </p>
            <ToneChartSVG />
          </section>
        </FadeIn>

        <SectionSplit />

        {/* ── Syllable Structure ── */}
        <FadeIn delay={0.15}>
          <section className="lp-section">
            <h3 className="lp-h">
              <IconPuzzle size={22} />
              How a Syllable Is Built
            </h3>
            <p className="lp-body">
              Every Mandarin syllable is composed of three parts:
              an <strong>initial</strong> (consonant start), a <strong>final</strong> (vowel core),
              and a <strong>tone</strong> that gives it meaning.
            </p>
            <SyllableDiagram />
            <p className="lp-caption">
              Example: <code>b</code> (initial) + <code>a</code> (final) + 1st tone = <strong>bā</strong> (八, "eight")
            </p>
          </section>
        </FadeIn>

        <SectionSplit />

        {/* ── Finals Table ── */}
        <FadeIn delay={0.2}>
          <section className="lp-section">
            <h3 className="lp-h">
              <IconTable size={22} />
              Finals by Starting Vowel
            </h3>
            <p className="lp-body">
              The finals (vowel or vowel–consonant endings) group naturally by
              their starting sound. These groups make memorisation easier:
            </p>
            <FinalsTable />
          </section>
        </FadeIn>

        <SectionSplit label="Pronunciation" />

        {/* ── Tricky Sounds ── */}
        <FadeIn delay={0.25}>
          <section className="lp-section">
            <h3 className="lp-h">
              <IconTarget size={22} />
              Tricky Sounds
            </h3>
            <p className="lp-body">
              These three consonant groups give English speakers the most
              trouble. The key difference is <strong>tongue position</strong>:
            </p>
            <div className="pron-groups">
              <PronGroup
                icon={IconBook}
                title="Alveolo-palatal (j / q / x)"
                rows={[
                  { code: 'j', desc: 'unaspirated, like "jeep" with flatter tongue', aspiration: 'no puff' },
                  { code: 'q', desc: 'aspirated, strong puff of air', aspiration: 'strong puff' },
                  { code: 'x', desc: 'like "sheep" with tongue raised to palate', aspiration: '—' },
                ]}
              />
              <PronGroup
                icon={IconBook}
                title="Retroflex (zh / ch / sh / r)"
                rows={[
                  { code: 'zh', desc: 'unaspirated, like "j" with curled tongue', aspiration: 'no puff' },
                  { code: 'ch', desc: 'aspirated, like "church" with curled tongue', aspiration: 'strong puff' },
                  { code: 'sh', desc: 'like "shirt" with curled tongue tip', aspiration: '—' },
                  { code: 'r', desc: 'voiced counterpart of sh, like "rain"', aspiration: '—' },
                ]}
              />
              <PronGroup
                icon={IconBook}
                title="Dental / Flat (z / c / s)"
                rows={[
                  { code: 'z', desc: 'unaspirated, like "dz" in "adze"', aspiration: 'no puff' },
                  { code: 'c', desc: 'aspirated, like "ts" in "cats"', aspiration: 'strong puff' },
                  { code: 's', desc: 'like "s" in "see"', aspiration: '—' },
                ]}
              />
            </div>
          </section>
        </FadeIn>

        <SectionSplit />

        {/* ── Irregular Pronunciations (grouped, no toggle) ── */}
        <FadeIn delay={0.3}>
          <section className="lp-section">
            <h3 className="lp-h">
              <IconAlert size={22} />
              Irregular Pronunciations
            </h3>
            <p className="lp-body">
              Several pinyin syllables don't follow the expected sound rules
              from their spelling. These are grouped by phonetic theme —
              all visible, no toggles.
            </p>
            {IRREG_GROUPS.map(g => (
              <IrregularGroup key={g.label} group={g} />
            ))}
          </section>
        </FadeIn>

        <SectionSplit label="Tone Rules" />

        {/* ── The 4 Tones in Detail ── */}
        <FadeIn delay={0.35}>
          <section className="lp-section">
            <h3 className="lp-h">
              <IconTrending size={22} />
              The 4 Tones in Detail
            </h3>
            <p className="lp-body">
              The same syllable spoken at different pitches means completely
              different things. Here they are with the example <strong>mā</strong>:
            </p>
            <div className="tone-demo">
              {[
                { mark: '\u02c9', num: '1st', label: 'high level', example: 'mā', meaning: 'mother', color: 'var(--tone-1)' },
                { mark: '\u02ca', num: '2nd', label: 'rising', example: 'má', meaning: 'hemp', color: 'var(--tone-2)' },
                { mark: '\u02c7', num: '3rd', label: 'dipping', example: 'mǎ', meaning: 'horse', color: 'var(--tone-3)' },
                { mark: '\u02cb', num: '4th', label: 'falling', example: 'mà', meaning: 'scold', color: 'var(--tone-4)' },
              ].map((t, i) => (
                <ToneDemoRow key={t.num} {...t} delay={i * 0.08} />
              ))}
            </div>
            <p className="lp-body">
              Tap any syllable in the <strong>Sound Table</strong> to hear all four
              tones played aloud. The colour coding matches this guide.
            </p>
            <aside className="lp-callout">
              <IconBook size={16} /> <strong>Tip:</strong> Use the <strong>Tone Sandhi</strong> tab to explore
              two-syllable words. Each cell shows real HSK vocabulary for that
              tone combination — tap to hear the full word.
            </aside>
          </section>
        </FadeIn>

        <SectionSplit />

        {/* ── Tone Sandhi ── */}
        <FadeIn delay={0.4}>
          <section className="lp-section">
            <h3 className="lp-h">
              <IconRefresh size={22} />
              Tone Sandhi
            </h3>
            <p className="lp-body">
              In natural speech, tones shift depending on neighbouring syllables.
              The most common change — <strong>third tone sandhi</strong> — turns
              3-3 into 2-3:
            </p>
            <div className="sandhi-demo">
              <motion.div
                className="sandhi-cell"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0, duration: 0.3 }}
              >
                <div className="sandhi-cell-tone" style={{ color: 'var(--tone-3)' }}>3</div>
                <div className="sandhi-cell-char">nǐ</div>
              </motion.div>
              <motion.span
                className="sandhi-arrow"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >+</motion.span>
              <motion.div
                className="sandhi-cell"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <div className="sandhi-cell-tone" style={{ color: 'var(--tone-3)' }}>3</div>
                <div className="sandhi-cell-char">hǎo</div>
              </motion.div>
              <motion.span
                className="sandhi-arrow"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35 }}
              >→</motion.span>
              <motion.div
                className="sandhi-cell sandhi-cell--result"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <div className="sandhi-cell-tone" style={{ color: 'var(--tone-2)' }}>2</div>
                <div className="sandhi-cell-char">ní</div>
              </motion.div>
              <motion.span
                className="sandhi-arrow"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.45 }}
              >+</motion.span>
              <motion.div
                className="sandhi-cell sandhi-cell--result"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <div className="sandhi-cell-tone" style={{ color: 'var(--tone-3)' }}>3</div>
                <div className="sandhi-cell-char">hǎo</div>
              </motion.div>
            </div>
            <p className="lp-caption">
              nǐ hǎo (你好) → <strong>ní hǎo</strong> — "hello"
            </p>
            <table className="sandhi-table">
              <thead>
                <tr>
                  <th>Pattern</th>
                  <th>Result</th>
                  <th>Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="tone-tag t3">3</span> + <span className="tone-tag t3">3</span></td>
                  <td><span className="tone-tag t2">2</span> + <span className="tone-tag t3">3</span></td>
                  <td>nǐ hǎo → <strong>ní hǎo</strong></td>
                </tr>
                <tr>
                  <td><span className="tone-tag t1">1</span> + any</td>
                  <td>no change</td>
                  <td>—</td>
                </tr>
                <tr>
                  <td><span className="tone-tag t4">4</span> + <span className="tone-tag t4">4</span></td>
                  <td>first 4 becomes ~2 (half falling)</td>
                  <td>dà jiā → dà~jiā</td>
                </tr>
              </tbody>
            </table>
          </section>
        </FadeIn>

        {/* ── Footer ── */}
        <FadeIn delay={0.45}>
          <div className="lp-footer">
            <p>
              <strong>Falafel in Hotpot</strong> — Pinyin Chart v2 &middot;
              Audio by <a href="https://github.com/hugolpz/audio-cmn" target="_blank" rel="noopener noreferrer">Hugo (Chen Wang / Yue Tan)</a> (CC-BY-SA)
              &middot; Words from HSK 2012 &middot; Dictionary data from <a href="https://cc-cedict.org" target="_blank" rel="noopener noreferrer">CC-CEDICT</a> (CC-BY-SA 4.0)
            </p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
