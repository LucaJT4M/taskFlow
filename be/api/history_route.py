from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from be.core.db import get_db
from be.models.user_model import User
from be.services.history_service import HistoryService
from be.schemas.history_schema import HistoryResponse, HistoryCreate
from be.security.current_user import get_current_user

router = APIRouter(prefix="/history", tags=["Task History"])
service = HistoryService()

@router.post("", response_model=HistoryResponse)
def create_history_task(
    history_task: HistoryCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Erstellt history item von Task"""
    try:
        return service.create_history_task(db, history_task, owner_id=user.id)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=list[HistoryResponse])
def get_history_tasks(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Verlauf (gelöschte Aufgaben) des eingeloggten Benutzers"""
    return service.get_history_of_user(db, user.id)