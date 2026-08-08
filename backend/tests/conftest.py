import os
import sys

import pytest
from fastapi.testclient import TestClient

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c
