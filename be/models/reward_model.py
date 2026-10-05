from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer

from be.core.db import Base


class Reward(Base):
    """Eine Belohnung = eine erledigte Aufgabe, die den Garten wachsen lässt.

    Jede Aufgabe wird nur EINMAL belohnt (task_id ist eindeutig).
    task_id ist bewusst kein Fremdschlüssel: Wird die Aufgabe später
    gelöscht, bleibt das Wachstum im Garten erhalten.
    """

    __tablename__ = "rewards"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    task_id = Column(Integer, nullable=False, unique=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
