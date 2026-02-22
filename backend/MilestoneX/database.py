from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from fastapi import Depends

# -------------------------
# Database URL
# -------------------------
DATABASE_URL = "sqlite:///./milestonex.db"

# -------------------------
# Engine
# -------------------------
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # Required only for SQLite
)

# -------------------------
# Session Local
# -------------------------
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# -------------------------
# Base class
# -------------------------
Base = declarative_base()

# -------------------------
# Dependency
# -------------------------
def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()