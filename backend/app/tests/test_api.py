def test_health_endpoint(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_import_endpoint_invalid_csv(client):
    files = {"file": ("bad.csv", b"oops", "text/csv")}
    r = client.post("/api/import/sales", files=files)
    assert r.status_code == 400
