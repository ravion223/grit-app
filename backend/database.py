# backend/database.py
import os

from dotenv import load_dotenv
from sqlmodel import Session, SQLModel, create_engine

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL") or ""

engine = create_engine(
    DATABASE_URL,
    echo=False,  # Turn off raw SQL spam in terminal
    pool_pre_ping=True,  # Pings db to verify connection before using it
    pool_recycle=300,  # Refreshes connections every 5 minutes
)


def get_session():
    with Session(engine) as session:
        yield session


def init_db():
    # Creates all tables defined in SQLModel classes
    import models  # noqa: F401

    SQLModel.metadata.create_all(engine)
    print("✅ Database tables created successfully in Neon 'development' branch!")


if __name__ == "__main__":
    init_db()
