from fastapi import APIRouter, UploadFile, File, Form
from database.db import SessionLocal
from models.models import Firmware
import shutil
import os

router = APIRouter()

# Uploads folder तयार करा (नसल्यास)
os.makedirs("uploads", exist_ok=True)


@router.post("/firmware/upload")
async def upload_firmware(
    firmware: UploadFile = File(...),
    version: str = Form(...),
    firmware_name: str = Form(...)
):
    # File save path
    file_path = f"uploads/{firmware.filename}"

    # Save uploaded file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(firmware.file, buffer)

    # Database session
    db = SessionLocal()

    try:
        # Create firmware record
        new_firmware = Firmware(
            firmware_name=firmware_name,
            version=version,
            hash="samplehash",
            signature="samplesignature"
        )

        db.add(new_firmware)
        db.commit()
        db.refresh(new_firmware)

        return {
            "message": "Firmware uploaded successfully",
            "firmware_id": new_firmware.id,
            "firmware_name": new_firmware.firmware_name,
            "version": new_firmware.version,
            "filename": firmware.filename
        }

    finally:
        db.close()