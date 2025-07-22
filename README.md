# Legal Document Generator

This project implements a simple site for generating legal documents with search and template management.

## Structure
- `client/` – Next.js frontend with client-side search using Fuse.js.
- `server/` – Node.js Express backend providing CRUD for templates and proxying to the OpenAI API.
- `db/` – Database schema and migrations.
- `templates/` – Stored HTML templates.

Run `npm test` and `npm run lint` inside `client/` and `server/` before committing changes.
