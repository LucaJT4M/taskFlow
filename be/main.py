import logging
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from be.api import health, user_route, task_route, auth, garden_route, history_route, team_route
from be.core.db import init_db
from be.core.config import FRONTEND_URLS
from be.core.logging_config import setup_logging

setup_logging()
logger = logging.getLogger("taskflow.requests")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_URLS,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    ms = (time.perf_counter() - start) * 1000
    logger.info("%s %s -> %s (%.0f ms)", request.method, request.url.path, response.status_code, ms)
    return response

init_db()

app.include_router(health.router)
app.include_router(user_route.router)
app.include_router(task_route.router)
app.include_router(auth.router)
app.include_router(garden_route.router)
app.include_router(history_route.router)
app.include_router(team_route.router)