from sqlalchemy.orm import Session
from datetime import datetime
from be.models.history_model import History_Task
from be.schemas.history_schema import HistoryCreate

class HistoryService:
    def get_history_of_user(self, db: Session, user_id: int):
        return db.query(History_Task).filter(History_Task.owner_id == user_id).all()

    def create_history_task(self, db: Session, history_task: HistoryCreate, deleted_id: int):
        db_history_task = History_Task(
            title=history_task.title,
            description=history_task.description,
            status=history_task.status,
            owner_id=history_task.owner_id,
            deleted_date=datetime.utcnow(),
            deleted_id=deleted_id
        )
        db.add(db_history_task)
        db.commit()
        db.refresh(db_history_task)
        return db_history_task