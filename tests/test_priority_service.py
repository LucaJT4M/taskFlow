from datetime import date, timedelta
from types import SimpleNamespace

from be.services import priority_service as ps

TODAY = date(2026, 10, 21)


def level(title, description=None, due=None):
    return ps.suggest(title, description, due, today=TODAY)["priority"]


def test_plain_task_is_medium():
    assert level("Einkaufen") == ps.MEDIUM


def test_important_keyword_makes_it_high():
    result = ps.suggest("Prüfungsvorbereitung Mathe", today=TODAY)
    assert result["priority"] == ps.HIGH
    assert "keyword:prüfung" in result["reasons"]


def test_low_keyword_makes_it_low():
    assert level("Irgendwann Keller aufräumen") == ps.LOW


def test_due_tomorrow_makes_it_high():
    result = ps.suggest("Zimmer streichen", due_date=TODAY + timedelta(days=1), today=TODAY)
    assert result["priority"] == ps.HIGH
    assert "due:tomorrow" in result["reasons"]


def test_far_due_date_does_not_change_anything():
    assert level("Zimmer streichen", due=TODAY + timedelta(days=30)) == ps.MEDIUM


def test_prepare_new_respects_manual_choice():
    fields = ps.prepare_new({"title": "Steuererklärung", "priority": 1})
    assert fields["priority"] == 1 and fields["priority_auto"] is False

    auto = ps.prepare_new({"title": "Steuererklärung", "priority": None})
    assert auto["priority"] == ps.HIGH and auto["priority_auto"] is True


def test_update_recalculates_only_automatic_tasks():
    task = SimpleNamespace(title="Einkaufen", description=None, due_date=None, priority=2, priority_auto=True)
    ps.apply_update(task, {"title": "Dringend: Medikamente holen"})
    assert task.priority == ps.HIGH

    ps.apply_update(task, {"priority": 1})
    assert task.priority == 1 and task.priority_auto is False

    ps.apply_update(task, {"title": "Notfall!"})  # manuell bleibt manuell
    assert task.priority == 1

    ps.apply_update(task, {"priority_auto": True})
    assert task.priority == ps.HIGH and task.priority_auto is True
