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

### Adding a template via CLI

You can add new HTML templates from the command line. The script will copy the file into the `templates/` directory, update `db/templates.json` and generate tags with OpenAI if none are provided.

```bash
node server/addTemplate.js path/to/file.html "Document title" "Optional description" "tag1,tag2"
```
