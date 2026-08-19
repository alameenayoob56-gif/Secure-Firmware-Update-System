from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    HTTPException,
    Depends
)

from sqlalchemy.orm import Session

from database.db import SessionLocal
from models.models import Firmware

from pydantic import BaseModel

from utils.hash_utils import generate_sha256

from utils.rsa_utils import (
    sign_data,
    verify_signature as verify_rsa_signature
)

from utils.encryption_utils import (
    encrypt_file,
    decrypt_file
)

from utils.audit_logger import log_audit

import os
import shutil
from pathlib import Path


router = APIRouter()


# ============================================================
# DIRECTORIES
# ============================================================

BASE_DIR = Path(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

UPLOAD_DIR = BASE_DIR / "uploads"
ENCRYPTED_DIR = BASE_DIR / "encrypted"
DECRYPTED_DIR = BASE_DIR / "decrypted"


UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)

ENCRYPTED_DIR.mkdir(
    parents=True,
    exist_ok=True
)

DECRYPTED_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# DATABASE
# ============================================================

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ============================================================
# REQUEST MODEL
# ============================================================

class DeployRequest(BaseModel):

    version: str


# ============================================================
# HELPER
# ============================================================

def safe_filename(filename: str):

    if not filename:

        raise HTTPException(
            status_code=400,
            detail="Filename is required"
        )

    filename = os.path.basename(
        filename
    )

    if filename in ("", ".", ".."):

        raise HTTPException(
            status_code=400,
            detail="Invalid filename"
        )

    return filename


# ============================================================
# UPLOAD FIRMWARE
# ============================================================

@router.post("/firmware/upload")
async def upload_firmware(

    firmware: UploadFile = File(...),

    version: str = Form(...),

    firmware_name: str = Form(...),

    release_notes: str = Form("")
):

    version = version.strip()

    firmware_name = firmware_name.strip()

    release_notes = release_notes.strip()

    if not firmware.filename:

        raise HTTPException(
            status_code=400,
            detail="Firmware file is required"
        )

    if not version:

        raise HTTPException(
            status_code=400,
            detail="Version is required"
        )

    if not firmware_name:

        raise HTTPException(
            status_code=400,
            detail="Firmware name is required"
        )

    filename = safe_filename(
        firmware.filename
    )

    db = SessionLocal()

    file_path = UPLOAD_DIR / filename

    encrypted_path = (
        ENCRYPTED_DIR /
        f"{filename}.enc"
    )

    try:

        # ----------------------------------------------------
        # DUPLICATE VERSION CHECK
        # ----------------------------------------------------

        existing = (
            db.query(Firmware)
            .filter(
                Firmware.version == version
            )
            .first()
        )

        if existing:

            raise HTTPException(
                status_code=400,
                detail="Firmware version already exists"
            )

        # ----------------------------------------------------
        # SAVE FILE
        # ----------------------------------------------------

        with open(
            file_path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                firmware.file,
                buffer
            )

        # ----------------------------------------------------
        # HASH
        # ----------------------------------------------------

        hash_value = generate_sha256(
            str(file_path)
        )

        # ----------------------------------------------------
        # READ DATA
        # ----------------------------------------------------

        with open(
            file_path,
            "rb"
        ) as file:

            firmware_data = file.read()

        # ----------------------------------------------------
        # RSA SIGNATURE
        # ----------------------------------------------------

        signature = sign_data(
            firmware_data
        )

        signature_hex = signature.hex()

        # ----------------------------------------------------
        # ENCRYPT
        # ----------------------------------------------------

        encrypt_file(
            input_file=str(file_path),
            output_file=str(encrypted_path)
        )

        # ----------------------------------------------------
        # CREATE DATABASE RECORD
        # ----------------------------------------------------

        new_firmware = Firmware(

            firmware_name=firmware_name,

            version=version,

            hash=hash_value,

            signature=signature_hex,

            encrypted_file=str(
                encrypted_path
            ),

            release_notes=release_notes,

            deployment_status="Pending",

            is_active=False,

            is_latest=False
        )

        db.add(
            new_firmware
        )

        db.commit()

        db.refresh(
            new_firmware
        )

        # ----------------------------------------------------
        # AUDIT
        # ----------------------------------------------------

        log_audit(
            action="Firmware Upload",
            firmware_name=firmware_name,
            version=version,
            performed_by="admin"
        )

        return {

            "success": True,

            "message":
                "Firmware uploaded successfully",

            "data": {

                "id": new_firmware.id,

                "firmware_name":
                    new_firmware.firmware_name,

                "version":
                    new_firmware.version,

                "hash":
                    new_firmware.hash,

                "signature":
                    new_firmware.signature,

                "encrypted_file":
                    new_firmware.encrypted_file,

                "deployment_status":
                    new_firmware.deployment_status,

                "is_active":
                    new_firmware.is_active,

                "release_notes":
                    new_firmware.release_notes,

                "uploaded_at":
                    new_firmware.uploaded_at,

                "release_date":
                    new_firmware.release_date
            }
        }

    except HTTPException:

        db.rollback()

        raise

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Firmware upload failed: {str(e)}"
        )

    finally:

        db.close()


