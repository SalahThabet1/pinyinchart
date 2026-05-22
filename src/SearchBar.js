import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconSearch, IconFilter, IconCheck, IconClose } from './icons';
import './SearchBar.css';

const SEARCH_MODES = [
  { value: 'syllable', label: 'Syllable' },
  { value: 'pinyin', label: 'Pinyin' },
  { value: 'both', label: 'Both' },
];
const NON_MATCH_OPTIONS = [
  { value: 'dim', label: 'Dim' },
  { value: 'hide', label: 'Hide' },
];

const SearchBar = memo(function SearchBar({
  value = '',
  onChange,
  placeholder = 'Search syllables…',
  searchMode = 'syllable',
  onSearchModeChange,
  nonMatchBehavior = 'dim',
  onNonMatchBehaviorChange,
}) {
  const [showOptions, setShowOptions] = useState(false);

  const handleClear = () => {
    if (onChange) {
      onChange({ target: { value: '' } });
    }
  };

  return (
    <div className="search-bar-wrapper">
      <div className="search-bar">
        <span className="search-icon" aria-hidden="true">
          <IconSearch size={15} />
        </span>
        <input
          type="text"
          className="search-input"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-label="Search syllables"
          autoComplete="off"
          spellCheck={false}
        />
        <AnimatePresence>
          {value && (
            <motion.button
              className="search-clear"
              onClick={handleClear}
              aria-label="Clear search"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.15 }}
              whileTap={{ scale: 0.85 }}
            >
              <IconClose size={12} />
            </motion.button>
          )}
        </AnimatePresence>
        <motion.button
          className={`search-filter-toggle ${showOptions ? 'active' : ''}`}
          onClick={() => setShowOptions((v) => !v)}
          aria-label="Toggle search options"
          aria-expanded={showOptions}
          whileTap={{ scale: 0.85 }}
        >
          <IconFilter size={14} />
        </motion.button>
        <span className="search-hint">use 'v' for 'ü'</span>
      </div>

      <AnimatePresence>
        {showOptions && (
          <motion.div
            className="search-options-panel"
            initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{ transformOrigin: 'top center' }}
          >
            <div className="search-options-section">
              <span className="search-options-label">Search in</span>
              <div className="search-options-group">
                {SEARCH_MODES.map(({ value, label }) => (
                  <button
                    key={value}
                    className={`search-option-pill ${searchMode === value ? 'active' : ''}`}
                    onClick={() => onSearchModeChange?.(value)}
                    aria-pressed={searchMode === value}
                  >
                    {searchMode === value && <IconCheck size={10} />}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="search-options-section">
              <span className="search-options-label">Non-matches</span>
              <div className="search-options-group">
                {NON_MATCH_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    className={`search-option-pill ${nonMatchBehavior === value ? 'active' : ''}`}
                    onClick={() => onNonMatchBehaviorChange?.(value)}
                    aria-pressed={nonMatchBehavior === value}
                  >
                    {nonMatchBehavior === value && <IconCheck size={10} />}
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default SearchBar;
