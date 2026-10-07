# TaskFlow

TaskFlow is a full-stack task management app with:

- a FastAPI backend (`be/`)
- a React + Vite frontend (`frontend/`)
- a PostgreSQL database via Docker Compose

## Tech Stack

- Backend: FastAPI, SQLAlchemy, PostgreSQL, JWT (OAuth2 password flow)
- Frontend: React, Vite, React Router, React Toastify
- Database: Postgres 17 (Docker)

## Project Structure

```text
taskFlow/
	be/                # FastAPI backend
	frontend/          # React frontend
	docker-compose.yml # Postgres service
	readme.md
```

## Prerequisites

- Python 3.11+
- Node.js + npm
- Docker Desktop

Node note:

- Current frontend dependencies expect Node `20.19+` (or `22.12+`).

## Environment Configuration

Create `be/.env` with:

```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/taskflow
ACCESS_TOKEN_EXPIRE_MINUTES=30
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
```

## Backend Setup

From project root:

1. Create virtual environment:

```bash
python -m venv venv
```

2. Activate venv (PowerShell):

```powershell
.\venv\Scripts\Activate.ps1
```

3. Install dependencies:

```bash
pip install -r .\be\requirements.txt
```

4. Start database:

```bash
docker compose up -d
```

5. Start API:

```bash
uvicorn be.main:app --reload
```

Backend URLs:

- API base: `http://127.0.0.1:8000`
- Swagger docs: `http://127.0.0.1:8000/docs`

## Backend Tests

Backend tests are located in the root `tests/` folder. They cover:

- user update authorization
- task creation, updates, deletion, and ownership checks
- garden rewards, plant growth, and completion streaks
- deleted-task history creation
- JWT token validation

Install the test dependency with the backend requirements, then run the suite from the project root:

```powershell
pip install -r .\be\requirements.txt
python -m pytest tests -q
```

The tests use mocks and do not require a running PostgreSQL database.

## Frontend Setup

From project root:

1. Install dependencies:

```bash
npm --prefix frontend install
```

2. Start dev server:

```bash
npm --prefix frontend run dev
```

Frontend URL is shown in terminal (usually `http://127.0.0.1:5173`, or next free port).

## API Overview

### Health

- `GET /health/live`
- `GET /health/ready`

### Auth

- `POST /auth/token` (form-urlencoded: `username`, `password`)
- `GET /auth/me` (requires `Authorization: Bearer <token>`)

### Users

- `POST /user` (JSON body)
- `GET /user` (admin only)
- `GET /user/{username}` (admin only)
- `PUT /user/{username}` (admin or the user itself)
- `DELETE /user/{username}` (admin only)

Example user create body:

```json
{
  "username": "alice",
  "password": "secret"
}
```

Example user update body (partial update):

```json
{
  "password": "newSecret"
}
```

`PUT /user/{username}` accepts one or both fields:

- `username`
- `password`

### Tasks

- `GET /tasks`
- `POST /tasks`
- `POST /tasks/create_as_admin` (admin only, body includes `owner_id`)
- `PATCH /tasks/{task_id}`
- `DELETE /tasks/{task_id}`

## Swagger Authorize Flow

1. Open `http://127.0.0.1:8000/docs`
2. Execute `POST /auth/token` with username/password
3. Copy `access_token`
4. Click `Authorize`
5. Paste `Bearer <access_token>`
6. Call protected endpoints like `GET /auth/me`

## Common Issues

### 422 on Register

- Cause: Sending form-urlencoded to `POST /user`
- Fix: Send JSON (`Content-Type: application/json`)

### 403 on User endpoints

- `GET /user`, `GET /user/{username}`, `DELETE /user/{username}` require admin token.
- `PUT /user/{username}` requires admin token or token owner matching `{username}`.

### `DATABASE_URL is not set`

- Ensure `be/.env` exists
- Ensure backend loads env from `be/.env`

### Frontend native binding error (`rolldown`)

- Remove `frontend/node_modules` and lockfile, reinstall
- Ensure your Node version is compatible with current Vite version

## Notes

- Root `docker-compose.yml` runs only Postgres.
- Backend CORS currently allows `http://localhost:5173` and `http://localhost:5174`.

## Frontend Admin Updates (2026-10-04)

The admin dashboard was extended and refactored with reusable modules:

- Admin-only menu button is shown on `/dashboard` for user `admin`.
- Admin page layout was tightened to use more viewport space.
- Modal logic was moved to reusable components in `frontend/src/modules/admin/AdminPopups.tsx`.
- Popup prop/type definitions were moved to `frontend/src/classes/AdminPopUpClasses.ts`.
- Added user management actions in admin UI:
  - create user
  - edit user (username/password)
  - delete user with confirmation popup
- Added task management actions in admin UI:
  - create task for selected user via `POST /tasks/create_as_admin`
  - edit task (title/status)
  - delete task with confirmation popup
- Removed due-date column from admin task table because backend task schema has no due date.

