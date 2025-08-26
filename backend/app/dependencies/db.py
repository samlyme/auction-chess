from typing import Annotated
from fastapi import Depends
from sqlalchemy import create_engine, Engine
from sqlalchemy.orm import Session, DeclarativeBase
import os # Import os for path manipulation

class Base(DeclarativeBase):
    pass

# Use a file-based SQLite database for persistence during development/testing
# This will create 'test.db' in the same directory as your db.py file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE_PATH = os.path.join(BASE_DIR, "test.db")
DB_URL = f"sqlite:///{DB_FILE_PATH}"

print(f"Database URL: {DB_URL}")
print(f"Database file path: {DB_FILE_PATH}")

# Ensure `echo=True` for debugging, so you can see the SQL queries
engine: Engine = create_engine(DB_URL, echo=False)

def init_db():
    print("Initializing database: Creating all tables...")
    Base.metadata.create_all(engine)
    print("Database initialization complete.")

def get_session():
    with Session(engine) as session:
        yield session

DBDep = Annotated[Session, Depends(get_session)]