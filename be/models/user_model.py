from sqlalchemy import Column, Integer, String
from be.core.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    def __eq__(self, other):
        return self.__dict__ == other.__dict__

    def __nonzero__(self):
        return bool(self.id or self.username or self.hashed_password)