## Modularisierung: kurze Projektprüfung

Für die Vorbereitung der Präsentation wurde Codex gefragt, ob TaskFlow dem Modularisierungsprinzip folgt und wie sich die Struktur verbessern lässt. Die Prüfung erfolgte anhand der Projektordner und des vorhandenen Quellcodes; es wurden dabei keine Funktionen oder Tests ausgeführt.

### Einschätzung

TaskFlow folgt dem Modularisierungsprinzip bereits in wesentlichen Teilen:

- Das Backend trennt API-Routen (`be/api/`), Geschäftslogik (`be/services/`), Datenmodelle (`be/models/`), Validierung und Antwortformate (`be/schemas/`) sowie Datenbank und Konfiguration (`be/core/`).
- Das Frontend trennt Login und Registrierung, Aufgabenfunktionen und gemeinsame API-Dienste in eigene Bereiche. Die Aufgabenansichten (`TaskList`, `KanbanBoard`, `TaskForm`) sind außerdem einzelne Komponenten.
- Die Oberfläche spricht das Backend über HTTP-Endpunkte an; dadurch bleiben Frontend und Backend als größere Systemteile getrennt.

Bei einer erneuten Prüfung am 2. Oktober 2026 waren weitere Schritte umgesetzt: JWT-Funktionen liegen inzwischen in `be/security/jwt_auth.py`, die Service-Klasse heißt `UserService`, und Login sowie Registrierung rufen Funktionen in `frontend/src/services/authService.ts` auf. Die Modularisierung ist aber noch nicht durchgehend: `be/api/task_route.py` enthält weiterhin Datenbankzugriffe und Aufgabenlogik. `TasksPage.jsx` bündelt Aufgabenstatus, API-Aufrufe und Seitenaufbau. Außerdem enthält `UserService` noch JWT- und FastAPI-Abhängigkeiten mit einer eigenen Funktion zur Token-Prüfung, obwohl die Routen bereits `be/security/jwt_auth.py` verwenden.

### Seit der ersten Prüfung vorgenommene Änderungen

Im aktuellen Quellcode sind gegenüber der ersten Prüfung folgende Änderungen erkennbar:

- Token-Erstellung und Prüfung des aktuellen Benutzernamens wurden aus `be/api/auth.py` in das neue Modul `be/security/jwt_auth.py` verschoben. Die Authentifizierungs-Routen importieren diese Funktionen nun.
- Die Service-Klasse wurde von `User_Service` in `UserService` umbenannt; die betroffenen Routen und der Authentifizierungs-Endpunkt verwenden den neuen Namen.
- Im Frontend wurden die direkten Login- und Registrierungsaufrufe aus `LoginForm.tsx` und `RegisterForm.tsx` in Funktionen in `frontend/src/services/authService.ts` verlagert. Die Formulare rufen nun `login()` beziehungsweise `sign_up()` auf und kümmern sich anschließend um die Navigation.
- Der Authentifizierungsdienst übernimmt die Anfrage an die API, das Speichern des Tokens und die Fehlerbenachrichtigung. Die Registrierungsfunktion prüft außerdem die Passwortbestätigung und meldet den Benutzer nach erfolgreicher Registrierung direkt an.

Damit wurden insbesondere die zuvor empfohlenen Schritte zur Auslagerung der JWT-Funktionen und zur Zentralisierung der Login-/Registrierungsaufrufe teilweise umgesetzt. Die Aufgabenlogik wurde bislang nicht in einen eigenen Service ausgelagert; auch die doppelte Token-Prüfung in `UserService` ist noch vorhanden.

### Sinnvolle nächste Schritte

1. Einen `task_service.py` ergänzen und Datenbankoperationen für Aufgaben aus `task_route.py` dorthin verschieben. Die Route sollte hauptsächlich HTTP-Eingaben entgegennehmen, den Dienst aufrufen und HTTP-Antworten liefern.
2. Die doppelte Token-Prüfung im `UserService` entfernen oder zentral über `be/security/jwt_auth.py` lösen. Dadurch bleibt Authentifizierung an einer Stelle.
3. `TasksPage.jsx` bei weiterem Wachstum in einen Hook für Aufgabenstatus und Aktionen aufteilen. Die Seite kann dann hauptsächlich die Komponenten zusammensetzen.
4. Im Frontend `authService.ts` aufteilen, falls es weiter wächst: HTTP-/Token-Verwaltung einerseits und Benachrichtigungen andererseits. Aktuell ist `react-toastify` direkt im Dienst eingebunden, wodurch der Dienst auch eine UI-Aufgabe übernimmt.
5. Einheitliche Namenskonventionen verwenden, zum Beispiel `signUp` statt `sign_up`, und ungenutzte Abhängigkeiten aus `UserService` entfernen.

Diese Änderungen sind Empfehlungen für eine schrittweise Weiterentwicklung. Die bestehende Struktur ist bereits modular angelegt; es handelt sich nicht um einen vollständigen Umbau.
