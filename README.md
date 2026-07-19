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

## RSA Digital Signature

The Secure Firmware Update System uses RSA Digital Signatures to verify firmware authenticity.

### Workflow

1. Upload firmware
2. Generate SHA-256 hash
3. Sign firmware using RSA Private Key
4. Store signature in database
5. Verify signature using RSA Public Key

### Security Benefits

- Ensures firmware authenticity
- Prevents unauthorized firmware modification
- Detects tampered firmware
- Provides secure firmware validation

## AES Firmware Encryption

### Workflow

Upload Firmware

↓

Generate SHA-256

↓

Generate RSA Signature

↓

Encrypt using AES-256

↓

Store Encrypted Firmware

↓

Decrypt when Required

### Benefits

- Prevents firmware theft
- Protects firmware confidentiality
- Secure deployment