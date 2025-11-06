import { useEffect, useState } from 'react';
import './App.css';
import StoryCard from './components/story-card/story-card.component';
import AcceptButton from './components/buttons/AcceptButton';
import RejectButton from './components/buttons/RejectButton';

export default function App() {
  const [stories, setStories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  // Load the JSON
  useEffect(() => {
    fetch('/stories_analyzed.json')
      .then((res) => res.json())
      .then((data) => {
        // New schema is already an array of entries
        setStories(Array.isArray(data) ? data : []);
      });
  }, []);

  if (stories.length === 0) {
    return <div className="loading">Loading stories...</div>;
  }

  // No more stories left
  if (currentIndex >= stories.length) {
    return <h1 className="finished">✅ All stories have been moderated!</h1>;
  }

  const currentStory = stories[currentIndex];

  function handleDecision(decision) {
    setStatusMessage(
      decision === 'accepted' ? '✅ Story accepted!' : '❌ Story rejected!'
    );

    // Wait 1 second before advancing to next story
    setTimeout(() => {
      setStatusMessage('');
      setCurrentIndex((prev) => prev + 1);
    }, 1000);
  }

  return (
    <div className="app">
      <StoryCard story={currentStory} />

      <div className="controls">
        <AcceptButton onClick={() => handleDecision('accepted')} />
        <RejectButton onClick={() => handleDecision('rejected')} />
      </div>

      {statusMessage && (
        <div
          className={`status ${
            statusMessage.includes('accepted')
              ? 'status-accepted'
              : 'status-rejected'
          }`}
        >
          {statusMessage}
        </div>
      )}
    </div>
  );
}
