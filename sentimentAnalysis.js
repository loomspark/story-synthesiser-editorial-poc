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
    'Language Learning'
];

// Read the stories from the JSON file
const stories = JSON.parse(fs.readFileSync('generated_stories.json', 'utf-8'));

// Ollama API settings
const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL = 'llama3:latest'; // Change if you use a different model

// Use Ollama for sentiment analysis
async function analyzeSentimentOllama(text) {
    const prompt = `Analyze the following story and return only a JSON object with keys: sentiment (positive, negative, neutral), score (number between -1 and 1), and a short explanation.\nStory: ${text}`;
    const response = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: MODEL, prompt })
    });
    const data = await response.json();
    // Ollama returns streaming output, so we need to parse the response
    // The response object has a 'response' field with the model's output
    try {
        const jsonStart = data.response.indexOf('{');
        const jsonEnd = data.response.lastIndexOf('}') + 1;
        const jsonString = data.response.substring(jsonStart, jsonEnd);
        return JSON.parse(jsonString);
    } catch (e) {
        // Log the raw response for debugging
        fs.appendFileSync('ollama_raw_responses.log', `\n--- RAW RESPONSE ---\n${data.response}\n`);
        return {
            sentiment: 'unknown',
            score: 0,
            explanation: 'Could not parse Ollama response. Raw response logged to ollama_raw_responses.log.'
        };
    }
}

// Main function to process all stories
async function main() {
    const analyzedStories = [];
    for (const story of stories) {
        const sentiment = await analyzeSentimentOllama(story.story.body_text);
        analyzedStories.push({
            storyId: story.story.story_id,
            title: story.story.title,
            userId: story.user.user_id,
            userName: story.user.name,
            destinationCountry: story.experience.destination_country,
            experienceType: story.experience.experience_type,
            theme: story.story.theme || '', // Add theme property, default to empty string
            sentiment
        });
        console.log(`Analyzed story: ${story.story.title}`);
    }
    fs.writeFileSync('sentiment_analysis_results.json', JSON.stringify(analyzedStories, null, 2));
    console.log('Sentiment analysis completed. Results saved to sentiment_analysis_results.json');
}

main();