# ============================================================
# VERIFY HASH
# ============================================================

@router.post("/firmware/verify")
async def verify_firmware(

    file: UploadFile = File(...)

):

    filename = safe_filename(
        file.filename
    )

    file_path = UPLOAD_DIR / filename

    db = SessionLocal()

    try:

        with open(
            file_path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )

        generated_hash = generate_sha256(
            str(file_path)
        )

        firmware = (
            db.query(Firmware)
            .filter(
                Firmware.hash == generated_hash
            )
            .first()
        )

        if firmware is None:

            return {

                "success": True,

                "status": "Tampered",

                "message":
                    "Firmware hash does not match trusted firmware",

                "data": None
            }

        return {

            "success": True,

            "status": "Valid",

            "message":
                "Firmware integrity verified",

            "data": {

                "id":
                    firmware.id,

                "firmware_name":
                    firmware.firmware_name,

                "version":
                    firmware.version,

                "hash":
                    firmware.hash,

                "is_active":
                    firmware.is_active
            }
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Firmware verification failed: {str(e)}"
        )

    finally:

        db.close()


# ============================================================
# VERIFY DIGITAL SIGNATURE
# ============================================================

@router.post("/firmware/verify-signature")
async def verify_signature_api(

    file: UploadFile = File(...)

):

    filename = safe_filename(
        file.filename
    )

    file_path = UPLOAD_DIR / filename

    db = SessionLocal()

    try:

        # ----------------------------------------------------
        # SAVE FILE
        # ----------------------------------------------------

        with open(
            file_path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )

        # ----------------------------------------------------
        # READ FILE
        # ----------------------------------------------------

        with open(
            file_path,
            "rb"
        ) as file_data:

            firmware_data = file_data.read()

        # ----------------------------------------------------
        # HASH
        # ----------------------------------------------------

        uploaded_hash = generate_sha256(
            str(file_path)
        )

        # ----------------------------------------------------
        # FIND EXACT FIRMWARE
        # ----------------------------------------------------

        firmware = (
            db.query(Firmware)
            .filter(
                Firmware.hash == uploaded_hash
            )
            .first()
        )

        if firmware is None:

            raise HTTPException(
                status_code=404,
                detail="Firmware not found"
            )

        # ----------------------------------------------------
        # SIGNATURE
        # ----------------------------------------------------

        try:

            stored_signature = bytes.fromhex(
                firmware.signature
            )

        except ValueError:

            raise HTTPException(
                status_code=500,
                detail="Invalid stored signature"
            )

        # ----------------------------------------------------
        # VERIFY
        # ----------------------------------------------------

        verified = verify_rsa_signature(
            firmware_data,
            stored_signature
        )

        if not verified:

            return {

                "success": True,

                "status":
                    "Invalid Signature",

                "message":
                    "Digital signature verification failed",

                "data": {

                    "id":
                        firmware.id,

                    "version":
                        firmware.version
                }
            }

        return {

            "success": True,

            "status":
                "Signature Verified",

            "message":
                "Firmware digital signature verified successfully",

            "data": {

                "id":
                    firmware.id,

                "firmware_name":
                    firmware.firmware_name,

                "version":
                    firmware.version,

                "hash":
                    firmware.hash
            }
        }

    except HTTPException:

        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Signature verification failed: {str(e)}"
        )

    finally:

        db.close()


