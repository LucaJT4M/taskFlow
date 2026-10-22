import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from be.models.reward_model import Reward
from be.models.task_model import Task
from be.models.user_model import User

logger = logging.getLogger(__name__)

# Wachstumspunkte pro erledigter Aufgabe = ihre Wichtigkeit:
# niedrig +1, mittel +2, hoch +3  (wichtige Aufgaben lassen den Garten schneller wachsen)
# Ab wie vielen Punkten eine Pflanze welche Stufe erreicht:
STAGES = [
    {"key": "seed", "name": "Samen", "min_points": 0},
    {"key": "sprout", "name": "Spross", "min_points": 2},
    {"key": "bush", "name": "Busch", "min_points": 6},
    {"key": "tree", "name": "Baum", "min_points": 12},
    {"key": "bloom", "name": "Blüte", "min_points": 20},
]
PLANT_SIZE = STAGES[-1]["min_points"]  # 20 Punkte = ca. 10 mittlere Aufgaben pro Pflanze
KINDS = ["eiche", "kirsche", "tanne", "birke"]  # Reihenfolge der Pflanzenarten im Garten


class GardenService:
    def reward_task(self, db: Session, task: Task, owner_id: int | None = None) -> bool:
        """Lässt den Garten des Besitzers wachsen – pro Aufgabe nur einmal.
h
        Kein commit hier: Der Aufrufer speichert zusammen mit der Aufgabe.
        """
        already = db.query(Reward).filter(Reward.task_id == task.id).first()
        if already:
            return False
        # owner_id: bei Team-Aufgaben wächst der Garten von dem, der sie erledigt hat
        db.add(Reward(owner_id=owner_id or task.owner_id, task_id=task.id, points=task.priority or 2))
        return True

    def get_garden(self, db: Session, user: User) -> dict:
        rows = db.query(Reward.created_at, Reward.points).filter(Reward.owner_id == user.id).all()
        dates = [r.created_at for r in rows]
        points = sum(r.points or 2 for r in rows)
        grown = points // PLANT_SIZE

        plants = [self._plant(i, PLANT_SIZE) for i in range(grown)]
        plants.append(self._plant(grown, points % PLANT_SIZE))  # die Pflanze, die gerade wächst

        return {
            "total_completed": len(rows),
            "total_points": points,
            "grown_plants": grown,
            "streak_days": self._streak(dates),
            "plant_size": PLANT_SIZE,
            "stages": STAGES,
            "plants": plants,
            "current": plants[-1],
        }

    def _plant(self, index: int, growth: int) -> dict:
        stage = max((s for s in STAGES if growth >= s["min_points"]), key=lambda s: s["min_points"])
        nxt = next((s for s in STAGES if s["min_points"] > growth), None)
        return {
            "index": index,
            "kind": KINDS[index % len(KINDS)],
            "growth": growth,
            "stage": stage["key"],
            "stage_name": stage["name"],
            "next_stage_name": nxt["name"] if nxt else None,
            "points_to_next": nxt["min_points"] - growth if nxt else 0,
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
