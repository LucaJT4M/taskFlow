from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from be.core.db import get_db
from be.models.user_model import User
from be.security.jwt_auth import get_current_username
from be.services.user_service import UserService

user_service = UserService()


def get_current_user(
    username: str = Depends(get_current_username),
    db: Session = Depends(get_db),
) -> User:
    """Liest den Benutzernamen aus dem JWT-Token und lädt den passenden User aus der DB."""
    user = user_service.get_user_by_username(db, username)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user
