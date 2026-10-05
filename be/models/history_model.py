from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from be.core.db import Base

class History_Task(Base):
    __tablename__ = "history"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="todo")
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    deleted_date = Column(DateTime, nullable=False)
    deleted_id = Column(Integer, nullable=True)  # id der gelöschten Aufgabe
