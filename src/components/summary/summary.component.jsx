import React from 'react';
import './summary.styles.css';
import StoryCard from '../story-card/story-card.component';

export default function Summary({ stories, onDeleteStory, onSubmit }) {
  const total = stories.length;

  const sentiments = stories.reduce((acc, s) => {
    const sentiment = s?.ai_analysis?.sentiment ?? 'Unknown';
    acc[sentiment] = (acc[sentiment] || 0) + 1;
    return acc;
  }, {});

  const qualities = stories
    .map((s) => s?.ai_analysis?.quality_score)
    .filter((n) => typeof n === 'number');

  const avgQuality =
    qualities.length > 0
      ? (qualities.reduce((a, b) => a + b, 0) / qualities.length).toFixed(2)
      : 'N/A';

  const themeCounts = stories.reduce((acc, s) => {
    const themes = s?.ai_analysis?.themes || [];
    themes.forEach((t) => {
      acc[t] = (acc[t] || 0) + 1;
    });
    return acc;
  }, {});

  const topThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="summary">
      <div className="summary-actions">
        <button onClick={onSubmit} disabled={stories.length === 0}>
          Submit All
        </button>
      </div>

      <p className="story-meta">Total accepted: {total}</p>
      <p className="story-meta">Average quality score: {avgQuality}</p>

      <h3>Sentiments</h3>
      <ul>
        {Object.entries(sentiments).map(([label, count]) => (
          <li key={label}>
            {label}: {count}
          </li>
        ))}
      </ul>

      <h3>Top Themes</h3>
      <ul>
        {topThemes.map(([theme, count]) => (
          <li key={theme}>
            {theme}: {count}
          </li>
        ))}
      </ul>

      <h3>Accepted Stories</h3>
      {stories.length === 0 ? (
        <p className="story-meta">No accepted stories yet.</p>
      ) : (
        <div className="accepted-grid">
          {stories.map((s) => (
            <div className="accepted-card" key={s?.story?.id}>
              <StoryCard story={s} />
              <div className="accepted-card-actions">
                <button
                  className="danger"
                  onClick={() => onDeleteStory?.(s?.story?.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}