const fs = require('fs');
const fetch = require('node-fetch');

// List of available travel-related themes for users to choose from
const availableThemes = [
    'Adventure',
    'Culture',
    'Self-Discovery',
    'Nature',
    'Challenge',
    'Community',
    'Tradition',
    'Innovation',
    'Spirituality',
    'Connection',
    'Exploration',
    'Discovery',
    'Local Cuisine',
    'Wildlife',
    'Landmarks',
    'Road Trip',
    'Backpacking',
    'Volunteering',
    'Study Abroad',
    'Solo Travel',
    'Group Travel',
    'Cultural Exchange',
    'Urban Experience',
    'Rural Experience',
    'Festivals',
    'Language Learning',
    // Custom themes for advanced analysis
    'Insurance Denial',
    'Extreme Financial Loss',
    'Customer Service Failure',
    'Antarctica Expedition',
    'Service Inconsistency'
];

// Read the stories from the JSON file
const stories = JSON.parse(fs.readFileSync('generated_stories.json', 'utf-8'));
console.log('Loaded', stories.length, 'stories from generated_stories.json');

// Ollama API settings
const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL = 'llama3.2'; // Change if you use a different model

// Use Ollama for sentiment analysis
async function analyzeSentimentOllama(text) {
    console.log('Sending story to Ollama for sentiment analysis...');
    const prompt = `Analyze the following story and assign ALL relevant themes from this list to fully capture the context: ${availableThemes.join(', ')}. You may also assign additional themes or use custom sentiment values if appropriate (e.g., Extreme Negative, Insurance Denial, etc.). Return a short text response describing the sentiment (any value that best fits), a quality score (0.0 to 5.0), all applicable themes, and a one-sentence summary. Format your response as: Sentiment: <sentiment>. Quality Score: <score>. Themes: <theme1>, <theme2>, ... Summary: <summary>. Do NOT use JSON.\nStory: ${text}`;
    const response = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: MODEL, prompt })
    });
    let fullResponse = '';
    for await (const chunk of response.body) {
        const lines = chunk.toString().split(/\r?\n/).filter(Boolean);
        for (const line of lines) {
            try {
                const obj = JSON.parse(line);
                if (obj.response) fullResponse += obj.response;
            } catch (e) {
                // If not JSON, skip
            }
        }
    }
    // Return the full text response from Ollama
    console.log('Ollama response received:', fullResponse.trim());
    return fullResponse.trim();
}

// Parse AI analysis text into structured data
function parseAiAnalysis(text) {
    // Extract fields using regex
    const sentimentMatch = text.match(/Sentiment:\s*([\w\s\-]+)/i); // allow spaces and hyphens
    const qualityMatch = text.match(/Quality Score:\s*([\d.]+)/i);
    const themesMatch = text.match(/Themes:\s*([\w\s,\-]+)/i);
    const summaryMatch = text.match(/Summary:\s*(.+)$/ims);

    return {
        sentiment: sentimentMatch ? sentimentMatch[1].trim() : '',
        quality_score: qualityMatch ? Math.min(1, parseFloat(qualityMatch[1].trim()) / 5) : 0, // Normalize to 0.0-1.0
        themes: themesMatch ? themesMatch[1].split(',').map(t => t.trim()).filter(Boolean) : [],
        summary: summaryMatch ? summaryMatch[1].replace(/\n/g, ' ').trim() : ''
    };
}

// Main function to process all stories
async function main() {
    console.log('Starting sentiment analysis for all stories...');
    const analyzedStories = [];
    for (let i = 0; i < stories.length; i++) {
        const story = stories[i];
        console.log(`Analyzing story ${i + 1} of ${stories.length}:`, story.story.title);
        const ai_analysis_text = await analyzeSentimentOllama(story.story.body_text);
        const ai_analysis = parseAiAnalysis(ai_analysis_text);
        analyzedStories.push({
            user: story.user,
            experience: story.experience,
            story: story.story,
            ai_analysis
        });
        console.log('Finished analyzing:', story.story.title);
        // Optional: Add a short delay between requests to avoid overloading Ollama
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.log('Writing results to sentiment_analysis_results.json...');
    fs.writeFileSync('sentiment_analysis_results.json', JSON.stringify(analyzedStories, null, 2));
    console.log('Sentiment analysis completed. Results saved to sentiment_analysis_results.json');
}

main();
