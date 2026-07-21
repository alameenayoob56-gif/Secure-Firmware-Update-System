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

## Firmware Encryption

The Secure Firmware Update System encrypts firmware files before storing them on the server to protect them from unauthorized access.

### Features

* Firmware encryption using Fernet symmetric encryption
* Secure encryption key management
* Encrypted firmware storage
* Firmware decryption API for authorized access
* SHA-256 hash generation for integrity verification
* RSA digital signature for authenticity verification

### Encryption Workflow

1. Upload firmware
2. Generate SHA-256 hash
3. Generate RSA digital signature
4. Encrypt firmware using Fernet
5. Store encrypted firmware
6. Save firmware metadata in SQLite

### Decryption Workflow

1. Receive firmware filename
2. Load encrypted firmware
3. Decrypt using Fernet key
4. Save decrypted firmware
5. Return decrypted file information

### Security Benefits

* Prevents unauthorized access to firmware files
* Protects firmware during storage
* Supports integrity verification using SHA-256
* Supports authenticity verification using RSA Digital Signatures

## JWT Authentication

### Login

POST /login

### Roles

- Admin: upload, download, delete firmware
- User: download firmware only

### Authorization

Use the JWT token in Swagger Authorize:

Bearer <token>