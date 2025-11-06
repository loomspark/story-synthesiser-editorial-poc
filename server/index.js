const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '2mb' }));

function buildPrompt(story, instructions) {
  const title = story?.story?.title || '';
  const content = story?.story?.content || '';
  const sentiment = story?.ai_analysis?.sentiment || '';
  const themes = Array.isArray(story?.ai_analysis?.themes)
    ? story.ai_analysis.themes.join(', ')
    : '';

  return `
You are an editing assistant. Transform the story into the requested format.

Instructions:
${
  instructions ||
  `Primary Objective
Ensure each story reflects the Stories of Exchange brand voice:
Professional yet vibrant, welcoming yet authoritative — communicating warmth, purpose, and inspiration while celebrating global connection. Voice & Tone Guidelines
When rewriting or reviewing, ensure the story expresses the following qualities:
Friendly & Approachable
Use warm, human, and inclusive language.
Avoid overly formal or stiff phrasing.
Sound conversational but still polished.
Empowering & Inspirational
Highlight the transformative power of cultural exchange.
Emphasize human growth, learning, and mutual understanding.
Inclusive & Global
Celebrate diversity and community.
Avoid region-specific jargon or references that exclude readers.
Knowledgeable & Authoritative
Communicate confidently, sharing valuable insights clearly and credibly.
Reflect understanding of international experiences and impact.
Vibrant & Energetic
Keep the tone lively, optimistic, and forward-looking.
Use dynamic verbs and positive framing. Clear and Direct Prioritize simplicity and flow. Avoid unnecessary jargon or long, complex sentences. Each paragraph should communicate one clear idea.'`
}

Story Context:
- Title: ${title}
- Sentiment: ${sentiment}
- Themes: ${themes}

Original Content:
"""
${content}
"""

Output JSON only, no extra text, matching exactly:
{
  "title": string,
  "content": string, <= 300 words
  "notes": string
}
`;
}

app.post('/api/ai/transform', async (req, res) => {
  try {
    const { stories, instructions, model = 'llama3:8b' } = req.body || {};
    if (!Array.isArray(stories) || stories.length === 0) {
      return res.status(400).json({ error: 'stories[] required' });
    }

    const results = [];
    for (const s of stories) {
      const prompt = buildPrompt(s, instructions);

      const ollamaRes = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature: 0.3,
            num_ctx: 4096,
          },
        }),
      });

      if (!ollamaRes.ok) {
        const text = await ollamaRes.text();
        throw new Error(`Ollama error: ${text}`);
      }

      const data = await ollamaRes.json();
      let altered;
      try {
        altered = JSON.parse(data.response);
      } catch {
        altered = {
          title: s?.story?.title || `Story #${s?.story?.id || ''}`,
          content: data.response,
          notes: 'Model did not return strict JSON; raw text captured.',
        };
      }

      results.push({
        original: s,
        altered: {
          id: s?.story?.id,
          ...altered,
        },
      });
    }

    res.json(results);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Failed to transform stories' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`AI proxy listening on http://localhost:${PORT}`);
});
