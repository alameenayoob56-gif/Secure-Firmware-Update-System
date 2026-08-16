def test_user_cannot_delete_firmware(client):
    login_response = client.post(
        "/login",
        json={
            "username": "user",
            "password": "user123",
        },
    )

    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    response = client.delete(
        "/firmware/1",
        headers={
            "Authorization": f"Bearer {token}"
        },
    )

    assert response.status_code == 403