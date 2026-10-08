from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock

from be.models.reward_model import Reward
from be.models.task_model import Task
from be.models.user_model import User
from be.services.garden_service import GardenService


def test_reward_task_adds_reward_once():
    service = GardenService()
    db = MagicMock()
    task = Task(id=4, owner_id=2, title="Done", status="done")
    db.query.return_value.filter.return_value.first.side_effect = [None, Reward(task_id=4)]

    assert service.reward_task(db, task) is True
    assert service.reward_task(db, task) is False
    assert db.add.call_count == 1
    assert db.add.call_args.args[0].task_id == 4


def test_plant_reports_current_and_next_stage():
    plant = GardenService()._plant(index=0, growth=3)

    assert plant["stage"] == "bush"
    assert plant["next_stage_name"] == "Baum"
    assert plant["tasks_to_next"] == 3


def test_garden_counts_completed_tasks_and_plants():
    service = GardenService()
    db = MagicMock()
    user = User(id=2, username="alice", hashed_password="hash")
    dates = [datetime.now(timezone.utc)] * 3
    db.query.return_value.filter.return_value.all.return_value = [
        MagicMock(created_at=date) for date in dates
    ]

    result = service.get_garden(db, user)

    assert result["total_completed"] == 3
    assert result["grown_plants"] == 0
    assert result["current"]["growth"] == 3


def test_streak_counts_consecutive_days():
    today = datetime.now(timezone.utc)
    dates = [today, today - timedelta(days=1), today - timedelta(days=2)]

    assert GardenService()._streak(dates) == 3
