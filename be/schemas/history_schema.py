from typing import Literal
from datetime import datetime
from pydantic import BaseModel

Status = Literal["todo", "in_progress", "done"]

class HistoryCreate(BaseModel):
    # owner_id kommt NICHT vom Client, sondern vom eingeloggten Benutzer
    title: str
    description: str | None = None
    status: Status = "todo"
    deleted_id: int | None = None  # id der gelöschten Aufgabe

class HistoryResponse(HistoryCreate):
    id: int
    owner_id: int
    deleted_date: datetime
    deleted_id: int | None = None

    class Config:
        from_attributes = True