# ============================================================
# DECRYPT FIRMWARE
# ============================================================

@router.post("/firmware/decrypt")
async def decrypt_firmware(

    filename: str = Form(...)

):

    filename = safe_filename(
        filename
    )

    encrypted_file = (
        ENCRYPTED_DIR /
        f"{filename}.enc"
    )

    if not encrypted_file.exists():

        raise HTTPException(
            status_code=404,
            detail="Encrypted firmware not found"
        )

    output_file = (
        DECRYPTED_DIR /
        filename
    )

    try:

        decrypt_file(
            input_file=str(
                encrypted_file
            ),

            output_file=str(
                output_file
            )
        )

        return {

            "success": True,

            "message":
                "Firmware decrypted successfully",

            "data": {

                "filename":
                    filename,

                "decrypted_file":
                    str(output_file)
            }
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Firmware decryption failed: {str(e)}"
        )


# ============================================================
# LATEST FIRMWARE
# ============================================================

@router.get("/firmware/latest")
def latest_firmware(

    db: Session = Depends(get_db)

):

    firmware = (

        db.query(Firmware)

        .order_by(
            Firmware.release_date.desc()
        )

        .first()
    )

    if firmware is None:

        raise HTTPException(
            status_code=404,
            detail="No firmware found"
        )

    return {

        "success": True,

        "message":
            "Latest firmware retrieved successfully",

        "data": {

            "id":
                firmware.id,

            "firmware_name":
                firmware.firmware_name,

            "version":
                firmware.version,

            "release_notes":
                firmware.release_notes,

            "release_date":
                firmware.release_date,

            "deployment_status":
                firmware.deployment_status,

            "is_active":
                firmware.is_active,

            "is_latest":
                firmware.is_latest
        }
    }


# ============================================================
# FIRMWARE HISTORY
# ============================================================

@router.get("/firmware/history")
def firmware_history(

    db: Session = Depends(get_db)

):

    firmwares = (

        db.query(Firmware)

        .order_by(
            Firmware.uploaded_at.desc()
        )

        .all()
    )

    return {

        "success": True,

        "message":
            "Firmware history retrieved successfully",

        "data": [

            {

                "id":
                    firmware.id,

                "firmware_name":
                    firmware.firmware_name,

                "version":
                    firmware.version,

                "deployment_status":
                    firmware.deployment_status,

                "is_active":
                    firmware.is_active,

                "is_latest":
                    firmware.is_latest,

                "rollback_from":
                    firmware.rollback_from,

                "release_notes":
                    firmware.release_notes,

                "uploaded_at":
                    firmware.uploaded_at,

                "release_date":
                    firmware.release_date

            }

            for firmware in firmwares
        ]
    }


# ============================================================
# DEPLOY FIRMWARE
# ============================================================

