from fastapi import APIRouter
from be.core.db import engine
from sqlalchemy import text

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("/live")
def live():
    return {"status": "alive"}

@router.get("/ready")
def ready():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))

        return {
            "status": "ready",
            "database": "ok",
        }

    except Exception:
        return {
            "status": "not_ready",
            "database": "failed",
        }