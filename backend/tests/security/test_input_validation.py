def test_login_missing_username(client):
    response = client.post(
        "/login",
        json={
            "password": "admin123",
        },
    )

    assert response.status_code == 422


def test_login_empty_username(client):
    response = client.post(
        "/login",
        json={
            "username": "",
            "password": "admin123",
        },
    )

    assert response.status_code in [401, 422]


def test_firmware_download_invalid_id(client):
    response = client.get("/firmware/download/not-a-number")

    assert response.status_code == 401