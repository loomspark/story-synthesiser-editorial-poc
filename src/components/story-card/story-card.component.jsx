import { useState } from 'react';
import './story-card.styles.css';
import Modal from './modal/modal.component';

export default function StoryCard({ story, previewLength = 180 }) {
  const user = story?.user;
  const experience = story?.experience;
  const s = story?.story;
  const analysis = story?.ai_analysis;

  const [open, setOpen] = useState(false);

  const content = s?.content || '';
  const isLong = content.length > previewLength;
  const preview = isLong ? content.slice(0, previewLength).trim() + '…' : content;

  return (
    <div className="story-card">
      <h2 className="story-title">{s?.title ?? `Story #${s?.id ?? ''}`}</h2>

      {user && (
        <p className="story-meta">
          By {user.name} ({user.role})
        </p>
      )}
      {experience && (
        <p className="story-meta">
          Region: {experience.region} • Focus: {experience.focus_area} • Years:{' '}
          {experience.years_active}
        </p>
      )}

      {content && (
        <>
          <h3>Content</h3>
          <p className="story-text">
            {preview}
            {isLong && (
              <button className="link-btn" onClick={() => setOpen(true)}>
                Read more
              </button>
            )}
          </p>
        </>
      )}

      {analysis?.summary && (
        <>
          <h3>AI Summary</h3>
          <p className="story-text">{analysis.summary}</p>
        </>
      )}

      {analysis?.sentiment && (
        <>
          <h3>Sentiment</h3>
          <p className="story-meta">{analysis.sentiment}</p>
        </>
      )}

      {Array.isArray(analysis?.themes) && analysis.themes.length > 0 && (
        <>
          <h3>Themes</h3>
          <ul>
            {analysis.themes.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </>
      )}

      {typeof analysis?.quality_score === 'number' && (
        <p className="story-meta">
          Quality Score: {analysis.quality_score.toFixed(2)}
        </p>
      )}

      {open && (
        <Modal onClose={() => setOpen(false)} title={s?.title ?? 'Story'}>
          <div className="modal-content-scroll">
            <p className="full-story">{content}</p>
          </div>
        </Modal>
      )}
    </div>
  );
}