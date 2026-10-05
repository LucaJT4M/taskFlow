from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from be.api import health, user_route, task_route, auth, garden_route, history_route
from be.core.db import init_db

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

app.include_router(health.router)
app.include_router(user_route.router)
app.include_router(task_route.router)
app.include_router(auth.router)
app.include_router(garden_route.router)
app.include_router(history_route.router)