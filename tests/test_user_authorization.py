import pytest
from fastapi import HTTPException

from be.api import user_route
from be.core.roles import UserRole
from be.models.user_model import User
from be.schemas.user_schema import UserUpdate


class FakeUserService:
    def __init__(self, users):
        self.users = {user.username: user for user in users}
        self.updated = None

    def get_user_by_username(self, db, username):
        return self.users.get(username)

    def update_user(self, db, username, user_update):
        self.updated = (username, user_update)
        return self.users[username]


def make_user(user_id, username, role):
    return User(
        id=user_id,
        username=username,
        role=role,
        hashed_password="test-password-hash",
    )


def call_update(username, user_update, current_user):
    return user_route.update_user(
        username=username,
        user_update=user_update,
        db=None,
        current_user=current_user,
    )


def test_user_can_update_themselves(monkeypatch):
    user = make_user(1, "alice", UserRole.USER.value)
    service = FakeUserService([user])
    monkeypatch.setattr(user_route, "service", service)

    result = call_update("alice", UserUpdate(username="alice-new"), user)

    assert result is user
    assert service.updated[0] == "alice"


def test_user_cannot_update_another_user(monkeypatch):
    alice = make_user(1, "alice", UserRole.USER.value)
    bob = make_user(2, "bob", UserRole.USER.value)
    monkeypatch.setattr(user_route, "service", FakeUserService([alice, bob]))

    with pytest.raises(HTTPException) as error:
        call_update("bob", UserUpdate(username="bob-new"), alice)

    assert error.value.status_code == 403


def test_admin_can_update_another_user(monkeypatch):
    admin = make_user(1, "admin", UserRole.ADMIN.value)
    user = make_user(2, "bob", UserRole.USER.value)
    service = FakeUserService([admin, user])
    monkeypatch.setattr(user_route, "service", service)

    result = call_update("bob", UserUpdate(username="bob-new"), admin)

    assert result is user
    assert service.updated[0] == "bob"


def test_user_cannot_change_their_own_role(monkeypatch):
    user = make_user(1, "alice", UserRole.USER.value)
    monkeypatch.setattr(user_route, "service", FakeUserService([user]))

    with pytest.raises(HTTPException) as error:
        call_update("alice", UserUpdate(role=UserRole.ADMIN), user)

    assert error.value.status_code == 403


def test_admin_can_change_another_users_role(monkeypatch):
    admin = make_user(1, "admin", UserRole.ADMIN.value)
    user = make_user(2, "bob", UserRole.USER.value)
    service = FakeUserService([admin, user])
    monkeypatch.setattr(user_route, "service", service)

    result = call_update("bob", UserUpdate(role=UserRole.ADMIN), admin)

    assert result is user
    assert service.updated[1].role == UserRole.ADMIN


def test_update_returns_not_found_for_missing_user(monkeypatch):
    user = make_user(1, "alice", UserRole.USER.value)
    monkeypatch.setattr(user_route, "service", FakeUserService([user]))

    with pytest.raises(HTTPException) as error:
        call_update("missing", UserUpdate(username="new-name"), user)

    assert error.value.status_code == 404
