from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database.db import SessionLocal
from models.models import Deployment, Device

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/deployment-stats")
def deployment_stats(
    db: Session = Depends(get_db)
):
    total = db.query(Deployment).count()

    started = (
        db.query(Deployment)
        .filter(Deployment.status == "Started")
        .count()
    )

    completed = (
        db.query(Deployment)
        .filter(Deployment.status == "Completed")
        .count()
    )

    failed = (
        db.query(Deployment)
        .filter(Deployment.status == "Failed")
        .count()
    )

    return {
        "total_deployments": total,
        "started": started,
        "completed": completed,
        "failed": failed
    }

@router.get("/firmware-distribution")
def firmware_distribution(
    db: Session = Depends(get_db)
):
    data = (
        db.query(
            Device.firmware_version,
            func.count(Device.id)
        )
        .group_by(Device.firmware_version)
        .all()
    )

    return [
        {
            "version": version,
            "devices": count
        }
        for version, count in data
    ]