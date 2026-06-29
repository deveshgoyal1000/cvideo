import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_transcribe_endpoint_missing_file():
    # Should fail if no file is provided
    response = client.post("/api/captions/v3/transcribe")
    assert response.status_code == 422 # Unprocessable Entity

def test_render_status_not_found():
    # Should return 404 or gracefully handle missing job
    response = client.get("/api/captions/v3/render_status/fake_job_123")
    assert response.status_code == 404

def test_download_not_found():
    response = client.get("/api/captions/v3/download/fake_job_123")
    assert response.status_code == 404
