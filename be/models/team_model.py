from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, UniqueConstraint

from be.core.db import Base


def _now():
    return datetime.now(timezone.utc)


class Team(Base):
    """Ein Team teilt sich eine gemeinsame Aufgabenliste."""

    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(60), nullable=False)
    invite_code = Column(String(12), nullable=False, unique=True, index=True)  # zum Beitreten
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_now)


class TeamMember(Base):
    """Wer ist in welchem Team? role = "owner" (hat das Team erstellt) oder "member"."""

    __tablename__ = "team_members"
    __table_args__ = (UniqueConstraint("team_id", "user_id", name="uq_team_member"),)

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(20), nullable=False, default="member")
    joined_at = Column(DateTime(timezone=True), nullable=False, default=_now)
