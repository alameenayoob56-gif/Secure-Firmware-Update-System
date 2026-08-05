# RSA Digital Signature Workflow

## Purpose

RSA Digital Signatures ensure firmware authenticity and prevent unauthorized firmware installation.

## Workflow

1. Upload firmware.
2. Generate a SHA-256 hash.
3. Sign the hash using the RSA private key.
4. Store the digital signature.
5. Verify the signature using the RSA public key before installation.

## Outcome

- Authentic firmware is accepted.
- Modified firmware is rejected.
