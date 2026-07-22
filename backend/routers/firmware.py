from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from database.db import SessionLocal
from sqlalchemy.orm import Session
from models.models import Firmware
import shutil
import os

from utils.hash_utils import generate_sha256
from utils.rsa_utils import sign_data
from utils.rsa_utils import verify_signature

from utils.encryption_utils import encrypt_file, decrypt_file

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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

    # Encrypt uploaded firmware

    encrypted_path = f"encrypted/{firmware.filename}.enc"

    encrypt_file(
    input_file=file_path,
    output_file=encrypted_path
)    

    # Generate SHA-256 hash
    hash_value = generate_sha256(file_path)

    # Read firmware data
    with open(file_path, "rb") as file:
        firmware_data = file.read()

    # Generate Digital Signature
    signature = sign_data(firmware_data)
    signature_hex = signature.hex()


     # Database session
    db = SessionLocal()

    # Check duplicate firmware version
    existing_firmware = (
        db.query(Firmware)
        .filter(Firmware.version == version)
        .first()
    )

    if existing_firmware:
        db.close()
        raise HTTPException(
            status_code=400,
            detail="Firmware version already exists"
        )

    try:
        new_firmware = Firmware(
            firmware_name=firmware_name,
            version=version,
            hash=hash_value,
            signature=signature_hex,
            encrypted_file=encrypted_path
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
            "encrypted_file": encrypted_path,
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
async def decrypt_firmware(filename: str = Form(...)):

    encrypted_file = f"encrypted/{filename}.enc"

    if not os.path.exists(encrypted_file):
        raise HTTPException(
            status_code=404,
            detail="Encrypted firmware not found"
        )

    os.makedirs("decrypted", exist_ok=True)

    output_file = f"decrypted/{filename}"

    decrypt_file(
        input_file=encrypted_file,
        output_file=output_file
    )

    return {
        "message": "Firmware decrypted successfully",
        "decrypted_file": output_file
    }

@router.get("/firmware/history")
def firmware_history(db: Session = Depends(get_db)):
    firmware_list = (
        db.query(Firmware)
        .order_by(Firmware.release_date.desc())
        .all()
    )

    return [
        {
            "firmware_name": fw.firmware_name,
            "version": fw.version,
            "release_date": fw.release_date,
        }
        for fw in firmware_list
    ]

@router.get("/firmware/latest")
def latest_firmware(db: Session = Depends(get_db)):
    firmware = (
        db.query(Firmware)
        .order_by(Firmware.release_date.desc())
        .first()
    )

    if not firmware:
        raise HTTPException(
            status_code=404,
            detail="No firmware found"
        )

    return {
        "firmware_name": firmware.firmware_name,
        "version": firmware.version,
        "release_date": firmware.release_date,
    }