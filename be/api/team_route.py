from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from be.core.db import get_db
from be.models.user_model import User
from be.schemas.history_schema import HistoryCreate
from be.schemas.team_schema import (
    TeamCreate, TeamDetail, TeamJoin, TeamSummary, TeamTaskCreate,
    TeamTaskResponse, TeamTaskUpdate, TeamUpdate,
)
from be.security.jwt_auth import get_current_user
from be.services.history_service import HistoryService
from be.services.team_service import TeamError, TeamService
import logging

logger = logging.getLogger(__name__)


router = APIRouter(prefix="/teams", tags=["Teams"])
service = TeamService()
history_service = HistoryService()


def _run(action):
    """Führt die Service-Funktion aus und macht aus TeamError eine HTTP-Antwort."""
    try:
        return action()
    except TeamError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


# ---------- Teams ----------

@router.get("", response_model=list[TeamSummary])
def get_teams(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Alle Teams, in denen der Benutzer Mitglied ist"""
    return service.get_teams(db, user)


@router.post("", response_model=TeamDetail, status_code=201)
def create_team(data: TeamCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return _run(lambda: service.create_team(db, data.name, user))


@router.post("/join", response_model=TeamDetail)
def join_team(data: TeamJoin, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Mit Einladungscode einem Team beitreten"""
    return _run(lambda: service.join_team(db, data.invite_code, user))


@router.get("/{team_id}", response_model=TeamDetail)
def get_team(team_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return _run(lambda: service.get_team(db, team_id, user))


@router.patch("/{team_id}", response_model=TeamDetail)
def rename_team(team_id: int, data: TeamUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return _run(lambda: service.rename_team(db, team_id, data.name, user))


@router.post("/{team_id}/invite-code", response_model=TeamDetail)
def new_invite_code(team_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return _run(lambda: service.new_invite_code(db, team_id, user))


@router.delete("/{team_id}", status_code=204)
def delete_team(team_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _run(lambda: service.delete_team(db, team_id, user))


@router.delete("/{team_id}/members/{member_id}", status_code=204)
def remove_member(team_id: int, member_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Besitzer entfernt ein Mitglied – mit der eigenen id: Team verlassen"""
    _run(lambda: service.remove_member(db, team_id, member_id, user))


# ---------- Aufgaben im Team ----------

@router.get("/{team_id}/tasks", response_model=list[TeamTaskResponse])
def get_team_tasks(team_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return _run(lambda: service.get_team_tasks(db, team_id, user))


@router.post("/{team_id}/tasks", response_model=TeamTaskResponse, status_code=201)
def create_team_task(team_id: int, data: TeamTaskCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return _run(lambda: service.create_team_task(db, team_id, data, user))


@router.patch("/{team_id}/tasks/{task_id}", response_model=TeamTaskResponse)
def update_team_task(team_id: int, task_id: int, data: TeamTaskUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return _run(lambda: service.update_team_task(db, team_id, task_id, data, user))


@router.delete("/{team_id}/tasks/{task_id}", status_code=204)
def delete_team_task(team_id: int, task_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    def action():
        task = service.get_team_task(db, team_id, task_id, user)
        # wie bei persönlichen Aufgaben: landet im Verlauf von dem, der löscht
        history_service.create_history_task(
            db,
            HistoryCreate(
                title=task.title,
                description=task.description,
                status=task.status,
                deleted_id=task.id,
                owner_id=user.id,
            ),
            owner_id=user.id,
        )
        service.delete_team_task(db, team_id, task_id, user)

    _run(action)
