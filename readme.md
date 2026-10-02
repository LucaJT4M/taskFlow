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

## Modularisierung: kurze Projektprüfung

Für die Vorbereitung der Präsentation wurde Codex gefragt, ob TaskFlow dem Modularisierungsprinzip folgt und wie sich die Struktur verbessern lässt. Die Prüfung erfolgte anhand der Projektordner und des vorhandenen Quellcodes; es wurden dabei keine Funktionen oder Tests ausgeführt.

### Einschätzung

TaskFlow folgt dem Modularisierungsprinzip bereits in wesentlichen Teilen:

- Das Backend trennt API-Routen (`be/api/`), Geschäftslogik (`be/services/`), Datenmodelle (`be/models/`), Validierung und Antwortformate (`be/schemas/`) sowie Datenbank und Konfiguration (`be/core/`).
- Das Frontend trennt Login und Registrierung, Aufgabenfunktionen und gemeinsame API-Dienste in eigene Bereiche. Die Aufgabenansichten (`TaskList`, `KanbanBoard`, `TaskForm`) sind außerdem einzelne Komponenten.
- Die Oberfläche spricht das Backend über HTTP-Endpunkte an; dadurch bleiben Frontend und Backend als größere Systemteile getrennt.

Die Modularisierung ist jedoch noch nicht durchgehend: Im Backend enthält `be/api/task_route.py` neben der HTTP-Behandlung auch Datenbankzugriffe und Aufgabenlogik. In `be/api/auth.py` liegen sowohl Token-Hilfsfunktionen als auch Endpunkte. Im Frontend führt `TasksPage.jsx` Zustand, API-Aufrufe und Seitenaufbau zusammen. Login und Registrierung enthalten direkte `fetch`-Aufrufe und wiederholen Teile der Fehlerbehandlung.

### Sinnvolle nächste Schritte

1. Eine `task_service.py` ergänzen und Datenbankoperationen für Aufgaben aus `task_route.py` dorthin verschieben. Die Route sollte hauptsächlich HTTP-Eingaben entgegennehmen, den Dienst aufrufen und HTTP-Antworten liefern.
2. Authentifizierungslogik wie Token-Erstellung und Token-Prüfung in ein eigenes Modul, zum Beispiel `be/security/`, verschieben. `be/api/auth.py` kann dann bei den Endpunkten bleiben.
3. Im Frontend einen zentralen Authentifizierungsdienst mit Funktionen wie `login()` und `register()` bereitstellen und die Komponenten diesen Dienst verwenden lassen. So werden URL, Token-Ablage und Fehlerbehandlung nicht in mehreren Formularen gepflegt.
4. Falls `TasksPage.jsx` weiter wächst, API-Zustand und Aufgabenaktionen in einen Hook oder Controller auslagern. Die Seite kann dann vorwiegend die Komponenten zusammensetzen.
5. Einheitliche Benennungen verwenden, zum Beispiel `UserService` statt `User_Service`, und ungenutzte beziehungsweise doppelte Authentifizierungs-Hilfsfunktionen entfernen.

Diese Änderungen sind Empfehlungen für eine schrittweise Weiterentwicklung. Die bestehende Struktur ist bereits modular angelegt; es handelt sich nicht um einen vollständigen Umbau.
