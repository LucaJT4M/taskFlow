import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from be.core.db import Base
from be.models.reward_model import Reward
from be.models.task_model import Task
from be.models.team_model import Team, TeamMember
from be.models.user_model import User
from be.schemas.team_schema import TeamTaskCreate, TeamTaskUpdate
from be.services.task_service import TaskService
from be.services.team_service import TeamError, TeamService, normalize_code

service = TeamService()


@pytest.fixture
def db():
    """Echte SQLite-Datenbank im Speicher – jede Testfunktion bekommt eine frische."""
    engine = create_engine("sqlite://")
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)()
    yield session
    session.close()


def add_user(db, name):
    user = User(username=name, hashed_password="hash")
    db.add(user)
    db.commit()
    return user


@pytest.fixture
def team(db):
    """Team von anna mit ben als Mitglied"""
    anna, ben = add_user(db, "anna"), add_user(db, "ben")
    created = service.create_team(db, "Projekt LF10", anna)
    service.join_team(db, created["invite_code"], ben)
    return created["id"], anna, ben


def test_normalize_code_ignores_case_and_dash():
    assert normalize_code("k7q2-m9xa ") == "K7Q2M9XA"


def test_create_team_makes_creator_owner(db):
    anna = add_user(db, "anna")
    team = service.create_team(db, "Projekt", anna)

    assert team["my_role"] == "owner"
    assert len(team["invite_code"]) == 8
    assert [m["username"] for m in team["members"]] == ["anna"]


def test_join_with_code_and_not_twice(db, team):
    team_id, anna, ben = team
    detail = service.get_team(db, team_id, ben)

    assert detail["my_role"] == "member"
    with pytest.raises(TeamError) as err:
        service.join_team(db, detail["invite_code"].lower(), ben)
    assert err.value.status_code == 409


def test_join_with_wrong_code_fails(db):
    with pytest.raises(TeamError) as err:
        service.join_team(db, "XXXXXXXX", add_user(db, "carl"))
    assert err.value.status_code == 404


def test_strangers_cannot_see_team(db, team):
    team_id, _, _ = team
    with pytest.raises(TeamError) as err:
        service.get_team_tasks(db, team_id, add_user(db, "carl"))
    assert err.value.status_code == 404


def test_only_owner_can_rename_or_remove(db, team):
    team_id, anna, ben = team
    with pytest.raises(TeamError) as err:
        service.rename_team(db, team_id, "Neu", ben)
    assert err.value.status_code == 403
    with pytest.raises(TeamError):
        service.remove_member(db, team_id, anna.id, ben)


def test_team_tasks_are_shared_but_not_in_personal_list(db, team):
    team_id, anna, ben = team
    task = service.create_team_task(db, team_id, TeamTaskCreate(title="Folien", assignee_id=ben.id), anna)

    assert [t.id for t in service.get_team_tasks(db, team_id, ben)] == [task.id]
    assert TaskService().get_tasks(db, anna) == []


def test_assignee_must_be_member(db, team):
    team_id, anna, _ = team
    carl = add_user(db, "carl")
    with pytest.raises(TeamError):
        service.create_team_task(db, team_id, TeamTaskCreate(title="X", assignee_id=carl.id), anna)


def test_completing_team_task_grows_garden_of_completer(db, team):
    team_id, anna, ben = team
    task = service.create_team_task(db, team_id, TeamTaskCreate(title="Folien"), anna)
    service.update_team_task(db, team_id, task.id, TeamTaskUpdate(status="done"), ben)

    reward = db.query(Reward).filter(Reward.task_id == task.id).one()
    assert reward.owner_id == ben.id


def test_member_leaving_unassigns_tasks(db, team):
    team_id, anna, ben = team
    task = service.create_team_task(db, team_id, TeamTaskCreate(title="Folien", assignee_id=ben.id), ben)
    service.remove_member(db, team_id, ben.id, ben)

    db.refresh(task)
    assert task.assignee_id is None
    assert task.owner_id == anna.id
    assert [m["username"] for m in service.get_team(db, team_id, anna)["members"]] == ["anna"]


def test_owner_leaving_hands_team_over(db, team):
    team_id, anna, ben = team
    service.remove_member(db, team_id, anna.id, anna)

    assert service.get_team(db, team_id, ben)["my_role"] == "owner"
    assert db.get(Team, team_id).owner_id == ben.id


def test_last_member_leaving_deletes_team(db):
    anna = add_user(db, "anna")
    team_id = service.create_team(db, "Solo", anna)["id"]
    service.create_team_task(db, team_id, TeamTaskCreate(title="X"), anna)
    service.remove_member(db, team_id, anna.id, anna)

    assert db.get(Team, team_id) is None
    assert db.query(Task).count() == 0
    assert db.query(TeamMember).count() == 0


def test_reward_points_follow_priority(db, team):
    team_id, anna, ben = team
    low = service.create_team_task(db, team_id, TeamTaskCreate(title="Irgendwann aufräumen"), anna)
    high = service.create_team_task(db, team_id, TeamTaskCreate(title="Abgabe Bericht", priority=3), anna)
    for task in (low, high):
        service.update_team_task(db, team_id, task.id, TeamTaskUpdate(status="done"), ben)

    points = {r.task_id: r.points for r in db.query(Reward).all()}
    assert points == {low.id: 1, high.id: 3}
