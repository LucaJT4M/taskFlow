from unittest.mock import MagicMock

import pytest

from be.models.task_model import Task
from be.models.user_model import User
from be.schemas.task_schema import TaskCreate, TaskUpdate
from be.services.task_service import TaskNotFoundError, TaskService


def make_user(user_id=1, username="alice"):
    return User(id=user_id, username=username, hashed_password="hash")


def test_get_task_returns_task_for_owner():
    task = Task(id=3, title="Test", owner_id=1, status="todo")
    query = MagicMock()
    query.filter.return_value = query
    query.first.return_value = task
    db = MagicMock()
    db.query.return_value = query

    result = TaskService().get_task(db, 3, make_user())

    assert result is task
    assert query.filter.call_count == 2


def test_get_task_raises_when_task_is_not_found():
    query = MagicMock()
    query.filter.return_value = query
    query.first.return_value = None
    db = MagicMock()
    db.query.return_value = query

    with pytest.raises(TaskNotFoundError, match="Task 3 not found"):
        TaskService().get_task(db, 3, make_user())


def test_create_done_task_rewards_the_task(monkeypatch):
    db = MagicMock()
    service = TaskService()
    reward_task = MagicMock()
    monkeypatch.setattr("be.services.task_service.garden_service.reward_task", reward_task)

    result = service.create_task(
        db,
        TaskCreate(title="Finished", status="done"),
        make_user(),
    )

    assert result.title == "Finished"
    assert result.owner_id == 1
    db.add.assert_called_once_with(result)
    reward_task.assert_called_once_with(db, result)
    assert db.commit.call_count >= 1


def test_update_to_done_rewards_only_when_task_was_not_done(monkeypatch):
    task = Task(id=1, title="Task", owner_id=1, status="todo")
    service = TaskService()
    db = MagicMock()
    reward_task = MagicMock()
    monkeypatch.setattr("be.services.task_service.garden_service.reward_task", reward_task)
    monkeypatch.setattr(service, "get_task", lambda db, task_id, user: task)

    result = service.update_task(
        db,
        1,
        TaskUpdate(status="done"),
        make_user(),
    )

    assert result.status == "done"
    reward_task.assert_called_once_with(db, task)


def test_delete_task_removes_task_and_commits():
    task = Task(id=1, title="Task", owner_id=1, status="todo")
    service = TaskService()
    db = MagicMock()
    monkeypatch = MagicMock()
    monkeypatch.get_task = lambda db, task_id, user: task
    service.get_task = monkeypatch.get_task

    service.delete_task(db, 1, make_user())

    db.delete.assert_called_once_with(task)
    db.commit.assert_called_once()
