from database.db import SessionLocal
from models.models import AuditLog


def log_audit(
    action: str,
    firmware_name: str = None,
    version: str = None,
    device_name: str = None,
    performed_by: str = "system"
):
    db = SessionLocal()

    try:
        audit = AuditLog(
            action=action,
            firmware_name=firmware_name,
            version=version,
            device_name=device_name,
            performed_by=performed_by
        )

        db.add(audit)
        db.commit()

        print("========== AUDIT LOG ==========")
        print("ACTION         :", action)
        print("FIRMWARE       :", firmware_name)
        print("VERSION        :", version)
        print("DEVICE         :", device_name)
        print("PERFORMED BY   :", performed_by)
        print("===============================")

    finally:
        db.close()