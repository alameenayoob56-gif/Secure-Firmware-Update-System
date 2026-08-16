def test_security_headers(client):
    response = client.get("/")

    assert response.status_code == 200

    assert "X-Content-Type-Options" in response.headers
    assert "X-Frame-Options" in response.headers
    assert "Content-Security-Policy" in response.headers