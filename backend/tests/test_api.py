import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.storage.repository import scan_repository
from app.schemas.detection import PredictionResponse, BoundingBox, Detection, Location

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "SONARX"
    assert "/health" in data["health"]


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["service"] == "SONARX"
    assert "model_loaded" in data


def test_model_info_endpoint():
    response = client.get("/api/model")
    assert response.status_code == 200
    data = response.json()
    assert "MILCO" in data["classes"]
    assert "NOMBO" in data["classes"]
    assert data["image_size"] == 640
    assert "validation_metrics" in data
    metrics = data["validation_metrics"]
    assert metrics["precision"] == 0.718
    assert metrics["recall"] == 0.669
    assert metrics["map50"] == 0.712


def test_scans_and_stats_empty():
    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_scans" in data
    assert "objects_detected" in data


def test_predict_empty_file():
    response = client.post(
        "/api/predict",
        files={"file": ("test.png", b"", "image/png")},
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_predict_model_missing_behavior():
    # When model is not present, predict should cleanly return 503 Service Unavailable
    # Create a small valid test image in-memory
    img = Image.new("RGB", (300, 300), color=(50, 50, 50))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    response = client.post(
        "/api/predict",
        files={"file": ("sonar_scan.png", buf.getvalue(), "image/png")},
        data={"confidence": "0.3"},
    )
    # Either 200 if model exists or 503 if model is not placed yet
    assert response.status_code in [200, 503]
    if response.status_code == 503:
        assert "best.onnx" in response.json()["detail"]


def test_scan_repository_workflow():
    sample_scan = PredictionResponse(
        scan_id="SCAN-TEST1234",
        filename="test_acoustic.png",
        image_width=800,
        image_height=600,
        inference_ms=12.4,
        detections=[
            Detection(
                id="det_1",
                type="MILCO",
                confidence=0.89,
                bbox=BoundingBox(x1=100, y1=150, x2=250, y2=300),
            ),
            Detection(
                id="det_2",
                type="NOMBO",
                confidence=0.74,
                bbox=BoundingBox(x1=400, y1=200, x2=550, y2=350),
            ),
        ],
        location=Location(latitude=24.55, longitude=-81.78),
        created_at="2026-08-26T12:00:00Z",
        confidence_threshold=0.25,
        total_detections=2,
        milco_count=1,
        nombo_count=1,
        highest_confidence=0.89,
        status="completed",
    )

    # Save
    scan_repository.save(sample_scan)

    # Get
    fetched = scan_repository.get("SCAN-TEST1234")
    assert fetched is not None
    assert fetched.filename == "test_acoustic.png"
    assert fetched.milco_count == 1

    # Report
    report_res = client.get("/api/scans/SCAN-TEST1234/report")
    assert report_res.status_code == 200
    report_data = report_res.json()
    assert "MILCO" in report_data["analyst_summary"]

    # Delete
    del_res = client.delete("/api/scans/SCAN-TEST1234")
    assert del_res.status_code == 200
    assert scan_repository.get("SCAN-TEST1234") is None
