def test_deployment_status(client):

    response = client.get("/deployment/status")

    assert response.status_code == 200

    data = response.json()

    assert "total_deployments" in data


def test_deployment_history(client):

    response = client.get("/deployment/history")

    assert response.status_code == 200

    assert isinstance(response.json(), list)


def test_invalid_rollback(client):

    response = client.post(
        "/deployment/rollback",
        json={
            "deployment_id": 999999
        }
    )

    assert response.status_code == 404


def test_invalid_deployment(client):

    response = client.post(
        "/deployment/deploy",
        json={
            "device_id": 999999,
            "firmware_id": 999999
        }
    )

    assert response.status_code == 404