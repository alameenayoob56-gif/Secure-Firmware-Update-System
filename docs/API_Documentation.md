# API Documentation

## Overview

The Secure Firmware Update System provides REST APIs for firmware upload, authentication, version management, deployment, and verification.

## Authentication

JWT-based authentication is used to secure protected endpoints.

## Main API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /login | Authenticate user |
| POST | /firmware/upload | Upload firmware |
| GET | /firmware/history | Retrieve firmware history |
| GET | /firmware/latest | Retrieve latest firmware |
| POST | /firmware/deploy | Deploy firmware |

## API Testing

Swagger UI is used for testing and validating all available API endpoints.
