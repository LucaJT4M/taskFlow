# TaskFlow

TaskFlow is a full-stack task management app with:

- a FastAPI backend (`be/`)
- a React + Vite frontend (`frontend/`)
- a PostgreSQL database via Docker Compose

## Tech Stack

- Backend: FastAPI, SQLAlchemy, PostgreSQL, JWT (OAuth2 password flow)
- Frontend: React, Vite, React Router
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

Frontend URL is shown in terminal (usually `http://127.0.0.1:5173`).

## API Overview

### Health

- `GET /health/live`
- `GET /health/ready`

### Auth

- `POST /auth/token` (form-urlencoded: `username`, `password`)
- `GET /auth/me` (requires `Authorization: Bearer <token>`)

### Users

- `POST /user` (JSON body)
- `GET /user`

Example user create body:

```json
{
  "username": "alice",
  "password": "secret"
}
```

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

### `DATABASE_URL is not set`

- Ensure `be/.env` exists
- Ensure backend loads env from `be/.env`

### Frontend native binding error (`rolldown`)

- Remove `frontend/node_modules` and lockfile, reinstall
- Ensure your Node version is compatible with current Vite version

## Notes

- Root `docker-compose.yml` runs only Postgres.
- Backend CORS currently allows `http://localhost:5173` and `http://localhost:5174`.
