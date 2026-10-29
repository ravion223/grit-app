import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import categories, sessions

raw_origins = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:5173")
origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
app = FastAPI(title="Grit App API")

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
