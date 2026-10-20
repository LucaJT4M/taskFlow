import secrets

from sqlalchemy import func
from sqlalchemy.orm import Session

from be.models.task_model import Task
from be.models.team_model import Team, TeamMember
from be.models.user_model import User
from be.schemas.team_schema import TeamTaskCreate, TeamTaskUpdate
from be.services.garden_service import GardenService

garden_service = GardenService()

# ohne 0/O und 1/I, damit man den Code gut abtippen kann
CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
CODE_LENGTH = 8


class TeamError(Exception):
    """Fehler mit passendem HTTP-Statuscode, den die Route weitergibt."""

    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def normalize_code(code: str) -> str:
    """ "k7q2-m9xa" -> "K7Q2M9XA" """
    return "".join(c for c in code.upper() if c.isalnum())


class TeamService:
    # ---------- Hilfsfunktionen ----------

    def _new_code(self, db: Session) -> str:
        while True:
            code = "".join(secrets.choice(CODE_ALPHABET) for _ in range(CODE_LENGTH))
            if not db.query(Team).filter(Team.invite_code == code).first():
                return code

    def _membership(self, db: Session, team_id: int, user: User) -> TeamMember:
        """Mitgliedschaft des Benutzers – sonst 404 (fremde Teams sind „unsichtbar“)."""
        member = (
            db.query(TeamMember)
            .filter(TeamMember.team_id == team_id, TeamMember.user_id == user.id)
            .first()
        )
        if not member:
            raise TeamError("Team nicht gefunden", 404)
        return member

    def _require_owner(self, member: TeamMember) -> None:
        if member.role != "owner":
            raise TeamError("Nur der Team-Besitzer darf das", 403)

    def _check_assignee(self, db: Session, team_id: int, assignee_id: int | None) -> None:
        if assignee_id is None:
            return
        is_member = (
            db.query(TeamMember)
            .filter(TeamMember.team_id == team_id, TeamMember.user_id == assignee_id)
            .first()
        )
        if not is_member:
            raise TeamError("Zuständige Person ist kein Mitglied des Teams")

    def _team_task(self, db: Session, team_id: int, task_id: int) -> Task:
        task = db.query(Task).filter(Task.id == task_id, Task.team_id == team_id).first()
        if not task:
            raise TeamError(f"Task {task_id} not found", 404)
        return task

    # ---------- Teams ----------

    def get_teams(self, db: Session, user: User) -> list[dict]:
        rows = (
            db.query(Team, TeamMember.role)
            .join(TeamMember, TeamMember.team_id == Team.id)
            .filter(TeamMember.user_id == user.id)
            .order_by(Team.created_at)
            .all()
        )
        result = []
        for team, role in rows:
            member_count = db.query(func.count(TeamMember.id)).filter(TeamMember.team_id == team.id).scalar()
            open_tasks = (
                db.query(func.count(Task.id))
                .filter(Task.team_id == team.id, Task.status != "done")
                .scalar()
            )
            result.append({
                "id": team.id,
                "name": team.name,
                "my_role": role,
                "member_count": member_count,
                "open_tasks": open_tasks,
                "created_at": team.created_at,
            })
        return result

    def get_team(self, db: Session, team_id: int, user: User) -> dict:
        me = self._membership(db, team_id, user)
        team = db.get(Team, team_id)
        rows = (
            db.query(TeamMember, User.username)
            .join(User, User.id == TeamMember.user_id)
            .filter(TeamMember.team_id == team_id)
            .order_by(TeamMember.joined_at)
            .all()
        )
        return {
            "id": team.id,
            "name": team.name,
            "invite_code": team.invite_code,
            "my_role": me.role,
            "created_at": team.created_at,
            "members": [
                {"user_id": m.user_id, "username": name, "role": m.role, "joined_at": m.joined_at}
                for m, name in rows
            ],
        }

    def create_team(self, db: Session, name: str, user: User) -> dict:
        team = Team(name=name, invite_code=self._new_code(db), owner_id=user.id)
        db.add(team)
        db.flush()  # team.id wird gebraucht
        db.add(TeamMember(team_id=team.id, user_id=user.id, role="owner"))
        db.commit()
        return self.get_team(db, team.id, user)

    def join_team(self, db: Session, invite_code: str, user: User) -> dict:
        team = db.query(Team).filter(Team.invite_code == normalize_code(invite_code)).first()
        if not team:
            raise TeamError("Kein Team mit diesem Einladungscode gefunden", 404)
        already = (
            db.query(TeamMember)
            .filter(TeamMember.team_id == team.id, TeamMember.user_id == user.id)
            .first()
        )
        if already:
            raise TeamError("Du bist schon Mitglied in diesem Team", 409)
        db.add(TeamMember(team_id=team.id, user_id=user.id, role="member"))
        db.commit()
        return self.get_team(db, team.id, user)

    def rename_team(self, db: Session, team_id: int, name: str, user: User) -> dict:
        self._require_owner(self._membership(db, team_id, user))
        db.get(Team, team_id).name = name
        db.commit()
        return self.get_team(db, team_id, user)

    def new_invite_code(self, db: Session, team_id: int, user: User) -> dict:
        """Neuer Code – der alte funktioniert danach nicht mehr."""
        self._require_owner(self._membership(db, team_id, user))
        db.get(Team, team_id).invite_code = self._new_code(db)
        db.commit()
        return self.get_team(db, team_id, user)

    def delete_team(self, db: Session, team_id: int, user: User) -> None:
        self._require_owner(self._membership(db, team_id, user))
        self._delete_team(db, team_id)
        db.commit()

    def _delete_team(self, db: Session, team_id: int) -> None:
        # Belohnungen (Garten) bleiben erhalten, nur Aufgaben + Mitglieder verschwinden
        db.query(Task).filter(Task.team_id == team_id).delete(synchronize_session=False)
        db.query(TeamMember).filter(TeamMember.team_id == team_id).delete(synchronize_session=False)
        db.query(Team).filter(Team.id == team_id).delete(synchronize_session=False)

    def remove_member(self, db: Session, team_id: int, member_user_id: int, user: User) -> None:
        """Besitzer entfernt ein Mitglied – oder ein Mitglied verlässt das Team selbst."""
        me = self._membership(db, team_id, user)
        if member_user_id != user.id:
            self._require_owner(me)
        target = (
            db.query(TeamMember)
            .filter(TeamMember.team_id == team_id, TeamMember.user_id == member_user_id)
            .first()
        )
        if not target:
            raise TeamError("Mitglied nicht gefunden", 404)
        self._leave(db, target)
        db.commit()

    def _leave(self, db: Session, member: TeamMember) -> None:
        team_id, user_id = member.team_id, member.user_id
        others = (
            db.query(TeamMember)
            .filter(TeamMember.team_id == team_id, TeamMember.user_id != user_id)
            .order_by(TeamMember.joined_at)
            .all()
        )
        if not others:
            self._delete_team(db, team_id)  # letztes Mitglied geht -> Team wird gelöscht
            return

        if member.role == "owner":
            # Besitz geht an das Mitglied, das am längsten dabei ist
            others[0].role = "owner"
            db.get(Team, team_id).owner_id = others[0].user_id

        # Aufgaben dieser Person im Team: Zuständigkeit entfernen, Ersteller umschreiben
        new_owner_id = others[0].user_id if member.role == "owner" else db.get(Team, team_id).owner_id
        db.query(Task).filter(Task.team_id == team_id, Task.assignee_id == user_id).update(
            {Task.assignee_id: None}, synchronize_session=False
        )
        db.query(Task).filter(Task.team_id == team_id, Task.owner_id == user_id).update(
            {Task.owner_id: new_owner_id}, synchronize_session=False
        )
        db.delete(member)

    def remove_user_everywhere(self, db: Session, user: User) -> None:
        """Wird beim Löschen eines Benutzers aufgerufen."""
        for member in db.query(TeamMember).filter(TeamMember.user_id == user.id).all():
            self._leave(db, member)
        db.flush()

    # ---------- Aufgaben im Team ----------

    def get_team_tasks(self, db: Session, team_id: int, user: User) -> list[Task]:
        self._membership(db, team_id, user)
        return db.query(Task).filter(Task.team_id == team_id).order_by(Task.id).all()

    def create_team_task(self, db: Session, team_id: int, data: TeamTaskCreate, user: User) -> Task:
        self._membership(db, team_id, user)
        self._check_assignee(db, team_id, data.assignee_id)
        task = Task(**data.model_dump(), owner_id=user.id, team_id=team_id)
        db.add(task)
        db.flush()
        if task.status == "done":
            garden_service.reward_task(db, task, owner_id=user.id)
        db.commit()
        db.refresh(task)
        return task

    def update_team_task(self, db: Session, team_id: int, task_id: int, data: TeamTaskUpdate, user: User) -> Task:
        """Jedes Mitglied darf Team-Aufgaben bearbeiten und verschieben."""
        self._membership(db, team_id, user)
        task = self._team_task(db, team_id, task_id)
        changes = data.model_dump(exclude_unset=True)
        if "assignee_id" in changes:
            self._check_assignee(db, team_id, changes["assignee_id"])
        was_done = task.status == "done"
        for key, value in changes.items():
            setattr(task, key, value)
        if not was_done and task.status == "done":
            # der Garten von dem, der sie erledigt hat, wächst
            garden_service.reward_task(db, task, owner_id=user.id)
        db.commit()
        db.refresh(task)
        return task

    def get_team_task(self, db: Session, team_id: int, task_id: int, user: User) -> Task:
        self._membership(db, team_id, user)
        return self._team_task(db, team_id, task_id)

    def delete_team_task(self, db: Session, team_id: int, task_id: int, user: User) -> None:
        task = self.get_team_task(db, team_id, task_id, user)
        db.delete(task)
        db.commit()
