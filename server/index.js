const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
