# Legal Document Generator

This project is a prototype for generating legal document templates.

## Structure
- `client/` – Next.js frontend (placeholder)
- `server/` – Node.js + Express API
- `db/` – JSON database placeholder
- `templates/` – HTML template files

Run the backend:
```bash
cd server
node index.js
```

### API Endpoints

- `GET /api/templates` – list templates
- `GET /api/templates/:id` – get a template by id
- `POST /api/templates` – create template metadata (expects JSON)
- `POST /api/templates/upload` – upload an HTML file using `multipart/form-data`
- `PUT /api/templates/:id` – update metadata
- `DELETE /api/templates/:id` – remove a template

Uploaded files are stored in the `templates/` directory. Tags are extracted
from the `<article data-tags>` attribute; if none are present a ChatGPT call
will generate them. All OpenAI requests are logged to `openai.log`.
