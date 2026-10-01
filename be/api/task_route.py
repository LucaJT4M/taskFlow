from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from be.core.db import get_db
from be.models.task_model import Task
from be.models.user_model import User
from be.schemas.task_schema import TaskCreate, TaskUpdate, TaskResponse
from be.services.user_service import User_Service

router = APIRouter(prefix="/tasks", tags=["Tasks"])
user_service = User_Service()


def get_own_task(db: Session, task_id: int, user: User) -> Task:
    task = db.get(Task, task_id)
    if not task or task.owner_id != user.id:
        raise HTTPException(404, "Task not found")
    return task


@router.get("", response_model=list[TaskResponse])
def get_tasks(db: Session = Depends(get_db), user: User = Depends(user_service.get_current_user)):
    return db.query(Task).filter(Task.owner_id == user.id).order_by(Task.id).all()


@router.post("", response_model=TaskResponse, status_code=201)
def create_task(data: TaskCreate, db: Session = Depends(get_db), user: User = Depends(user_service.get_current_user)):
    task = Task(**data.model_dump(), owner_id=user.id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, data: TaskUpdate, db: Session = Depends(get_db), user: User = Depends(user_service.get_current_user)):
    task = get_own_task(db, task_id, user)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db), user: User = Depends(user_service.get_current_user)):
    task = get_own_task(db, task_id, user)
    db.delete(task)
    db.commit()