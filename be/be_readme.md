## Backend starten

1. Venv erstellen:

```bash
python -m venv venv
```

2. Venv aktivieren (Windows PowerShell):

```powershell
.\venv\Scripts\Activate.ps1
```

3. Dependencies installieren:

```bash
pip install -r ./be/requirements.txt
```

4. Datenbank starten (aus dem Projekt-Root):

```bash
docker compose up
```

5. API starten (aus dem Projekt-Root):

```bash
uvicorn be.main:app --reload
```

Swagger Docs:

```text
http://127.0.0.1:8000/docs
```

## Health Endpoints

Liveness:

```http
GET /health/live
```

Antwort:

```json
{ "status": "alive" }
```

Readiness (DB check):

```http
GET /health/ready
```

Antwort (ok):

```json
{
  "status": "ready",
  "database": "ok"
}
```

## Auth Endpoints

JWT Token holen (OAuth2 Password Flow):

```http
POST /auth/token
Content-Type: application/x-www-form-urlencoded
```

Body Felder:

```text
username=<username>
password=<password>
```

Antwort:

```json
{
  "access_token": "<jwt>",
  "token_type": "bearer"
}
```

Aktuellen User aus Token lesen:

```http
GET /auth/me
Authorization: Bearer <jwt>
```

## User Endpoints

User erstellen:

```http
POST /user
Content-Type: application/json
```

Body:

```json
{
  "username": "alice",
  "password": "secret"
}
```

Alle User lesen:

```http
GET /user
```

Nur admin: Einzelnen User lesen:

```http
GET /user/{username}
```

Nur admin: User loeschen:

```http
DELETE /user/{username}
```

User updaten (admin oder User selbst):

```http
PUT /user/{username}
Content-Type: application/json
```

Body ist partiell moeglich:

```json
{
  "password": "newSecret"
}
```

oder:

```json
{
  "username": "newName"
}
```

oder beides:

```json
{
  "username": "newName",
  "password": "newSecret"
}
```

## Task Endpoints

Alle Tasks:

```http
GET /tasks
```

Task erstellen:

```http
POST /tasks
Content-Type: application/json
```

Task updaten:

```http
PATCH /tasks/{task_id}
Content-Type: application/json
```

Task loeschen:

```http
DELETE /tasks/{task_id}
```

## Swagger Authorize verwenden

1. In Swagger `POST /auth/token` ausfuehren und Token holen.
2. Oben rechts auf `Authorize` klicken.
3. `Bearer <token>` eintragen und bestaetigen.
4. Geschuetzte Endpoints wie `GET /auth/me` testen.

## Rollen/Autorisierung

- `GET /user` nur admin.
- `GET /user/{username}` nur admin.
- `DELETE /user/{username}` nur admin.
- `PUT /user/{username}` admin oder Benutzer selbst (`sub` im JWT entspricht `{username}`).
