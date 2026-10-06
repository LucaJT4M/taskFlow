from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import requests

from be.core.db import get_db
from be.models.user_model import User
from be.schemas.task_schema import TaskCreate, TaskUpdate, TaskResponse, TaskAdminCreate
from be.security.current_user import get_current_user
from be.services.task_service import TaskService, TaskNotFoundError
from be.core.config import BE_URL

router = APIRouter(prefix="/tasks", tags=["Tasks"])
task_service = TaskService()

@router.get("", response_model=list[TaskResponse])
def get_tasks(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return task_service.get_tasks(db, user)

@router.post("", response_model=TaskResponse, status_code=201)
def create_task(data: TaskCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return task_service.create_task(db, data, user)

@router.post("/create_as_admin", response_model=TaskResponse)
def create_task_as_admin(data: TaskAdminCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.username == "admin":
        user_response = requests.get(f"{BE_URL.rstrip("/")}/user/id/{data.owner_id}")

        if user_response.status_code >= 400:
            detail = user_response.text or "Failed to get user by id"
            raise HTTPException(status_code=user_response.status_code, detail=detail)

        creating_user = User()
        creating_user.id = user_response.json()["id"]

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
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        # put taskItem into history (über die REST-API des History-Moduls)
        to_delete_task = task_service.get_task(db, task_id, user)

        auth_header = request.headers.get("Authorization")
        if not auth_header:
            raise HTTPException(status_code=401, detail="Missing Authorization header")

        # owner_id wird nicht mitgeschickt: /history nimmt den Benutzer aus dem Token
        history_response = requests.post(
            f"{BE_URL.rstrip('/')}/history",
            json={
                "title": to_delete_task.title,
                "description": to_delete_task.description,
                "status": to_delete_task.status,
                "deleted_id": to_delete_task.id,
            },
            headers={"Authorization": auth_header},
            timeout=10,
        )

        if history_response.status_code >= 400:
            detail = history_response.text or "Failed to create history entry"
            raise HTTPException(status_code=history_response.status_code, detail=detail)

        task_service.delete_task(db, task_id, user)
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"History API request failed: {str(e)}")
    except TaskNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))