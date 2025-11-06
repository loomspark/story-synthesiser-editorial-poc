# Story Moderator

A React app for moderating user stories, selecting accepted ones, and generating AI‑altered versions in a defined format. It includes:

- Moderation view to step through stories and Accept/Reject
- Summary view to review accepted stories (cards, metrics, delete per card, submit all)
- AI results view that sends accepted stories to a local Ollama model (via a small Node/Express proxy) and displays transformed outputs

## Project structure

- `src/` React UI (moderation, summary, AI results, modal)
- `public/stories_analyzed.json` Sample dataset (array of entries)
- `server/` Minimal Node/Express proxy that calls Ollama’s HTTP API

## Prerequisites

- Node.js 18+
- Ollama installed locally and running (Windows, macOS, Linux)
  - Download: `https://ollama.com/`
  - Windows (PowerShell, optional): `winget install Ollama.Ollama`

## Setup

1. Install frontend deps and run the app

```bash
npm install
npm start
```

If port 3000 is busy, answer “Y” to run on another port.

2. Start the backend proxy (in a separate terminal)

```bash
cd server
npm install
npm start
```

You should see: `AI proxy listening on http://localhost:3001`.

3. Ensure Ollama is running and a model is available

- Verify API is up:

```bash
curl http://127.0.0.1:11434/api/tags
```

- Pull a model (recommended smaller model):

```bash
ollama pull llama3:8b
```

If you prefer another model, pull it and adjust the server default (see below).

## How it works

The React app calls the proxy at `http://localhost:3001/api/ai/transform` with accepted stories and a prompt. The proxy builds a prompt per story and calls Ollama at `http://127.0.0.1:11434/api/generate`. Results are returned and rendered as AI‑altered story cards.

## Changing the prompt (instructions)

You can change the AI instructions in either place:

- Frontend request: `src/App.js` inside `startAiProcessing` body

```js
// src/App.js (excerpt)
await fetch('http://localhost:3001/api/ai/transform', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    stories: toProcess,
    model: 'llama3:8b',
    instructions:
      'Rewrite the story into a single paragraph of no more than 40 words. Preserve the key moment and tone. Remove specifics that identify people or exact locations. Keep language plain and warm.',
  }),
});
```

- Server prompt builder: `server/index.js` in `buildPrompt(story, instructions)`

```js
// server/index.js (excerpt)
function buildPrompt(story, instructions) {
  // ... gather story fields
  return `
You are an editing assistant. Transform the story into the requested format.

Instructions:
${
  instructions ||
  'Rewrite the story into a single paragraph of no more than 40 words. ...'
}

Story Context:
...`;
}
```

If you pass `instructions` from the frontend, the server uses those; otherwise it falls back to its default text in `buildPrompt`.

## Changing the model

- Default model (server): `server/index.js`

```js
// server/index.js (excerpt)
const { stories, instructions, model = 'llama3:8b' } = req.body || {};
```

To use a different model, either pull and set it here or pass `model` from the frontend request body.

## Development without Ollama (mock)

There is a commented mock in `src/App.js` above `startAiProcessing` showing how to generate fake AI results. Uncomment and use during UI development if you don’t want to run the server/Ollama.

## Typical flow

1. Open the app; review each story and Accept/Reject
2. Go to Summary; optionally remove any card, then Submit All
3. The app navigates to AI Results and shows transformed versions
4. Use “Back” to return to Summary

## Troubleshooting

- “AI processing failed” or hanging:
  - Ensure the proxy is running: `cd server && npm start`
  - Ensure Ollama is running and the model is pulled: `ollama pull llama3:8b`
  - Check available models: `curl http://127.0.0.1:11434/api/tags`
  - Watch server logs for errors
