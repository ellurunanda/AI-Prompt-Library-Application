import os
import redis
from dotenv import load_dotenv

load_dotenv()

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))

# Attempt connection; fall back gracefully if Redis is unavailable
try:
    redis_client = redis.Redis(
        host=REDIS_HOST, port=REDIS_PORT, db=0,
        decode_responses=True, socket_connect_timeout=2,
    )
    redis_client.ping()
    REDIS_AVAILABLE = True
    print(f"Redis connected at {REDIS_HOST}:{REDIS_PORT}")
except Exception as e:
    redis_client = None  # type: ignore[assignment]
    REDIS_AVAILABLE = False
    print(f"Redis unavailable ({e}). View counts will return 0.")


def increment_view_count(prompt_id: int) -> int:
    if not REDIS_AVAILABLE or redis_client is None:
        return 0
    try:
        key = f"prompt:{prompt_id}:views"
        return int(redis_client.incr(key))
    except Exception:
        return 0


def get_view_count(prompt_id: int) -> int:
    if not REDIS_AVAILABLE or redis_client is None:
        return 0
    try:
        key = f"prompt:{prompt_id}:views"
        value = redis_client.get(key)
        return int(value) if value else 0
    except Exception:
        return 0