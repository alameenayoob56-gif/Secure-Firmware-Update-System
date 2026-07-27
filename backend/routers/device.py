from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database.db import SessionLocal
from models.models import Device, Firmware
from schemas import DeviceCreate, DeviceUpdate

router = APIRouter(
    prefix="/devices",
    tags=["Device Management"]
)


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
    request: DeviceCreate,
    db: Session = Depends(get_db)
):
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


@router.get("/search/serial/{serial_number}")
def search_device_by_serial(
    serial_number: str,
    db: Session = Depends(get_db)
):
    device = (
        db.query(Device)
        .filter(Device.serial_number == serial_number)
        .first()
    )

    if device is None:
        raise HTTPException(
            status_code=404,
            detail="Device not found"
        )

    return {
        "device_id": device.id,
        "device_name": device.device_name,
        "serial_number": device.serial_number,
        "model": device.model,
        "firmware_version": device.firmware_version,
        "assigned_firmware": device.assigned_firmware,
        "status": device.status,
        "registered_at": device.registered_at
    }


@router.get("/status/{status}")
def get_devices_by_status(
    status: str,
    db: Session = Depends(get_db)
):
    devices = (
        db.query(Device)
        .filter(Device.status == status)
        .all()
    )

    return devices


@router.get("/firmware/{version}")
def get_devices_by_firmware(
    version: str,
    db: Session = Depends(get_db)
):
    devices = (
        db.query(Device)
        .filter(Device.firmware_version == version)
        .all()
    )

    return devices


@router.get("/{device_id}")
def get_device_by_id(
    device_id: int,
    db: Session = Depends(get_db)
):
    device = (
        db.query(Device)
        .filter(Device.id == device_id)
        .first()
    )

    if device is None:
        raise HTTPException(
            status_code=404,
            detail="Device not found"
        )

    return {
        "device_id": device.id,
        "device_name": device.device_name,
        "serial_number": device.serial_number,
        "model": device.model,
        "firmware_version": device.firmware_version,
        "assigned_firmware": device.assigned_firmware,
        "status": device.status,
        "registered_at": device.registered_at
    }


@router.put("/{device_id}")
def update_device(
    device_id: int,
    request: DeviceUpdate,
    db: Session = Depends(get_db)
):
    device = (
        db.query(Device)
        .filter(Device.id == device_id)
        .first()
    )

    if device is None:
        raise HTTPException(
            status_code=404,
            detail="Device not found"
        )

    device.device_name = request.device_name
    device.model = request.model
    device.firmware_version = request.firmware_version
    device.status = request.status

    db.commit()
    db.refresh(device)

    return {
        "message": "Device updated successfully",
        "device": {
            "device_id": device.id,
            "device_name": device.device_name,
            "serial_number": device.serial_number,
            "model": device.model,
            "firmware_version": device.firmware_version,
            "assigned_firmware": device.assigned_firmware,
            "status": device.status,
            "registered_at": device.registered_at
        }
    }


@router.delete("/{device_id}")
def delete_device(
    device_id: int,
    db: Session = Depends(get_db)
):
    device = (
        db.query(Device)
        .filter(Device.id == device_id)
        .first()
    )

    if device is None:
        raise HTTPException(
            status_code=404,
            detail="Device not found"
        )

    db.delete(device)
    db.commit()

    return {
        "message": "Device deleted successfully",
        "device_id": device_id
    }

@router.get("/devices")
async def get_devices():

    db = SessionLocal()

    try:

        devices = db.query(Device).all()

        return [
            {
                "id": device.id,
                "device_name": device.device_name,
                "id": device.id,
                "firmware_version": device.firmware_version,
                "status": device.status,
                "last_seen": device.last_seen
            }
            for device in devices
        ]

    finally:
        db.close()


    class AssignFirmwareRequest(BaseModel):
     device_id: str
    firmware_version: str


@router.post("/devices/assign-firmware")
async def assign_firmware(request: AssignFirmwareRequest):

    db = SessionLocal()

    try:
        device = (
            db.query(Device)
            .filter(Device.device_id == request.device_id)
            .first()
        )

        if device is None:
            raise HTTPException(
                status_code=404,
                detail="Device not found"
            )

        device.firmware_version = request.firmware_version
        device.status = "Pending Update"

        db.commit()
        db.refresh(device)

        return {
            "message": "Firmware assigned successfully",
            "device_id": device.device_id,
            "firmware_version": device.firmware_version,
            "status": device.status
        }

    finally:
        db.close()    

    class DeviceStatusRequest(BaseModel):
     device_id: str
    status: str    

@router.post("/devices/update-status")
async def update_device_status(request: DeviceStatusRequest):

    db = SessionLocal()

    try:
        device = (
            db.query(Device)
            .filter(Device.device_id == request.device_id)
            .first()
        )

        if device is None:
            raise HTTPException(
                status_code=404,
                detail="Device not found"
            )

        valid_status = [
            "Pending",
            "Updating",
            "Updated",
            "Failed"
        ]

        if request.status not in valid_status:
            raise HTTPException(
                status_code=400,
                detail="Invalid status"
            )

        device.status = request.status

        db.commit()
        db.refresh(device)

        return {
            "message": "Device status updated successfully",
            "id": device.id,
            "status": device.status
        }

    finally:
        db.close()

@router.get("/devices/history")
async def device_history():

    db = SessionLocal()

    try:
        devices = (
            db.query(Device)
            .order_by(Device.registered_at.desc())
            .all()
        )

        return [
            {
                "id": device.id,
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

    finally:
        db.close()