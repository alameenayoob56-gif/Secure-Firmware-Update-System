from fastapi import APIRouter, UploadFile, File, Form
from database.db import SessionLocal
from models.models import Firmware
import shutil
import os

router = APIRouter()

# Create uploads folder if it doesn't exist
os.makedirs("uploads", exist_ok=True)


@router.post("/firmware/upload")
async def upload_firmware(
    firmware: UploadFile = File(...),
    version: str = Form(...),
    firmware_name: str = Form(...)
):
    # Validate input
    if firmware.filename == "":
        return {
            "error": "Empty file"
        }

    if version.strip() == "":
        return {
            "error": "Version required"
        }

    if firmware_name.strip() == "":
        return {
            "error": "Firmware name required"
        }

    # Save uploaded file
    file_path = f"uploads/{firmware.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(firmware.file, buffer)

    # Database session
    db = SessionLocal()

    try:
        # Save firmware metadata
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