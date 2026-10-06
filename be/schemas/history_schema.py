from typing import Literal
from datetime import datetime
from pydantic import BaseModel

Status = Literal["todo", "in_progress", "done"]

class HistoryCreate(BaseModel):
    title: str
    description: str | None = None
    status: Status = "todo"
    deleted_id: int | None = None  # id der gelöschten Aufgabe
    owner_id: int

class HistoryResponse(HistoryCreate):
    id: int
    owner_id: int
    deleted_date: datetime
    deleted_id: int | None = None

    class Config:
        from_attributes = True
