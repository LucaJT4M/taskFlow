from typing import Optional
from be.core.roles import UserRole
from pydantic import BaseModel, field_validator, ConfigDict

MIN_PASSWORD_LENGTH = 12
MAX_PASSWORD_LENGTH = 128

class PasswordMixin(BaseModel):
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, password: str) -> str:
        if len(password) < MIN_PASSWORD_LENGTH:
            raise ValueError(
                f"Password should have at least {MIN_PASSWORD_LENGTH} characters"
            )

        if len(password) > MAX_PASSWORD_LENGTH:
            raise ValueError(
                f"Passwort should have at most {MAX_PASSWORD_LENGTH} characters"
            )

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
    password: str | None = None
    role: UserRole | None = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, password: str | None) -> str | None:
        if password is None:
            return None

        if len(password) < MIN_PASSWORD_LENGTH:
            raise ValueError(
                f"Password should have at least {MIN_PASSWORD_LENGTH} characters"
            )

        if len(password) > MAX_PASSWORD_LENGTH:
            raise ValueError(
                f"Password should have at most {MAX_PASSWORD_LENGTH} characters"
            )

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