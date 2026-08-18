🔐 Secure Firmware Update System

Enterprise-grade Secure OTA Firmware Update Platform for IoT and Edge Devices

A security-focused firmware update platform designed to securely upload, validate, sign, encrypt, deploy, and manage firmware for IoT and edge devices.

The system combines FastAPI, React, SQLite, SQLAlchemy, RSA digital signatures, SHA-256 integrity verification, Fernet encryption, JWT authentication, role-based authorization, audit logging, rate limiting, security headers, CI validation, and dependency security scanning.

📌 Project Overview

Firmware updates are a critical security boundary in IoT environments. An attacker who modifies, replaces, or distributes unauthorized firmware can compromise an entire fleet of devices.

This project provides a controlled firmware lifecycle:

Firmware Upload
      |
      v
SHA-256 Integrity Hash
      |
      v
RSA Digital Signature
      |
      v
Fernet Encryption
      |
      v
Secure Firmware Storage
      |
      v
Authentication & Authorization
      |
      v
Firmware Deployment
      |
      v
Device Update Tracking
      |
      v
Audit & Analytics

✨ Key Features

🔐 Security

JWT-based authentication

Role-based authorization

RSA digital signature verification

SHA-256 firmware integrity verification

Fernet symmetric firmware encryption

Environment-based secret configuration

Protected cryptographic key files

Rate limiting

Security response headers

Content Security Policy (CSP)

Global exception handling

Audit logging

Input validation

Dependency vulnerability scanning with pip-audit and Trivy

📦 Firmware Management

Firmware upload

Firmware metadata management

Firmware version tracking

Firmware history

Latest firmware retrieval

Duplicate-version validation

Authorized firmware deletion/access

Firmware encryption and protected storage

Authorized firmware decryption

🚀 Deployment

Firmware deployment by version

Active firmware management

Deployment status tracking

Firmware rollback support

🖥️ Device Management

IoT device registration

Device listing

Device update and deletion

Firmware assignment

Device update-status tracking

Device history

📊 Monitoring & Operations

Analytics APIs

Health-check API

Audit logging

Structured application logging

Global error handling

Swagger/OpenAPI documentation

Docker support

CI validation

🏗️ System Architecture

                         +----------------------+
                         |      React UI        |
                         |  Dashboard / Client  |
                         +----------+-----------+
                                    |
                                    | HTTP / REST
                                    v
                    +-----------------------------+
                    |        FastAPI API          |
                    |                             |
                    | Authentication / JWT        |
                    | Authorization / RBAC        |
                    | Rate Limiting               |
                    | Input Validation            |
                    | Security Headers / CSP      |
                    | Exception Handling          |
                    +--------------+--------------+
                                   |
             +---------------------+---------------------+
             |                     |                     |
             v                     v                     v
      +-------------+       +-------------+       +-------------+
      |  Firmware   |       |   Device    |       | Deployment  |
      |   Module    |       |   Module    |       |   Module    |
      +------+------+       +------+------+       +------+------+
             |                     |                     |
             +---------------------+---------------------+
                                   |
                                   v
                         +---------------------+
                         |   Security Layer    |
                         |                     |
                         | SHA-256             |
                         | RSA Signatures      |
                         | Fernet Encryption   |
                         | Audit Logging        |
                         +----------+----------+
                                    |
                                    v
                         +---------------------+
                         | SQLite + SQLAlchemy |
                         +---------------------+

🛡️ Security Model

The platform uses multiple security controls rather than relying on a single mechanism.

Authentication

POST /login

A successful login returns a JWT bearer token.

Use the token in Swagger UI:

Authorization: Bearer <JWT_TOKEN>

Authorization

Role-based controls distinguish administrative operations from normal user operations.

Typical model:

Admin
 ├── Upload firmware
 ├── Delete firmware
 ├── Deploy firmware
 └── Manage devices

User
 └── Authorized firmware access

Actual authorization behavior should always be verified against the implemented API.

🔏 Firmware Integrity Verification

The backend generates a SHA-256 hash for firmware content.

Firmware
   |
   v
SHA-256
   |
   v
Hash stored with metadata
   |
   v
Future verification
   |
   +--> Match    -> Integrity Valid
   |
   +--> Mismatch -> Possible Tampering

SHA-256 helps detect unauthorized modification of firmware content.

✍️ RSA Digital Signatures

RSA digital signatures provide firmware authenticity verification.

Firmware
   |
   v
Signing Process
   |
   v
RSA Private Key
   |
   v
Digital Signature
   |
   v
Verification
   |
   v
RSA Public Key

Benefits:

Detects unauthorized firmware modification

Verifies firmware authenticity

Rejects invalid signatures

Separates signing capability from verification capability

