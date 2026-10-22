# backend/database.py
import os

from dotenv import load_dotenv
from sqlmodel import SQLModel, create_engine

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL, echo=True)


def init_db():
    # Creates all tables defined in SQLModel classes
    # (import models here later!)
    SQLModel.metadata.create_all(engine)
    print("✅ Database tables created successfully in Neon 'development' branch!")


if __name__ == "__main__":
    init_db()
