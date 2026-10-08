from datetime import timedelta

import pytest
from fastapi import HTTPException

from be.models.user_model import User
from be.security import jwt_auth


def test_created_token_contains_subject():
    token = jwt_auth.create_access_token({"sub": "alice"}, timedelta(minutes=5))
    user = User(id=1, username="alice", hashed_password="hash")

    jwt_auth.user_service.get_user_by_username = lambda db, username: user

    assert jwt_auth.get_current_user(token, db=None) is user


def test_token_without_subject_is_rejected():
    token = jwt_auth.create_access_token({"user": "alice"})

    with pytest.raises(HTTPException) as error:
        jwt_auth.get_current_user(token, db=None)

    assert error.value.status_code == 401


def test_invalid_token_is_rejected():
    with pytest.raises(HTTPException) as error:
        jwt_auth.get_current_user("not-a-valid-token", db=None)

    assert error.value.status_code == 401
