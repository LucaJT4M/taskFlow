from collections.abc import Callable
from typing import Any
from fastapi import Depends, HTTPException, status

from be.models.user_model import User
from be.security.jwt_auth import get_current_user
from be.core.roles import UserRole


def require_roles(*allowed_roles: UserRole) -> Callable[..., User]:
    def role_checker(
        user: User = Depends(get_current_user),
    ) -> User:
        allowed_values = {role.value for role in allowed_roles}

        if user.role not in allowed_values:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )

        return user

    return role_checker