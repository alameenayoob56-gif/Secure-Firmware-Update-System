from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from database.db import Base, engine
from models.models import Firmware, Device
from routers.firmware import router as firmware_router
from utils.auth_utils import create_access_token, verify_token

app = FastAPI(
    title="Secure Firmware Update System"
)

security = HTTPBearer()

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


# Temporary users for testing
fake_users = {
    "admin": {
        "username": "admin",
        "password": "admin123",
        "role": "admin"
    },
    "user": {
        "username": "user",
        "password": "user123",
        "role": "user"
    }
}


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

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    payload = verify_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    return payload

def require_admin(user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return user

@app.get("/firmware/download/{firmware_id}")
def download_firmware(
    firmware_id: int,
    user=Depends(get_current_user)
):

    return {
        "message": f"Firmware {firmware_id} download allowed",
        "user": user.get("sub"),
        "role": user.get("role")
    }

@app.delete("/firmware/{firmware_id}")
def delete_firmware(
    firmware_id: int,
    admin=Depends(require_admin)
):

    return {
        "message": f"Firmware {firmware_id} deleted by admin",
        "admin": admin.get("sub")
    }