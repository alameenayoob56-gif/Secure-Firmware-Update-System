from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from database.db import SessionLocal
from sqlalchemy.orm import Session
from models.models import Firmware
import shutil
import os
from pydantic import BaseModel

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

class DeployRequest(BaseModel):
     version: str       

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

@router.post("/firmware/rollback")
async def rollback_firmware(version: str = Form(...)):

    db = SessionLocal()

    try:

        # Find requested firmware version
        firmware = (
            db.query(Firmware)
            .filter(Firmware.version == version)
            .first()
        )

        if firmware is None:
            raise HTTPException(
                status_code=404,
                detail="Firmware version not found"
            )

        # Deactivate current active firmware
        active_firmware = (
            db.query(Firmware)
            .filter(Firmware.is_active == True)
            .first()
        )

        if active_firmware:
            active_firmware.is_active = False
            active_firmware.deployment_status = "Rolled Back"

        # Activate selected firmware
        firmware.is_active = True
        firmware.deployment_status = "Deployed"

        db.commit()

        return {
            "message": "Firmware rollback successful",
            "active_version": firmware.version
        }

    finally:
        db.close()

@router.get("/firmware/history")
async def firmware_history():

    db = SessionLocal()

    try:
        firmwares = (
            db.query(Firmware)
            .order_by(Firmware.uploaded_at.desc())
            .all()
        )

        return [
            {
                "id": fw.id,
                "firmware_name": fw.firmware_name,
                "version": fw.version,
                "deployment_status": fw.deployment_status,
                "is_active": fw.is_active,
                "rollback_from": fw.rollback_from,
                "uploaded_at": fw.uploaded_at,
                "release_date": fw.release_date
            }
            for fw in firmwares
        ]

    finally:
        db.close()


@router.post("/firmware/deploy")
def deploy_firmware(request: DeployRequest, db: Session = Depends(get_db)):

    firmware = (
        db.query(Firmware)
        .filter(Firmware.version == request.version)
        .first()
    )

    if firmware is None:
        raise HTTPException(
            status_code=404,
            detail="Firmware version not found"
        )

    # Deactivate all firmware
    db.query(Firmware).update(
        {
            Firmware.is_active: False,
            Firmware.deployment_status: "Pending"
        }
    )

    # Activate selected firmware
    firmware.is_active = True
    firmware.deployment_status = "Deployed"

    db.commit()
    db.refresh(firmware)

    return {
        "message": "Firmware deployed successfully",
        "active_version": firmware.version
    }    