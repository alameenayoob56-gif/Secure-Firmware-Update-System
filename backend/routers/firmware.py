from fastapi import APIRouter, UploadFile, File, Form

router = APIRouter()

@router.post("/firmware/upload")
async def upload_firmware(
    firmware: UploadFile = File(...),
    version: str = Form(...),
    firmware_name: str = Form(...)
):
    return {
        "filename": firmware.filename,
        "version": version,
        "firmware_name": firmware_name,
        "message": "Firmware received successfully"
    }