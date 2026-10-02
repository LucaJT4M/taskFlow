from sqlalchemy.orm import Session

from be.models.task_model import Task
from be.schemas.task_schema import TaskCreate, TaskUpdate


class TaskNotFoundError(Exception):
    """Wird geworfen, wenn eine Aufgabe mit der angegebenen ID nicht existiert."""


class TaskService:
    def get_tasks(self, db: Session) -> list[Task]:
        return db.query(Task).order_by(Task.id).all()

    def get_task(self, db: Session, task_id: int) -> Task:
        task = db.get(Task, task_id)
        if not task:
            raise TaskNotFoundError(f"Task {task_id} not found")
        return task

    def create_task(self, db: Session, data: TaskCreate) -> Task:
        task = Task(**data.model_dump())
        db.add(task)
        db.commit()
        db.refresh(task)
        return task

    def update_task(self, db: Session, task_id: int, data: TaskUpdate) -> Task:
        task = self.get_task(db, task_id)
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(task, key, value)
        db.commit()
        db.refresh(task)
        return task

    def delete_task(self, db: Session, task_id: int) -> None:
        task = self.get_task(db, task_id)
        db.delete(task)
        db.commit()