from sqlalchemy.orm import Session
from datetime import datetime, timezone
from be.models.history_model import History_Task
from be.models.task_model import Task
from be.schemas.history_schema import HistoryCreate

class HistoryService:
    def get_history_of_user(self, db: Session, user_id: int):
        # neueste zuerst
        return (
            db.query(History_Task)
            .filter(History_Task.owner_id == user_id)
            .order_by(History_Task.deleted_date.desc())
            .all()
        )

    def create_history_task(self, db: Session, history_task: HistoryCreate, owner_id: int, deleted_id: int | None = None):
        db_history_task = History_Task(
            title=history_task.title,
            description=history_task.description,
            status=history_task.status,
            owner_id=owner_id,
            deleted_date=datetime.now(timezone.utc).replace(tzinfo=None),  # in UTC gespeichert
            deleted_id=deleted_id,
        )
        db.add(db_history_task)
        db.commit()
        db.refresh(db_history_task)
        return db_history_task

    def add_deleted_task(self, db: Session, task: Task):
        """Kopiert eine Aufgabe in den Verlauf, bevor sie gelöscht wird."""
        data = HistoryCreate(title=task.title, description=task.description, status=task.status)
        return self.create_history_task(db, data, owner_id=task.owner_id, deleted_id=task.id)
