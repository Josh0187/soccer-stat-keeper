import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# load env vars
load_dotenv()

# postgreSQL connection string ex. postgresql://username:password@localhost:5432/database_name
DATABASE_URL = os.getenv(
    # env var default
    "DATABASE_URL",
    # local fallback
    "postgresql://joslaw@localhost:5432/soccer_stats"
)

# SQLAlchemy connection engine
engine = create_engine(DATABASE_URL)

# generates temp database transactions for API routes
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# cleanly handle database connections
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
