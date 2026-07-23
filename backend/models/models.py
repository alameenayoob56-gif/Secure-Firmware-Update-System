from sqlalchemy import Column, Integer, String, DateTime, Boolean
from datetime import datetime
from database.db import Base


class Firmware(Base):
    __tablename__ = "firmware"

    id = Column(Integer, primary_key=True, index=True)
    firmware_name = Column(String, nullable=False)
    version = Column(String, nullable=False)
    hash = Column(String, nullable=False)
    signature = Column(String, nullable=False)
    encrypted_file = Column(String)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=False)
    deployment_status = Column(String, default="Pending")
    rollback_from = Column(String, nullable=True)

    release_notes = Column(String, nullable=True)
    release_date = Column(DateTime, default=datetime.utcnow)
    is_latest = Column(Boolean, default=False)


class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    device_name = Column(String, nullable=False)
    serial_number = Column(String, unique=True, nullable=False)
    current_version = Column(String, nullable=False)
    status = Column(String, default="ACTIVE")


class UpdateHistory(Base):
    __tablename__ = "update_history"

    id = Column(Integer, primary_key=True, index=True)
    firmware_id = Column(Integer, nullable=False)
    device_id = Column(Integer, nullable=False)
    update_status = Column(String, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow)