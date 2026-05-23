import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './LearnTOC.css';

/* Extract headings from LearnSection DOM nodes */
function useLearnHeadings(containerRef) {
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const extract = () => {
      const h3s = container.querySelectorAll('h3.lp-h');
      const items = Array.from(h3s).map((h, i) => {
        const id = `learn-section-${i}`;
        h.id = id;
        return {
          id,
          text: h.textContent.trim(),
          element: h,
        };
      });
      setHeadings(items);
    };

    // Small delay to let LearnSection render
    const t = setTimeout(extract, 100);
    return () => clearTimeout(t);
  }, [containerRef]);

  return headings;
}

export default function LearnTOC({ containerRef, isOpen, onToggle }) {
  const headings = useLearnHeadings(containerRef);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      onToggle(false);
    }
  };

  return (
    <>
      {/* Toggle button — always visible */}
      <button
        className={`lp-toc-toggle ${isOpen ? 'lp-toc-toggle--open' : ''}`}
        onClick={() => onToggle(!isOpen)}
        aria-label="Table of contents"
        aria-expanded={isOpen}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <circle cx="4" cy="6" r="1" fill="currentColor" />
          <circle cx="4" cy="12" r="1" fill="currentColor" />
          <circle cx="4" cy="18" r="1" fill="currentColor" />
        </svg>
      </button>

      {/* Side panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop on mobile */}
            <motion.div
              className="lp-toc-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onToggle(false)}
            />
            <motion.aside
              className="lp-toc-panel"
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              role="navigation"
              aria-label="Learn section table of contents"
            >
              <div className="lp-toc-header">
                <span className="lp-toc-title">Contents</span>
                <button
                  className="lp-toc-close"
                  onClick={() => onToggle(false)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <nav className="lp-toc-nav">
                {headings.map((h, i) => (
                  <button
                    key={h.id}
                    className="lp-toc-item"
                    onClick={() => scrollTo(h.id)}
                    style={{ '--idx': i }}
                  >
                    <span className="lp-toc-dot" />
                    <span className="lp-toc-text">{h.text}</span>
                  </button>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
