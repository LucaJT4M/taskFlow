from sqlalchemy import Column, Integer, String
from be.core.db import Base
from be.core.roles import UserRole

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String(20), nullable=False, default=UserRole.USER.value)

    def __eq__(self, other):
        return self.__dict__ == other.__dict__

    def __nonzero__(self):
        return bool(self.id or self.username or self.hashed_password)