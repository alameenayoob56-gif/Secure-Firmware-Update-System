from fastapi import FastAPI

from database.db import Base, engine
from models.models import Firmware, Device
from routers.firmware import router as firmware_router
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends, HTTPException
from pydantic import BaseModel
from utils.auth_utils import create_access_token, verify_token

app = FastAPI(
    security = HTTPBearer()
    title="Secure Firmware Update System"
)

Base.metadata.create_all(bind=engine)

app.include_router(firmware_router)


@app.get("/")
def root():
    return {
        "message": "Secure Firmware Update System API"
    }

class LoginRequest(BaseModel):
    username: str
    password: str

    @app.post("/login")
def login(request: LoginRequest):

    user = fake_users.get(request.username)

    if not user or user["password"] != request.password:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    token = create_access_token({
        "sub": user["username"],
        "role": user["role"]
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user["role"]
    }