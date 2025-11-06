import React, { useState } from 'react';
import './ai-results.styles.css';
import Modal from '../modal/modal.component';

export default function AiResults({ loading, results, onBack }) {
  const [openOriginal, setOpenOriginal] = useState(null); // { original, altered } or null

  if (loading) {
    return <div className="loading">Processing stories with AI…</div>;
  }

  if (!results || results.length === 0) {
    return (
      <div>
        <p className="story-meta">No AI results yet.</p>
        <div className="controls">
          <button onClick={onBack}>Back</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="ai-grid">
        {results.map((r) => (
          <div key={r?.altered?.id} className="ai-card">
            <h3 className="ai-title">
              {r?.altered?.title ?? `Story #${r?.altered?.id ?? ''}`}
            </h3>
            <p className="ai-notes">{r?.altered?.notes}</p>
            <div className="ai-content">{r?.altered?.content}</div>

            <div className="ai-actions">
              <button onClick={() => setOpenOriginal(r)}>View original</button>
            </div>
          </div>
        ))}
      </div>

      <div className="controls">
        <button onClick={onBack}>Back</button>
      </div>

      {openOriginal && (
        <Modal
          title={openOriginal?.original?.story?.title ?? 'Original story'}
          onClose={() => setOpenOriginal(null)}
        >
          <div>
            <strong>Title:</strong> {openOriginal?.original?.story?.title}
          </div>
          <div style={{ marginTop: 8 }}>
            <strong>Content:</strong>
          </div>
          <div className="modal-body-scroll" style={{ marginTop: 6 }}>
            {openOriginal?.original?.story?.content}
          </div>
        </Modal>
      )}
    </div>
  );
}