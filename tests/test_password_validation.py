import pytest
from pydantic import ValidationError

from be.core.roles import UserRole
from be.schemas.user_schema import MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH
from be.schemas.user_schema import UserCreate, UserUpdate


def test_user_create_accepts_a_valid_passphrase():
    user = UserCreate(
        username="alice",
        password="correct horse battery",
        role=UserRole.USER,
    )

    assert user.password == "correct horse battery"


def test_user_creation_defaults_to_regular_user_role():
    user = UserCreate(
        username="alice",
        password="correct horse battery",
    )

    assert user.role is UserRole.USER


def test_user_update_accepts_a_valid_password():
    user_update = UserUpdate(password="a longer secure password")

    assert user_update.password == "a longer secure password"


def test_short_password_has_custom_validation_message():
    with pytest.raises(ValidationError) as error:
        UserCreate(
            username="alice",
            password="short",
            role=UserRole.USER,
        )

    assert "Passwort should have at least 12 characters" in str(error.value)


@pytest.mark.parametrize(
    "password",
    [
        "short",
        "x" * (MIN_PASSWORD_LENGTH - 1),
        "x" * (MAX_PASSWORD_LENGTH + 1),
    ],
)
def test_password_length_is_enforced(password):
    with pytest.raises(ValidationError):
        UserCreate(
            username="alice",
            password=password,
            role=UserRole.USER,
        )


@pytest.mark.parametrize(
    "password",
    [
        " password1234",
        "password1234 ",
    ],
)
def test_password_cannot_have_leading_or_trailing_whitespace(password):
    with pytest.raises(ValidationError):
        UserCreate(
            username="alice",
            password=password,
            role=UserRole.USER,
        )


@pytest.mark.parametrize(
    "password",
    [
        "password123456",
        "PASSWORD123456",
        "qwerty123456",
        "admin123456",
    ],
)
def test_common_passwords_are_rejected(password):
    with pytest.raises(ValidationError):
        UserCreate(
            username="alice",
            password=password,
            role=UserRole.USER,
        )


def test_common_passwords_are_rejected_during_updates():
    with pytest.raises(ValidationError):
        UserUpdate(password="letmein123456")
