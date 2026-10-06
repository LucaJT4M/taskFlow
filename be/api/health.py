from fastapi import APIRouter, HTTPException
from be.core.db import engine
from sqlalchemy import text
from be.services.garden_service import GardenService
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends
from be.core.db import get_db
from be.models.task_model import Task
from be.security.jwt_auth import get_current_username

router = APIRouter(prefix="/health", tags=["Health"])
garden_service = GardenService()

@router.get("/cheat")
def cheat(db: Session = Depends(get_db), current_user: str = Depends(get_current_username)):
    if current_user == "admin":
        for i in range(100):
            test_task = Task()
            test_task.owner_id = 1
            test_task.title = "test"
            test_task.status = "done"
            test_task.id = i + 50

            garden_service.reward_task(db, task=test_task)

        db.commit()

    else:
        raise HTTPException(status_code=403, detail="Not authorized for user output")

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