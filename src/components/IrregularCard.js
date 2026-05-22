import React, { useState } from 'react';
import irregulars from '../irregulars.json';
import { IconInfo } from '../icons';
import './IrregularCard.css';

function IrregularCard() {
  const [open, setOpen] = useState(false);
  const irregKeys = Object.keys(irregulars);
  return (
    <div className={`irregular-card${open ? ' irregular-card--open' : ''}`}>
      <button className="irregular-card-head" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <IconInfo size={14} />
        <span>Irregular Pronunciations ({irregKeys.length})</span>
        <span className="irregular-card-arrow" aria-hidden="true">
          <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
            <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="irregular-card-body">
          {irregKeys.map(k => (
            <div key={k} className="irregular-card-row">
              <code className="irregular-card-syl">{k}</code>
              <span className="irregular-card-exp">{irregulars[k]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default IrregularCard;
