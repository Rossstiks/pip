CREATE TABLE templates (
  id SERIAL PRIMARY KEY,
  title TEXT,
  file_url TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE
);

CREATE TABLE template_tags (
  template_id INT REFERENCES templates(id),
  tag_id INT REFERENCES tags(id),
  PRIMARY KEY (template_id, tag_id)
);
