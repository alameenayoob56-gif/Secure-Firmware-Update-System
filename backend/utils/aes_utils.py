import os
from cryptography.fernet import Fernet

KEY_FILE = "keys/aes.key"


def generate_key():
    """
    Generate AES(Fernet) key and save it.
    """

    os.makedirs("keys", exist_ok=True)

    if not os.path.exists(KEY_FILE):
        key = Fernet.generate_key()

        with open(KEY_FILE, "wb") as f:
            f.write(key)


def load_key():
    """
    Load AES key.
    """

    with open(KEY_FILE, "rb") as f:
        return f.read()


def encrypt_data(data: bytes):
    """
    Encrypt firmware bytes.
    """

    key = load_key()
    cipher = Fernet(key)

    return cipher.encrypt(data)


def decrypt_data(data: bytes):
    """
    Decrypt firmware bytes.
    """

    key = load_key()
    cipher = Fernet(key)

    return cipher.decrypt(data)