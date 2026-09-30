from fastapi import FastAPI
from be.api import health
from be.core.db import init_db

app = FastAPI()

init_db()

app.include_router(health.router)