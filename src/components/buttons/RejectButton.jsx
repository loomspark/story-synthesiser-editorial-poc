import React from 'react';
import './reject-button.styles.css';

export default function RejectButton({ onClick, disabled = false, children }) {
  return (
    <button className="reject-btn" onClick={onClick} disabled={disabled}>
      {children ?? 'Reject'}
    </button>
  );
}
