from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base
from be.core.config import DATABASE_URL

Base = declarative_base()

if not DATABASE_URL:
	raise RuntimeError("DATABASE_URL is not set. Add it to be/.env or export it in your environment.")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

# Neue Spalten in schon bestehenden Tabellen.
# create_all() legt nur fehlende TABELLEN an, keine fehlenden Spalten –
# deshalb ergänzen wir sie hier einmalig per ALTER TABLE.
NEW_COLUMNS = {
    "tasks": {"due_date": "DATE"},
    "users": {"role": "VARCHAR(20) NOT NULL DEFAULT 'user'"},
}

def _add_missing_columns():
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    with engine.begin() as conn:
        for table, columns in NEW_COLUMNS.items():
            if table not in existing_tables:
                continue
            existing = {c["name"] for c in inspector.get_columns(table)}
            for name, sql_type in columns.items():
                if name not in existing:
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {sql_type}"))

def init_db():
    Base.metadata.create_all(bind=engine)
    _add_missing_columns()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()