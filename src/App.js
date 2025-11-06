import { useEffect, useState } from 'react';
import './App.css';
import StoryCard from './components/story-card/story-card.component';
import AcceptButton from './components/buttons/AcceptButton';
import RejectButton from './components/buttons/RejectButton';
import Summary from './components/summary/summary.component';
import AiResults from './components/ai-results/ai-results.component';

export default function App() {
  const [stories, setStories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [acceptedStories, setAcceptedStories] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [submissionMsg, setSubmissionMsg] = useState('');
  const [submittedIds, setSubmittedIds] = useState([]);

  // AI processing state
  const [showAIPage, setShowAIPage] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState([]);

  // Load the JSON
  useEffect(() => {
    fetch('/stories_analyzed.json')
      .then((res) => res.json())
      .then((data) => {
        setStories(Array.isArray(data) ? data : []);
      });
  }, []);

  function handleDeleteAccepted(id) {
    setAcceptedStories((prev) => prev.filter((s) => s?.story?.id !== id));
  }

  async function startAiProcessing(toProcess) {
    setAiLoading(true);
    setAiResults([]);

    try {
      // Replace this mock with a real API call:
      // const res = await fetch('/api/ai/transform', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ stories: toProcess }),
      // });
      // const data = await res.json();

      // Mock result: echo story with "AI Edited:" prefix and an added field
      const mock = await new Promise((resolve) =>
        setTimeout(() => {
          resolve(
            toProcess.map((s) => ({
              original: s,
              altered: {
                id: s?.story?.id,
                title: s?.story?.title,
                content:
                  'AI Edited: ' + (s?.story?.content || '').slice(0, 800),
                notes: 'Edited to AI team specifications (mock).',
              },
            }))
          );
        }, 1200)
      );

      setAiResults(mock);
    } catch (e) {
      setSubmissionMsg('AI processing failed. Please try again.');
      setTimeout(() => setSubmissionMsg(''), 2500);
    } finally {
      setAiLoading(false);
    }
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
  
    const toProcess = acceptedStories.filter((s) => newIds.includes(s?.story?.id));
  
    setSubmissionMsg('Submission accepted.');
    setSubmittedIds((prev) => [...prev, ...newIds]);
  
    // Do NOT clear the list anymore:
    // setAcceptedStories([]);
  
    // Go straight to the AI page
    setShowSummary(false);
    setShowAIPage(true);
    startAiProcessing(toProcess);
  
    setTimeout(() => setSubmissionMsg(''), 2000);
  }

  // AI Results page
  if (showAIPage) {
    return (
      <div className="app">
        <h1 className="title">AI Altered Stories</h1>
        {submissionMsg && (
          <div className="status status-accepted">{submissionMsg}</div>
        )}
        <AiResults
          loading={aiLoading}
          results={aiResults}
          onBack={() => { setShowAIPage(false);
            setShowSummary(true);
          }}
        />
      </div>
    );
  }

  // Summary page
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