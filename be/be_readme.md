## Starten des BE:

1. venv erstellen: python -m venv venv
2. venv aktivieren: ./venv/Scripts/activate
3. im venv alle pakete herunterladen: pip install -r ./be/requirements.txt
4. Docker starten: docker compose up
5. aus dem RootFolder (taskflow folder): uvicorn.exe be.main:app --reload

### Health Endpoint

**Check ob api ready**

```
GET /api/health/live
```

gibt optimaler weise {"status": "ready"} zurück

**Checkt ob db ready ist**

```
GET /api/health/ready
```

gibt optimaler weise: {
"status": "ready",
"database": "ok",
} zurück

### Auth Endpoint

**JWT token für Session holen**
gibt jwt token zurück, wenn user richtig authentifiziert wurde

```
GET /api/auth/token
```

### User Endpoints

**User erstellen**

```
POST /api/user/{username},{password}
```

**Alle User auslese**

```
GET /api/user
```
