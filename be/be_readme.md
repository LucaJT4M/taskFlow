### Starten des BE:

1. Docker starten: docker compose up
2. aus dem RootFolder (taskflow folder): uvicorn.exe be.main:app --reload

## Health Endpoint

- /live => returns {"status": "alive"}
- /ready => checks if DB is ready for connection

## Auth Endpoint

- /
