from pydantic import BaseModel, ConfigDict
from typing import Optional
from be.core.roles import UserRole

class UserCreate(BaseModel):
    username: str
    password: str
    role: UserRole

class UserResponse(BaseModel):
    id: int
    username: str
    role: UserRole

    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None