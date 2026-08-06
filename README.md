# Secure-Firmware-Update-System

Enterprise-grade Secure Firmware Update System using FastAPI, React, SQLite, RSA Digital Signatures and JWT Authentication.

## Project Overview

The Secure Firmware Update System provides a secure Over-the-Air (OTA) firmware update solution for IoT and edge devices. It uses RSA Digital Signatures and SHA-256 hashing to verify firmware authenticity and integrity before installation. The project also integrates an automated CI/CD pipeline for secure firmware signing and edge-device verification.

## Features

- Secure Over-the-Air (OTA) firmware updates
- RSA digital signature verification
- SHA-256 hash integrity validation
- Automated firmware signing
- Edge device verification
- Firmware encryption
- JWT-based authentication
- Firmware version management
- Secure deployment workflow
- REST API with Swagger documentation

## Technology Stack

- **Backend:** FastAPI
- **Frontend:** React
- **Database:** SQLite, SQLAlchemy ORM
- **Programming Language:** Python
- **Cryptography:** RSA, SHA-256, AES (Fernet)
- **Authentication:** JWT
- **API Documentation:** Swagger UI
- **Version Control:** Git & GitHub
## Folder Structure

```text
Secure-Firmware-Update-System/
├── backend/                 # FastAPI backend application
├── frontend/                # React frontend application
├── uploads/                 # Uploaded firmware files
├── docs/                    # Project documentation
├── README.md                # Project documentation
└── .gitignore               # Git ignore rules
```
## Installation Guide

### Prerequisites

- Python 3.10 or later
- Git
- Node.js (for frontend)
- SQLite

### Installation

1. Clone the repository.
2. Navigate to the project directory.
3. Install the required dependencies.
4. Start the backend server.
5. Start the frontend application.
6. Open Swagger UI to test the APIs.

## Team Members

| Name | Role |
|------|------|
| Prasad Kedar | Team Lead |
| Al Ameen Ayoob | Developer |
| Adarsh | Developer |
| Nelna K Siyad | Documentation & Testing |

## Database Design

- SQLite

- SQLAlchemy ORM

- Firmware Table

- Device Table

- UpdateHistory Table

## Firmware Upload Module

 ###Features

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

## Firmware Version Management

This module provides firmware version tracking and update management features.

### Features

- Firmware version tracking
- Firmware release history
- Latest firmware retrieval
- Duplicate firmware version validation

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /firmware/upload | Upload a new firmware |
| GET | /firmware/history | Retrieve firmware version history |
| GET | /firmware/latest | Retrieve the latest firmware version |

### Validation

- Prevents duplicate firmware versions
- Rejects empty firmware version
- Returns appropriate HTTP error responses

## Firmware Version Management

### Features

- Firmware version history
- Activate latest firmware
- Rollback to previous firmware
- Deployment status tracking
- Release date management
- Active firmware management

### APIs

- POST /firmware/upload
- POST /firmware/rollback
- GET /firmware/history

### Testing

Verified using Swagger UI.

## Firmware Deployment

### Features

- Deploy firmware by version
- Maintain one active firmware at a time
- Track deployment status
- Swagger API available

### Deployment API

**Endpoint**

POST /firmware/deploy

**Example Request**

```json
{
  "version": "1.0.0"
}
```

**Example Response**

```json
{
  "message": "Firmware deployed successfully",
  "active_version": "1.0.0"
}
```

### Deployment Workflow

Receive Version

↓

Find Firmware

↓

Deactivate Current Active Firmware

↓

Activate Selected Firmware

↓

Update Deployment Status

↓

Return Success
  
## Device Management

### Features

- Register IoT devices
- Assign firmware to devices
- Track firmware version
- Monitor device update status
- Swagger API support

### APIs

- POST /devices/register
- GET /devices
- POST /devices/assign-firmware
- POST /devices/update-status

### Device Status
- Pending
- Updating
- Updated
- Failed

### Device History

- View complete history of registered devices.
- Track assigned firmware versions.
- Monitor device status.
- Retrieve registration history.

## Device Management APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /devices/register | Register a new device |
| GET | /devices | Get all registered devices |
| PUT | /devices/update/{id} | Update device details |
| DELETE | /devices/delete/{id} | Delete device |
| POST | /devices/assign-firmware | Assign firmware to device |
| GET | /devices/history | Get complete device history |

### GET /devices/history

Example Response

```json
[
  {
    "id": 1,
    "device_name": "ESP32",
    "serial_number": "ESP001",
    "model": "ESP32-WROOM",
    "firmware_version": "1.0.0",
    "assigned_firmware": "1.0.0",
    "status": "Online",
    "registered_at": "2026-07-27T10:30:00"
  }
]


# Secure Firmware Update System

A production-ready Secure Firmware Update System built with FastAPI.

## Features

- JWT Authentication
- Firmware Management
- Device Management
- Deployment Tracking
- Analytics Dashboard
- Audit Logging
- Health Check API
- Docker Support
- Global Exception Handling


## Installation

```bash
git clone <repository-url>

cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload --port 8001

## Environment Variables

Create a .env file.

DATABASE_URL=

SECRET_KEY=

ALGORITHM=

ACCESS_TOKEN_EXPIRE_MINUTES=

## Docker

Build

docker build -t secure-firmware-api .

Run

docker run -p 8001:8001 secure-firmware-api

## Main APIs

GET /

GET /health

POST /login

GET /firmware

POST /firmware

DELETE /firmware/{id}

GET /analytics

## Deployment

Platform

Render

Docker

Docker Compose

Python 3.12


## Troubleshooting

ImportError

Run

pip install -r requirements.txt

Authentication Error

Check JWT Secret

Docker Error

docker compose up --build

Database Error

Verify DATABASE_URL

backend/

main.py

routers/

models/

database/

utils/

logs/

Dockerfile

docker-compose.yml

render.yaml

requirements.txt

## Continuous Integration (CI)

This project uses GitHub Actions for Continuous Integration.

### Automated Workflow

- Python Environment Setup
- Dependency Installation
- Backend Startup Verification
- Automated Build Validation

The workflow runs automatically on every push and pull request to ensure code quality and application stability.