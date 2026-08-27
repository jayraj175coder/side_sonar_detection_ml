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
    assert data["model_version"] == "baseline"


def test_model_info_endpoint():
    response = client.get("/api/model")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "YOLOv8n-Sonar-MILCO-NOMBO"
    assert data["version"] == "baseline"
    assert "MILCO" in data["classes"]
    assert "NOMBO" in data["classes"]
    assert data["input_size"] == 640
    assert data["metrics"]["precision"] == 0.718
    assert data["metrics"]["recall"] == 0.669
    assert data["metrics"]["map50"] == 0.712


def test_datasets_catalog_endpoint():
    response = client.get("/api/datasets")
    assert response.status_code == 200
    data = response.json()
    assert "datasets" in data
    assert "subpipe_sss_pipeline" in data["datasets"]
    assert "sss_crab_pot_aldfg" in data["datasets"]
    assert "ai4shipwrecks" in data["datasets"]


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


def test_live_onnx_inference_baseline():
    img = Image.new("RGB", (640, 480), color=(20, 30, 40))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    response = client.post(
        "/api/predict",
        files={"file": ("live_sonar_scan.png", buf.getvalue(), "image/png")},
        data={
            "confidence": "0.15",
            "latitude": "17.6868",
            "longitude": "83.2185",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "scan_id" in data
    assert data["filename"] == "live_sonar_scan.png"
    assert data["model_version"] == "baseline"
    assert data["location"]["latitude"] == 17.6868
    assert data["location"]["longitude"] == 83.2185


def test_scan_repository_and_report_workflow():
    sample_scan = PredictionResponse(
        scan_id="SCAN-TEST-BASELINE-01",
        filename="test_acoustic.png",
        model_name="YOLOv8n-Sonar-MILCO-NOMBO",
        model_version="baseline",
        image_width=800,
        image_height=600,
        inference_ms=12.4,
        detections=[
            Detection(
                id="det_1",
                type="MILCO",
                confidence=0.89,
                bbox=BoundingBox(x1=100, y1=150, x2=250, y2=300),
                confidence_tier="HIGH",
            ),
        ],
        location=Location(latitude=17.6868, longitude=83.2185),
        created_at="2026-08-27T12:00:00Z",
        confidence_threshold=0.25,
        total_detections=1,
        milco_count=1,
        highest_confidence=0.89,
        status="completed",
    )

    # Save
    scan_repository.save(sample_scan)

    # Get
    fetched = scan_repository.get("SCAN-TEST-BASELINE-01")
    assert fetched is not None
    assert fetched.filename == "test_acoustic.png"

    # Report
    report_res = client.get("/api/scans/SCAN-TEST-BASELINE-01/report")
    assert report_res.status_code == 200
    report_data = report_res.json()
    assert "analyst_summary" in report_data
    assert "MILCO" in report_data["analyst_summary"]
    assert "disclaimer" in report_data

    # Delete
    del_res = client.delete("/api/scans/SCAN-TEST-BASELINE-01")
    assert del_res.status_code == 200
    assert scan_repository.get("SCAN-TEST-BASELINE-01") is None
