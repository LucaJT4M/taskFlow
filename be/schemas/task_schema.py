from datetime import date
from typing import Literal
from pydantic import BaseModel, ConfigDict

Status = Literal["todo", "in_progress", "done"]

class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    status: Status = "todo"
    due_date: date | None = None  # Fälligkeitsdatum, z. B. "2026-10-10"

class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: Status | None = None
    due_date: date | None = None  # null schicken = Datum entfernen

class TaskResponse(TaskCreate):
    id: int
    owner_id: int

    model_config = ConfigDict(from_attributes=True)

class TaskAdminCreate(BaseModel):
    title: str
    description: str | None = None
    status: Status = "todo"
    due_date: date | None = None
    owner_id: int
