# backend/database.py
from sqlmodel import SQLModel, create_engine
import os
from dotenv import load_dotenv

# Load your .env file
load_dotenv()

# Get the Neon DB URL
DATABASE_URL = os.getenv("DATABASE_URL")

# SQLModel requires the prefix to be postgresql:// (Neon gives this by default)
engine = create_engine(DATABASE_URL, echo=True)

def init_db():
    # This creates all tables defined in your SQLModel classes
    # (import your models here later!)
    SQLModel.metadata.create_all(engine)
    print("✅ Database tables created successfully in Neon 'development' branch!")

if __name__ == "__main__":
    init_db()