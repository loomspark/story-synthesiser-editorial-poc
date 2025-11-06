import './story-card.styles.css';

export default function StoryCard({ story }) {
  return (
    <div className="story-card">
      <h2 className="story-title">Story ID: {story.id}</h2>

      <h3>Summary</h3>
      <p className="story-text">{story.summary}</p>

      <h3>Sentiment</h3>
      <p className="story-meta">{story.sentiment}</p>

      <h3>Keywords</h3>
      <ul>
        {story.keywords?.map((k, i) => (
          <li key={i}>{k}</li>
        ))}
      </ul>

      <h3>Themes</h3>
      <ul>
        {story.themes?.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>

      <h3>Suggested Angles</h3>
      <ul>
        {story.angles?.map((a, i) => (
          <li key={i}>{a}</li>
        ))}
      </ul>

      {story.metadata && (
        <>
          <h3>Metadata</h3>
          <pre className="metadata-pre">
            {JSON.stringify(story.metadata, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
}
