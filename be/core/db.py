from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from be.core.config import DATABASE_URL

Base = declarative_base()

if not DATABASE_URL:
	raise RuntimeError("DATABASE_URL is not set. Add it to be/.env or export it in your environment.")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()