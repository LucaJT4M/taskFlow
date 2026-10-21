from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from be.schemas.task_schema import TaskCreate, TaskUpdate

TeamRole = Literal["owner", "member"]


class TeamCreate(BaseModel):
    name: str = Field(min_length=1, max_length=60)

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Name darf nicht leer sein")
        return value


class TeamUpdate(TeamCreate):
    pass


class TeamJoin(BaseModel):
    invite_code: str = Field(min_length=4, max_length=20)


class TeamSummary(BaseModel):
    id: int
    name: str
    my_role: TeamRole
    member_count: int
    open_tasks: int
    created_at: datetime


class TeamMemberResponse(BaseModel):
    user_id: int
    username: str
    role: TeamRole
    joined_at: datetime


class TeamDetail(BaseModel):
    id: int
    name: str
    invite_code: str
    my_role: TeamRole
    created_at: datetime
    members: list[TeamMemberResponse]


class TeamTaskCreate(TaskCreate):
    assignee_id: int | None = None  # muss Mitglied des Teams sein


class TeamTaskUpdate(TaskUpdate):
    assignee_id: int | None = None  # null schicken = niemand zuständig


class TeamTaskResponse(TeamTaskCreate):
    id: int
    owner_id: int
    team_id: int
    priority: int = 2
    priority_auto: bool = True

    model_config = ConfigDict(from_attributes=True)
