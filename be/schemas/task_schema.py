from typing import Literal
from pydantic import BaseModel

Status = Literal["todo", "in_progress", "done"]

class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    status: Status = "todo"

class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: Status | None = None

class TaskResponse(TaskCreate):
    id: int
    owner_id: int

    class Config:
        from_attributes = True