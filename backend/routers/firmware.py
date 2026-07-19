from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from database.db import SessionLocal
from models.models import Firmware
import shutil
import os

from utils.hash_utils import generate_sha256
from utils.rsa_utils import sign_data
from utils.rsa_utils import verify_signature

from utils.aes_utils import encrypt_data
from utils.aes_utils import decrypt_data

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

    # Read firmware data
    with open(file_path, "rb") as file:
        firmware_data = file.read()

    # Generate Digital Signature
    signature = sign_data(firmware_data)
    signature_hex = signature.hex()

    # Encrypt firmware
    encrypted_data = encrypt_data(firmware_data)

    # Store encrypted firmware
    with open(file_path, "wb") as file:
     file.write(encrypted_data)

    # Database session
    db = SessionLocal()

    try:
        new_firmware = Firmware(
            firmware_name=firmware_name,
            version=version,
            hash=hash_value,
            signature=signature_hex
        )

        db.add(new_firmware)
        db.commit()
        db.refresh(new_firmware)

        return {
            "message": "Firmware uploaded and encrypted successfully",
            "firmware_id": new_firmware.id,
            "firmware_name": new_firmware.firmware_name,
            "version": new_firmware.version,
            "filename": firmware.filename,
            "hash": hash_value,
            "signature": signature_hex
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

@router.post("/firmware/verify-signature")
async def verify_signature_api(file: UploadFile = File(...)):
    file_path = f"uploads/{file.filename}"

    # Save uploaded file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    db = SessionLocal()

    try:
        # Get latest firmware from database
        firmware = (
            db.query(Firmware)
            .order_by(Firmware.id.desc())
            .first()
        )

        if firmware is None:
            raise HTTPException(
                status_code=404,
                detail="Firmware not found"
            )

        # Read uploaded firmware
        with open(file_path, "rb") as f:
            firmware_data = f.read()

        # Debug prints
        print("Firmware ID:", firmware.id)
        print("Firmware Name:", firmware.firmware_name)
        print("Stored Signature:", firmware.signature)

        # Convert hex string to bytes
        stored_signature = bytes.fromhex(firmware.signature)

        # Verify signature
        result = verify_signature(
            firmware_data,
            stored_signature
        )

        if result:
            return {
                "status": "Signature Verified"
            }

        return {
            "status": "Invalid Signature"
        }

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        db.close()

        
@router.post("/firmware/decrypt")
async def decrypt_firmware(file: UploadFile = File(...)):

    file_path = f"uploads/{file.filename}"

    # Save uploaded encrypted file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Read encrypted data
    with open(file_path, "rb") as f:
        encrypted_data = f.read()

    # Decrypt
    decrypted_data = decrypt_data(encrypted_data)

    # Save decrypted file
    output_path = f"uploads/decrypted_{file.filename}"

    with open(output_path, "wb") as f:
        f.write(decrypted_data)

    return {
        "message": "Firmware decrypted successfully",
        "output_file": output_path
    }