from fastapi import APIRouter, UploadFile, File, Form
import shutil
import os

router = APIRouter()
@router.post("/firmware/upload")
async def upload_firmware(
    firmware: UploadFile = File(...),
    version: str = Form(...),
    firmware_name: str = Form(...)
):

    file_path = f"uploads/{firmware.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(firmware.file, buffer)

    return {
        "message": "Firmware uploaded successfully",
        "filename": firmware.filename
    }