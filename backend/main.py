from fastapi import FastAPI

from database.db import Base, engine
from models.models import Firmware, Device, UpdateHistory

app = FastAPI()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Secure Firmware Update System"
)

@app.get("/")
def root():
    return {
        "message": "Secure Firmware Update System API"
    }