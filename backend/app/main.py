import time
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import OperationalError

from .database import engine, Base, DATABASE_URL
from .routers import prompts


def wait_for_db(retries: int = 10, delay: int = 3):
    """Wait for the database to be ready (needed for PostgreSQL in Docker)."""
    # SQLite is always available — skip the retry loop
    if DATABASE_URL.startswith("sqlite"):
        print("Using SQLite — skipping DB readiness check.")
        return

    for attempt in range(retries):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("Database is ready.")
            return
        except OperationalError:
            print(f"Database not ready, retrying in {delay}s... ({attempt + 1}/{retries})")
            time.sleep(delay)
    raise RuntimeError("Could not connect to the database after multiple retries.")


# Ensure DB is ready, then create all tables
wait_for_db()
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Prompt Library API",
    description="A REST API for managing AI image generation prompts",
    version="1.0.0",
)

# CORS configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:80,http://frontend").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(prompts.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "AI Prompt Library API is running", "docs": "/docs"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}