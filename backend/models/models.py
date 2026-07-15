from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from database.db import Base

class Firmware(Base):
    __tablename__ = "firmware"

    id = Column(Integer, primary_key=True, index=True)

    firmware_name = Column(String, nullable=False)

    version = Column(String, nullable=False)

    hash = Column(String, nullable=False)

    signature = Column(String, nullable=False)

    uploaded_at = Column(DateTime, default=datetime.utcnow)