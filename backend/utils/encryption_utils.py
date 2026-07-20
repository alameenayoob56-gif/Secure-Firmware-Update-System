from cryptography.fernet import Fernet
import os

# Base directory (backend folder)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Keys directory
KEYS_DIR = os.path.join(BASE_DIR, "keys")
KEY_FILE = os.path.join(KEYS_DIR, "aes.key")


def generate_key():
    """
    Generate a Fernet encryption key and save it.
    """
    os.makedirs(KEYS_DIR, exist_ok=True)

    if not os.path.exists(KEY_FILE):
        key = Fernet.generate_key()

        with open(KEY_FILE, "wb") as f:
            f.write(key)

        print("Encryption key generated successfully.")
    else:
        print("Encryption key already exists.")


def load_key():
    """
    Load the existing encryption key.
    """
    if not os.path.exists(KEY_FILE):
        generate_key()

    with open(KEY_FILE, "rb") as f:
        return f.read()


def encrypt_file(input_file, output_file):
    """
    Encrypt a firmware file.
    """
    key = load_key()
    cipher = Fernet(key)

    with open(input_file, "rb") as f:
        data = f.read()

    encrypted_data = cipher.encrypt(data)

    with open(output_file, "wb") as f:
        f.write(encrypted_data)

    return output_file


def decrypt_file(input_file, output_file):
    """
    Decrypt an encrypted firmware file.
    """
    key = load_key()
    cipher = Fernet(key)

    with open(input_file, "rb") as f:
        encrypted_data = f.read()

    decrypted_data = cipher.decrypt(encrypted_data)

    with open(output_file, "wb") as f:
        f.write(decrypted_data)

    return output_file