Important: Private keys must never be committed to Git. The repository ignores cryptographic private-key files.

🔒 Firmware Encryption

The project uses Fernet symmetric encryption to protect firmware stored on the server.

Encryption workflow

Firmware
   |
   v
SHA-256 Integrity Hash
   |
   v
RSA Signature
   |
   v
Fernet Encryption
   |
   v
Encrypted Firmware Storage

Decryption workflow

Authorized Request
       |
       v
Encrypted Firmware
       |
       v
Fernet Decryption
       |
       v
Decrypted Firmware

Encryption protects firmware confidentiality while hashing and signatures provide integrity and authenticity controls.

🗄️ Database Design

The backend uses:

SQLite

SQLAlchemy ORM

Core entities include:

Firmware

Device

UpdateHistory

📦 Firmware Lifecycle

Upload
  |
  v
Validate
  |
  v
Hash
  |
  v
Sign
  |
  v
Encrypt
  |
  v
Store Metadata
  |
  v
Deploy
  |
  v
Track Status

🚀 Firmware Deployment

Example:

POST /firmware/deploy

{
  "version": "1.0.0"
}

Example response:

{
  "message": "Firmware deployed successfully",
  "active_version": "1.0.0"
}

Deployment workflow:

Receive Version
      |
      v
Find Firmware
      |
      v
Validate Firmware
      |
      v
Deactivate Previous Active Version
      |
      v
Activate Selected Version
      |
      v
Update Deployment Status
      |
      v
Return Result

🔄 Firmware Version Management

Capabilities include:

Firmware version tracking

Firmware release history

Latest firmware retrieval

Duplicate-version validation

Active firmware management

Rollback support

Release/deployment tracking

Example APIs:

POST /firmware/upload
GET  /firmware/history
GET  /firmware/latest
POST /firmware/rollback
POST /firmware/deploy

📡 Device Management

Capabilities:

Register devices


List devices

Update device details

# Secure Firmware Update System


Delete devices

Assign firmware

Track update status

Retrieve device history

Example APIs:

POST   /devices/register
GET    /devices
PUT    /devices/update/{id}
DELETE /devices/delete/{id}
POST   /devices/assign-firmware
POST   /devices/update-status
GET    /devices/history

Typical device lifecycle:

Registered
    |
    v
Pending
    |
    v
Updating
    |
    +--> Updated
    |
    +--> Failed

📊 Analytics & Audit

The project includes analytics and audit capabilities for operational visibility.

Security-relevant events can be recorded through the audit logging layer, including authentication activity and firmware-related operations.

Structured application logging covers:

Application startup

Database initialization

API activity

Authentication events

Validation failures

Exceptions

Security-related events

❤️ Health Check

GET /health

Use this endpoint to verify that the API is running correctly.

🧪 Security & Quality Testing

The project includes tests for security-sensitive functionality such as:

Authorization

Input validation

Login behavior

Rate limiting

Health endpoint

Authentication

Firmware security behavior

Run:

pytest

Review the complete test output after security-related changes.

🔍 Dependency Security Scanning

pip-audit

pip-audit

Trivy

trivy fs --scanners vuln --skip-dirs venv --skip-dirs .git .

If Trivy reports a vulnerable frontend dependency, update it to a fixed version and rerun the scan.

🛡️ Security Headers

The backend applies:

X-Content-Type-Options: nosniff

X-Frame-Options: DENY

Referrer-Policy: strict-origin-when-cross-origin

Content-Security-Policy

Swagger UI requires controlled CSP exceptions for its required external assets and initialization code. The application therefore uses a Swagger-specific CSP policy under /docs while keeping normal API responses more restrictive.

⚙️ Environment Configuration

Sensitive configuration is supplied through environment variables.

Example:

DATABASE_URL=sqlite:///firmware.db
SECRET_KEY=CHANGE_ME_TO_A_LONG_RANDOM_SECRET
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

A template is provided as:

.env.example

Never commit:

.env
private_key.pem
aes.key
*.bundle

Local databases containing sensitive data should also remain outside version control.

🛠️ Installation

Prerequisites

Python 3.10+

Node.js

npm

Git

SQLite

Optional: Docker

Optional: Trivy

Optional: pip-audit

Backend Setup

From the project root:

cd backend
python -m venv ..
env
..
env\Scripts ctivate
pip install -r requirements.txt

Set a development secret:

$env:SECRET_KEY="change-this-local-development-secret"

Start:

uvicorn main:app --reload --port 8001

📖 API Documentation

Swagger UI:

http://127.0.0.1:8001/docs

OpenAPI:

http://127.0.0.1:8001/openapi.json

Swagger can be used to:

Authenticate

Test endpoints

