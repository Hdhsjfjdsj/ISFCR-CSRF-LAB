# ISFCR CSRF Lab

An interactive training lab for learning Cross-Site Request Forgery (CSRF) attacks and defences. The stack is split across a TypeScript backend, a Next.js frontend, and nginx for local containerized delivery.

## What's Included

- `backend/`: Express API and lab logic
- `frontend/`: Next.js training UI
- `nginx/`: Reverse proxy configuration for the container setup
- `docker-compose.yml`: One-command local deployment

## Prerequisites

- Docker Desktop
- Git
- Optional for local development: Node.js 20+

## Quick Start With Docker

1. Clone the repository.
2. Start Docker Desktop.
3. Run:

```bash
docker-compose up --build
```

4. Open `http://localhost` in your browser.

To stop the lab:

```bash
docker-compose down
```

## Local Development

Run the services separately if you want to work outside Docker.

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Configuration

The backend supports these environment variables:

- `PORT`: backend port, defaults to `5000`
- `TRUST_PROXY`: enables trusted proxy behavior when set
- `GEMINI_API_KEY` or `GOOGLE_GENAI_API_KEY`: optional AI tutor key
- `GEMINI_MODEL`: optional preferred Gemini model name

`docker-compose.yml` already wires these values for container runs. Keep local secrets in an untracked `.env` file and do not commit API keys.

## Repository Hygiene

This repository intentionally ignores common generated and sensitive files such as:

- `node_modules/`
- build artifacts like `dist/`, `.next/`, and `coverage/`
- local environment files like `.env` and `.env.*`
- log and TypeScript build cache files

If you add a new toolchain or build output, update `.gitignore` before committing it.

## Security Note

The project is designed for a CSRF training scenario, so some demo credentials and insecure flows exist by design inside the application. Keep development secrets out of the repository and review any new configuration before committing.

## Project Layout

```text
csrf-lab/
├── backend/
├── frontend/
├── nginx/
├── docker-compose.yml
└── README.md
```
