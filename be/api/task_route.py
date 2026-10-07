from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from be.core.db import get_db
from be.models.user_model import User
from be.schemas.task_schema import TaskCreate, TaskUpdate, TaskResponse, TaskAdminCreate
from be.security.current_user import get_current_user
from be.services.task_service import TaskService, TaskNotFoundError
from be.services.user_service import UserService
from be.services.history_service import HistoryService, HistoryCreate

router = APIRouter(prefix="/tasks", tags=["Tasks"])
task_service = TaskService()
user_service = UserService()
history_service = HistoryService()

@router.get("", response_model=list[TaskResponse])
def get_tasks(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return task_service.get_tasks(db, user)

@router.post("", response_model=TaskResponse, status_code=201)
def create_task(data: TaskCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return task_service.create_task(db, data, user)

@router.post("/create_as_admin", response_model=TaskResponse)
def create_task_as_admin(data: TaskAdminCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.role == UserRole.ADMIN.value:
        creating_user = user_service.get_user_by_id(db, data.owner_id)
        task_create = TaskCreate(**data.model_dump(exclude={"owner_id"}))

        return task_service.create_task(db, task_create, creating_user)

@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, data: TaskUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    try:
        return task_service.update_task(db, task_id, data, user)
    except TaskNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        # Put the task into history before deleting it.
        to_delete_task = task_service.get_task(db, task_id, user)

        history_create = HistoryCreate(
            title=to_delete_task.title,
            description=to_delete_task.description,
            status=to_delete_task.status,
            deleted_id=to_delete_task.id,
            owner_id=to_delete_task.owner_id,
        )

        history_service.create_history_task(
            db,
            history_create,
            owner_id=to_delete_task.owner_id,
        )

        task_service.delete_task(db, task_id, user)
    except TaskNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))