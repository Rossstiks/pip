const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '..', 'db', 'openai.log');

async function generateTags(description) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const prompt = `Suggest up to 5 short tags for the following document description in comma separated format:\n${description}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 50
    })
  });

  const data = await response.json();
  const tagsText = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content || '';
  const tags = tagsText.split(',').map(t => t.trim()).filter(Boolean);
  const logEntry = { prompt, id: data.id, date: new Date().toISOString() };
  fs.appendFileSync(LOG_FILE, JSON.stringify(logEntry) + '\n');
  return tags;
}

module.exports = { generateTags };
