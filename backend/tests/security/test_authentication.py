def test_firmware_download_requires_auth(client):
    response = client.get("/firmware/download/1")

    assert response.status_code == 401


def test_firmware_download_invalid_jwt(client):
    response = client.get(
        "/firmware/download/1",
        headers={"Authorization": "Bearer invalid-token"},
    )

    assert response.status_code == 401


def test_firmware_download_malformed_authorization(client):
    response = client.get(
        "/firmware/download/1",
        headers={"Authorization": "InvalidToken"},
    )

    assert response.status_code == 401