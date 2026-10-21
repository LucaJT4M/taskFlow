from datetime import date
from typing import Literal
from pydantic import BaseModel, ConfigDict

Status = Literal["todo", "in_progress", "done"]
Priority = Literal[1, 2, 3]  # 1 niedrig, 2 mittel, 3 hoch

class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    status: Status = "todo"
    due_date: date | None = None  # Fälligkeitsdatum, z. B. "2026-10-10"
    priority: Priority | None = None  # leer = automatisch bestimmen

class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: Status | None = None
    due_date: date | None = None  # null schicken = Datum entfernen
    priority: Priority | None = None  # Stufe von Hand festlegen
    priority_auto: bool | None = None  # true = wieder automatisch bestimmen

class TaskResponse(TaskCreate):
    id: int
    owner_id: int
    team_id: int | None = None
    assignee_id: int | None = None
    priority: Priority = 2
    priority_auto: bool = True

    model_config = ConfigDict(from_attributes=True)

class PrioritySuggestRequest(BaseModel):
    title: str = ""
    description: str | None = None
    due_date: date | None = None


class PrioritySuggestion(BaseModel):
    priority: int  # 1 niedrig, 2 mittel, 3 hoch
    reasons: list[str]  # z. B. "keyword:prüfung", "due:tomorrow"


class TaskAdminCreate(BaseModel):
    title: str
    description: str | None = None
    status: Status = "todo"
    due_date: date | None = None
    owner_id: int
