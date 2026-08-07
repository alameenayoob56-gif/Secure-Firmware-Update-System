def test_firmware_download_requires_auth(client):
    response = client.get("/firmware/download/1")

    assert response.status_code in [401, 403]