from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from database.db import SessionLocal
from models.models import Firmware
import shutil
import os
from utils.hash_utils import generate_sha256

router = APIRouter()

os.makedirs("uploads", exist_ok=True)


@router.post("/firmware/upload")
async def upload_firmware(
    firmware: UploadFile = File(...),
    version: str = Form(...),
    firmware_name: str = Form(...)
):
    # Validate input
    if firmware.filename == "":
        return {"error": "Empty file"}

    if version.strip() == "":
        return {"error": "Version required"}

    if firmware_name.strip() == "":
        return {"error": "Firmware name required"}

    # Save uploaded file
    file_path = f"uploads/{firmware.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(firmware.file, buffer)

    # Generate SHA-256 hash
    hash_value = generate_sha256(file_path)

    db = SessionLocal()

    try:
        new_firmware = Firmware(
            firmware_name=firmware_name,
            version=version,
            hash=hash_value,
            signature=""
        )

        db.add(new_firmware)
        db.commit()
        db.refresh(new_firmware)

        return {
            "message": "Firmware uploaded successfully",
            "firmware_id": new_firmware.id,
            "firmware_name": new_firmware.firmware_name,
            "version": new_firmware.version,
            "filename": firmware.filename,
            "hash": hash_value
        }

    finally:
        db.close()


@router.post("/firmware/verify")
async def verify_firmware(file: UploadFile = File(...)):
    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    generated_hash = generate_sha256(file_path)

    db = SessionLocal()

    try:
        firmware = db.query(Firmware).first()

        if firmware is None:
            raise HTTPException(
                status_code=404,
                detail="Firmware not found"
            )

        if generated_hash == firmware.hash:
            return {
                "status": "Valid"
            }

        return {
            "status": "Tampered"
        }

    finally:
        db.close()