import os

from cryptography.fernet import Fernet


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

KEYS_DIR = os.path.join(
    BASE_DIR,
    "keys"
)

KEY_FILE = os.path.join(
    KEYS_DIR,
    "aes.key"
)


# ============================================================
# GENERATE KEY
# ============================================================

def generate_key():

    os.makedirs(
        KEYS_DIR,
        exist_ok=True
    )

    if not os.path.exists(KEY_FILE):

        key = Fernet.generate_key()

        with open(
            KEY_FILE,
            "wb"
        ) as file:

            file.write(key)


# ============================================================
# LOAD KEY
# ============================================================

def load_key():

    if not os.path.exists(KEY_FILE):

        generate_key()

    with open(
        KEY_FILE,
        "rb"
    ) as file:

        return file.read()


# ============================================================
# ENCRYPT FILE
# ============================================================

def encrypt_file(
    input_file,
    output_file
):

    key = load_key()

    cipher = Fernet(key)

    with open(
        input_file,
        "rb"
    ) as file:

        data = file.read()

    encrypted_data = cipher.encrypt(
        data
    )

    os.makedirs(
        os.path.dirname(output_file) or ".",
        exist_ok=True
    )

    with open(
        output_file,
        "wb"
    ) as file:

        file.write(
            encrypted_data
        )

    return output_file


# ============================================================
# DECRYPT FILE
# ============================================================

def decrypt_file(
    input_file,
    output_file
):

    key = load_key()

    cipher = Fernet(key)

    with open(
        input_file,
        "rb"
    ) as file:

        encrypted_data = file.read()

    decrypted_data = cipher.decrypt(
        encrypted_data
    )

    os.makedirs(
        os.path.dirname(output_file) or ".",
        exist_ok=True
    )

    with open(
        output_file,
        "wb"
    ) as file:

        file.write(
            decrypted_data
        )

    return output_file