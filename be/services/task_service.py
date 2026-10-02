from sqlalchemy.orm import Session

from be.models.task_model import Task
from be.models.user_model import User
from be.schemas.task_schema import TaskCreate, TaskUpdate

ADMIN_USERNAME = "admin"


class TaskNotFoundError(Exception):
    """Wird geworfen, wenn die Aufgabe nicht existiert oder dem Benutzer nicht gehört."""


class TaskService:
    def _query_for(self, db: Session, user: User):
        """Admin sieht alle Aufgaben, alle anderen nur ihre eigenen."""
        query = db.query(Task)
        if user.username != ADMIN_USERNAME:
            query = query.filter(Task.owner_id == user.id)
        return query

    def get_tasks(self, db: Session, user: User) -> list[Task]:
        return self._query_for(db, user).order_by(Task.id).all()

    def get_task(self, db: Session, task_id: int, user: User) -> Task:
        task = self._query_for(db, user).filter(Task.id == task_id).first()
        if not task:
            raise TaskNotFoundError(f"Task {task_id} not found")
        return task

    def create_task(self, db: Session, data: TaskCreate, user: User) -> Task:
        task = Task(**data.model_dump(), owner_id=user.id)
        db.add(task)
        db.commit()
        db.refresh(task)
        return task

    def update_task(self, db: Session, task_id: int, data: TaskUpdate, user: User) -> Task:
        task = self.get_task(db, task_id, user)
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(task, key, value)
        db.commit()
        db.refresh(task)
        return task

    def delete_task(self, db: Session, task_id: int, user: User) -> None:
        task = self.get_task(db, task_id, user)
        db.delete(task)
        db.commit()
