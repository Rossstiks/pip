const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const DATA_FILE = path.join(__dirname, 'templates.json');

function loadTemplates() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveTemplates(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/templates/index', (req, res) => {
  const templates = loadTemplates();
  res.json(templates);
});

app.post('/api/templates', (req, res) => {
  const { title, tags, description, html } = req.body;
  if (!title || !html) {
    return res.status(400).json({ error: 'title and html are required' });
  }
  let existing = loadTemplates();
  const id = existing.length + 1;
  const entry = { id, title, tags: tags || [], description };
  existing.push(entry);
  saveTemplates(existing);
  const filePath = path.join(__dirname, '..', 'templates', `template-${id}.html`);
  fs.writeFileSync(filePath, html);
  res.json(entry);
});

app.post('/api/tag', async (req, res) => {
  const { description } = req.body;
  if (!description) return res.status(400).json({ error: 'description required' });
  try {
    const prompt = [
      { role: 'system', content: 'Ты — юридический классификатор. Отвечай JSON-массивом строк-тегов.' },
      { role: 'user', content: description }
    ];
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: prompt,
      functions: [{
        name: 'set_tags',
        parameters: {
          type: 'object',
          properties: { tags: { type: 'array', items: { type: 'string' } } },
          required: ['tags']
        }
      }],
      function_call: { name: 'set_tags' }
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    const result = response.data;
    fs.appendFileSync(path.join(__dirname, 'openai.log'), JSON.stringify({ prompt, result }, null, 2) + '\n');
    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'OpenAI request failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
