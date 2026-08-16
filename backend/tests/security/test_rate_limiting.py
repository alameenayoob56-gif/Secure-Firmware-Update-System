from fastapi.testclient import TestClient

from main import app, limiter


client = TestClient(app)


def test_login_rate_limit():
    # Reset rate-limit state before this test
    limiter._storage.reset()

    payload = {
        "username": "admin",
        "password": "admin123",
    }

    responses = []

    for _ in range(6):
        response = client.post("/login", json=payload)
        responses.append(response.status_code)

    assert responses[:5] == [200, 200, 200, 200, 200]
    assert responses[5] == 429

    # Reset so other tests are not affected
    limiter._storage.reset()