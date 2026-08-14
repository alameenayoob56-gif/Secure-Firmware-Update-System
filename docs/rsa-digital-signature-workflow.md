# RSA Digital Signature Workflow

## 1. Overview

The Secure Firmware Update System uses RSA digital signatures to verify the authenticity and integrity of firmware before it is accepted for installation.

The signing process uses an RSA private key, while the verification process uses the corresponding RSA public key.

## 2. Digital Signature Workflow

**Firmware**  
↓  
**Generate Firmware Hash**  
↓  
**Hash + RSA Private Key**  
↓  
**Generate Digital Signature**  
↓  
**Attach/Store Signature**  
↓  
**Upload Signed Firmware**  
↓  
**Verify Signature using RSA Public Key**  
↓  
**Is the Signature Valid?**

- **Yes** → Firmware Accepted
- **No** → Firmware Rejected

## 3. Signing Process

## 3. Signing Process

1. The firmware file is prepared for release.
2. A cryptographic hash is generated from the firmware.
3. The hash is processed using the RSA private key.
4. A digital signature is generated.
5. The firmware and signature are prepared for upload or distribution.
6. The signed firmware is made available to the verification system.

## 4. Verification Process

1. The receiving system obtains the firmware and digital signature.
2. The system calculates the hash of the received firmware.
3. The RSA public key is used to verify the digital signature.
4. The calculated hash is compared against the signed data.
5. If verification succeeds, the firmware is considered authentic and unmodified.
6. If verification fails, the firmware is rejected.

## 5. Security Benefits

RSA digital signatures provide:

- Firmware integrity
- Firmware authenticity
- Detection of unauthorized modifications
- Protection against fraudulent firmware releases

## 6. Failure Conditions

The firmware must be rejected when:

- The signature is invalid.
- The firmware has been modified after signing.
- The signature is missing.
- The verification key is invalid.
- Required firmware metadata is invalid.

## 7. Security Considerations

The RSA private key is a critical security asset and must never be committed to the GitHub repository.

The public key may be used by the verification component to validate signatures.

## 8. Conclusion

The RSA signing and verification workflow provides a cryptographic mechanism for determining whether firmware is authentic and has remained unchanged after signing.

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
