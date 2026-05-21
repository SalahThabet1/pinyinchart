import React, { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import './ClickModeSwitch.css';

const MODES = [
  { value: 'Show tones', label: 'Show tones' },
  { value: 'T1', label: 'T1' },
  { value: 'T2', label: 'T2' },
  { value: 'T3', label: 'T3' },
  { value: 'T4', label: 'T4' },
];

const TONE_INDEX = { T1: 0, T2: 1, T3: 2, T4: 3 };

const ClickModeSwitch = memo(function ClickModeSwitch({ mode, onChange }) {
  const handleClick = useCallback(
    (value) => {
      if (onChange && value !== mode) {
        onChange(value);
      }
    },
    [mode, onChange],
  );

  return (
    <div className="click-mode-switch" role="radiogroup" aria-label="Click mode">
      {MODES.map(({ value, label }) => {
        const active = value === mode;
        const toneIdx = TONE_INDEX[value];
        const cssVar = toneIdx !== undefined ? `var(--tone-${toneIdx + 1})` : undefined;

        return (
          <motion.button
            key={value}
            role="radio"
            aria-checked={active}
            className={
              'mode-btn' +
              (active ? ' mode-btn--active' : '') +
              (toneIdx !== undefined ? ' mode-btn--tone' : '')
            }
            style={
              active && cssVar
                ? { '--mode-accent': cssVar }
                : undefined
            }
            onClick={() => handleClick(value)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            layout
          >
            {label}
          </motion.button>
        );
      })}
    </div>
  );
});

export default ClickModeSwitch;
