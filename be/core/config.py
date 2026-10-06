import os
from pathlib import Path
from dotenv import load_dotenv

ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=ENV_PATH)

DATABASE_URL = os.getenv("DATABASE_URL")
# Hoster (Aiven, Neon, Render) geben "postgres://..." aus – SQLAlchemy braucht den Treiber psycopg
if DATABASE_URL and DATABASE_URL.startswith(("postgres://", "postgresql://")):
    DATABASE_URL = "postgresql+psycopg://" + DATABASE_URL.split("://", 1)[1]
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
BE_URL = os.getenv("BE_URL", "http://localhost:8000")

# Erlaubte Frontend-Adressen (CORS), durch Komma getrennt.
# Online z. B.: FRONTEND_URLS=https://taskflow.vercel.app
FRONTEND_URLS = [
    url.strip().rstrip("/")
    for url in os.getenv("FRONTEND_URLS", "http://localhost:5173,http://localhost:5174").split(",")
    if url.strip()
]