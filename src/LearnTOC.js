import React, { useState, useEffect, useRef } from 'react';
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
        return { id, text: h.textContent.trim(), element: h };
      });
      setHeadings(items);
    };

    const t = setTimeout(extract, 100);
    return () => clearTimeout(t);
  }, [containerRef]);

  return headings;
}

/* Track which heading is currently in viewport */
function useActiveHeading(headings, containerRef) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = headings.findIndex((h) => h.id === entry.target.id);
            if (idx !== -1) setActiveIdx(idx);
          }
        });
      },
      { root: null, rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    headings.forEach((h) => {
      if (h.element) observer.observe(h.element);
    });

    return () => observer.disconnect();
  }, [headings, containerRef]);

  return activeIdx;
}

export default function LearnTOC({ containerRef }) {
  const headings = useLearnHeadings(containerRef);
  const activeIdx = useActiveHeading(headings, containerRef);
  const [visible, setVisible] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(-1);
  const lastScrollY = useRef(0);
  const rafRef = useRef(null);

  // Auto-show on scroll down, hide at top
  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const y = window.scrollY;
        const headingEl = headings[0]?.element;
        if (headingEl) {
          const rect = headingEl.getBoundingClientRect();
          // Show when scrolled past the first heading, hide when at top
          setVisible(rect.top < -40);
        }
        lastScrollY.current = y;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [headings]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (headings.length === 0) return null;

  return (
    <div className={`lp-toc${visible ? ' lp-toc--visible' : ''}`}>
      <div className="lp-toc-track">
        {headings.map((h, i) => (
          <button
            key={h.id}
            className={`lp-toc-item${i === activeIdx ? ' lp-toc-item--active' : ''}${i === hoveredIdx ? ' lp-toc-item--hover' : ''}`}
            onClick={() => scrollTo(h.id)}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(-1)}
          >
            <span className="lp-toc-line" />
            <span className="lp-toc-text">{h.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
