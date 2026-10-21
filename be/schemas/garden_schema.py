from pydantic import BaseModel


class StageInfo(BaseModel):
    key: str
    name: str
    min_points: int


class PlantResponse(BaseModel):
    index: int
    kind: str
    growth: int
    stage: str
    stage_name: str
    next_stage_name: str | None
    points_to_next: int  # Wachstumspunkte bis zur nächsten Stufe


class GardenResponse(BaseModel):
    total_completed: int  # Anzahl erledigter Aufgaben
    total_points: int  # Summe der Wachstumspunkte
    grown_plants: int
    streak_days: int
    plant_size: int
    stages: list[StageInfo]
    plants: list[PlantResponse]
    current: PlantResponse
