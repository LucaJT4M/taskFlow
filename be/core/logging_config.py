import logging
import os
from logging.handlers import RotatingFileHandler

def setup_logging():
    level = os.getenv("LOG_LEVEL", "INFO")          # in .env änderbar, z. B. DEBUG
    fmt = logging.Formatter("%(asctime)s | %(levelname)-7s | %(name)s | %(message)s")

    root = logging.getLogger()
    root.setLevel(level)

    console = logging.StreamHandler()               # Konsole (Render zeigt das unter "Logs")
    console.setFormatter(fmt)
    root.addHandler(console)

    os.makedirs("logs", exist_ok=True)              # lokal zusätzlich in eine Datei
    file = RotatingFileHandler("logs/taskflow.log", maxBytes=1_000_000, backupCount=3, encoding="utf-8")
    file.setFormatter(fmt)
    root.addHandler(file)