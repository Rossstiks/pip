const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { JSDOM } = require('jsdom');

const app = express();
app.use(bodyParser.json());

const upload = multer({ dest: path.join(__dirname, '..', 'templates') });

const OPENAI_LOG = path.join(__dirname, '..', 'openai.log');

function logOpenAI(prompt, responseId) {
  const entry = { prompt, responseId, timestamp: new Date().toISOString() };
  fs.appendFileSync(OPENAI_LOG, JSON.stringify(entry) + '\n');
}

async function getTagsFromGPT(description) {
  const prompt = `Classify legal description into tags: ${description}`;
  logOpenAI(prompt, 'mock-id');
  // TODO: call OpenAI API
  return ['auto-tag'];
}

function extractTags(filePath) {
  const html = fs.readFileSync(filePath, 'utf-8');
  const dom = new JSDOM(html);
  const article = dom.window.document.querySelector('article');
  if (!article) {
    throw new Error('No <article> tag found');
  }
  const tagsAttr = article.getAttribute('data-tags') || '';
  const tags = tagsAttr.split(',').map(t => t.trim()).filter(Boolean);
  const placeholders = html.match(/{{\s*\w+\s*}}/g) || [];
  if (placeholders.length === 0) {
    throw new Error('No placeholders found');
  }
  return tags;
}

const DATA_FILE = path.join(__dirname, '..', 'db', 'templates.json');

function loadData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return { templates: [], tags: [] };
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/templates', (req, res) => {
  const data = loadData();
  res.json(data.templates);
});

app.get('/api/templates/index', (req, res) => {
  const data = loadData();
  const index = data.templates.map(t => ({ id: t.id, title: t.title, tags: t.tags }));
  res.json(index);
});

app.post('/api/templates', (req, res) => {
  const { title, fileUrl, description, tags } = req.body;
  const data = loadData();
  const id = data.templates.length ? data.templates[data.templates.length - 1].id + 1 : 1;
  const template = { id, title, fileUrl, description, tags, createdAt: new Date().toISOString() };
  data.templates.push(template);
  saveData(data);
  res.status(201).json(template);
});

app.post('/api/templates/upload', upload.single('file'), async (req, res) => {
  const { title, description } = req.body;
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'File required' });
  let tags;
  try {
    tags = extractTags(file.path);
    if (tags.length === 0) {
      tags = await getTagsFromGPT(description || '');
    }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
  const data = loadData();
  const id = data.templates.length ? data.templates[data.templates.length - 1].id + 1 : 1;
  const fileUrl = `/templates/${file.filename}`;
  const template = { id, title, fileUrl, description, tags, createdAt: new Date().toISOString() };
  data.templates.push(template);
  saveData(data);
  res.status(201).json(template);
});

app.get('/api/templates/:id', (req, res) => {
  const data = loadData();
  const template = data.templates.find(t => t.id === parseInt(req.params.id, 10));
  if (!template) return res.status(404).json({ error: 'Not found' });
  res.json(template);
});

app.put('/api/templates/:id', (req, res) => {
  const data = loadData();
  const idx = data.templates.findIndex(t => t.id === parseInt(req.params.id, 10));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.templates[idx] = { ...data.templates[idx], ...req.body };
  saveData(data);
  res.json(data.templates[idx]);
});

app.delete('/api/templates/:id', (req, res) => {
  const data = loadData();
  const idx = data.templates.findIndex(t => t.id === parseInt(req.params.id, 10));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const removed = data.templates.splice(idx, 1)[0];
  saveData(data);
  res.json(removed);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
