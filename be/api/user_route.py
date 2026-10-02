from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from be.core.db import get_db
from be.schemas.task_schema import TaskCreate, TaskUpdate, TaskResponse
from be.services.task_service import TaskService, TaskNotFoundError

router = APIRouter(prefix="/tasks", tags=["Tasks"])
task_service = TaskService()


@router.get("", response_model=list[TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    return task_service.get_tasks(db)


@router.post("", response_model=TaskResponse, status_code=201)
def create_task(data: TaskCreate, db: Session = Depends(get_db)):
    return task_service.create_task(db, data)


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, data: TaskUpdate, db: Session = Depends(get_db)):
    try:
        return task_service.update_task(db, task_id, data)
    except TaskNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    try:
        task_service.delete_task(db, task_id)
    except TaskNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))