@router.post("/firmware/deploy")
def deploy_firmware(

    request: DeployRequest,

    db: Session = Depends(get_db)

):

    version = request.version.strip()

    if not version:

        raise HTTPException(
            status_code=400,
            detail="Firmware version is required"
        )

    firmware = (

        db.query(Firmware)

        .filter(
            Firmware.version == version
        )

        .first()
    )

    if firmware is None:

        raise HTTPException(
            status_code=404,
            detail="Firmware version not found"
        )

    try:

        # ----------------------------------------------------
        # CURRENT ACTIVE FIRMWARE
        # ----------------------------------------------------

        active_firmware = (

            db.query(Firmware)

            .filter(
                Firmware.is_active.is_(True)
            )

            .first()
        )

        previous_version = None

        if active_firmware:

            if active_firmware.id == firmware.id:

                return {

                    "success": True,

                    "message":
                        "Firmware is already deployed",

                    "data": {

                        "active_version":
                            firmware.version,

                        "deployment_status":
                            firmware.deployment_status,

                        "is_active":
                            firmware.is_active
                    }
                }

            previous_version = (
                active_firmware.version
            )

            active_firmware.is_active = False

            active_firmware.is_latest = False

            active_firmware.deployment_status = (
                "Previous"
            )

        # ----------------------------------------------------
        # ACTIVATE SELECTED FIRMWARE
        # ----------------------------------------------------

        firmware.is_active = True

        firmware.is_latest = True

        firmware.deployment_status = (
            "Deployed"
        )

        firmware.rollback_from = (
            previous_version
        )

        # ----------------------------------------------------
        # MAKE ONLY ONE LATEST
        # ----------------------------------------------------

        db.query(Firmware).filter(
            Firmware.id != firmware.id
        ).update(
            {
                Firmware.is_latest: False
            },
            synchronize_session=False
        )

        db.commit()

        db.refresh(
            firmware
        )

        # ----------------------------------------------------
        # AUDIT
        # ----------------------------------------------------

        log_audit(
            action="Firmware Deployment",
            firmware_name=firmware.firmware_name,
            version=firmware.version,
            performed_by="admin"
        )

        return {

            "success": True,

            "message":
                "Firmware deployed successfully",

            "data": {

                "id":
                    firmware.id,

                "firmware_name":
                    firmware.firmware_name,

                "previous_version":
                    previous_version,

                "active_version":
                    firmware.version,

                "deployment_status":
                    firmware.deployment_status,

                "is_active":
                    firmware.is_active,

                "is_latest":
                    firmware.is_latest
            }
        }

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Firmware deployment failed: {str(e)}"
        )

    finally:

        pass


# ============================================================
# ROLLBACK FIRMWARE
# ============================================================

@router.post("/firmware/rollback")
def rollback_firmware(

    version: str = Form(...),

    db: Session = Depends(get_db)

):

    version = version.strip()

    if not version:

        raise HTTPException(
            status_code=400,
            detail="Firmware version is required"
        )

    try:

        firmware = (

            db.query(Firmware)

            .filter(
                Firmware.version == version
            )

            .first()
        )

        if firmware is None:

            raise HTTPException(
                status_code=404,
                detail="Firmware version not found"
            )

        active_firmware = (

            db.query(Firmware)

            .filter(
                Firmware.is_active.is_(True)
            )

            .first()
        )

        if active_firmware:

            if active_firmware.id == firmware.id:

                return {

                    "success": True,

                    "message":
                        "Firmware is already active",

                    "data": {

                        "active_version":
                            firmware.version
                    }
                }

            previous_version = (
                active_firmware.version
            )

            active_firmware.is_active = False

            active_firmware.is_latest = False

            active_firmware.deployment_status = (
                "Rolled Back"
            )

        else:

            previous_version = None

        # ----------------------------------------------------
        # ACTIVATE ROLLBACK VERSION
        # ----------------------------------------------------

        firmware.is_active = True

        firmware.is_latest = True

        firmware.deployment_status = (
            "Deployed"
        )

        firmware.rollback_from = (
            previous_version
        )

        # ----------------------------------------------------
        # RESET LATEST
        # ----------------------------------------------------

        db.query(Firmware).filter(
            Firmware.id != firmware.id
        ).update(
            {
                Firmware.is_latest: False
            },
            synchronize_session=False
        )

        db.commit()

        db.refresh(
            firmware
        )

        # ----------------------------------------------------
        # AUDIT
        # ----------------------------------------------------

        log_audit(
            action="Firmware Rollback",
            firmware_name=firmware.firmware_name,
            version=firmware.version,
            performed_by="admin"
        )

        return {

            "success": True,

            "message":
                "Firmware rollback successful",

            "data": {

                "id":
                    firmware.id,

                "firmware_name":
                    firmware.firmware_name,

                "previous_version":
                    previous_version,

                "active_version":
                    firmware.version,

                "deployment_status":
                    firmware.deployment_status,

                "is_active":
                    firmware.is_active,

                "rollback_from":
                    firmware.rollback_from
            }
        }

    except HTTPException:

        db.rollback()

        raise

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Firmware rollback failed: {str(e)}"
        )