from pydantic import BaseModel


class StageInfo(BaseModel):
    key: str
    name: str
    min_tasks: int


class PlantResponse(BaseModel):
    index: int
    kind: str
    growth: int
    stage: str
    stage_name: str
    next_stage_name: str | None
    tasks_to_next: int


class GardenResponse(BaseModel):
    total_completed: int
    grown_plants: int
    streak_days: int
    plant_size: int
    stages: list[StageInfo]
    plants: list[PlantResponse]
    current: PlantResponse
