from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from database.db import SessionLocal
from models.models import Device, Firmware, Deployment, UpdateHistory
from schemas import DeploymentCreate
from utils.audit_logger import log_audit

router = APIRouter(prefix="/deployment", tags=["Deployment"])


class RollbackRequest(BaseModel):
    deployment_id: int


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/deploy")
def deploy_firmware(request: DeploymentCreate, db: Session = Depends(get_db)):

    # Device Validation
    device = db.query(Device).filter(Device.id == request.device_id).first()

    if device is None:
        raise HTTPException(status_code=404, detail="Device not found")

    # Firmware Validation
    firmware = db.query(Firmware).filter(Firmware.id == request.firmware_id).first()

    if firmware is None:
        raise HTTPException(status_code=404, detail="Firmware not found")

    # Create Deployment
    deployment = Deployment(
        device_id=request.device_id, firmware_id=request.firmware_id, status="Started"
    )

    db.add(deployment)
    db.commit()
    db.refresh(deployment)

    # Save Update History
    history = UpdateHistory(
        firmware_id=request.firmware_id,
        device_id=request.device_id,
        update_status="Started",
    )

    db.add(history)
    db.commit()
    db.refresh(history)

    # Audit Logging
    log_audit(
        action="Firmware Deployment",
        firmware_name=firmware.firmware_name,
        version=firmware.version,
        device_name=device.device_name,
        performed_by="admin",
    )

    return {"deployment_id": deployment.id, "status": "Deployment Started"}


@router.get("/history")
def deployment_history(db: Session = Depends(get_db)):

    deployments = db.query(Deployment).all()

    return [
        {
            "deployment_id": deployment.id,
            "device_id": deployment.device_id,
            "firmware_id": deployment.firmware_id,
            "status": deployment.status,
            "started_at": deployment.started_at,
            "completed_at": deployment.completed_at,
            "rollback": deployment.rollback,
            "rollback_time": deployment.rollback_time,
        }
        for deployment in deployments
    ]


@router.get("/status")
def deployment_status(db: Session = Depends(get_db)):

    total = db.query(Deployment).count()

    started = db.query(Deployment).filter(Deployment.status == "Started").count()

    completed = db.query(Deployment).filter(Deployment.status == "Completed").count()

    failed = db.query(Deployment).filter(Deployment.status == "Failed").count()

    rolled_back = (
        db.query(Deployment).filter(Deployment.status == "Rolled Back").count()
    )

    return {
        "total_deployments": total,
        "started": started,
        "completed": completed,
        "failed": failed,
        "rolled_back": rolled_back,
    }


@router.get("/status/{status}")
def deployment_by_status(status: str, db: Session = Depends(get_db)):

    deployments = db.query(Deployment).filter(Deployment.status == status).all()

    return [
        {
            "deployment_id": deployment.id,
            "device_id": deployment.device_id,
            "firmware_id": deployment.firmware_id,
            "status": deployment.status,
            "started_at": deployment.started_at,
            "completed_at": deployment.completed_at,
            "rollback": deployment.rollback,
            "rollback_time": deployment.rollback_time,
        }
        for deployment in deployments
    ]


@router.post("/rollback")
def rollback_deployment(request: RollbackRequest, db: Session = Depends(get_db)):

    # Find Deployment
    deployment = (
        db.query(Deployment).filter(Deployment.id == request.deployment_id).first()
    )

    if deployment is None:
        raise HTTPException(status_code=404, detail="Deployment not found")

    # Update Deployment Status
    deployment.status = "Rolled Back"
    deployment.rollback = True
    deployment.rollback_time = datetime.utcnow()

    db.commit()
    db.refresh(deployment)

    # Save Rollback History
    history = UpdateHistory(
        firmware_id=deployment.firmware_id,
        device_id=deployment.device_id,
        update_status="Rolled Back",
    )

    db.add(history)
    db.commit()
    db.refresh(history)

    # Get Device Details
    device = db.query(Device).filter(Device.id == deployment.device_id).first()

    # Get Firmware Details
    firmware = db.query(Firmware).filter(Firmware.id == deployment.firmware_id).first()

    # Audit Logging
    log_audit(
        action="Firmware Rollback",
        firmware_name=firmware.firmware_name,
        version=firmware.version,
        device_name=device.device_name,
        performed_by="admin",
    )

    return {
        "message": "Rollback completed successfully",
        "deployment_id": deployment.id,
        "status": deployment.status,
        "rollback": deployment.rollback,
        "rollback_time": deployment.rollback_time,
    }
