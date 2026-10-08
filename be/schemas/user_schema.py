from typing import Optional
from be.core.roles import UserRole
from pydantic import BaseModel, Field, field_validator, ConfigDict

MIN_PASSWORD_LENGTH = 12
MAX_PASSWORD_LENGTH = 128

class PasswordMixin(BaseModel):
    password: str = Field(
        min_length=MIN_PASSWORD_LENGTH,
        max_length=MAX_PASSWORD_LENGTH,
    )

    @field_validator("password")
    @classmethod
    def validate_password(cls, password: str) -> str:
        if password.strip() != password:
            raise ValueError("Password must not start or end with whitespace")

        common_passwords = {
            "password123456",
            "qwerty123456",
            "letmein123456",
            "admin123456",
        }

        if password.lower() in common_passwords:
            raise ValueError("This password is too common")

        return password

class UserCreate(PasswordMixin):
    username: str
    role: UserRole = UserRole.USER

    model_config = ConfigDict(from_attributes=True)

class UserResponse(BaseModel):
    id: int
    username: str
    role: UserRole

    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    username: str | None = None
    password: str | None = Field(
        default=None,
        min_length=MIN_PASSWORD_LENGTH,
        max_length=MAX_PASSWORD_LENGTH,
    )
    role: UserRole | None = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, password: str | None) -> str | None:
        if password is None:
            return None

        if password.strip() != password:
            raise ValueError("Password must not start or end with whitespace")

        if password.lower() in {
            "password123456",
            "qwerty123456",
            "letmein123456",
            "admin123456",
        }:
            raise ValueError("This password is too common")

        return password