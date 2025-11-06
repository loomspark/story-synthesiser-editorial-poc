import React from 'react';
import './accept-button.styles.css';

export default function AcceptButton({ onClick, disabled = false, children }) {
  return (
    <button className="accept-btn" onClick={onClick} disabled={disabled}>
      {children ?? 'Accept'}
    </button>
  );
}
