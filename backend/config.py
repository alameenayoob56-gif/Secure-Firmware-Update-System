import os
from dotenv import load_dotenv

load_dotenv()

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///firmware.db")

# JWT
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY environment variable is required")

ALGORITHM = os.getenv("ALGORITHM", "HS256")

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
)

# Application
APP_NAME = os.getenv(
    "APP_NAME",
    "Secure Firmware Update System"
)

APP_VERSION = os.getenv("APP_VERSION", "1.0.0")

DEBUG = os.getenv("DEBUG", "False").lower() == "true"