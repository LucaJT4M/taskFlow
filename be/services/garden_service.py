from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from be.models.reward_model import Reward
from be.models.task_model import Task
from be.models.user_model import User

# Ab wie vielen erledigten Aufgaben eine Pflanze welche Stufe erreicht
STAGES = [
    {"key": "seed", "name": "Samen", "min_tasks": 0},
    {"key": "sprout", "name": "Spross", "min_tasks": 1},
    {"key": "bush", "name": "Busch", "min_tasks": 3},
    {"key": "tree", "name": "Baum", "min_tasks": 6},
    {"key": "bloom", "name": "Blüte", "min_tasks": 10},
]
PLANT_SIZE = STAGES[-1]["min_tasks"]  # nach 10 Aufgaben ist eine Pflanze ausgewachsen
KINDS = ["eiche", "kirsche", "tanne", "birke"]  # Reihenfolge der Pflanzenarten im Garten


class GardenService:
    def reward_task(self, db: Session, task: Task) -> bool:
        """Lässt den Garten des Besitzers wachsen – pro Aufgabe nur einmal.

        Kein commit hier: Der Aufrufer speichert zusammen mit der Aufgabe.
        """
        already = db.query(Reward).filter(Reward.task_id == task.id).first()
        if already:
            return False
        db.add(Reward(owner_id=task.owner_id, task_id=task.id))
        return True

    def get_garden(self, db: Session, user: User) -> dict:
        dates = [r.created_at for r in db.query(Reward.created_at).filter(Reward.owner_id == user.id).all()]
        total = len(dates)
        grown = total // PLANT_SIZE

        plants = [self._plant(i, PLANT_SIZE) for i in range(grown)]
        plants.append(self._plant(grown, total % PLANT_SIZE))  # die Pflanze, die gerade wächst

        return {
            "total_completed": total,
            "grown_plants": grown,
            "streak_days": self._streak(dates),
            "plant_size": PLANT_SIZE,
            "stages": STAGES,
            "plants": plants,
            "current": plants[-1],
        }

    def _plant(self, index: int, growth: int) -> dict:
        stage = max((s for s in STAGES if growth >= s["min_tasks"]), key=lambda s: s["min_tasks"])
        nxt = next((s for s in STAGES if s["min_tasks"] > growth), None)
        return {
            "index": index,
            "kind": KINDS[index % len(KINDS)],
            "growth": growth,
            "stage": stage["key"],
            "stage_name": stage["name"],
            "next_stage_name": nxt["name"] if nxt else None,
            "tasks_to_next": nxt["min_tasks"] - growth if nxt else 0,
        }

    def _streak(self, dates: list[datetime]) -> int:
        """Wie viele Tage in Folge mindestens eine Aufgabe erledigt wurde."""
        days = {d.astimezone(timezone.utc).date() for d in dates}
        day = datetime.now(timezone.utc).date()
        if day not in days:
            day -= timedelta(days=1)  # heute noch nichts erledigt: die Serie von gestern zählt noch
        streak = 0
        while day in days:
            streak += 1
            day -= timedelta(days=1)
        return streak