Upload firmware

Manage devices

Test deployment APIs

Inspect responses

Validate authorization behavior

🌐 Frontend Setup

cd frontend
npm install
npm run dev

The React frontend communicates with the FastAPI backend using its configured API base URL.

🐳 Docker

Example:

docker build -t secure-firmware-api .
docker run -p 8001:8001 secure-firmware-api

If Docker Compose is configured:

docker compose up --build

🔄 CI/CD

The project includes GitHub Actions-based continuous integration.

Push / Pull Request
        |
        v
Python Environment
        |
        v
Dependency Installation
        |
        v
Application Validation
        |
        v
Automated Tests / Build Checks

This helps detect integration and build problems before deployment.

📁 Project Structure

Secure-Firmware-Update-System/
|
+-- backend/
|   +-- main.py
|   +-- config.py
|   +-- requirements.txt
|   +-- database/
|   +-- models/
|   +-- routers/
|   |   +-- firmware.py
|   |   +-- device.py
|   |   +-- deployment.py
|   |   +-- analytics.py
|   +-- utils/
|   |   +-- auth_utils.py
|   |   +-- audit_logger.py
|   +-- logging_config.py
|   +-- Dockerfile
|
+-- frontend/
+-- docs/
+-- uploads/
+-- .env.example
+-- .gitignore
+-- README.md
+-- requirements.txt

🔧 Troubleshooting

Backend import error

pip install -r backend
equirements.txt

Authentication error

Check:

SECRET_KEY=
ALGORITHM=
ACCESS_TOKEN_EXPIRE_MINUTES=

Swagger page is blank

First verify:

Invoke-WebRequest http://127.0.0.1:8001/openapi.json -UseBasicParsing

Expected:

StatusCode : 200


Then open:

http://127.0.0.1:8001/docs

If CSP errors appear, verify the security middleware's Swagger-specific CSP configuration.

Database error

Verify:

DATABASE_URL=sqlite:///firmware.db

and confirm that the application can access the configured database.

Dependency vulnerability

Run:

pip-audit
trivy fs --scanners vuln --skip-dirs venv --skip-dirs .git .

Update vulnerable dependencies to fixed versions and scan again.

🔐 Secure Development Practices

This project follows security-focused practices:

Secrets are externalized through environment variables.

Private cryptographic keys are excluded from version control.

Local databases and temporary security artifacts are ignored.

JWT authentication protects authenticated API operations.

Authorization controls restrict sensitive operations.

Firmware integrity is verified using SHA-256.

Firmware authenticity is supported through RSA signatures.

Firmware confidentiality is supported through Fernet encryption.

Rate limiting protects sensitive endpoints.

Security headers reduce browser-side attack surfaces.

Input validation and global exception handling are implemented.

Dependency vulnerabilities are checked with security scanners.

Automated tests validate security-sensitive behavior.

📋 API Summary

Area

Examples

Authentication

POST /login

Health

GET /health

Firmware

Upload, history, latest, deletion

Deployment

Deploy, rollback, status

Devices

Register, list, update, delete

Device Firmware

Assign firmware, update status

Analytics

Analytics/security metrics

Documentation

/docs, /openapi.json

For the authoritative endpoint list, use:

http://127.0.0.1:8001/openapi.json

👥 Team

Member

Role

Prasad Kedar

Team Lead / Backend / Security

Al Ameen Ayoob

Frontend / Development

Prasad kedar

Development / Testing

Nelna K Siyad

Documentation / Testing

🎯 Project Goals

The project demonstrates how a secure firmware update platform can combine:

Authentication
      +
Authorization
      +
Integrity
      +
Authenticity
      +
Confidentiality
      +
Secure Deployment
      +
Device Management
      +
Monitoring
      +
Auditability

The goal is to provide a practical security-oriented foundation for managing firmware updates across IoT and edge-device environments.

📌 Project Status

The project contains major components for a secure firmware-management workflow:

Backend API

Frontend application

Authentication

Authorization

Firmware management

Cryptographic verification

Firmware encryption

Device management

Deployment management

Analytics

Audit logging

Security headers

Rate limiting

Automated testing

Dependency security scanning

Docker support

CI validation

Environment-based configuration

Before production deployment, environment-specific secrets, cryptographic key management, infrastructure configuration, monitoring, and deployment controls should be reviewed and hardened for the target environment.

📄 License



⭐ Security First

Never commit passwords, JWT secrets, private RSA keys, AES/Fernet keys, production .env files, sensitive databases, or temporary security artifacts to Git.

If a secret has ever been exposed in Git history, rotate/revoke it and treat the old secret as compromised.

The workflow runs automatically on every push and pull request to ensure code quality and application stability.

