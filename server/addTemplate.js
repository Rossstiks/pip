const fs = require('fs');
const path = require('path');
const { generateTags } = require('./openai');

const DATA_FILE = path.join(__dirname, '..', 'db', 'templates.json');
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

async function main() {
  const [filePath, title, description = '', tagsArg = ''] = process.argv.slice(2);
  if (!filePath || !title) {
    console.log('Usage: node addTemplate.js <file> <title> [description] [tags]');
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const tagMatch = content.match(/<article[^>]*data-tags="([^"]+)"/i);
  let tags = [];
  if (tagsArg) tags = tagsArg.split(',').map(t => t.trim());
  if (tagMatch) tags = tags.concat(tagMatch[1].split(',').map(t => t.trim()));
  if (!tags.length && description) {
    try {
      tags = await generateTags(description);
    } catch (err) {
      console.error('Tag generation failed:', err.message);
    }
  }

  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  const id = data.templates.length ? data.templates[data.templates.length - 1].id + 1 : 1;
  const fileName = `${id}-${path.basename(filePath)}`;
  const destPath = path.join(TEMPLATES_DIR, fileName);
  fs.copyFileSync(filePath, destPath);
  const fileUrl = `/templates/${fileName}`;
  const template = { id, title, fileUrl, description, tags, createdAt: new Date().toISOString() };
  data.templates.push(template);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  console.log('Template added with id', id);
}

main();
