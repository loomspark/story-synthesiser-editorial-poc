import { useEffect, useState } from 'react';
import './App.css';
import StoryCard from './components/story-card/story-card.component';
import AcceptButton from './components/buttons/AcceptButton';
import RejectButton from './components/buttons/RejectButton';
import Summary from './components/summary/summary.component';

export default function App() {
  const [stories, setStories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [acceptedStories, setAcceptedStories] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [submissionMsg, setSubmissionMsg] = useState('');
  const [submittedIds, setSubmittedIds] = useState([]);

  // Load the JSON
  useEffect(() => {
    fetch('/stories_analyzed.json')
      .then((res) => res.json())
      .then((data) => {
        // New schema is already an array of entries
        setStories(Array.isArray(data) ? data : []);
      });
  }, []);

  function handleDeleteAccepted(id) {
    setAcceptedStories((prev) => prev.filter((s) => s?.story?.id !== id));
  }

  function handleSubmitAccepted() {
    const newIds = acceptedStories
    .map((s) => s?.story?.id)
    .filter((id) => typeof id === 'number' && !submittedIds.includes(id));

  if (newIds.length === 0) {
    setSubmissionMsg('Nothing new to submit.');
    setTimeout(() => setSubmissionMsg(''), 2000);
    return;
  }

  // simulate submission success
  setSubmissionMsg('Submission accepted.')

  // remember submitted IDs and clear accepted list to avoid resubmitting
  setSubmittedIds((prev) => [...prev, ...newIds]);
  setAcceptedStories([]);
  setTimeout(() => setSubmissionMsg(''), 2000);
  }

  if (showSummary) {
    return (
      <div className="app">
        <h1 className="title">Accepted Stories Summary</h1>
        {submissionMsg && (
          <div className="status status-accepted">{submissionMsg}</div>
        )}
        <Summary
          stories={acceptedStories}
          onDeleteStory={handleDeleteAccepted}
          onSubmit={handleSubmitAccepted}
        />
        <div className="controls">
          <button onClick={() => setShowSummary(false)}>Back to Moderation</button>
        </div>
      </div>
    );
  }
  
  if (stories.length === 0) {
    return <div className="loading">Loading stories...</div>;
  }
  
  // No more stories left
  if (currentIndex >= stories.length) {
    return (
      <div className="app">
        <h1 className="finished">✅ All stories have been moderated!</h1>
        {acceptedStories.length > 0 && (
          <div className="controls">
            <button onClick={() => setShowSummary(true)}>View Summary</button>
          </div>
        )}
      </div>
    );
  }


  const currentStory = stories[currentIndex];

  function handleDecision(decision) {
    if (decision === 'accepted') {
      const id = currentStory?.story?.id;
      const alreadyAccepted = acceptedStories.some((s) => s?.story?.id === id);
      const alreadySubmitted = submittedIds.includes(id);
  
      if (!alreadyAccepted && !alreadySubmitted) {
        setAcceptedStories((prev) => [...prev, currentStory]);
      }
    }
  
    setStatusMessage(
      decision === 'accepted' ? '✅ Story accepted!' : '❌ Story rejected!'
    );
  
    setTimeout(() => {
      setStatusMessage('');
      setCurrentIndex((prev) => prev + 1);
    }, 1000);
  }

  return (
    <div className="app">
      <h1 className="title">Moderate Stories</h1>
      <StoryCard story={currentStory} />

      <div className="controls">
        <AcceptButton onClick={() => handleDecision('accepted')} />
        <RejectButton onClick={() => handleDecision('rejected')} />
        {acceptedStories.length > 0 && (
          <button onClick={() => setShowSummary(true)}>View Summary</button>
        )}
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
