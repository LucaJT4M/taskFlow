"""
Wichtigkeit (Gewicht) einer Aufgabe automatisch bestimmen.

Stufe 1 = niedrig, 2 = mittel, 3 = hoch.

Version 1 arbeitet mit Schlüsselwörtern und dem Fälligkeitsdatum.
Später kann suggest() durch eine KI ersetzt werden – der Rest der App
(Endpunkte, Belohnungen, Frontend) bleibt dabei gleich.
"""
import re
from datetime import date

LOW, MEDIUM, HIGH = 1, 2, 3

# Wortanfänge, damit auch zusammengesetzte Wörter passen ("Prüfungsvorbereitung")
HIGH_WORDS = [
    "dringend", "sofort", "asap", "urgent", "wichtig", "important", "deadline", "frist",
    "abgabe", "prüfung", "klausur", "exam", "arzt", "zahnarzt", "krank", "notfall", "emergency",
    "chef", "kunde", "rechnung", "mahnung", "steuer", "bewerbung", "vertrag", "präsentation",
    "presentation", "interview", "vorstellungsgespräch", "kritisch", "critical", "bug", "zahlung",
    "miete", "behörde", "kündigung",
]
MEDIUM_WORDS = [
    "meeting", "termin", "besprechung", "vorbereiten", "lernen", "review", "bericht", "report",
    "anrufen", "call", "planen", "projekt", "email", "e-mail", "antworten",
]
LOW_WORDS = [
    "irgendwann", "optional", "vielleicht", "später", "idee", "someday", "maybe", "nice to have",
    "aufräumen", "sortieren", "film", "serie", "hobby", "wenn zeit",
]

WORD_RE = re.compile(r"[a-zäöüß][a-zäöüß\-]*")


def _find(words: list[str], text: str) -> list[str]:
    tokens = WORD_RE.findall(text)
    found = []
    for w in words:
        if " " in w:  # mehrere Wörter, z. B. "nice to have"
            if w in text:
                found.append(w)
        elif any(tok.startswith(w) for tok in tokens):
            found.append(w)
    return found


def suggest(title: str, description: str | None = None, due_date: date | None = None, today: date | None = None) -> dict:
    """Schlägt eine Stufe vor und sagt, warum: {"priority": 3, "reasons": ["keyword:prüfung", "due:tomorrow"]}"""
    raw = f"{title} {description or ''}"
    text = raw.lower()
    score = 1  # ohne Hinweise: mittel
    reasons: list[str] = []

    high = _find(HIGH_WORDS, text)
    if high:
        score += 2
        reasons += [f"keyword:{w}" for w in high[:2]]
    medium = _find(MEDIUM_WORDS, text)
    if medium and not high:
        score += 1
        reasons.append(f"keyword:{medium[0]}")
    low = _find(LOW_WORDS, text)
    if low:
        score -= 2
        reasons.append(f"low:{low[0]}")
    if "!" in raw or any(len(w) >= 4 and w.isalpha() and w.isupper() for w in raw.split()):
        score += 1
        reasons.append("emphasis")

    if due_date:
        days = (due_date - (today or date.today())).days
        if days < 0:
            score += 3
            reasons.append("due:overdue")
        elif days == 0:
            score += 2
            reasons.append("due:today")
        elif days == 1:
            score += 2
            reasons.append("due:tomorrow")
        elif days <= 3:
            score += 1
            reasons.append("due:soon")

    if score >= 3:
        level = HIGH
    elif score <= 0:
        level = LOW
    else:
        level = MEDIUM
    return {"priority": level, "reasons": reasons}


def prepare_new(fields: dict) -> dict:
    """Beim Anlegen: Wurde keine Stufe gewählt, wird sie automatisch bestimmt."""
    fields = dict(fields)
    chosen = fields.pop("priority", None)
    fields.pop("priority_auto", None)
    if chosen is None:
        fields["priority"] = suggest(fields.get("title", ""), fields.get("description"), fields.get("due_date"))["priority"]
        fields["priority_auto"] = True
    else:
        fields["priority"] = chosen
        fields["priority_auto"] = False
    return fields


def refresh(tasks) -> bool:
    """Automatische Stufen aktuell halten (das Fälligkeitsdatum rückt jeden Tag näher).
    Gibt True zurück, wenn sich etwas geändert hat (dann muss gespeichert werden)."""
    changed = False
    for task in tasks:
        if task.priority_auto and task.status != "done":
            level = suggest(task.title, task.description, task.due_date)["priority"]
            if level != task.priority:
                task.priority = level
                changed = True
    return changed


def apply_update(task, changes: dict) -> None:
    """Beim Bearbeiten: eine manuelle Wahl gewinnt, sonst wird bei Text-/Datumsänderung neu berechnet."""
    changes = dict(changes)
    chosen = changes.pop("priority", None)
    back_to_auto = changes.pop("priority_auto", None)
    for key, value in changes.items():
        setattr(task, key, value)

    if chosen is not None:
        task.priority = chosen
        task.priority_auto = False
    elif back_to_auto:
        task.priority_auto = True
    if task.priority_auto:
        task.priority = suggest(task.title, task.description, task.due_date)["priority"]
