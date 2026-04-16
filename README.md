# 🎨 AI Prompt Library

A full-stack web application for storing and managing AI image generation prompts. Built with **React**, **FastAPI**, **PostgreSQL**, and **Redis**, containerized with **Docker Compose**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Python 3.11 + FastAPI |
| Database | PostgreSQL 15 |
| Cache / Counter | Redis 7 |
| Containerization | Docker + Docker Compose |
| Web Server | Nginx (serves built React app) |

---

## Features

- **Browse Prompts** — View all saved prompts in a responsive card grid with complexity badges (Low / Medium / High)
- **Prompt Detail** — View full prompt content with a live view counter powered by Redis
- **Add Prompt** — Create new prompts with a validated form (title, content, complexity 1–10)
- **View Counter** — Every time a prompt detail page is loaded, the Redis counter increments in real time
- **Persistent Storage** — Prompts are stored in PostgreSQL and survive container restarts
- **Input Validation** — Both frontend (React) and backend (FastAPI/Pydantic) validate all inputs

---

## Project Structure

```
ai-prompt-library/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app entry point, CORS, startup
│   │   ├── database.py      # SQLAlchemy engine + session
│   │   ├── models.py        # Prompt ORM model
│   │   ├── schemas.py       # Pydantic request/response schemas
│   │   ├── redis_client.py  # Redis connection + view counter helpers
│   │   └── routers/
│   │       └── prompts.py   # GET /prompts/, POST /prompts/, GET /prompts/{id}/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PromptList/   # Browse all prompts
│   │   │   ├── PromptDetail/ # Single prompt + view count
│   │   │   └── AddPrompt/    # Create prompt form
│   │   ├── services/
│   │   │   └── promptService.ts  # Axios API calls
│   │   ├── types/index.ts    # TypeScript interfaces
│   │   ├── App.tsx           # Router + layout
│   │   └── main.tsx          # React entry point
│   ├── nginx.conf            # Nginx config (SPA routing + API proxy)
│   ├── Dockerfile            # Multi-stage: build → nginx
│   └── package.json
├── docker-compose.yml
├── .env
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/prompts/` | List all prompts (id, title, complexity, created_at) |
| `POST` | `/api/prompts/` | Create a new prompt |
| `GET` | `/api/prompts/{id}/` | Get prompt details + increment Redis view counter |
| `GET` | `/health` | Health check |
| `GET` | `/docs` | Interactive Swagger UI |

### POST /api/prompts/ — Request Body

```json
{
  "title": "Cyberpunk cityscape at dusk",
  "content": "A sprawling neon-lit cyberpunk city at dusk, rain-slicked streets reflecting holographic advertisements, flying cars in the distance, ultra-detailed, cinematic lighting",
  "complexity": 7
}
```

### GET /api/prompts/{id}/ — Response

```json
{
  "id": 1,
  "title": "Cyberpunk cityscape at dusk",
  "content": "...",
  "complexity": 7,
  "created_at": "2024-01-15T10:30:00Z",
  "view_count": 5
}
```

---

## How to Run Locally

### Prerequisites

- [Docker](https://www.docker.com/get-started) installed and running
- [Docker Compose](https://docs.docker.com/compose/) (included with Docker Desktop)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ai-prompt-library.git
cd ai-prompt-library
```

### 2. Configure environment (optional)

The default `.env` values work out of the box. To customize:

```bash
cp .env .env.local
# Edit .env.local with your preferred values
```

### 3. Start the full stack

```bash
docker-compose up --build
```

This single command will:
1. Pull PostgreSQL 15 and Redis 7 images
2. Build the FastAPI backend image
3. Build the React frontend (Vite build → Nginx)
4. Start all 4 services with proper health checks
5. Apply database table creation automatically on startup

### 4. Open the app

| Service | URL |
|---------|-----|
| Frontend (React) | http://localhost |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

### 5. Stop the stack

```bash
docker-compose down
```

To also remove the database volume (reset all data):

```bash
docker-compose down -v
```

---

## Validation Rules

### Frontend (React)

| Field | Rule |
|-------|------|
| Title | Required, minimum 3 characters |
| Content | Required, minimum 20 characters |
| Complexity | Required, integer between 1 and 10 |

### Backend (FastAPI + Pydantic)

Same rules enforced server-side — the API rejects invalid payloads with descriptive error messages even if requests bypass the UI.

---

## Architecture Overview

```
Browser
  │
  ▼
Nginx (port 80)
  ├── /api/* ──────────────► FastAPI (port 8000)
  │                               ├── PostgreSQL (prompts storage)
  │                               └── Redis (view counters)
  └── /* ─────────────────► React SPA (index.html)
```

- **Nginx** serves the built React app and proxies `/api/` requests to FastAPI, avoiding CORS issues in production.
- **FastAPI** handles all business logic. Tables are created automatically via SQLAlchemy on startup.
- **PostgreSQL** stores prompt data persistently in a named Docker volume.
- **Redis** stores view counts using the key pattern `prompt:{id}:views`. Counters are incremented atomically with `INCR`.

---

## Assumptions & Trade-offs

- **No authentication** — All users can read and create prompts. Authentication was not required by the spec.
- **Redis view counts are ephemeral** — If the Redis container is removed (`docker-compose down -v`), view counts reset. Prompt data in PostgreSQL is unaffected.
- **Auto table creation** — SQLAlchemy `create_all()` is used instead of Alembic migrations for simplicity. For production, Alembic would be preferred.
- **Multi-stage Docker build** — The frontend Dockerfile uses a two-stage build (Node → Nginx) to keep the final image small.

---

## Development (without Docker)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/promptlibrary
export REDIS_HOST=localhost

uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev   # Starts Vite dev server on http://localhost:3000
```

> The Vite dev server proxies `/api` requests to `http://backend:8000`. Update `vite.config.ts` target to `http://localhost:8000` for local development without Docker.