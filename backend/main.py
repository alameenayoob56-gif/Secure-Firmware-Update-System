from fastapi import (
    FastAPI,
    HTTPException,
    Depends,
    Request
)
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials 
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from pydantic import BaseModel

from database.db import Base, engine
from models.models import Firmware, Device
from routers.firmware import router as firmware_router
from utils.auth_utils import create_access_token, verify_token
from routers.device import router as device_router
from routers.deployment import router as deployment_router
from routers.analytics import router as analytics_router
from utils.audit_logger import log_audit

from logging_config import logger
from datetime import datetime
from sqlalchemy import text


app = FastAPI(
    title="Secure Firmware Update System"
)

logger.info("Secure Firmware Update System started successfully.")

security = HTTPBearer()

Base.metadata.create_all(bind=engine)
logger.info(
    "Database initialized successfully"
)

app.include_router(firmware_router)
app.include_router(device_router)
app.include_router(analytics_router)
app.include_router(deployment_router)

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(
    request: Request,
    exc: StarletteHTTPException
):

    logger.warning(
        f"HTTP Exception: {exc.detail}"
    )

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "status": exc.status_code,
            "message": exc.detail
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError
):

    logger.warning(
        "Validation Error"
    )

    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "status": 422,
            "message": "Validation Error",
            "errors": exc.errors()
        }
    )
@app.exception_handler(Exception)
async def global_exception_handler(
    request: Request,
    exc: Exception
):

    logger.exception(
        str(exc)
    )

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "status": 500,
            "message": "Internal Server Error"
        }
    )

@app.get("/")
def home():

    logger.info(
        "Home API Accessed"
    )

    return {
        "message": "Secure Firmware Update System API Running"
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

    # Failed Login Audit
    if not user or user["password"] != request.password:

        logger.warning(
    f"Failed login attempt for user: {request.username}"
)


        log_audit(
            action="Login Failed",
            firmware_name=None,
            version=None,
            device_name=None,
            performed_by=request.username
        )

        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    token = create_access_token({
        "sub": user["username"],
        "role": user["role"]
    })
    logger.info(
    f"User '{user['username']}' logged in successfully"
)

    # Successful Login Audit
    log_audit(
        action="Login Success",
        firmware_name=None,
        version=None,
        device_name=None,
        performed_by=user["username"]
    )

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
        logger.warning(
    "Invalid or expired token used"
)
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
    logger.info(
        f"Firmware delete requested | Firmware ID: {firmware_id} | Admin: {admin.get('sub')}"
    )

    return {
        "message": f"Firmware {firmware_id} deleted by admin",
        "admin": admin.get("sub")
    }