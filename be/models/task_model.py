from sqlalchemy import Boolean, Column, Date, Integer, String, Text, ForeignKey
from be.core.db import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="todo")
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    due_date = Column(Date, nullable=True)  # Fälligkeitsdatum (optional)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True, index=True)  # leer = persönliche Aufgabe
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # wer im Team zuständig ist
    priority = Column(Integer, nullable=False, default=2)  # Wichtigkeit: 1 niedrig, 2 mittel, 3 hoch
    priority_auto = Column(Boolean, nullable=False, default=True)  # True = automatisch bestimmt