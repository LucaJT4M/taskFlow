from datetime import datetime
from unittest.mock import MagicMock

from be.schemas.history_schema import HistoryCreate
from be.services.history_service import HistoryService


def test_create_history_task_persists_task_details():
    db = MagicMock()
    history = HistoryCreate(
        title="Deleted task",
        description="Details",
        status="done",
        deleted_id=7,
        owner_id=2,
    )

    result = HistoryService().create_history_task(db, history, owner_id=2)

    saved = db.add.call_args.args[0]
    assert result is saved
    assert saved.title == "Deleted task"
    assert saved.description == "Details"
    assert saved.status == "done"
    assert saved.deleted_id == 7
    assert saved.owner_id == 2
    assert isinstance(saved.deleted_date, datetime)
    db.commit.assert_called_once()
    db.refresh.assert_called_once_with(saved)
