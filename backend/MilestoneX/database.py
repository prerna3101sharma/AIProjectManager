import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from fastapi import Depends
from dotenv import load_dotenv

load_dotenv()

# -------------------------
# Database URL
# -------------------------
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./milestonex.db")

# -------------------------
# Engine
# -------------------------
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args
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