from datetime import datetime

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from pydantic import BaseModel
from sqlalchemy import text

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from database.db import Base, engine

from routers.firmware import router as firmware_router
from routers.device import router as device_router
from routers.deployment import router as deployment_router
from routers.analytics import router as analytics_router

from utils.auth_utils import create_access_token, verify_token
from utils.audit_logger import log_audit

from logging_config import logger


# ============================================================
# SECURITY HEADERS MIDDLEWARE
# ============================================================

class SecurityHeadersMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next):

        response = await call_next(request)

        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = (
            "strict-origin-when-cross-origin"
        )

        # Swagger UI requires external JS/CSS/image resources.

        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; "
            "style-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; "
            "img-src 'self' data: https://fastapi.tiangolo.com; "
            "font-src 'self' data:;"
        )



        if request.url.path.startswith("/docs"):

            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; "
                "script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; "
                "style-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; "
                "img-src 'self' data: https://fastapi.tiangolo.com; "
                "font-src 'self' data:; "
                "connect-src 'self' https://cdn.jsdelivr.net;"
            )

        else:

            response.headers["Content-Security-Policy"] = (
                "default-src 'self'"
            )


        return response


# ============================================================
# RATE LIMITER
# ============================================================

limiter = Limiter(
    key_func=get_remote_address
)


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="Secure Firmware Update System"
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://secure-firmware-update-system-krd10tfae-soar-4.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# APPLICATION MIDDLEWARE
# ============================================================

app.add_middleware(
    SecurityHeadersMiddleware
)


# ============================================================
# RATE LIMITER CONFIGURATION
# ============================================================

app.state.limiter = limiter

app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler,
)


# ============================================================
# APPLICATION STARTUP
# ============================================================

logger.info(
    "Secure Firmware Update System started successfully."
)


# ============================================================
# DATABASE INITIALIZATION
# ============================================================

Base.metadata.create_all(
    bind=engine
)

logger.info(
    "Database initialized successfully"
)


# ============================================================
# SECURITY
# ============================================================

security = HTTPBearer()


# ============================================================
# ROUTERS
# ============================================================

app.include_router(
    firmware_router
)

app.include_router(
    device_router
)

app.include_router(
    analytics_router
)

app.include_router(
    deployment_router
)


# ============================================================
# GLOBAL HTTP EXCEPTION HANDLER
# ============================================================

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
            "message": exc.detail,
        },
    )


# ============================================================
# VALIDATION ERROR HANDLER
# ============================================================

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
            "errors": exc.errors(),
        },
    )


# ============================================================
# GLOBAL EXCEPTION HANDLER
# ============================================================

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
            "message": "Internal Server Error",
        },
    )


# ============================================================
# HOME API
# ============================================================

@app.get("/")
def home():

    logger.info(
        "Home API Accessed"
    )

    return {
        "message": "Secure Firmware Update System API Running"
    }


# ============================================================
# LOGIN MODEL
# ============================================================

class LoginRequest(BaseModel):

    username: str
    password: str


# ============================================================
# TEMPORARY USERS FOR TESTING
# ============================================================

fake_users = {

    "admin": {
        "username": "admin",
        "password": "admin123",  # nosec B105
        "role": "admin",
    },

    "user": {
        "username": "user",
        "password": "user123",  # nosec B105
        "role": "user",
    },

}


# ============================================================
# LOGIN API
# ============================================================

@app.post("/login")
@limiter.limit("5/minute")
def login(
    request: Request,
    credentials: LoginRequest
):

    user = fake_users.get(
        credentials.username
    )

    # --------------------------------------------------------
    # FAILED LOGIN
    # --------------------------------------------------------

    if (
        not user
        or user["password"] != credentials.password
    ):

        logger.warning(
            f"Failed login attempt for user: "
            f"{credentials.username}"
        )

        log_audit(
            action="Login Failed",
            firmware_name=None,
            version=None,
            device_name=None,
            performed_by=credentials.username,
        )

        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
        )

    # --------------------------------------------------------
    # CREATE JWT TOKEN
    # --------------------------------------------------------

    token = create_access_token(
        {
            "sub": user["username"],
            "role": user["role"],
        }
    )

    logger.info(
        f"User '{user['username']}' logged in successfully"
    )

    # --------------------------------------------------------
    # SUCCESSFUL LOGIN AUDIT
    # --------------------------------------------------------

    log_audit(
        action="Login Success",
        firmware_name=None,
        version=None,
        device_name=None,
        performed_by=user["username"],
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user["role"],
    }


# ============================================================
# CURRENT USER
# ============================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    token = credentials.credentials

    payload = verify_token(
        token
    )

    if payload is None:

        logger.warning(
            "Invalid or expired token used"
        )

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    return payload


# ============================================================
# ADMIN AUTHORIZATION
# ============================================================

def require_admin(
    user=Depends(get_current_user)
):

    if user.get("role") != "admin":

        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )

    return user


# ============================================================
# PROTECTED FIRMWARE DOWNLOAD
# ============================================================

@app.get("/firmware/download/{firmware_id}")
def download_firmware(
    firmware_id: int,
    user=Depends(get_current_user)
):

    return {
        "message": (
            f"Firmware {firmware_id} download allowed"
        ),
        "user": user.get("sub"),
        "role": user.get("role"),
    }


# ============================================================
# ADMIN FIRMWARE DELETE
# ============================================================

@app.delete("/firmware/{firmware_id}")
def delete_firmware(
    firmware_id: int,
    admin=Depends(require_admin)
):

    logger.info(
        f"Firmware delete requested | "
        f"Firmware ID: {firmware_id} | "
        f"Admin: {admin.get('sub')}"
    )

    return {
        "message": (
            f"Firmware {firmware_id} deleted by admin"
        ),
        "admin": admin.get("sub"),
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    try:

        with engine.connect() as connection:

            connection.execute(
                text("SELECT 1")
            )

        logger.info(
            "Health check executed successfully"
        )

        return {
            "status": "healthy",
            "database": "connected",
            "version": "1.0.0",
            "timestamp": datetime.utcnow().isoformat(),
        }

    except Exception as e:

        logger.exception(
            "Health check failed"
        )

        raise HTTPException(
            status_code=500,
            detail={
                "status": "unhealthy",
                "database": "disconnected",
                "error": str(e),
            },
        )