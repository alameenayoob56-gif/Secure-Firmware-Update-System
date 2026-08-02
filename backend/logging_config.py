import logging
import os

LOG_DIR = "logs"

os.makedirs(LOG_DIR, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    handlers=[
        logging.FileHandler(
            os.path.join(LOG_DIR, "app.log")
        ),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("SecureFirmwareUpdateSystem")

logger.info("Application logging initialized successfully.")