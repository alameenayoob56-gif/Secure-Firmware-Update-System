# Secure-Firmware-Update-System
Enterprise-grade Secure Firmware Update System using FastAPI, React, SQLite, RSA Digital Signatures and JWT Authentication.


## Database Design

- SQLite
- SQLAlchemy ORM
- Firmware Table
- Device Table
- UpdateHistory Table


## Firmware Upload Module

### Features

- Upload firmware packages
- Store firmware files in uploads directory
- Save firmware metadata to SQLite
- Validate upload requests
- Test APIs using Swagger UIgit add README.md


## Firmware Integrity Verification

The backend generates a SHA-256 hash for every uploaded firmware package.

### Workflow

- Upload firmware
- Generate SHA-256 hash
- Store hash in SQLite
- Verify uploaded firmware against stored hash
- Return Valid or Tampered status