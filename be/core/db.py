from sqlalchemy import create_engine
import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy.orm import sessionmaker, declarative_base

ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=ENV_PATH)

DATABASE_URL = os.getenv("DATABASE_URL")
Base = declarative_base()

if not DATABASE_URL:
	raise RuntimeError("DATABASE_URL is not set. Add it to be/.env or export it in your environment.")

engine = create_engine(DATABASE_URL)

def init_db():
    Base.metadata.create_all(bind=engine)