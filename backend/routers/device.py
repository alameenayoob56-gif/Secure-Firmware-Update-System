from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database.db import SessionLocal
from models.models import Device, Firmware

router = APIRouter(
    prefix="/devices",
    tags=["Device Management"]
)


class DeviceRegisterRequest(BaseModel):
    device_name: str
    serial_number: str
    model: str
    firmware_version: str

class AssignFirmwareRequest(BaseModel):
    serial_number: str
    firmware_version: str

class DeviceStatusRequest(BaseModel):
    serial_number: str
    status: str
    
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/register")
def register_device(
    request: DeviceRegisterRequest,
    db: Session = Depends(get_db)
):
    # Check duplicate serial number
    existing_device = (
        db.query(Device)
        .filter(Device.serial_number == request.serial_number)
        .first()
    )

    if existing_device:
        raise HTTPException(
            status_code=400,
            detail="Device with this serial number already exists"
        )

    # Create new device
    new_device = Device(
        device_name=request.device_name,
        serial_number=request.serial_number,
        model=request.model,
        firmware_version=request.firmware_version,
        assigned_firmware=None,
        status="Pending"
    )

    db.add(new_device)
    db.commit()
    db.refresh(new_device)

    return {
        "message": "Device registered successfully",
        "device_id": new_device.id,
        "device_name": new_device.device_name,
        "serial_number": new_device.serial_number,
        "model": new_device.model,
        "firmware_version": new_device.firmware_version,
        "status": new_device.status
    }

@router.get("/")
def get_devices(db: Session = Depends(get_db)):
    devices = db.query(Device).all()

    return [
        {
            "device_id": device.id,
            "device_name": device.device_name,
            "serial_number": device.serial_number,
            "model": device.model,
            "firmware_version": device.firmware_version,
            "assigned_firmware": device.assigned_firmware,
            "status": device.status,
            "registered_at": device.registered_at
        }
        for device in devices
    ]

@router.post("/assign-firmware")
def assign_firmware(
    request: AssignFirmwareRequest,
    db: Session = Depends(get_db)
):
    device = (
        db.query(Device)
        .filter(Device.serial_number == request.serial_number)
        .first()
    )

    if device is None:
        raise HTTPException(
            status_code=404,
            detail="Device not found"
        )

    firmware = (
        db.query(Firmware)
        .filter(Firmware.version == request.firmware_version)
        .first()
    )

    if firmware is None:
        raise HTTPException(
            status_code=404,
            detail="Firmware not found"
        )

    device.assigned_firmware = firmware.version

    db.commit()
    db.refresh(device)

    return {
        "message": "Firmware assigned successfully",
        "device_name": device.device_name,
        "serial_number": device.serial_number,
        "assigned_firmware": device.assigned_firmware
    }

@router.post("/update-status")
def update_device_status(
    request: DeviceStatusRequest,
    db: Session = Depends(get_db)
):
    device = (
        db.query(Device)
        .filter(Device.serial_number == request.serial_number)
        .first()
    )

    if device is None:
        raise HTTPException(
            status_code=404,
            detail="Device not found"
        )

    allowed_status = [
        "Pending",
        "Updating",
        "Updated",
        "Failed"
    ]

    if request.status not in allowed_status:
        raise HTTPException(
            status_code=400,
            detail="Invalid status"
        )

    device.status = request.status

    db.commit()
    db.refresh(device)

    return {
        "message": "Device status updated successfully",
        "serial_number": device.serial_number,
        "status": device.status
    }