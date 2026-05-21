import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SearchBar.css';

const SearchBar = memo(function SearchBar({
  value = '',
  onChange,
  placeholder = 'Search syllables…',
}) {
  return (
    <div className="search-bar">
      <span className="search-icon" aria-hidden="true">🔍</span>
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
            onClick={() => {
              if (onChange) {
                const nativeEvent = new Event('input', { bubbles: true });
                Object.defineProperty(nativeEvent, 'target', {
                  value: { value: '' },
                });
                onChange({ target: { value: '' } });
              }
            }}
            aria-label="Clear search"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
            whileTap={{ scale: 0.85 }}
          >
            ✕
          </motion.button>
        )}
      </AnimatePresence>
      <span className="search-hint">use 'v' for 'ü'</span>
    </div>
  );
});

export default SearchBar;
