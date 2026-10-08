import asyncio

import pytest
from fastapi import HTTPException

from be.api import auth
from be.core.roles import UserRole
from be.models.user_model import User
from be.security.authorization import require_roles


def make_user(role):
    return User(
        id=1,
        username="alice",
        role=role,
        hashed_password="test-password-hash",
    )


def test_current_user_endpoint_returns_role():
    user = make_user(UserRole.ADMIN.value)

    result = asyncio.run(auth.read_users_me(user))

    assert result == {
        "username": "alice",
        "role": "admin",
    }


def test_require_roles_allows_an_allowed_role():
    checker = require_roles(UserRole.ADMIN)
    user = make_user(UserRole.ADMIN.value)

    assert checker(user) is user


def test_require_roles_rejects_a_disallowed_role():
    checker = require_roles(UserRole.ADMIN)
    user = make_user(UserRole.USER.value)

    with pytest.raises(HTTPException) as error:
        checker(user)

    assert error.value.status_code == 403
    assert error.value.detail == "Insufficient permissions"
