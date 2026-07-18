import os

from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa


# -----------------------------
# Key Paths
# -----------------------------

KEYS_DIR = "keys"

PRIVATE_KEY_PATH = os.path.join(KEYS_DIR, "private_key.pem")
PUBLIC_KEY_PATH = os.path.join(KEYS_DIR, "public_key.pem")


# -----------------------------
# Generate RSA Keys
# -----------------------------

def generate_keys():

    os.makedirs(KEYS_DIR, exist_ok=True)

    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend()
    )

    public_key = private_key.public_key()

    with open(PRIVATE_KEY_PATH, "wb") as private_file:
        private_file.write(
            private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption()
            )
        )

    with open(PUBLIC_KEY_PATH, "wb") as public_file:
        public_file.write(
            public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            )
        )

    print("RSA Keys Generated Successfully")


# -----------------------------
# Load Private Key
# -----------------------------

def load_private_key():

    with open(PRIVATE_KEY_PATH, "rb") as file:

        return serialization.load_pem_private_key(
            file.read(),
            password=None,
            backend=default_backend()
        )


# -----------------------------
# Load Public Key
# -----------------------------

def load_public_key():

    with open(PUBLIC_KEY_PATH, "rb") as file:

        return serialization.load_pem_public_key(
            file.read(),
            backend=default_backend()
        )


# -----------------------------
# Sign Data
# -----------------------------

def sign_data(data: bytes):

    private_key = load_private_key()

    signature = private_key.sign(
        data,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )

    return signature


# -----------------------------
# Verify Signature
# -----------------------------

def verify_signature(data: bytes, signature: bytes):

    public_key = load_public_key()

    try:

        public_key.verify(
            signature,
            data,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )

        return True

    except InvalidSignature:

        return False