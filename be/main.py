from fastapi import FastAPI
from be.api import health, user_route, auth
from be.core.db import init_db

app = FastAPI()

init_db()

app.include_router(health.router)
app.include_router(user_route.router)
app.include_router(auth.router)