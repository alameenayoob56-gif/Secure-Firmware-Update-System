from fastapi import FastAPI

from database.db import Base, engine
from models.models import Firmware, Device
from routers.firmware import router as firmware_router

app = FastAPI(
    title="Secure Firmware Update System"
)

Base.metadata.create_all(bind=engine)

app.include_router(firmware_router)


@app.get("/")
def root():
    return {
        "message": "Secure Firmware Update System API"
    }
