# Docker Deployment — Step-by-Step Guide

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and **running**
- Run `docker --version` and `docker compose version` to confirm both are available

---

## Step 1 — Stop Local Dev Servers

If you have the local dev servers running (Vite + Uvicorn), stop them first so ports 3000 and 8000 are free.

---

## Step 2 — Configure the `.env` File

The `.env` file at the project root is used by Docker Compose. Make sure it looks like this:

```env
# PostgreSQL
POSTGRES_DB=promptlibrary
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Database URL — PostgreSQL for Docker
DATABASE_URL=postgresql://postgres:postgres@db:5432/promptlibrary
```

> **Important:** Change `REDIS_HOST` from `localhost` to `redis` and change `DATABASE_URL` from SQLite to PostgreSQL before running Docker Compose.

---

## Step 3 — Build and Start All Containers

From the project root (`c:/Projects/AI Prompt Library Application`), run:

```bash
docker compose up --build
```

This single command will:
1. Build the **backend** image (Python 3.11 + FastAPI + psycopg2)
2. Build the **frontend** image (Node 20 builds React → Nginx serves it)
3. Pull and start **PostgreSQL 15** (creates the `promptlibrary` database)
4. Pull and start **Redis 7**
5. Start all 4 containers in the correct dependency order

The first build takes ~2–3 minutes. Subsequent builds are faster due to layer caching.

---

## Step 4 — Verify All Containers Are Running

Open a new terminal and run:

```bash
docker compose ps
```

You should see all 4 services with status `running` (or `healthy`):

```
NAME               STATUS
prompt_db          running (healthy)
prompt_redis       running (healthy)
prompt_backend     running
prompt_frontend    running
```

---

## Step 5 — Access the Application

| Service       | URL                          |
|---------------|------------------------------|
| Frontend (UI) | http://localhost             |
| Backend API   | http://localhost:8000        |
| API Docs      | http://localhost:8000/docs   |
| Health Check  | http://localhost:8000/health |

Open **http://localhost** in your browser — the full app should be running.

---

## Step 6 — View Logs (Optional)

To watch all container logs in real time:

```bash
docker compose logs -f
```

To watch a specific service only:

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

---

## Step 7 — Stop the Application

To stop all containers (keeps data volumes):

```bash
docker compose down
```

To stop AND delete all data (PostgreSQL volume):

```bash
docker compose down -v
```

---

## Rebuilding After Code Changes

If you change any source code, rebuild the affected image:

```bash
# Rebuild everything
docker compose up --build

# Rebuild only the backend
docker compose up --build backend

# Rebuild only the frontend
docker compose up --build frontend
```

---

## Architecture Overview

```
Browser
  │
  ▼
┌─────────────────────────────┐
│  Frontend (Nginx : 80)      │  ← Serves React SPA
│  /api/* → proxy to backend  │
└────────────┬────────────────┘
             │ HTTP proxy
             ▼
┌─────────────────────────────┐
│  Backend (FastAPI : 8000)   │  ← REST API
└──────┬──────────────────────┘
       │              │
       ▼              ▼
┌──────────┐   ┌──────────────┐
│ PostgreSQL│   │   Redis      │
│  : 5432  │   │   : 6379     │
└──────────┘   └──────────────┘
```

---

## Troubleshooting

**Port already in use:**
```bash
# Find what's using port 80 or 8000
netstat -ano | findstr :80
netstat -ano | findstr :8000
```

**Backend can't connect to DB:**
The backend has a built-in retry loop (10 attempts, 3s apart). Check logs:
```bash
docker compose logs backend
```

**Reset everything and start fresh:**
```bash
docker compose down -v
docker compose up --build