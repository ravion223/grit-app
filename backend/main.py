import os
import secrets

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Security, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader

from routers import categories, daily_logs, sessions

load_dotenv()

is_debug = os.getenv("DEBUG", "False").strip().lower() in ("true", "1", "yes")
raw_origins = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:5173")
origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

api_key_header = APIKeyHeader(name="X-Grit-Key", auto_error=False)


def verify_secret_key(api_key: str | None = Security(api_key_header)) -> None:
    """Validate the X-Grit-Key header against GRIT_SECRET_KEY in constant time."""
    expected_key = os.getenv("GRIT_SECRET_KEY", "").strip()
    if not expected_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server GRIT_SECRET_KEY is not configured",
        )
    if not api_key or not secrets.compare_digest(api_key.strip(), expected_key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing access key",
        )


app = FastAPI(
    title="Grit App API",
    dependencies=[Depends(verify_secret_key)],
    docs_url="/docs" if is_debug else None,
    redoc_url="/redoc" if is_debug else None,
    openapi_url="/openapi.json" if is_debug else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(categories.router)
app.include_router(sessions.router)
app.include_router(daily_logs.router)
